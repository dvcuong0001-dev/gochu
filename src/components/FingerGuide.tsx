"use client";

import React from "react";

interface FingerGuideProps {
  activeChar?: string;
  targetWpm?: number;
  difficultyText?: string;
}

// Finger indices:
// 0: L-Pinky, 1: L-Ring, 2: L-Middle, 3: L-Index, 4: L-Thumb
// 5: R-Thumb, 6: R-Index, 7: R-Middle, 8: R-Ring, 9: R-Pinky

const CHAR_TO_FINGER: Record<string, number> = {
  // Left Hand
  "`": 0, "~": 0, "1": 0, "!": 0, "q": 0, "a": 0, "z": 0,
  "2": 1, "@": 1, "w": 1, "s": 1, "x": 1,
  "3": 2, "#": 2, "e": 2, "d": 2, "c": 2,
  "4": 3, "$": 3, "5": 3, "%": 3, "r": 3, "t": 3, "f": 3, "g": 3, "v": 3, "b": 3,
  // Thumbs
  " ": 4,
  // Right Hand
  "6": 6, "^": 6, "7": 6, "&": 6, "y": 6, "u": 6, "h": 6, "j": 6, "n": 6, "m": 6,
  "8": 7, "*": 7, "i": 7, "k": 7, ",": 7, "<": 7,
  "9": 8, "(": 8, "o": 8, "l": 8, ".": 8, ">": 8,
  "0": 9, ")": 9, "-": 9, "_": 9, "=": 9, "+": 9,
  "p": 9, "[": 9, "{": 9, "]": 9, "}": 9, "\\": 9, "|": 9,
  ";": 9, ":": 9, "'": 9, '"': 9, "/": 9, "?": 9,
};

export const FingerGuide: React.FC<FingerGuideProps> = ({
  activeChar = "",
  targetWpm = 40,
  difficultyText = "Bài tập cơ bản",
}) => {
  const norm = activeChar.toLowerCase();
  const activeFingerIndex = CHAR_TO_FINGER[norm] ?? (norm === " " ? 4 : -1);

  // Left Hand Fingers (explicit pixel heights so Tailwind doesn't drop custom sizes)
  const leftFingers = [
    { id: 0, name: "Út", height: "h-[40px]", width: "w-3.5", keys: "A Q Z" },
    { id: 1, name: "Áp út", height: "h-[54px]", width: "w-3.5", keys: "S W X" },
    { id: 2, name: "Giữa", height: "h-[62px]", width: "w-3.5", keys: "D E C" },
    { id: 3, name: "Trỏ", height: "h-[50px]", width: "w-3.5", keys: "F R V" },
    { id: 4, name: "Cái", height: "h-[32px]", width: "w-4 -rotate-12 mt-4", keys: "␣" },
  ];

  // Right Hand Fingers
  const rightFingers = [
    { id: 5, name: "Cái", height: "h-[32px]", width: "w-4 rotate-12 mt-4", keys: "␣" },
    { id: 6, name: "Trỏ", height: "h-[50px]", width: "w-3.5", keys: "J U M" },
    { id: 7, name: "Giữa", height: "h-[62px]", width: "w-3.5", keys: "K I ," },
    { id: 8, name: "Áp út", height: "h-[54px]", width: "w-3.5", keys: "L O ." },
    { id: 9, name: "Út", height: "h-[40px]", width: "w-3.5", keys: "; P /" },
  ];

  const displayChar =
    activeChar === " "
      ? "Space"
      : activeChar === "\n"
      ? "Enter"
      : activeChar.toUpperCase();

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0a101f]/95 border border-white/10 rounded-2xl p-4 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <span className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">
          VỊ TRÍ NGÓN
        </span>
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-gray-400">Phím:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-400/40">
            {displayChar || "—"}
          </span>
        </div>
      </div>

      {/* Hands Visualizer */}
      <div className="flex justify-around items-end gap-6 mb-3 px-2">
        {/* Left Hand */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 font-medium mb-2">Tay trái</span>
          <div className="flex items-end gap-2 h-[68px]">
            {leftFingers.map((f) => {
              const isActive = activeFingerIndex === f.id;
              return (
                <div key={f.id} className="flex flex-col items-center justify-end h-full">
                  <div
                    className={`${f.width} ${f.height} rounded-full transition-all duration-150 ${
                      isActive
                        ? "bg-amber-400 shadow-lg shadow-amber-400/80 scale-105 border border-amber-300 ring-2 ring-amber-400/30"
                        : "bg-[#18233c] border border-white/5"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <span className="text-[9px] font-mono text-gray-500 mt-2 tracking-tight">
            A Q Z S W X D E C F R V
          </span>
        </div>

        {/* Center Divider */}
        <div className="h-16 w-px bg-white/5" />

        {/* Right Hand */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 font-medium mb-2">Tay phải</span>
          <div className="flex items-end gap-2 h-[68px]">
            {rightFingers.map((f) => {
              const isActive = activeFingerIndex === f.id;
              return (
                <div key={f.id} className="flex flex-col items-center justify-end h-full">
                  <div
                    className={`${f.width} ${f.height} rounded-full transition-all duration-150 ${
                      isActive
                        ? "bg-amber-400 shadow-lg shadow-amber-400/80 scale-105 border border-amber-300 ring-2 ring-amber-400/30"
                        : "bg-[#18233c] border border-white/5"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <span className="text-[9px] font-mono text-gray-500 mt-2 tracking-tight">
            J U M K I , L O . ; P /
          </span>
        </div>
      </div>

      {/* Target WPM & Difficulty */}
      <div className="text-center pt-2 border-t border-white/5 text-[11px] text-gray-400 font-mono">
        Mục tiêu {targetWpm} WPM · {difficultyText}
      </div>
    </div>
  );
};
