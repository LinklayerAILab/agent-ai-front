
const conversationApi = "/api";

interface CreateConversationResponse {
    conversation_id: string;
}

export async function createConversation(): Promise<CreateConversationResponse> {
  const response = await fetch(`${conversationApi}/conversation`, {
    method: "POST",
    body: JSON.stringify({
        "user_id": "0x398a1C94E0C4a2aCA49f49F890c91757dc2188fA"
    }),
    redirect: "follow",
    cache: "no-store",
  });
  return response.json();
}


// --- Start of Refactored Types ---

// Define different types of message content parts
interface TextContentPart {
  type: 'text';
  text: string;
}

interface AudioContentPart {
  type: 'audio';
  audio: {
    url: string;
    name: string;
    format: string; // e.g., 'mp3'
  };
}

interface ImageContentPart {
  type: 'image';
  image: {
    url: string;
    name: string;
    format: string; // e.g., 'png'
  };
}

interface DocumentContentPart {
  type: 'document';
  document: {
    base64_content: string;
    name: string;
    format: string; // e.g., 'pdf'
  };
}

// Union of all possible content part types
type MessageContentPart = TextContentPart | AudioContentPart | ImageContentPart | DocumentContentPart;

// Single message interface definition
interface Message {
  role: 'user' | 'assistant';
  // Content can be simple text or complex multimodal content array
  content: string | MessageContentPart[];
}

// Optional session configuration
interface ConversationConfig {
  long_term_memory?: boolean;
  short_term_memory?: boolean;
  knowledge?: {
    data_ids?: string[];
    group_ids?: string[];
  };
}

// SendMessageRequest interface after refactoring
export interface SendMessageRequest {
  conversation_id: string;
  response_mode: 'blocking' | 'streaming';
  messages: Message[]; // Now a flexible message array
  conversation_config?: ConversationConfig; // Configuration is now optional
}

// --- Start of SendMessageResponse Types ---

// Message ID information
interface MessageInfoData {
  message_id: string;
}

// Flow output
interface FlowOutputData {
  content: string;
  branch: string | null;
  from_component_name: string;
}

// Cost details
interface CostData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: {
    audio_tokens: number;
    text_tokens: number;
  };
  completion_tokens_details: {
    reasoning_tokens: number;
    audio_tokens: number;
    text_tokens: number;
  };
}

// Define different types of response objects
interface MessageInfoResponse {
  code: 11;
  message: 'MessageInfo';
  data: MessageInfoData;
}

interface TextResponse {
  code: 3;
  message: 'Text';
  data: string; // Note: data is directly a string in the example
}

interface FlowOutputResponse {
  code: 10;
  message: 'FlowOutput';
  data: FlowOutputData[];
}

interface CostResponse {
  code: 4;
  message: 'Cost';
  data: CostData;
}

interface EndResponse {
  code: 0;
  message: 'End';
  data: null;
}

// Union of all possible response types
export type SendMessageResponse = 
  | MessageInfoResponse 
  | TextResponse 
  | FlowOutputResponse 
  | CostResponse 
  | EndResponse;

// --- End of SendMessageResponse Types ---


// --- End of Refactored Types ---

export async function sendMessage(request: SendMessageRequest): Promise<Response> {
  const response = await fetch(`/api/message`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        redirect: "follow",
        cache: "no-store",
    });

    // For streaming response, return Response object directly and let caller handle the data stream
    // For blocking response, caller can decide whether to call .json()
    return response;
}
