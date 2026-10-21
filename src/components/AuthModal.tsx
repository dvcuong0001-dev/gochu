"use client";

import React, { useState } from "react";
import { User, Sparkles, X, Check, ShieldCheck } from "lucide-react";

export interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  joinedAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile | null;
}

const AVATAR_OPTIONS = [
  { id: "cat", emoji: "🐱", label: "Mèo Tuxedo" },
  { id: "fox", emoji: "🦊", label: "Cáo Nhanh Nhẹn" },
  { id: "rocket", emoji: "🚀", label: "Tên Lửa Siêu Tốc" },
  { id: "lightning", emoji: "⚡", label: "Tia Chớp" },
  { id: "game", emoji: "🎮", label: "Gamer Cyber" },
  { id: "crown", emoji: "👑", label: "Bậc Thầy Typing" },
  { id: "dragon", emoji: "🐉", label: "Rồng Lửa" },
  { id: "girl", emoji: "🌸", label: "Tiểu Nương Nương" },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [username, setUsername] = useState(currentUser?.username || "");
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || "🐱");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = username.trim();

    if (!cleanName) {
      setError("Vui lòng nhập tên người dùng!");
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 20) {
      setError("Tên phải từ 2 đến 20 ký tự.");
      return;
    }

    const profile: UserProfile = {
      username: cleanName,
      avatar: selectedAvatar,
      level: currentUser?.level || 1,
      xp: currentUser?.xp || 0,
      joinedAt: currentUser?.joinedAt || new Date().toISOString(),
    };

    localStorage.setItem("tuhoc_user", JSON.stringify(profile));
    onLoginSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0c1220] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative glow-cyan">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
            {selectedAvatar}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {currentUser ? "Cập Nhật Hồ Sơ" : "Đăng Nhập / Tạo Tài Khoản"}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Lưu tiến độ luyện gõ, tích lũy XP và vinh danh trên Bảng xếp hạng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Chọn Linh Thú / Avatar Đồng Hành:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.emoji)}
                  className={`p-2.5 rounded-xl border text-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedAvatar === av.emoji
                      ? "bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-black/30 border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                  title={av.label}
                >
                  <span>{av.emoji}</span>
                  <span className="text-[9px] text-gray-400 truncate w-full text-center">
                    {av.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Tên Hiển Thị (Nickname):
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: CuongPro, HiHo, Typer99..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                maxLength={20}
                className="w-full bg-[#121929] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
              <User
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl flex items-center gap-2 text-[11px] text-cyan-300">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
            <span>
              Đăng nhập không cần mật khẩu phức tạp. Dữ liệu hồ sơ và cấp độ được lưu an toàn trên máy của bạn.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>{currentUser ? "Lưu Thay Đổi" : "Vào Luyện Gõ Ngay"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
