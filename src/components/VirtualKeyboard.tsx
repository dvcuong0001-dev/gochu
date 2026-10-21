"use client";

import React from "react";

interface VirtualKeyboardProps {
  activeChar?: string;
}

// Finger mapping
// 0: L-pinky, 1: L-ring, 2: L-middle, 3: L-index
// 4: Thumb
// 5: R-index, 6: R-middle, 7: R-ring, 8: R-pinky

const FINGER_COLORS: Record<number, { bg: string; text: string; active: string; border: string }> = {
  0: { bg: "bg-purple-950/40", text: "text-purple-300", active: "bg-purple-500 text-white shadow-purple-500/50 shadow-lg border-purple-300", border: "border-purple-800/40" },
  1: { bg: "bg-indigo-950/40", text: "text-indigo-300", active: "bg-indigo-500 text-white shadow-indigo-500/50 shadow-lg border-indigo-300", border: "border-indigo-800/40" },
  2: { bg: "bg-cyan-950/40", text: "text-cyan-300", active: "bg-cyan-500 text-white shadow-cyan-500/50 shadow-lg border-cyan-300", border: "border-cyan-800/40" },
  3: { bg: "bg-emerald-950/40", text: "text-emerald-300", active: "bg-emerald-500 text-white shadow-emerald-500/50 shadow-lg border-emerald-300", border: "border-emerald-800/40" },
  4: { bg: "bg-amber-950/40", text: "text-amber-300", active: "bg-amber-500 text-white shadow-amber-500/50 shadow-lg border-amber-300", border: "border-amber-800/40" },
  5: { bg: "bg-emerald-950/40", text: "text-emerald-300", active: "bg-emerald-500 text-white shadow-emerald-500/50 shadow-lg border-emerald-300", border: "border-emerald-800/40" },
  6: { bg: "bg-cyan-950/40", text: "text-cyan-300", active: "bg-cyan-500 text-white shadow-cyan-500/50 shadow-lg border-cyan-300", border: "border-cyan-800/40" },
  7: { bg: "bg-indigo-950/40", text: "text-indigo-300", active: "bg-indigo-500 text-white shadow-indigo-500/50 shadow-lg border-indigo-300", border: "border-indigo-800/40" },
  8: { bg: "bg-purple-950/40", text: "text-purple-300", active: "bg-purple-500 text-white shadow-purple-500/50 shadow-lg border-purple-300", border: "border-purple-800/40" },
};

interface KeyDef {
  key: string;
  display?: string;
  finger: number;
  width?: string;
}

const KEYBOARD_ROWS: KeyDef[][] = [
  [
    { key: "`", finger: 0 },
    { key: "1", finger: 0 },
    { key: "2", finger: 1 },
    { key: "3", finger: 2 },
    { key: "4", finger: 3 },
    { key: "5", finger: 3 },
    { key: "6", finger: 5 },
    { key: "7", finger: 5 },
    { key: "8", finger: 6 },
    { key: "9", finger: 7 },
    { key: "0", finger: 8 },
    { key: "-", finger: 8 },
    { key: "=", finger: 8 },
    { key: "Backspace", display: "⌫", finger: 8, width: "w-14" },
  ],
  [
    { key: "Tab", display: "Tab", finger: 0, width: "w-12" },
    { key: "q", finger: 0 },
    { key: "w", finger: 1 },
    { key: "e", finger: 2 },
    { key: "r", finger: 3 },
    { key: "t", finger: 3 },
    { key: "y", finger: 5 },
    { key: "u", finger: 5 },
    { key: "i", finger: 6 },
    { key: "o", finger: 7 },
    { key: "p", finger: 8 },
    { key: "[", finger: 8 },
    { key: "]", finger: 8 },
    { key: "\\", finger: 8, width: "w-12" },
  ],
  [
    { key: "CapsLock", display: "Caps", finger: 0, width: "w-14" },
    { key: "a", finger: 0 },
    { key: "s", finger: 1 },
    { key: "d", finger: 2 },
    { key: "f", finger: 3 },
    { key: "g", finger: 3 },
    { key: "h", finger: 5 },
    { key: "j", finger: 5 },
    { key: "k", finger: 6 },
    { key: "l", finger: 7 },
    { key: ";", finger: 8 },
    { key: "'", finger: 8 },
    { key: "Enter", display: "↵ Enter", finger: 8, width: "w-16" },
  ],
  [
    { key: "ShiftLeft", display: "Shift", finger: 0, width: "w-16" },
    { key: "z", finger: 0 },
    { key: "x", finger: 1 },
    { key: "c", finger: 2 },
    { key: "v", finger: 3 },
    { key: "b", finger: 3 },
    { key: "n", finger: 5 },
    { key: "m", finger: 5 },
    { key: ",", finger: 6 },
    { key: ".", finger: 7 },
    { key: "/", finger: 8 },
    { key: "ShiftRight", display: "Shift", finger: 8, width: "w-16" },
  ],
  [
    { key: "Ctrl", display: "Ctrl", finger: 0, width: "w-12" },
    { key: "Alt", display: "Alt", finger: 4, width: "w-12" },
    { key: " ", display: "Space", finger: 4, width: "w-64" },
    { key: "AltGr", display: "Alt", finger: 4, width: "w-12" },
    { key: "CtrlR", display: "Ctrl", finger: 8, width: "w-12" },
  ],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeChar = "" }) => {
  const normChar = activeChar.toLowerCase();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-[#0d1322]/80 backdrop-blur border border-white/10 rounded-2xl shadow-2xl select-none">
      <div className="flex flex-col gap-1.5 items-center font-mono">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((kDef, kIdx) => {
              const isMatch =
                (normChar === " " && kDef.key === " ") ||
                kDef.key.toLowerCase() === normChar;

              const style = FINGER_COLORS[kDef.finger];
              const w = kDef.width || "w-10 sm:w-11";

              return (
                <div
                  key={kIdx}
                  className={`h-10 sm:h-11 ${w} rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-150 border ${
                    isMatch
                      ? style.active + " scale-105 z-10 animate-pulse"
                      : `${style.bg} ${style.text} ${style.border} hover:border-white/30`
                  }`}
                >
                  {kDef.display || kDef.key.toUpperCase()}
                  {/* Home row bumps */}
                  {(kDef.key === "f" || kDef.key === "j") && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 bg-current opacity-70 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Finger Guide Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Ngón út</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Ngón áp út</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span>Ngón giữa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Ngón trỏ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Ngón cái (Cách)</span>
        </div>
      </div>
    </div>
  );
};
