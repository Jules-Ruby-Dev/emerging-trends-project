import React, { useState } from "react";

interface PretendFriendSettingsPageProps {
  selectedPersonality?: string | null;
  onPersonalityChange?: (personalityId: string) => void;
  onBack: () => void;
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

export const PretendFriendSettingsPage: React.FC<
  PretendFriendSettingsPageProps
> = ({
  selectedPersonality = "aria-empathetic",
  onPersonalityChange,
  onBack,
}) => {
  const [customInstructions, setCustomInstructions] = useState("");

  const handleTraitClick = (personalityId: string) => {
    if (onPersonalityChange) {
      onPersonalityChange(personalityId);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-darkBlue via-slate-800 to-black overflow-hidden flex flex-col">
      {/* ===== HEADER WITH BACK BUTTON ===== */}
      <div className="flex-shrink-0 px-6 py-6 bg-gradient-to-b from-darkBlue/50 to-transparent flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-lightBlue hover:text-blue transition-colors text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-white">
          Settings &gt; Pretend Friend
        </h1>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* ===== TRAITS SECTION ===== */}
        <div>
          <h2 className="text-white text-sm font-medium mb-3">Fruits</h2>
          <div className="bg-lightBlue2 rounded-2xl p-4 space-y-2 max-h-72 overflow-y-auto">
            {TRAIT_CHARACTERISTICS.map((trait) => (
              <div
                key={trait.label}
                onClick={() => handleTraitClick(trait.personalityId)}
                className={`px-4 py-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 font-medium ${
                  selectedPersonality === trait.personalityId
                    ? "bg-lightOrange text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-lightBlue/30"
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

        {/* ===== ADDITIONAL INSTRUCTIONS SECTION ===== */}
        <div>
          <h2 className="text-white text-sm font-medium mb-2">
            Additional Instructions
          </h2>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Type your message here"
            className="w-full bg-white rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 text-sm min-h-24 resize-none border-none focus:outline-none focus:ring-2 focus:ring-blue"
          />
          <p className="text-gray-400 text-xs mt-2">
            Any custom instructions, add them here.
          </p>
        </div>

        {/* ===== SAVE BUTTON ===== */}
        <div className="space-y-3 pb-32">
          <button className="w-full bg-blue hover:bg-blue/90 text-white font-semibold py-3 rounded-lg transition-all">
            Save Friendo Settings
          </button>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
};
