// http://192.168.85.21:6888

import { service } from "./service";
const DEFAI_AGENT_API = "/defai_api";

export interface ApiResponse {
  code: number;
  msg: string;
}
export interface LoginParams {
  sig_msg: string;
  signature: string;
}

export interface LoginResponse extends ApiResponse {
  data: {
    access_token: string;
    user_id: string;
    iframe: string;
  };
}

export const login = (params: LoginParams) => {
  return service.post(`${DEFAI_AGENT_API}/v1/login`, params);
};

export const AGENT_API = "/agentApi";

// /set_integrated
// 0 telegram  1 discord  3 whatsapp 6 line 2 slack 5 ins
export type PlatformType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface SetintegratedParams {
  app_type: PlatformType;
  token?: string;
  key?: string;
  client_id?: string;
  white_list?: string;
  phone_number_id?: string;
}
export interface SetintegratedResponse extends ApiResponse {
  data: {
    status: boolean;
  };
}
export const set_integrated = (
  params: SetintegratedParams
): Promise<SetintegratedResponse> => {
  return service.post(`${AGENT_API}/v1/set_integrated`, params);
};

/**
 * ALL --allpair话ID
SPACE--工作空间产生的对话ID
API--API调用产生的对话ID
EMBED--iframe产生的对话ID
WIDGET--部件气泡产生的对话ID
AI_SEARCH--AI搜索产生的对话ID
SHARE--分享产生的对话ID
WHATSAPP_META--WhatsApp by Meta产生的对话ID
WHATSAPP_ENGAGELAB--WhatsApp by EngageLab产生的对话ID
DINGTALK--钉钉机器人产生的对话ID
DISCORD--Discord产生的对话ID
SLACK --Slack产生的对话ID
ZAPIER--Zapier产生的对话ID
WXKF --微信客服产生的对话ID
TELEGRAM--Telegram产生的对话ID
LIVECHAT--LiveChat产生的对话ID
ZAPIER--Zapier产生的对话ID
 */

export type ConversationType =
  | "ALL"
  | "SPACE"
  | "API"
  | "EMBED"
  | "WIDGET"
  | "AI_SEARCH"
  | "SHARE"
  | "WHATSAPP_META"
  | "DINGTALK"
  | "DISCORD"
  | "SLACK"
  | "ZAPIER"
  | "WXKF"
  | "TELEGRAM"
  | "LIVECHAT"
  | "ZAPIER";
export interface GetConversationListParams {
  conversation_type: ConversationType;
  start_time: number;
  end_time: number;
  page: number;
  page_size: number;
}

export interface ConversationItem {
  bot_id: string;
  conversation_id: string;
  conversation_type: string;
  cost_credit: number;
  message_count: number;
  recent_chat_time: number;
  subject: string;
  user_id: string;
}
export interface GetConversationResponse extends ApiResponse {
  data: {
    list: ConversationItem[];
    total: number;
  };
}

// querysessionrecord
export const get_conversation_list = (
  params: GetConversationListParams
): Promise<GetConversationResponse> => {
  return service.get(`${AGENT_API}/v1/get_conversation_list`, { params });
};

export type UserFeedBack = "ALL" | "NONE" | "GOOD" | "BAD";
export interface GetQAListParams {
  user_feedback: UserFeedBack;
  start_time: number;
  end_time: number;
  page: number;
  page_size: number;
}
export interface GetQAListItem {
  a: string;
  convo_id: string;
  convo_type: ConversationType;
  id: string;
  q: string;
  q_time: number;
  user_feedback: UserFeedBack;
  user_id: string;
}
export interface GetQAListResponse extends ApiResponse {
  data: {
    list: GetQAListItem[];
    total: number;
  };
}

// queryQ&Arecord
export const get_qa_list = (
  params: GetQAListParams
): Promise<GetQAListResponse> => {
  return service.get(`${AGENT_API}/v1/get_qa_list`, { params });
};

export const get_bot = () => {
  return fetch(`/uploadApi/v1/bot/detail`, {
    headers: {
      Authorization: `Bearer app-azA9fLGtyCJFxkF9vfMFDoxp`,
    },
  });
};

