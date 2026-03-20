import { NextApiRequest, NextApiResponse } from 'next';

// 从环境变量中读取 API 密钥
const apiKey = process.env.GPTBOT_API_KEY;
export const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
};

export const conversationApi = "https://api.gptbots.ai";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'API configuration',
    conversationApi,
    hasApiKey: !!apiKey
  });
}