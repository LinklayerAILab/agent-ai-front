export { };

declare module '@reown/appkit-siwe' {
  export * from '@reown/appkit-siwe/dist/types/exports/index';
}

export interface TelegramMiniAppUserInfo {
  auth_date: string;
  hash: string;
  query_id: string;
  start_param?: string;
  user: {
    allows_write_to_pm: boolean;
    first_name: string;
    id: number;
    language_code: string;
    last_name: string;
    username: string;
  };
}

export interface TelegramUserInfo {
  id: number;
  photo_url: string;
  last_name: string;
  first_name: string;
  username: string;
  auth_date: number;
  hash: string;
 [key: string]: string | number;
}
declare global {
  interface Window {
    turnstile: {
      execute: (container: HTMLElement | string, options?: { action?: string }) => void | Promise<string>;
      render: (element: HTMLElement | string, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        action?: string;
        size?: string;
        theme?: string;
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };

    FB: unknown
  }
}