export const uploadFile = () => {
  return fetch(`/uploadApi/v1/bot/data/file/upload`, {
    method: "post",
    headers: {
      Authorization: `Bearer app-azA9fLGtyCJFxkF9vfMFDoxp`,
    },
  });
};

export interface DocItem {
  data_id: string;
  data_status:
    | "PENDING_PARSE"
    | "AVAILABLE"
    | "PENDING_ASYNC_EMBEDDING"
    | "PENDING_EMBEDDING";
  file_name: string;
  upload_time: number;
  update_time: number;
}
export interface GetFileListParams {
  page: number;
  size: number;
}
export interface GetFileListResponse extends ApiResponse {
  data: {
    total_count: number;
    doc: DocItem[];
  };
}
export const get_file_list = (
  params: GetFileListParams
): Promise<GetFileListResponse> => {
  return service.post(`${AGENT_API}/v1/get_file_list`, params);
};

//   Integrated_Type_Telegram = 0
//   Integrated_Type_Discord  = 1
//   Integrated_Type_Slack    = 2
//   Integrated_Type_WhatsApp = 3
//   Integrated_Type_Iframe   = 4
export interface SetIntegratedParams {
  bot_id: string;
  app_type: PlatformType;
  integrated_code_1?: string;
  integrated_code_2?: string;
  integrated_code_3?: string;
}
//
export const set_integrated_result = (
  params: SetIntegratedParams
): Promise<GetFileListResponse> => {
  return service.post(`${AGENT_API}/v1/set_integrated_result`, params);
};

export interface InfoItem {
  user_id: string;
  bot_id: string;
  app_type: 0 | 1 | 2 | 3 | 4 | 5 | 6; //0:telegram, 1:discord, 2:slack, 3: whatsApp 5:ins
  app_token: string;
  app_key: string;
  client_id: string;
  client_secret: string;
  bubble_list: string;
  integrated_code: string;
  set_flag: boolean;
  phone_number_id: string;
  integrated_code_1: string;
  integrated_code_2: string;
  integrated_code_3: string;
}
export interface GetIntegraInfosResponse extends ApiResponse {
  data: {
    IntegInfos: InfoItem[] | null;
  };
}
// fetch 集成information
export const get_Integrated_infos = (): Promise<GetIntegraInfosResponse> => {
  return service.get(`${AGENT_API}/v1/get_Integrated_infos`);
};

export interface CreateOrderParams {
  commodity_id: number;
  payer_address: string;
  credits?: number;
}

export interface OrderInfo {
  order_id: string;
  commodity_id: number;
  pay_address: string; // 付款人地址地址
  collection_address: string; // 收款地址
  amount: number; // 付款金额
  credits: number;
  coin_type: number;
  network_id: number;
  paid_amount: number;
  /**
   * 0: 未支付, 1: 支付Success, 2: 支付Failed, 3: 实际支付金额不足
   */
  payment_status: 0 | 1 | 2 | 3;
  payment_time: number;
  quantity: number;
  sub_end_time: number;
  sub_start_time: number;
  tx_hash: string;
  user_id: string;
}

export interface CreateOrderResponse extends ApiResponse {
  data: {
    order: OrderInfo;
  };
}
//  0 积分  1 按monthssubscribe  2  按yearssubscribe 3 按季度

// Create订单
export const create_order = (
  params: CreateOrderParams
): Promise<CreateOrderResponse> => {
  return service.post(`${AGENT_API}/v1/create_order`, params);
};

// 0 积分 1 按monthssubscribe  2  按yearssubscribe、
export const get_unpayment_order = (params: {
  commodity_id: number;
}): Promise<CreateOrderResponse> => {
  return service.post(`${AGENT_API}/v1/get_unpayment_order`, params);
};

export interface UpdateOrderParams {
  order_id: string;
  tx_hash: string;
  payer_address?: `0x${string}`;
  credits: number;
  // isnoupdate積分
  update_credit_flag: boolean;
}
export const update_order = (params: UpdateOrderParams) => {
  return service.post(`${AGENT_API}/v1/update_order`, params);
};

