import React from "react";
import logo from "../assets/images/logo-symbol-2x.png";

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoPopup: React.FC<InfoPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Card Container */}
      <div className="bg-[#0B2230] rounded-3xl w-full max-w-md shadow-2xl px-6 py-20 text-center">
        {/* =========================
            LOGO / HEADER
        ========================= */}
        <div className="p-6 text-white flex justify-center text-lg font-semibold">
          <img src={logo} alt="Friendo Logo" className="w-32 h-auto" />
        </div>
        {/* =========================
            MAIN MESSAGE
        ========================= */}
        <h2 className="text-2xl font-semibold text-white mb-6">
          Just checking in 💬
        </h2>
        <div className="text-gray-300 text-sm leading-relaxed space-y-4">
          <p>Some of what you said sounds really heavy.</p>

          <p>If you're in distress, reaching out to someone can really help.</p>
        </div>
        {/* =========================
            CRISIS INFO (LIGHTER STYLE)
        ========================= */}
        <div className="mt-6 text-sm text-gray-300 space-y-2">
          <p className="text-white font-semibold">
            If you need immediate support:
          </p>

          <p className="text-amber-300 font-bold">Call or text 988</p>

          <p className="text-xs text-gray-400">
            Suicide Crisis Helpline – Canada
          </p>

          <a
            href="https://988.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 underline text-xs"
          >
            https://988.ca
          </a>
        </div>
        {/* =========================
            CTA BUTTON (NEW)
        ========================= */}
        <button
          onClick={onClose}
          className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          I will reach out 🤝
        </button>
        {/* =========================
            SECONDARY DISMISS (OPTIONAL)
        ========================= */}
        <button
          onClick={onClose}
          className="mt-3 text-gray-400 text-sm hover:text-white transition"
        >
          I'm okay for now
        </button>
      </div>
    </div>
  );
};
