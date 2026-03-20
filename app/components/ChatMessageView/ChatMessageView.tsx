"use client";
import { createConversation, sendMessage, SendMessageRequest } from "@/app/api/conversation";
import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./interfaces";
import { ChatMessageViewItem } from "./ChatMessageViewItem";
import { SendMessageInput } from "./SendMessageInput";

const localConversationKey = "c_id";

export default function ChatMessageView() {
  const [cid, setCid] = useState("");
  const [messages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversationId = localStorage.getItem(localConversationKey);
    if (!conversationId) {
      createConversation().then((res) => {
        const newCid = res.conversation_id;
        setCid(newCid);
        localStorage.setItem(localConversationKey, newCid);
      });
    } else {
      setCid(conversationId);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
 const [streamingResponse, setStreamingResponse] = useState('');
  const handleSubmit = async (message: string) => {
       const request: SendMessageRequest = {
      conversation_id: cid,
      response_mode: 'streaming', // Request streaming response
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    };
    const response = await sendMessage(request);
     if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedResponse += chunk;
           // TODO Update UI in real-time
           setStreamingResponse(accumulatedResponse);
        }

      } else {
      }
  };

  useEffect(() => {
  },[streamingResponse])

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg relative flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatMessageViewItem key={msg.id} {...msg} />
        ))}
      </div>
      <SendMessageInput onSubmit={handleSubmit} />
    </div>
  );
}

