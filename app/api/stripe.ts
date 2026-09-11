import { request } from "./request";

export const AGENT_C_API = process.env.NEXT_PUBLIC_API_AGENT_C;

export type StripePackageType = "basic" | "standard" | "professional";

export type StripeOrderStatus = "pending" | "paid" | "expired" | "failed";

export const STRIPE_ERROR_CODES = {
  NOT_ENABLED: 6001,
  INVALID_PACKAGE: 6002,
  UPSTREAM_ERROR: 6003,
  PENDING_LIMIT: 6006,
  // refund endpoints (see /v1/stripe/refund in the backend integration guide):
  // 6011/6012/6017 arrive with HTTP 200, 6015 with HTTP 400 - request.ts only
  // reads the body code, so the HTTP status does not matter here.
  REFUND_NOT_REFUNDABLE: 6011,
  REFUND_ALREADY_REFUNDED: 6012,
  REFUND_BAD_REASON: 6015,
  REFUND_REQUEST_EXISTS: 6017,
} as const;

export interface StripePackage {
  /** maps to the my-points page list item value (1/2/3) */
  listValue: number;
  /** display price, same format as the existing list item money */
  money: string;
  amountCents: number;
  points: number;
  llax: number;
}

/** Static package table, kept in sync with the backend stripe prices config */
export const STRIPE_PACKAGES: Record<StripePackageType, StripePackage> = {
  basic: { listValue: 1, money: "9.9", amountCents: 990, points: 990, llax: 10000 },
  standard: { listValue: 2, money: "29.9", amountCents: 2990, points: 3400, llax: 36000 },
  professional: { listValue: 3, money: "99.9", amountCents: 9990, points: 12500, llax: 130000 },
};

export interface StripeCheckoutData {
  order_no: string;
  checkout_url: string;
  amount_cents: number;
  currency: string;
  points: number;
  llax_amount: number;
}

export interface StripeCheckoutResponse {
  code: number;
  message: string;
  data: StripeCheckoutData;
}

// Set NEXT_PUBLIC_STRIPE_MOCK=1 to develop against an in-memory fake backend
// when the real one (feat/stripe-purchase) is not deployed. Remove after launch.
const STRIPE_MOCK = process.env.NEXT_PUBLIC_STRIPE_MOCK === "1";

