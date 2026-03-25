import React from "react";

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoPopup: React.FC<InfoPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-cyan-400/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in">
        {/* Logo */}
        <div className="flex justify-center pt-8 pb-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-3 border-2 border-cyan-300">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <div className="text-sm font-bold text-cyan-400">Friendo</div>
            <div className="text-xs text-cyan-300 font-semibold">PRETENDO</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Main message */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">
              Just checking in 💬
            </h2>
            <div className="space-y-3 text-gray-200 text-sm leading-relaxed">
              <p>Some of what you said sounds really heavy.</p>
              <p>
                If you're in distress, reaching out to someone can really help.
              </p>
            </div>
          </div>

          {/* Crisis resources */}
          <div className="bg-black/40 border border-cyan-400/20 rounded-lg p-4 mt-6">
            <p className="text-white font-semibold mb-3">
              If you need immediate support:
            </p>
            <div className="space-y-3">
              {/* Canada 988 */}
              <div>
                <p className="text-amber-300 font-bold">Call or text 988</p>
                <p className="text-xs text-gray-400">
                  Suicide Crisis Helpline – Canada
                </p>
                <a
                  href="https://988.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 text-xs underline transition-colors"
                >
                  visit: https://988.ca
                </a>
              </div>

              {/* Crisis Text Line */}
              <div className="pt-2 border-t border-gray-600">
                <p className="text-amber-300 font-bold">Text HOME to 741741</p>
                <p className="text-xs text-gray-400">Crisis Text Line</p>
                <a
                  href="https://www.crisistextline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 text-xs underline transition-colors"
                >
                  visit: https://www.crisistextline.org
                </a>
              </div>

              {/* US 988 */}
              <div className="pt-2 border-t border-gray-600">
                <p className="text-amber-300 font-bold">Call 988</p>
                <p className="text-xs text-gray-400">
                  Suicide & Crisis Lifeline – USA
                </p>
                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 text-xs underline transition-colors"
                >
                  visit: https://988lifeline.org
                </a>
              </div>
            </div>
          </div>

          {/* Supportive message */}
          <p className="text-gray-300 text-sm text-center py-4">
            You don't have to go through this alone. There are people who care
            and want to help.
          </p>
        </div>

        {/* Close button */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            I'm okay, thanks
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Thanks for caring
          </button>
        </div>
      </div>
    </div>
  );
};
