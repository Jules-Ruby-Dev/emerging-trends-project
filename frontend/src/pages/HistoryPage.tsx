import React, { useEffect, useState } from "react";

export const HistoryPage: React.FC = () => {
  const [history] = useState<any[]>([]);

  useEffect(() => {
    // Fetch chat history from API
    // For now, show empty state
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-20 bg-gradient-to-b from-cyan-900/40 to-transparent flex items-center px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Chat History</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">⏱️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No History Yet
            </h2>
            <p className="text-gray-400 mb-8">
              Your chat conversations will appear here
            </p>
            <p className="text-sm text-gray-500">
              Note: Older messages will be automatically deleted after 30 days
            </p>
          </div>
        ) : (
          history.map((session, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-800/40 hover:bg-gray-800/60 rounded-lg border border-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">
                    {session.title || "Untitled Chat"}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {session.preview}
                  </p>
                </div>
                <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                  {new Date(session.date).toLocaleDateString()}
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
