import React, { useState } from "react";
import { PretendFriendSettingsPage } from "./PretendFriendSettingsPage";
import backgroundImage from "../assets/images/bg-1.jpg";
import logo from "../assets/images/logo-symbol-2x.png";

interface SettingsPageProps {
  onLogout: () => void;
  selectedPersonality?: string | null;
  onPersonalityChange?: (personalityId: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onLogout,
  selectedPersonality = "aria-empathetic",
  onPersonalityChange,
}) => {
  const [showPretendFriendSettings, setShowPretendFriendSettings] =
    useState(false);

  // If Pretend Friend settings is open, show that page instead
  if (showPretendFriendSettings) {
    return (
      <PretendFriendSettingsPage
        selectedPersonality={selectedPersonality}
        onPersonalityChange={onPersonalityChange}
        onBack={() => setShowPretendFriendSettings(false)}
      />
    );
  }

  // Main Settings Page
  return (
    <div
      className="bg-cover bg-center w-full h-full from-slate-900 via-slate-800 to-black overflow-hidden flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      {/* HEADER IMAGE */}
      <div className="p-6 text-white flex justify-start text-lg font-semibold">
        <img src={logo} alt="Friendo Logo" className="w-32 h-auto" />
      </div>
      {/* ===== TOP SECTION: Title ===== */}
      <div className="flex-shrink-0 w-full px-6 py-8 mt-32 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
        <button
          onClick={() => setShowPretendFriendSettings(true)}
          className="w-full px-8 py-3 bg-lightYellow text-gray-900 font-semibold rounded-lg hover:bg-lightYellow transition-all"
        >
          Choose Your AI Personality
        </button>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="w-full flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-end">
        {/* ===== ACCOUNTS SECTION ===== */}
        <div className="space-y-3 pb-32">
          <h2 className="text-white text-sm font-medium">Accounts</h2>

          {/* Delete Account Button */}
          <button className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all">
            Delete Account
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-lightBlue hover:bg-lightBlue2 text-gray-900 font-semibold py-3 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
