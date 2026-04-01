import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { InfoPopup } from "../components/InfoPopup";
import type { ChatMessage } from "../types/types";
import logo from "../assets/images/logo-symbol-2x.png";
import iconInfo from "../assets/icons/icon-info.svg";
import iconUp from "../assets/icons/icon-arrow-up.svg";
import iconMic from "../assets/icons/icon-mic.svg";
import iconCamera from "../assets/icons/icon-camera.svg";

interface HomePageProps {
  messages: ChatMessage[];
  messageInput: string;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onInputChange: (text: string) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

// Crisis keywords that trigger the support popup
const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "kill myself",
  "want to die",
  "end my life",
  "harm myself",
  "hopeless",
  "cant take it",
  "can't take it",
  "give up",
  "don't want to live",
  "can't go on",
  "cant go on",
];

function detectCrisisKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

export const HomePage: React.FC<HomePageProps> = ({
  messages,
  messageInput,
  isLoading,
  onSendMessage,
  onInputChange,
}) => {
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);

  // Check latest message for crisis keywords
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.role === "user" &&
        detectCrisisKeywords(lastMessage.content)
      ) {
        // Auto-show popup for crisis keywords with a small delay
        const timer = setTimeout(() => {
          setIsInfoPopupOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

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
      <div className="flex-shrink-0 flex justify-between items-center px-6 py-3 bg-gradient-to-b from-black/80 to-transparent relative z-20">
        <div className="">
          <img src={logo} alt="Friendo Logo" className="w-24 h-auto" />
        </div>
        <button
          onClick={() => setIsInfoPopupOpen(true)}
          className="text-gray-400 hover:text-cyan-400 transition text-lg p-1"
          title="Info"
        >
          <img
            src={iconInfo}
            alt="Info"
            className="w-8 h-8 me-3 opacity-50 hover:opacity:100 transition-opacity"
          />
        </button>
      </div>

      {/* Main Content Area - Centered layout for avatar */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative z-10">
        {/* Messages Area - Scrollable container with 3 visible */}
        <div className="flex-1 w-full max-w-2xl px-4 flex flex-col justify-end overflow-hidden relative">
          {/* Scrollable container for all messages */}
          <div className="flex flex-col space-y-3 overflow-y-auto pb-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{ opacity: messages.length - idx <= 3 ? 1 : 0.4 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} transition-opacity`}
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
                  PF
                </div>
                <div className="bg-amber-100/90 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none text-sm">
                  Aria is thinking...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Sticky at bottom */}
        <div className="flex-shrink-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent px-4 pt-4 pb-40 space-y-3 relative z-20">
          {/* Input Box */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="w-full max-w-2xl mx-auto relative">
              {/* FLOATING ACTION ICONS (BOTTOM LEFT)*/}
              <div className="absolute left-4 bottom-[12px] flex gap-2 text-gray-700 z-10">
                <button className="opacity-50 *:hover:opacity-100 text-xl">
                  <img src={iconCamera} alt="Camera" className="w-8 h-8" />
                </button>
                {/* <button className="hover:opacity-70 text-xl">{"</>"}</button> */}
                <button className="opacity-50 *:hover:opacity-100 text-xl">
                  <img src={iconMic} alt="Microphone" className="w-8 h-8" />
                </button>
              </div>

              {/* INPUT CONTAINER */}
              <div className="flex items-center bg-lightYellow rounded-2xl px-5 pt-4 pb-12 shadow-md">
                {/* INPUT */}
                <input
                  type="text"
                  placeholder="What would you like to know?"
                  value={messageInput}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500 text-lg"
                />

                {/* SEND BUTTON */}
                <button
                  onClick={handleSend}
                  disabled={isLoading || !messageInput.trim()}
                  className="ml-3 bg-cyan-500 hover:bg-cyan-600 text-white w-12 h-12 flex items-center justify-center rounded-full transition"
                >
                  {isLoading ? "..." : "↑"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Popup */}
      <InfoPopup
        isOpen={isInfoPopupOpen}
        onClose={() => setIsInfoPopupOpen(false)}
      />
    </div>
  );
};
