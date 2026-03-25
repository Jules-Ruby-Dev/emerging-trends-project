import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { ChatMessage } from "../types";

interface HomePageProps {
  messages: ChatMessage[];
  messageInput: string;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onInputChange: (text: string) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const HomePage: React.FC<HomePageProps> = ({
  messages,
  messageInput,
  isLoading,
  onSendMessage,
  onInputChange,
}) => {
  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      onInputChange("");
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* 3D Canvas Background with AR Avatar - Canvas is rendered by App.tsx */}

      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/80 to-transparent border-b border-cyan-500/20 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
            F
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-400">Friendo</div>
            <div className="text-xs text-cyan-300">PRETENDO</div>
          </div>
        </div>
        <button
          className="text-gray-400 hover:text-cyan-400 transition text-lg p-1"
          title="Info"
        >
          ⓘ
        </button>
      </div>

      {/* Main Content Area - Centered layout for avatar */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative z-10">
        {/* Messages Area - Scrollable, centered with max-width */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 w-full max-w-2xl flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role !== "user" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  F
                </div>
              )}
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-cyan-600 text-white rounded-br-none"
                    : "bg-amber-100/90 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                F
              </div>
              <div className="bg-amber-100/90 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none text-sm">
                ✍️ Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Sticky at bottom */}
        <div className="flex-shrink-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent px-4 pt-4 pb-32 space-y-3 relative z-20">
          {/* Action Buttons */}
          <div className="flex justify-center gap-8 text-gray-400">
            <button
              className="hover:text-cyan-400 transition text-xl"
              title="Upload image"
            >
              📷
            </button>
            <button
              className="hover:text-cyan-400 transition text-xl"
              title="Code snippet"
            >
              {"<>"}
            </button>
            <button
              className="hover:text-cyan-400 transition text-xl"
              title="Voice message"
            >
              🎤
            </button>
          </div>

          {/* Input Box */}
          <div className="flex gap-3 items-end">
            <Input
              type="text"
              placeholder="What would you like to know?"
              value={messageInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange(e.target.value)
              }
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              className="flex-1 bg-white/90 border-none text-gray-900 placeholder-gray-500 rounded-lg h-10"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !messageInput.trim()}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-4 h-10 rounded-lg flex-shrink-0"
              size="sm"
            >
              {isLoading ? "..." : "↑"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
