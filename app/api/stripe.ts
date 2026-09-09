import { request } from "./request";

export const AGENT_C_API = process.env.NEXT_PUBLIC_API_AGENT_C;

export type StripePackageType = "basic" | "standard" | "professional";

export type StripeOrderStatus = "pending" | "paid" | "expired" | "failed";

export const STRIPE_ERROR_CODES = {
  NOT_ENABLED: 6001,
  INVALID_PACKAGE: 6002,
  UPSTREAM_ERROR: 6003,
  PENDING_LIMIT: 6006,
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

const mockCheckout = async (
  package_type: StripePackageType
): Promise<StripeCheckoutResponse> => {
  await delay(400);
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
  // flip the newest order to paid after ~5s so polling can be observed
  setTimeout(() => {
    mockOrders = mockOrders.map((o) =>
      o.order_no === order_no
        ? { ...o, status: "paid", paid_at: Math.floor(Date.now() / 1000) }
        : o
    );
  }, 5000);
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
