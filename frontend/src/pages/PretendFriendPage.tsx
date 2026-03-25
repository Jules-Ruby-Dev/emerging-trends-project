import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export const PretendFriendPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTraits, setSelectedTraits] = useState<string[]>(["Pragmatic"]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const traits = [
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

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait],
    );
  };

  const handleSave = () => {
    console.log("Saving settings:", {
      traits: selectedTraits,
      instructions: additionalInstructions,
    });
    // TODO: Save to backend
    navigate("/settings");
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-20 bg-gradient-to-b from-cyan-900/40 to-transparent flex items-center px-6 border-b border-gray-700 justify-between">
        <h1 className="text-2xl font-bold text-white">
          Settings {">"} Pretend Friend
        </h1>
        <button
          onClick={() => navigate("/settings")}
          className="text-gray-400 hover:text-white text-xl"
          title="Back"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">
        {/* Personality Traits */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Fruits</h2>
          <div className="bg-amber-50 rounded-lg p-6 space-y-3">
            {traits.map((trait) => (
              <button
                key={trait}
                onClick={() => handleTraitToggle(trait)}
                className={`w-full text-left p-3 rounded-lg transition-all font-medium ${
                  selectedTraits.includes(trait)
                    ? "bg-amber-200 text-slate-900"
                    : "bg-transparent text-slate-700 hover:bg-amber-100"
                }`}
              >
                {selectedTraits.includes(trait) && "✓ "}
                {trait}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <h2 className="text-white font-semibold mb-2">
            Additional Instructions
          </h2>
          <textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="Type your message here"
            className="w-full bg-white rounded-lg p-4 text-slate-700 placeholder-gray-400 min-h-24 focus:outline-none"
          />
          <p className="text-gray-400 text-sm mt-2">
            Any custom instructions, add them here.
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold h-12 rounded-lg"
        >
          Save Friendo Settings
        </Button>
      </div>
    </div>
  );
};
