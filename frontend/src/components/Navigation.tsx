import React from "react";
import { Link } from "react-router-dom";

interface NavigationProps {
  currentPage: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage }) => {
  const navItems = [
    { id: "history", label: "History", icon: "⏱️", path: "/history" },
    { id: "home", label: "Chat", icon: "💬", path: "/" },
    { id: "settings", label: "My Settings", icon: "⚙️", path: "/settings" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-800 to-transparent border-t border-gray-700 pointer-events-auto z-30 px-4 py-4">
      <div className="flex justify-around items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-all flex-1 ${
              currentPage === item.id
                ? "text-cyan-400 bg-cyan-500/20 border border-cyan-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
