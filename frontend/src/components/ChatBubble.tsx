import React from "react";

type ChatBubbleProps = {
  role: "user" | "assistant";
  content: string;
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content }) => {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? "bg-gray-200 text-black rounded-br-md"
              : "bg-slate-600 text-white rounded-bl-md"
          }
        `}
      >
        {/* AI label */}
        {!isUser && <div className="text-xs text-gray-300 mb-1">Freya</div>}

        {content}
      </div>
    </div>
  );
};
