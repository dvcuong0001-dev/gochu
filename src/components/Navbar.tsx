"use client";

import React from "react";
import {
  Keyboard,
  Gamepad2,
  Trophy,
  BookOpen,
  Sparkles,
  FileSpreadsheet,
  Home,
  User,
  LogOut,
} from "lucide-react";
import { UserProfile } from "./AuthModal";

export type NavTab = "home" | "practice" | "arcade" | "leaderboard" | "sheets-guide";

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentLessonTitle?: string;
  currentDrillId?: string;
  onOpenLessonSelector: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentLessonTitle = "Bài 1",
  currentDrillId = "1.1",
  onOpenLessonSelector,
  user,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="w-full border-b border-white/10 bg-[#090e1c]/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onTabChange("home")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
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

        {/* Current Lesson Badge (Only when in practice tab) */}
        {currentTab === "practice" && (
          <button
            onClick={onOpenLessonSelector}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121a2f] border border-white/10 hover:border-cyan-500/50 text-xs text-gray-200 transition-all shadow-sm"
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
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => onTabChange("home")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "home"
                ? "bg-white/10 text-white border border-white/20 font-semibold shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <Home size={15} />
            <span className="hidden sm:inline">Trang Chủ</span>
          </button>

          <button
            onClick={() => onTabChange("practice")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "practice"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <Keyboard size={15} />
            <span>Luyện Gõ</span>
          </button>

          <button
            onClick={() => onTabChange("arcade")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentTab === "arcade"
                ? "bg-red-500/15 text-red-400 border border-red-500/30 font-semibold shadow-sm"
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
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold shadow-sm"
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
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <FileSpreadsheet size={15} />
            <span className="hidden md:inline">Sheets</span>
          </button>
        </nav>

        {/* User Account / Auth Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 transition-all text-xs"
                title="Bấm để chỉnh sửa hồ sơ"
              >
                <span className="text-base">{user.avatar}</span>
                <span className="font-semibold text-white max-w-[100px] truncate hidden sm:inline">
                  {user.username}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                  Lv.{user.level}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <User size={14} />
              <span>Đăng Nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
