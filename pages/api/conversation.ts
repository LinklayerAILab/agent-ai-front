import type { NextApiRequest, NextApiResponse } from 'next';
import { conversationApi, headers } from '.';



interface CreateConversationResponse {
    conversation_id: string;
}

// Read API key from environment variables
const apiKey = process.env.GPTBOT_API_KEY;
if (!apiKey) {
    console.error('API key is not configured');
    throw new Error('API key is not configured');
}


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "POST":
      return handlePost(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// POST /api/posts
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (!apiKey) {
        console.error('API key is not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`${conversationApi}/v1/conversation`, {
            method: "POST",
            headers,
            body: req.body,
            redirect: "follow",
            cache: "no-store", // Recommended to avoid caching issues
        });

        // Check if external API response is successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            console.error('External API error:', response.status, errorData);
            return res.status(response.status).json(errorData);
        }
        
        const data: CreateConversationResponse = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
}
