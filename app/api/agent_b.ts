import { request } from "./request";

export const AGENT_B_API = process.env.NEXT_PUBLIC_API_AGENT_B;

interface AgentBResponse {
  code: number;
  message: string;
}
export interface GetUserCountResponse extends AgentBResponse {
  data: {
    count: number;
  };
}

export const get_user_count_b = () => {
  return request<GetUserCountResponse>(`${AGENT_B_API}/v1/user_count`, {
    method: "get",
    cache: "no-store",
  });
};
