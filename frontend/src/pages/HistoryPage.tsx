import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import type { HistorySession } from "../api";
import { getHistorySessions, deleteSession } from "../api";

interface HistoryPageProps {
  accessToken?: string | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ accessToken }) => {
  const navigate = useNavigate();
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
    // Could navigate to a detail page or load the session into the chat
    console.log("Session clicked:", sessionId);
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-20 bg-gradient-to-b from-cyan-900/40 to-transparent flex items-center px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Chat History</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">⏱️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No History Yet
            </h2>
            <p className="text-gray-400 mb-8">
              Your chat conversations will appear here
            </p>
            <p className="text-sm text-gray-500">
              Note: Conversations are kept for 30 days
            </p>
          </div>
        ) : (
          history.map((session) => (
            <div
              key={session.session_id}
              onClick={() => handleSessionClick(session.session_id)}
              className="p-4 bg-gray-800/40 hover:bg-gray-800/60 rounded-lg border border-gray-700 cursor-pointer transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-1 truncate">
                    {session.title || "Untitled Chat"}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {session.preview}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {session.message_count} messages
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(session.updated_at)}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, session.session_id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                    title="Delete session"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-700 p-4 bg-gradient-to-t from-black/60 to-transparent text-center">
        <p className="text-xs text-gray-500">
          Conversations are stored securely and kept for 30 days
        </p>
      </div>
    </div>
  );
};
