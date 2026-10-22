"use client";

import React, { useState } from "react";
import {
  User,
  Sparkles,
  X,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Compass,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { UserProfile } from "@/types";

export type { UserProfile };

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
  const [pin, setPin] = useState(currentUser?.pin || "");
  const [showPin, setShowPin] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || "🐱");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle form submission (Login / Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = username.trim();
    const cleanPin = pin.trim();

    if (!cleanName) {
      setError("Vui lòng nhập tên người dùng!");
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 30) {
      setError("Tên phải từ 2 đến 30 ký tự.");
      return;
    }

    if (!cleanPin) {
      setError("Vui lòng nhập mã PIN 6 số!");
      return;
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      setError("Mã PIN phải bao gồm đúng 6 chữ số (0-9)!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanName,
          pin: cleanPin,
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại mã PIN.");
        setLoading(false);
        return;
      }

      // Success
      const profile: UserProfile = {
        ...data.user,
        pin: cleanPin,
        isGuest: false,
      };

      localStorage.setItem("tuhoc_user", JSON.stringify(profile));
      if (Array.isArray(profile.unlockedLessons)) {
        localStorage.setItem("unlocked_lessons", JSON.stringify(profile.unlockedLessons));
      }

      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error("Auth submit error:", err);
      setError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest Mode (Chế độ Khách)
  const handleContinueAsGuest = () => {
    const guestProfile: UserProfile = {
      username: "Khách",
      avatar: "👤",
      level: 1,
      xp: 0,
      joinedAt: new Date().toISOString(),
      isGuest: true,
      unlockedLessons: ["lesson1"],
    };

    localStorage.setItem("tuhoc_user", JSON.stringify(guestProfile));
    onLoginSuccess(guestProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0c1220] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative glow-cyan max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
            {selectedAvatar}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {currentUser?.isGuest
              ? "Đăng Ký Lưu Tiến Độ"
              : currentUser
              ? "Cập Nhật Hồ Sơ"
              : "Đăng Nhập / Tạo Hồ Sơ"}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Đăng nhập bằng Tên và PIN 6 số để lưu kết quả và đồng bộ trên mọi máy tính
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Chọn Avatar Đồng Hành:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.emoji)}
                  className={`p-2 rounded-xl border text-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
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

          {/* Username Input (Tên tự do) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Tên Học Sinh / Nickname:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: Hoàng Long, an_6a1, TyperPro..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                maxLength={30}
                className="w-full bg-[#121929] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
              <User
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              💡 Khuyên dùng: Đặt tên kèm lớp (ví dụ: <span className="text-cyan-400 font-mono">minh_6a2</span>) để tránh trùng lặp.
            </p>
          </div>

          {/* PIN Input (Mã PIN 6 số) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Mã PIN Bảo Vệ (Đúng 6 số):
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="•••••• (Ví dụ: 123456)"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPin(val);
                  setError("");
                }}
                className="w-full bg-[#121929] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all font-mono tracking-widest text-center sm:text-left"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400">
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="hover:text-white p-1"
                  title={showPin ? "Ẩn PIN" : "Hiện PIN"}
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <KeyRound size={15} className="text-gray-500" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
              <span>Nhập 6 chữ số dễ nhớ (ngày sinh, số cuối điện thoại...)</span>
              <span className={`font-mono font-bold ${pin.length === 6 ? "text-emerald-400" : "text-gray-500"}`}>
                {pin.length}/6
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>
              {loading
                ? "Đang xác thực..."
                : currentUser?.isGuest
                ? "Tạo Tài Khoản & Lưu Điểm"
                : currentUser
                ? "Lưu Cập Nhật"
                : "Vào Học / Đăng Nhập"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#0c1220] px-3 text-[11px] text-gray-500 uppercase tracking-wider">
              hoặc
            </span>
          </div>

          {/* Guest Mode Button (Chế độ Khách) */}
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Compass size={15} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
            <span>Tiếp Tục Với Tư Cách Khách (Không cần PIN)</span>
          </button>
          <p className="text-[10px] text-center text-gray-500">
            * Chế độ Khách: Bạn vẫn luyện gõ bình thường nhưng tiến độ chỉ lưu tạm thời trên máy này.
          </p>
        </form>
      </div>
    </div>
  );
};
