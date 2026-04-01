import React, { useState } from "react";
import { Link } from "react-router-dom";

import iconMessage from "../assets/icons/icon-message.svg";
import iconHistory from "../assets/icons/icon-history.svg";
import iconSettings from "../assets/icons/icon-settings.svg";

export const Navigation = ({ currentPage }) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const getIconFilter = (iconName: string, isActive: boolean) => {
    if (isActive) return "hue-rotate(-15deg) saturate(1.2) brightness(1.1)"; // orange
    if (hoveredIcon === iconName)
      return "hue-rotate(220deg) saturate(0.8) brightness(1)"; // lightBlue
    return "brightness(1) saturate(0) opacity-60"; // gray
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-darkBlue z-30 px-4 py-4">
      {/* =========================
          NORMAL NAV ITEMS (LEFT + RIGHT)
      ========================= */}
      <div className="px-8 flex justify-between items-center relative">
        {/* HISTORY */}
        <Link
          to="/history"
          onMouseEnter={() => setHoveredIcon("history")}
          onMouseLeave={() => setHoveredIcon(null)}
          className={`flex flex-col items-center gap-1 px-6 py-3 transition-all ${
            currentPage === "history"
              ? "text-orange scale-110"
              : "text-gray-400"
          }`}
        >
          <img
            src={iconHistory}
            alt="History"
            className="w-6 h-6 transition-all"
            style={{
              filter: getIconFilter("history", currentPage === "history"),
            }}
          />
          <span className="text-xs">History</span>
        </Link>

        {/* SETTINGS */}
        <Link
          to="/settings"
          onMouseEnter={() => setHoveredIcon("settings")}
          onMouseLeave={() => setHoveredIcon(null)}
          className={`flex flex-col items-center gap-1 px-6 py-3 transition-all ${
            currentPage === "settings"
              ? "text-orange scale-110"
              : "text-gray-400"
          }`}
        >
          <img
            src={iconSettings}
            alt="Settings"
            className="w-6 h-6 transition-all"
            style={{
              filter: getIconFilter("settings", currentPage === "settings"),
            }}
          />
          <span className="text-xs">My Settings</span>
        </Link>
      </div>

      {/* =========================
          FLOATING CHAT BUTTON
      ========================= */}
      <Link
        to="/"
        className="absolute left-1/2 -translate-x-1/2 -top-8 transition-all group"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 transition-all group-hover:scale-110 ${
            currentPage === "home"
              ? "bg-blue border-lightBlue"
              : "bg-blue border-darkBlue hover:shadow-xl"
          }`}
        >
          {/* icon */}
          <img
            src={iconMessage}
            alt="Chat"
            className={`w-7 h-7 transition-all ${currentPage === "home" ? "brightness-100" : ""}`}
          />
        </div>
      </Link>
    </nav>
  );
};
