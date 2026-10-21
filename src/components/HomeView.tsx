"use client";

import React from "react";
import { UserProfile } from "./AuthModal";
import {
  Keyboard,
  Gamepad2,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Award,
  BookOpen,
  Play,
  Flame,
} from "lucide-react";

interface HomeViewProps {
  onStartPractice: () => void;
  onOpenArcade: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartPractice,
  onOpenArcade,
  onOpenLeaderboard,
  onOpenAuth,
  user,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* User Welcome Banner if Logged In */}
      {user ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#0e1628] border border-cyan-500/30 mb-10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow-md">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">
                  Chào mừng trở lại, {user.username}!
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Cấp {user.level}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Tích lũy: <span className="text-cyan-400 font-mono font-bold">{user.xp} XP</span> · Sẵn sàng bứt phá tốc độ gõ hôm nay chưa?
              </p>
            </div>
          </div>

          <button
            onClick={onStartPractice}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            <span>Tiếp Tục Luyện Gõ</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <Sparkles size={16} className="text-amber-400" />
            <span>Bạn chưa đăng nhập. Tạo hồ sơ ngay để lưu cấp độ và điểm số vào Bảng xếp hạng!</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-medium transition-all"
          >
            Đăng nhập / Tạo hồ sơ
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 animate-pulse">
          <Flame size={14} className="text-orange-400 fill-orange-400" />
          <span>Phiên Bản Web · Chuyển Thể Hoàn Chỉnh Từ Tự Học Typing 3.1.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Làm Chủ Bàn Phím 10 Ngón <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Bứt Phá Tốc Độ Cùng Game 3D
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-300/90 leading-relaxed max-w-2xl mx-auto mb-8 font-light">
          Nền tảng luyện gõ máy tiếng Việt toàn diện với <strong className="text-white font-semibold">81 bài học</strong>,{" "}
          <strong className="text-white font-semibold">414 bài tập</strong>, hệ thống bàn phím màu sắc phân ngón tay, cùng khu trò chơi 3D Arcade WebGL kịch tính và Bảng xếp hạng Google Sheets thời gian thực.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartPractice}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-500/30 hover:scale-105 flex items-center gap-2.5"
          >
            <Keyboard size={18} />
            <span>Vào Luyện Gõ Ngay</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onOpenArcade}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600/30 to-orange-600/20 hover:from-red-600/40 hover:to-orange-600/30 border border-red-500/40 text-red-300 hover:text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg"
          >
            <Gamepad2 size={18} className="text-red-400" />
            <span>Chơi Game 3D Arcade</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="px-6 py-3.5 rounded-2xl bg-gray-800/80 hover:bg-gray-700/80 border border-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Trophy size={17} className="text-amber-400" />
            <span>Bảng Xếp Hạng</span>
          </button>
        </div>
      </div>

      {/* Stats Numbers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-white/10 text-center shadow-lg">
          <div className="text-3xl sm:text-4xl font-mono font-bold text-cyan-400 mb-1">
            81
          </div>
          <div className="text-xs text-gray-400 font-medium">Bài học chuẩn hóa</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0c1220] border border-white/10 text-center shadow-lg">
          <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 mb-1">
            414
          </div>
          <div className="text-xs text-gray-400 font-medium">Bài luyện tập phong phú</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0c1220] border border-white/10 text-center shadow-lg">
          <div className="text-3xl sm:text-4xl font-mono font-bold text-red-400 mb-1">
            6+
          </div>
          <div className="text-xs text-gray-400 font-medium">Mini-game 3D Three.js</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0c1220] border border-white/10 text-center shadow-lg">
          <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 mb-1">
            0đ
          </div>
          <div className="text-xs text-gray-400 font-medium">Miễn phí & Mã nguồn mở</div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Tại Sao Bạn Nên Luyện Gõ Tại Đây?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Được thiết kế tối ưu cho thói quen gõ tiếng Việt và phản xạ tự nhiên của đôi bàn tay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-cyan-500/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Bàn Phím Ảo Định Hướng Ngón
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Mỗi ngón tay được phân biệt bằng màu sắc riêng biệt (ngón út, áp út, ngón giữa, ngón trỏ, ngón cái). Phím cần bấm được nhấp nháy chỉ điểm tức thời.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-red-500/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5">
              <Gamepad2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Khu Trò Chơi 3D WebGL
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Không còn nhàm chán khi luyện gõ: Tiêu diệt quái cơ khí trong Quyết Đấu 3D, vượt chướng ngại vật trong Cyber Runner hay nấu tô Phở truyền thống bằng tốc độ gõ.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-emerald-500/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Trophy size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Bảng Xếp Hạng Google Sheets
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dữ liệu thành tích và tốc độ (WPM) được lưu trữ trực tiếp vào Google Sheets hoàn toàn miễn phí, xem bảng xếp hạng ngay trên trang tính mà không cần CMS.
            </p>
          </div>
        </div>
      </div>

      {/* Curriculum Roadmap */}
      <div className="mb-20 p-8 sm:p-10 rounded-3xl bg-[#0a0f1d] border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest block mb-1">
            LỘ TRÌNH 4 GIAI ĐOẠN
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Từ Con Số 0 Đến Bậc Thầy Gõ 100+ WPM
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs font-mono text-cyan-400 font-bold mb-2">GIAI ĐOẠN 1</div>
            <h4 className="text-sm font-bold text-white mb-1">Hàng Phím Cơ Sở</h4>
            <p className="text-xs text-gray-400">
              Cố định 8 ngón tay trên hàng phím <code className="text-cyan-300">asdf jkl;</code> và rèn luyện cảm giác phím F & J.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs font-mono text-cyan-400 font-bold mb-2">GIAI ĐOẠN 2</div>
            <h4 className="text-sm font-bold text-white mb-1">Mở Rộng Hàng Phím</h4>
            <p className="text-xs text-gray-400">
              Vươn ngón linh hoạt lên hàng phím trên (<code className="text-cyan-300">qwerty</code>) và hàng dưới (<code className="text-cyan-300">zxcvb</code>).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs font-mono text-cyan-400 font-bold mb-2">GIAI ĐOẠN 3</div>
            <h4 className="text-sm font-bold text-white mb-1">Số & Ký Tự Đặc Biệt</h4>
            <p className="text-xs text-gray-400">
              Gõ chính xác các phím số hàng trên cùng, dấu chấm câu và ký tự viết hoa với phím Shift chuẩn hai bên.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs font-mono text-cyan-400 font-bold mb-2">GIAI ĐOẠN 4</div>
            <h4 className="text-sm font-bold text-white mb-1">Tiếng Việt & Tốc Độ</h4>
            <p className="text-xs text-gray-400">
              Luyện gõ các đoạn văn bản tiếng Việt có dấu, tăng tốc độ phản xạ não bộ và giữ nhịp độ gõ ổn định.
            </p>
          </div>
        </div>
      </div>

      {/* Arcade Games Showcase Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-[#0e1628] border border-red-500/30 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold mb-3">
            <Gamepad2 size={14} />
            <span>KHO MINI-GAME 3D ARCADE</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Vừa Chơi Game 3D Vừa Tăng Tốc Độ Gõ
          </h3>
          <p className="text-xs sm:text-sm text-gray-300/80 leading-relaxed">
            Hóa thân thành phi công diệt quái cơ khí trong Quyết Đấu 3D, hay đua tài nấu phở chuẩn vị Hà Nội. Chơi ngay trực tiếp trên trình duyệt mà không cần cài đặt.
          </p>
        </div>

        <button
          onClick={onOpenArcade}
          className="px-6 py-3.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-all shadow-xl shadow-red-500/30 flex items-center gap-2"
        >
          <Play size={16} className="fill-current" />
          <span>Khám Phá Game 3D Ngay</span>
        </button>
      </div>
    </div>
  );
};
