"use client";

import React from "react";
import { Keyboard, Gamepad2, Trophy, BookOpen, Sparkles, FileSpreadsheet } from "lucide-react";

interface NavbarProps {
  currentTab: "practice" | "arcade" | "leaderboard" | "sheets-guide";
  onTabChange: (tab: "practice" | "arcade" | "leaderboard" | "sheets-guide") => void;
  currentLessonTitle?: string;
  currentDrillId?: string;
  onOpenLessonSelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentLessonTitle = "Bài 1",
  currentDrillId = "1.1",
  onOpenLessonSelector,
}) => {
  return (
    <header className="w-full border-b border-white/10 bg-[#090e1c]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Keyboard size={20} />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              <span>Tự Học Typing</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold">
                WEB
              </span>
            </span>
          </div>
        </div>

        {/* Current Lesson Badge Button */}
        {currentTab === "practice" && (
          <button
            onClick={onOpenLessonSelector}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#121a2f] border border-white/10 hover:border-cyan-500/50 text-xs text-gray-200 transition-all shadow-sm"
          >
            <BookOpen size={14} className="text-cyan-400" />
            <span className="font-medium text-white">{currentLessonTitle}</span>
            <span className="text-gray-500">·</span>
            <span className="font-mono text-cyan-300">Bài {currentDrillId}</span>
            <span className="text-[10px] text-gray-400 bg-black/40 px-1.5 py-0.5 rounded">
              Đổi bài ▾
            </span>
          </button>
        )}

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => onTabChange("practice")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "practice"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <Keyboard size={15} />
            <span className="hidden sm:inline">Luyện Gõ</span>
          </button>

          <button
            onClick={() => onTabChange("arcade")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "arcade"
                ? "bg-red-500/15 text-red-400 border border-red-500/30 font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <Gamepad2 size={15} />
            <span className="hidden sm:inline">Game 3D</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">
              HOT
            </span>
          </button>

          <button
            onClick={() => onTabChange("leaderboard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "leaderboard"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <Trophy size={15} />
            <span className="hidden sm:inline">Xếp Hạng</span>
          </button>

          <button
            onClick={() => onTabChange("sheets-guide")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "sheets-guide"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <FileSpreadsheet size={15} />
            <span className="hidden md:inline">Google Sheets</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
