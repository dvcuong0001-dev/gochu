"use client";

import React from "react";

interface VirtualKeyboardProps {
  activeChar?: string;
}

interface KeyDef {
  key: string;
  display?: string;
  width?: string;
  isHomeBump?: boolean;
}

const KEYBOARD_ROWS: KeyDef[][] = [
  [
    { key: "`", display: "~ `", width: "w-9 sm:w-10" },
    { key: "1", display: "! 1", width: "w-9 sm:w-10" },
    { key: "2", display: "@ 2", width: "w-9 sm:w-10" },
    { key: "3", display: "# 3", width: "w-9 sm:w-10" },
    { key: "4", display: "$ 4", width: "w-9 sm:w-10" },
    { key: "5", display: "% 5", width: "w-9 sm:w-10" },
    { key: "6", display: "^ 6", width: "w-9 sm:w-10" },
    { key: "7", display: "& 7", width: "w-9 sm:w-10" },
    { key: "8", display: "* 8", width: "w-9 sm:w-10" },
    { key: "9", display: "( 9", width: "w-9 sm:w-10" },
    { key: "0", display: ") 0", width: "w-9 sm:w-10" },
    { key: "-", display: "_ -", width: "w-9 sm:w-10" },
    { key: "=", display: "+ =", width: "w-9 sm:w-10" },
    { key: "Backspace", display: "Back", width: "w-14 sm:w-16" },
  ],
  [
    { key: "Tab", display: "Tab", width: "w-12 sm:w-14" },
    { key: "q", width: "w-9 sm:w-10" },
    { key: "w", width: "w-9 sm:w-10" },
    { key: "e", width: "w-9 sm:w-10" },
    { key: "r", width: "w-9 sm:w-10" },
    { key: "t", width: "w-9 sm:w-10" },
    { key: "y", width: "w-9 sm:w-10" },
    { key: "u", width: "w-9 sm:w-10" },
    { key: "i", width: "w-9 sm:w-10" },
    { key: "o", width: "w-9 sm:w-10" },
    { key: "p", width: "w-9 sm:w-10" },
    { key: "[", display: "{ [", width: "w-9 sm:w-10" },
    { key: "]", display: "} ]", width: "w-9 sm:w-10" },
    { key: "\\", display: "| \\", width: "w-10 sm:w-12" },
  ],
  [
    { key: "CapsLock", display: "Caps", width: "w-14 sm:w-16" },
    { key: "a", width: "w-9 sm:w-10" },
    { key: "s", width: "w-9 sm:w-10" },
    { key: "d", width: "w-9 sm:w-10" },
    { key: "f", width: "w-9 sm:w-10", isHomeBump: true },
    { key: "g", width: "w-9 sm:w-10" },
    { key: "h", width: "w-9 sm:w-10" },
    { key: "j", width: "w-9 sm:w-10", isHomeBump: true },
    { key: "k", width: "w-9 sm:w-10" },
    { key: "l", width: "w-9 sm:w-10" },
    { key: ";", display: ": ;", width: "w-9 sm:w-10" },
    { key: "'", display: "\" '", width: "w-9 sm:w-10" },
    { key: "Enter", display: "Enter", width: "w-16 sm:w-20" },
  ],
  [
    { key: "ShiftLeft", display: "Shift", width: "w-16 sm:w-20" },
    { key: "z", width: "w-9 sm:w-10" },
    { key: "x", width: "w-9 sm:w-10" },
    { key: "c", width: "w-9 sm:w-10" },
    { key: "v", width: "w-9 sm:w-10" },
    { key: "b", width: "w-9 sm:w-10" },
    { key: "n", width: "w-9 sm:w-10" },
    { key: "m", width: "w-9 sm:w-10" },
    { key: ",", display: "< ,", width: "w-9 sm:w-10" },
    { key: ".", display: "> .", width: "w-9 sm:w-10" },
    { key: "/", display: "? /", width: "w-9 sm:w-10" },
    { key: "ShiftRight", display: "Shift", width: "w-16 sm:w-20" },
  ],
  [
    { key: "Ctrl", display: "Ctrl", width: "w-12 sm:w-14" },
    { key: "Alt", display: "Alt", width: "w-12 sm:w-14" },
    { key: " ", display: "Space", width: "w-64 sm:w-80" },
    { key: "AltGr", display: "Alt", width: "w-12 sm:w-14" },
    { key: "CtrlR", display: "Ctrl", width: "w-12 sm:w-14" },
  ],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeChar = "" }) => {
  const normChar = activeChar.toLowerCase();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-[#0a101f]/90 border border-white/10 rounded-2xl shadow-2xl select-none">
      <div className="flex flex-col gap-1.5 items-center font-mono">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((kDef, kIdx) => {
              const isMatch =
                (normChar === " " && kDef.key === " ") ||
                (normChar === "\n" && kDef.key === "Enter") ||
                kDef.key.toLowerCase() === normChar;

              const w = kDef.width || "w-9 sm:w-10";

              return (
                <div
                  key={kIdx}
                  className={`h-9 sm:h-11 ${w} rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-150 relative border ${
                    isMatch
                      ? "bg-amber-400 text-black border-amber-300 font-extrabold shadow-lg shadow-amber-400/50 scale-105 z-10 animate-pulse"
                      : "bg-[#11192e] text-gray-300 border-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="truncate px-1">
                    {kDef.display || kDef.key.toUpperCase()}
                  </span>

                  {/* F and J Home bumps */}
                  {kDef.isHomeBump && !isMatch && (
                    <span className="absolute bottom-1 w-3 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
