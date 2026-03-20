import React, { useState } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

interface SendMessageInputProps {
  onSubmit: (text: string) => void;
}

export function SendMessageInput(props: SendMessageInputProps) {
  const [text, setText] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        props.onSubmit(text);
        setText("");
      }
    }
  };

  const handleClick = () => {
    if (text.trim()) {
      props.onSubmit(text);
      setText("");
    }
  };

  return (
    <div className="p-4 border-t border-gray-300">
      <div className="relative">
        <textarea
          placeholder="请输入"
          style={{ resize: "none" }}
          className="w-full h-24 rounded-lg border border-gray-300 p-2 pr-12"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div
          className="absolute flex items-center justify-center cursor-pointer right-3 bottom-3 w-8 h-8 rounded-lg bg-blue-500 text-white"
          onClick={handleClick}>
          <ArrowUpOutlined style={{ fontSize: 20 }} />
        </div>
      </div>
    </div>
  );
}