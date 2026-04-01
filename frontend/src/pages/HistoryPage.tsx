import React, { useEffect, useState } from "react";
import type { HistorySession } from "../services/api";
import { getHistorySessions, deleteSession } from "../services/api";
import logo from "../assets/images/logo-symbol-2x.png";

/**
 * ChatBubble component (inline to keep things simple)
 */
const ChatBubble = ({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) => {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl text-sm
          ${
            isUser
              ? "bg-white text-black rounded-br-md"
              : "bg-lightBlue2 text-slate-700 rounded-bl-md"
          }
        `}
      >
        {!isUser && (
          <div className="text-xs text-darkBlue font-bold mb-1 uppercase">
            Aria
          </div>
        )}

        {content}
      </div>
    </div>
  );
};

interface HistoryPageProps {
  accessToken?: string | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ accessToken }) => {
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const sessions = await getHistorySessions(accessToken);
        setHistory(sessions);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Failed to load chat history. Please try again later.");
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!accessToken) return;

    try {
      await deleteSession(sessionId, accessToken);
      setHistory((prev) =>
        prev.filter((session) => session.session_id !== sessionId),
      );
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError("Failed to delete session. Please try again.");
    }
  };

  const handleSessionClick = (sessionId: string) => {
    console.log("Session clicked:", sessionId);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#052A3A] to-[#02151F]">
      {/* HEADER */}
      <div className="p-6 text-white text-lg font-semibold">
        <img src={logo} alt="Friendo Logo" className="w-24 h-auto" />
      </div>

      {/* CHAT STYLE HISTORY */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-6">
        {/* Notice */}
        <div className="text-center text-gray-400 text-sm">
          Older messages will be deleted
        </div>

        {/* STATES */}
        {isLoading ? (
          <div className="text-center text-gray-400">Loading history...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-400">No conversations yet</div>
        ) : (
          history.map((session) => (
            <div
              key={session.session_id}
              className="space-y-2 group relative"
              onClick={() => handleSessionClick(session.session_id)}
            >
              {/* FAKE USER MESSAGE (for UI realism) */}
              <ChatBubble
                role="user"
                content={session.title || "Untitled chat"}
              />

              {/* AI MESSAGE (real preview) */}
              <ChatBubble
                role="assistant"
                content={
                  session.preview ||
                  "No preview available. Start chatting to see your conversations here."
                }
              />

              {/* Meta row */}
              <div className="flex justify-between items-center text-xs text-gray-500 px-2">
                <span>{session.message_count} messages</span>

                <div className="flex items-center gap-2">
                  <span>
                    {new Date(session.updated_at).toLocaleDateString()}
                  </span>

                  {/* DELETE */}
                  <button
                    onClick={(e) => handleDelete(e, session.session_id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
