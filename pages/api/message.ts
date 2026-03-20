import type { NextApiRequest, NextApiResponse } from 'next';
import { conversationApi, headers } from '.';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const externalApiResponse = await fetch(`${conversationApi}/v2/conversation/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    if (!externalApiResponse.ok) {
      const errorBody = await externalApiResponse.text();
      return res.status(externalApiResponse.status).send(errorBody);
    }

    // 检查客户端是否请求流式响应
    if (req.body.response_mode === 'streaming') {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      if (externalApiResponse.body) {
        const reader = externalApiResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            res.write(decoder.decode(value));
          }
        } catch (error) {
          console.error('Streaming error:', error);
        } finally {
          res.end();
        }
      } else {
        res.end();
      }
    } else {
      // 处理阻塞式响应
      const data = await externalApiResponse.json();
      res.status(200).json(data);
    }

  } catch (error) {
    console.error('Error forwarding message request:', error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}