export interface GetUserOrdersParams {
  page: number;
  size: number;
}

export interface GetUserOrdersResponse extends ApiResponse {
  data: {
    orders: {
      order_list: OrderInfo[];
      total_count: number;
    };
  };
}
// query账单list
export const get_user_orders = (
  params: GetUserOrdersParams
): Promise<GetUserOrdersResponse> => {
  return service.post(`${AGENT_API}/v1/get_user_orders`, params);
};

export interface GetUsingOrderResponse extends ApiResponse {
  data: {
    order: OrderInfo;
  };
}
// query正inuse订单
export const get_using_order = (): Promise<GetUsingOrderResponse> => {
  return service.post(`${AGENT_API}/v1/get_using_order`);
};

export interface GetCreditResponse extends ApiResponse {
  data: {
    credits: number;
  };
}
// Delete query积分
export const get_credit = (): Promise<GetCreditResponse> => {
  return service.post(`${AGENT_API}/v1/get_credit`);
};


export interface GetUserRewardpointResponse extends ApiResponse {
  data: {
    reward_points:number
  };
}
export const user_rewardpoints = (): Promise<GetUserRewardpointResponse> => {
  return service.get(`${DEFAI_AGENT_API}/v1/user_rewardpoints`);
}

// verificationtoken有效性
export const validate_token = (): Promise<LoginResponse> => {
  return service.post(`${AGENT_API}/v1/validate_token`);
};

// logout
export const logout = () => {
  return service.post(`${AGENT_API}/v1/logout`);
};

export interface SetLoginCodeResponse extends ApiResponse {
  data: {
    login_code: string;
  };
}
export interface SetLoginCodeParams {
  bot_id: string;
}
// refresh login_code
export const set_logincode = (
  params: SetLoginCodeParams
): Promise<SetLoginCodeResponse> => {
  return service.post(`${AGENT_API}/v1/set_logincode`, params);
};

export interface AgentKOLItem {
  claim_num: number;
  contact: string;
  invite_code: string;
  total_invite: number;
  register_time: number;
}
export type GetAgentKOLResponse = {
  data?: {
    Res: AgentKOLItem[];
    Total: number;
  };
} & ApiResponse;

export interface PageParams {
  page: number;
  size: number;
}

// queryagent tg koldata
export const get_agent_KOL = (
  params: PageParams
): Promise<GetAgentKOLResponse> => {
  return service.post(`${AGENT_API}/v1/agentKOL`, params);
};

export interface AgentTwitterKOLItem {
  invite_user_claim_num: number;
  twitter_name: string;
  invite_code: string;
  invite_total: number;
  register_time: number;
}
export type GetTwitterAgentKOLResponse = {
  data?: {
    Res: AgentTwitterKOLItem[];
    Total: number;
  };
} & ApiResponse;

// query agent twitter koldata
export const agentKOLDappTwitter = (
  params: PageParams
): Promise<GetTwitterAgentKOLResponse> => {
  return service.post(`${AGENT_API}/v1/agentKOLDappTwitter`, params);
};


export interface TgParams {
    user_id: string;
    user_name: string;
    first_name: string;
    last_name: string;
    invite_code: string;
}

export interface TgResponse extends ApiResponse {
  data: {
    access_token: string;
    iframe: string
    user_id: string;
  };
}

export const tgLogin = (params: TgParams) => {
  return service.post(`${DEFAI_AGENT_API}/v1/login`, params);
};



// /nonce

export interface NonceResponse extends ApiResponse {
  data: {
    nonce: string;
  }
}
export const getSiweNonce = async ():Promise<NonceResponse> => {
  return service.get(`${DEFAI_AGENT_API}/v1/nonce`);

}

export interface SiweVerifyResponse extends ApiResponse {
  data: {
    access_token: string;
    address: string;
    chainId: number;
  }
}
export interface SiweVerifyParams {
  message: string;
  signature: string;
  invite_code?: string;
}
export const verifySiweMessage = (params: SiweVerifyParams):Promise<SiweVerifyResponse> => {
  return service.post(`${DEFAI_AGENT_API}/v1/login`, params);
}
