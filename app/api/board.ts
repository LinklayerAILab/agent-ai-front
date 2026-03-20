import { request } from "./request";


export const BOARD__HOST = process.env.NEXT_PUBLIC_BOARD__HOST;

export interface NoticeItem {
content: string
created_at: string
id: number
is_published: boolean
link: string
published_at: null
publisher_id: number
publisher_name: string
status: string
title: string
type: string
updated_at: string
}
export interface NoticeResponse {
    code: number;
    data:{
        total: number;
        page: number
        pageSize: number
        notifications: NoticeItem[];
    }
} 
export const getNotices = async (): Promise<NoticeResponse> => {
  return request(`/board_api/api/notifications/published`, {
    method: "GET",
    cache: "no-store",
  });
};

