export const chatApi = "/conversation_api";

export async function chat(conversation_id: string, message: string) {
  const response = await fetch(`${chatApi}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer app-5VhtryHS5zgzTaoBCpU8ATGr`,
    },
    body: JSON.stringify({
      conversation_id,
      inputs: {},
      query: message,
      response_mode: "streaming",
      user: "0x398a1C94E0C4a2aCA49f49F890c91757dc2188fA",
    }),
  });

  return response.body;
}