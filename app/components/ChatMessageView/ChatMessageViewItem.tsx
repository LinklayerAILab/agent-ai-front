import React from "react";
import { ChatMessage } from "./interfaces";
import Image from "next/image";

export function ChatMessageViewItem(props: ChatMessage) {
  const { isUser, text, type } = props;

  const renderContent = () => {
    switch (type) {
      case "text":
        return <p>{text}</p>;
      case "image":
        return (
          <Image
            src={text}
            alt="Agent response"
            className="max-w-xs rounded-lg"
            width={200}
            height={200}
          />
        );
      default:
        return <p>{text}</p>;
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`p-3 rounded-lg max-w-lg ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
        {renderContent()}
      </div>
    </div>
  );
}