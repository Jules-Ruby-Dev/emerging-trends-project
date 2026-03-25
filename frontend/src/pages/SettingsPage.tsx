import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

interface SettingsPageProps {
  onLogout: () => void;
  selectedPersonality?: string | null;
  onPersonalityChange?: (personalityId: string) => void;
}

// Trait characteristics mapped to personality IDs
const TRAIT_CHARACTERISTICS = [
  { label: "Warm", personalityId: "aria-empathetic" },
  { label: "Supportive", personalityId: "aria-supportive" },
  { label: "Friendly", personalityId: "aria-friendly" },
  { label: "Pragmatic", personalityId: "aria-supportive" },
  { label: "Uses emojis", personalityId: "aria-friendly" },
  { label: "Casual", personalityId: "aria-friendly" },
  { label: "Encouraging", personalityId: "aria-encouraging" },
  { label: "Patient", personalityId: "aria-reflective" },
  { label: "Funny", personalityId: "aria-humorous" },
  { label: "Energetic", personalityId: "aria-encouraging" },
  { label: "Curious", personalityId: "aria-reflective" },
  { label: "Reflective", personalityId: "aria-reflective" },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onLogout,
  selectedPersonality = "aria-empathetic",
  onPersonalityChange,
}) => {
  const navigate = useNavigate();
  const [customInstructions, setCustomInstructions] = useState("");

  const handleTraitClick = (personalityId: string) => {
    if (onPersonalityChange) {
      onPersonalityChange(personalityId);
    }
  };

  const handleSaveSettings = () => {
    // Settings are saved via onPersonalityChange callback
    // This is just a visual feedback point
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-b from-cyan-900/30 to-transparent border-b border-cyan-500/20">
        <h1 className="text-xl font-bold text-white">
          Settings - Pretend Friend
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Pretend Friend Customization */}
        <div className="mb-6">
          <div className="bg-cyan-100 rounded-lg p-4 space-y-2">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {TRAIT_CHARACTERISTICS.map((trait) => (
                <div
                  key={trait.label}
                  onClick={() => handleTraitClick(trait.personalityId)}
                  className={`px-4 py-2 rounded cursor-pointer transition-all flex items-center gap-2 ${
                    selectedPersonality === trait.personalityId
                      ? "bg-amber-200 text-gray-900 font-semibold"
                      : "text-gray-800 hover:bg-cyan-200"
                  }`}
                >
                  {selectedPersonality === trait.personalityId && (
                    <span className="text-lg">✓</span>
                  )}
                  <span>{trait.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Instructions */}
        <div className="mb-6">
          <h2 className="text-white text-sm font-medium mb-2">
            Additional Instructions
          </h2>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Type your message here"
            className="w-full bg-white rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 text-sm min-h-24 resize-none border border-gray-300"
          />
          <p className="text-gray-500 text-xs mt-2">
            Any custom instructions, add them here.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg mb-6"
        >
          Save Friendo Settings
        </button>

        {/* Account Section */}
        <div className="space-y-3 mt-8 pt-6 border-t border-gray-600">
          <h2 className="text-white text-sm font-medium">Accounts</h2>

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
            className="w-full bg-cyan-100 hover:bg-cyan-200 text-gray-900 h-12 rounded-lg font-semibold"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Bottom Navigation - positioned absolutely */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent flex items-center justify-center gap-8 border-t border-cyan-500/20">
        <button className="text-gray-400 hover:text-cyan-400 transition font-medium text-sm">
          ⏰ History
        </button>
        <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center">
          <span className="text-gray-900 font-bold">⚙</span>
        </div>
        <button className="text-amber-500 hover:text-amber-400 transition font-medium text-sm">
          My settings
        </button>
      </div>
    </div>
  );
};
