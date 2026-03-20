export const isProd =
  process.env.NEXT_PUBLIC_NODE_ENV === "prod" ? true : false;
export const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "dev" ? true : false;
export const isTest = process.env.NEXT_PUBLIC_NODE_ENV === "test" ? true : false;

export const mainInviteCode = "linklayer";

export const DEFAULT_CHAIN_ID = Number(process.env.VITE_DEFAULT_CHAIN_ID);

export const DEFAULT_CHAIN_NAME = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_NAME;
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;

export const USER_WHITE_LIST = [
  "0xBa7B3387D88Bd7675DE8B492a9067dc6B7A59311",
  "0x02C3bE48336eA085C257b28DB13F6370e60051b1",
  "0xD58d7353E1f1c367258A7B31Dd20b5D3A8dCc3c0",
  "0x2596ea5E2f3f0Ae4735dB83D0573f458029Deb55",
  '0x56Fa925053085c295cC50dF6d27C49714071631A'
];



export const CHAIN_ID=Number(process.env.NEXT_PUBLIC_CHAIN_ID);
export const CHAIN_NAME=process.env.NEXT_PUBLIC_CHAIN_NAME;
export const CURRENCY=process.env.NEXT_PUBLIC_CURRENCY;
export const CONTRACT=process.env.NEXT_PUBLIC_CONTRACT;

export const ERC20_CONTRACT=process.env.NEXT_PUBLIC_ERC20_CONTRACT;