let mockOrders: StripeOrderItem[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The mock list dies with the module on every full page navigation (the
// checkout redirect leaves the SPA), so persist it in sessionStorage to keep
// the "one pending order per package" state across the redirect round trip.
// Mock-only; never touched when STRIPE_MOCK is off.
const MOCK_ORDERS_STORAGE_KEY = "stripe_mock_orders";
// Raised from 5s so the 6006 resume flow can be walked through manually
// after coming back from the mock checkout landing page.
const MOCK_AUTO_PAY_DELAY_MS = 20000;

function loadMockOrders(): StripeOrderItem[] {
  try {
    const raw = sessionStorage.getItem(MOCK_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const orders = JSON.parse(raw) as StripeOrderItem[];
    if (!Array.isArray(orders)) return [];
    const now = Math.floor(Date.now() / 1000);
    const ttlSec = Math.floor(MOCK_AUTO_PAY_DELAY_MS / 1000);
    // settle pendings whose auto-paid timer fired while the page was away
    return orders.map((o) =>
      o.status === "pending" && o.created_at + ttlSec <= now
        ? { ...o, status: "paid" as const, paid_at: o.created_at + ttlSec }
        : o
    );
  } catch {
    return [];
  }
}

function persistMockOrders(): void {
  try {
    sessionStorage.setItem(MOCK_ORDERS_STORAGE_KEY, JSON.stringify(mockOrders));
  } catch {
    // ignore
  }
}

const mockCheckout = async (
  package_type: StripePackageType
): Promise<StripeCheckoutResponse> => {
  await delay(400);
  mockOrders = loadMockOrders();
  // simulate the backend rule "one pending order per package" (error 6006):
  // instead of a new session, the existing pending order's payment link is
  // returned in the rejected body's data field
  const existing = mockOrders.find(
    (o) => o.package_type === package_type && o.status === "pending"
  );
  if (existing) {
    return Promise.reject({
      code: STRIPE_ERROR_CODES.PENDING_LIMIT,
      message:
        "you have unfinished purchase orders, please complete them or try again later",
      // same shape as a successful checkout (snapshot fields included),
      // mirroring the backend contract for the resume-payment payload
      data: {
        order_no: existing.order_no,
        checkout_url: `/pay/success?order_no=${existing.order_no}`,
        amount_cents: existing.amount_cents,
        currency: existing.currency,
        points: existing.points,
        llax_amount: existing.llax_amount,
      },
    });
  }
  const pkg = STRIPE_PACKAGES[package_type];
  const order_no = `SO${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  mockOrders = [
    {
      order_no,
      package_type,
      amount_cents: pkg.amountCents,
      currency: "usd",
      points: pkg.points,
      llax_amount: pkg.llax,
      status: "pending",
      created_at: Math.floor(Date.now() / 1000),
      paid_at: null,
    },
    ...mockOrders,
  ];
  persistMockOrders();
  // flip the newest order to paid after a while so polling can be observed
  setTimeout(() => {
    mockOrders = mockOrders.map((o) =>
      o.order_no === order_no
        ? { ...o, status: "paid", paid_at: Math.floor(Date.now() / 1000) }
        : o
    );
    persistMockOrders();
  }, MOCK_AUTO_PAY_DELAY_MS);
  return {
    code: 0,
    message: "ok",
    data: {
      order_no,
      checkout_url: `/pay/success?order_no=${order_no}`,
      amount_cents: pkg.amountCents,
      currency: "usd",
      points: pkg.points,
      llax_amount: pkg.llax,
    },
  };
};

/**
 * Creates a Stripe hosted checkout session.
 * Rejects with the raw response body `{ code, message, data? }` (see request.ts),
 * delivered with HTTP 500 for business errors.
 * On code 6006 (PENDING_LIMIT) with non-empty `data`, the payload is a
 * {@link StripeCheckoutData} (same shape as a successful checkout) pointing
 * at the existing pending order of the same package - resume its checkout_url.
 */
export const stripe_checkout = (package_type: StripePackageType) => {
  if (STRIPE_MOCK) return mockCheckout(package_type);
  return request<StripeCheckoutResponse>(`${AGENT_C_API}/v1/stripe/checkout`, {
    method: "post",
    cache: "no-store",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ package_type }),
  });
};

export interface StripeOrderItem {
  order_no: string;
  package_type: StripePackageType;
  amount_cents: number;
  currency: string;
  points: number;
  llax_amount: number;
  status: StripeOrderStatus;
  created_at: number;
  paid_at: number | null;
}

export interface StripeOrdersResponse {
  code: number;
  message: string;
  data: {
    total: number;
    orders: StripeOrderItem[];
  };
}

const mockOrdersResponse = async (params?: {
  status?: StripeOrderStatus;
}): Promise<StripeOrdersResponse> => {
  await delay(200);
  mockOrders = loadMockOrders();
  const list = params?.status
    ? mockOrders.filter((o) => o.status === params.status)
    : mockOrders;
  return { code: 0, message: "ok", data: { total: list.length, orders: list } };
};

export const stripe_orders = (params: {
  limit: number;
  offset: number;
  status?: StripeOrderStatus;
}) => {
  if (STRIPE_MOCK) return mockOrdersResponse({ status: params.status });
  return request<StripeOrdersResponse>(
    `${AGENT_C_API}/v1/stripe/orders?limit=${params.limit}&offset=${params.offset}${params.status ? `&status=${params.status}` : ""}`,
    {
      method: "get",
      cache: "no-store",
    }
  );
};

// ---------------------------------------------------------------------------
// Refund (ticket-based): user submits a request, an admin approves it, then
// the payment is returned and all granted benefits are revoked.
// ---------------------------------------------------------------------------

export type StripeRefundStatus =
  | "requested"
  | "processing"
  | "refunded"
  | "refund_failed"
  | "revoke_failed"
  | "rejected";

export interface StripeRefundRequestData {
  id: number;
  order_ref: string;
  status: StripeRefundStatus;
  /** enum; user-submitted requests are always "user_request" */
  reason: string;
  /** free text the user submitted with the request */
  user_reason: string;
  /** admin note, may be set on approve/reject */
  admin_note: string;
  refund_amount: number;
  refund_currency: string;
  /** ISO 8601 */
  requested_at: string;
  /** ISO 8601, empty until handled */
  handled_at: string;
  /** ISO 8601, only non-empty once refunded */
  refunded_at: string;
  created_at: string;
}

export interface StripeRefundSubmitData {
  id: number;
  status: StripeRefundStatus;
  /** ISO 8601 */
  requested_at: string;
}

export interface StripeRefundSubmitResponse {
  code: number;
  message: string;
  data: StripeRefundSubmitData;
}

// total is assumed pending backend confirmation; adjust if the real payload
// differs (see stripe_frontend_integration_guide.md section 7)
export interface StripeRefundsResponse {
  code: number;
  message: string;
  data: {
    total: number;
    refunds: StripeRefundRequestData[];
  };
}

// Same sessionStorage persistence idea as the mock orders above: the refund
// list must survive full page navigations. Mock-only.
const MOCK_REFUNDS_STORAGE_KEY = "stripe_mock_refunds";

let mockRefunds: StripeRefundRequestData[] = [];

function loadMockRefunds(): StripeRefundRequestData[] {
  try {
    const raw = sessionStorage.getItem(MOCK_REFUNDS_STORAGE_KEY);
    if (!raw) return [];
    const refunds = JSON.parse(raw) as StripeRefundRequestData[];
    return Array.isArray(refunds) ? refunds : [];
  } catch {
    return [];
  }
}

function persistMockRefunds(): void {
  try {
    sessionStorage.setItem(MOCK_REFUNDS_STORAGE_KEY, JSON.stringify(mockRefunds));
  } catch {
    // ignore
  }
}

const REASON_MAX_BYTES = 1024;

const reasonBytes = (reason: string) => new TextEncoder().encode(reason).length;

const mockRefundRequest = async (
  order_no: string,
  reason: string
): Promise<StripeRefundSubmitResponse> => {
  await delay(500);
  const trimmed = reason.trim();
  if (!trimmed || reasonBytes(trimmed) > REASON_MAX_BYTES) {
    return Promise.reject({
      code: STRIPE_ERROR_CODES.REFUND_BAD_REASON,
      message: "reason must be non-empty and at most 1024 bytes",
    });
  }
  mockRefunds = loadMockRefunds();
  mockOrders = loadMockOrders();
  const order = mockOrders.find((o) => o.order_no === order_no);
  if (!order || order.status !== "paid") {
    return Promise.reject({
      code: STRIPE_ERROR_CODES.REFUND_NOT_REFUNDABLE,
      message: "order not found or not refundable",
    });
  }
  const existing = mockRefunds.find((r) => r.order_ref === order_no);
  if (existing) {
    if (existing.status === "refunded" || existing.status === "revoke_failed") {
      return Promise.reject({
        code: STRIPE_ERROR_CODES.REFUND_ALREADY_REFUNDED,
        message: "order has already been refunded",
      });
    }
    if (existing.status !== "rejected") {
      return Promise.reject({
        code: STRIPE_ERROR_CODES.REFUND_REQUEST_EXISTS,
        message: "a refund request already exists for this order",
      });
    }
    // rejected tickets are reused on re-submission (same id, refreshed fields)
    mockRefunds = mockRefunds.map((r) =>
      r.id === existing.id
        ? {
            ...r,
            status: "requested" as const,
            user_reason: trimmed,
            admin_note: "",
            requested_at: new Date().toISOString(),
          }
        : r
    );
    persistMockRefunds();
    return {
      code: 0,
      message: "ok",
      data: {
        id: existing.id,
        status: "requested",
        requested_at: new Date().toISOString(),
      },
    };
  }
  const now = new Date().toISOString();
  const item: StripeRefundRequestData = {
    id: mockRefunds.reduce((max, r) => Math.max(max, r.id), 0) + 1,
    order_ref: order_no,
    status: "requested",
    reason: "user_request",
    user_reason: trimmed,
    admin_note: "",
    refund_amount: order.amount_cents / 100,
    refund_currency: order.currency,
    requested_at: now,
    handled_at: "",
    refunded_at: "",
    created_at: now,
  };
  mockRefunds = [item, ...mockRefunds];
  persistMockRefunds();
  return {
    code: 0,
    message: "ok",
    data: { id: item.id, status: item.status, requested_at: item.requested_at },
  };
};

const mockRefundsResponse = async (params: {
  limit: number;
  offset: number;
}): Promise<StripeRefundsResponse> => {
  await delay(200);
  mockRefunds = loadMockRefunds();
  return {
    code: 0,
    message: "ok",
    data: {
      total: mockRefunds.length,
      refunds: mockRefunds.slice(params.offset, params.offset + params.limit),
    },
  };
};

/**
 * Submits a refund request (ticket-based, admin approval required - no
 * immediate charge). Rejects with the raw response body `{ code, message }`:
 * 6011 order missing / not paid, 6012 already refunded, 6015 bad reason,
 * 6017 a request already exists, HTTP 429 rate limited (3 req / 300s).
 */
export const stripe_refund_request = (order_no: string, reason: string) => {
  if (STRIPE_MOCK) return mockRefundRequest(order_no, reason);
  return request<StripeRefundSubmitResponse>(
    `${AGENT_C_API}/v1/stripe/refund`,
    {
      method: "post",
      cache: "no-store",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ order_no, reason }),
    }
  );
};

/** Lists the current user's refund requests, newest first. */
export const stripe_refunds = (params: { limit: number; offset: number }) => {
  if (STRIPE_MOCK) return mockRefundsResponse(params);
  return request<StripeRefundsResponse>(
    `${AGENT_C_API}/v1/stripe/refunds?limit=${params.limit}&offset=${params.offset}`,
    {
      method: "get",
      cache: "no-store",
    }
  );
};

// ---------------------------------------------------------------------------
// Pending order hint, persisted in sessionStorage across the Stripe redirect
// ---------------------------------------------------------------------------

export const STRIPE_PENDING_ORDER_KEY = "stripe_pending_order";

export interface StripePendingOrderHint {
  order_no: string;
  package_type: StripePackageType;
  /** unix seconds */
  created_at: number;
}

export function savePendingOrder(hint: StripePendingOrderHint): void {
  try {
    sessionStorage.setItem(STRIPE_PENDING_ORDER_KEY, JSON.stringify(hint));
  } catch {
    // storage unavailable (private mode) - result page falls back to latest order
  }
}

export function readPendingOrder(): StripePendingOrderHint | null {
  try {
    const raw = sessionStorage.getItem(STRIPE_PENDING_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StripePendingOrderHint;
    if (!parsed || !parsed.order_no) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  try {
    sessionStorage.removeItem(STRIPE_PENDING_ORDER_KEY);
  } catch {
    // ignore
  }
}
