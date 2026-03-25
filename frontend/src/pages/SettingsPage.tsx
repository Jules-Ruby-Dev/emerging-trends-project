import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export const SettingsPage: React.FC<{ onLogout: () => void }> = ({
  onLogout,
}) => {
  const navigate = useNavigate();
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(
    "Pragmatic",
  );

  const personalities = [
    "Fruits",
    "Warm",
    "Supportive",
    "Friendly",
    "Pragmatic",
    "Uses emojis",
    "Casual",
    "Encouraging",
    "Patient",
    "Funny",
    "Energetic",
    "Curious",
    "Reflective",
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-20 bg-gradient-to-b from-cyan-900/40 to-transparent flex items-center px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">My Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {/* Pretend Friend Customization */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Pretend Friend
          </h2>
          <Button
            onClick={() => navigate("/pretend-friend")}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold h-12 rounded-lg"
          >
            Choose AI Personality
          </Button>
        </div>

        {/* AI Personality Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Current Personality Traits
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Your AI friend{"'"}s active personality settings
          </p>
          <div className="bg-amber-50 rounded-lg p-6 space-y-3 max-h-72 overflow-y-auto">
            {personalities.map((trait) => (
              <button
                key={trait}
                onClick={() => setSelectedPersonality(trait)}
                className={`w-full text-left p-3 rounded-lg transition-all font-medium ${
                  selectedPersonality === trait
                    ? "bg-amber-200 text-slate-900"
                    : "bg-transparent text-slate-700 hover:bg-amber-100"
                }`}
              >
                {selectedPersonality === trait && "✓ "}
                {trait}
              </button>
            ))}
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white mb-4">Accounts</h2>

          {/* Delete Account Button */}
          <Button
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-lg font-semibold"
          >
            Delete Account
          </Button>

          {/* Logout Button */}
          <Button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white h-12 rounded-lg font-semibold"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
