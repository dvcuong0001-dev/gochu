"use client";

import React, { useState } from "react";
import { Gamepad2, Maximize2, ExternalLink, ArrowLeft, Play, Sparkles } from "lucide-react";

interface GameInfo {
  id: string;
  title: string;
  desc: string;
  path: string;
  tag: string;
  color: string;
}

const ARCADE_GAMES: GameInfo[] = [
  {
    id: "quyetdau",
    title: "Quyết Đấu 3D",
    desc: "Đối kháng 1v1 gõ phím diệt quái cơ khí với mô hình 3D chiến đấu trực quan.",
    path: "/arcade/quyetdau.html",
    tag: "3D Mech Combat",
    color: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-400",
  },
  {
    id: "index",
    title: "Chiến Dịch Diệt Bug",
    desc: "Chiến dịch săn boss Mech Eye Drone và tiêu diệt lỗi mã nguồn bằng combo gõ phím.",
    path: "/arcade/index.html",
    tag: "3D Boss Raid",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
  },
  {
    id: "pho",
    title: "Nấu Phở Gia Truyền",
    desc: "Luyện gõ tiếng Việt có dấu qua các nguyên liệu và công thức nấu tô Phở Hà Nội.",
    path: "/arcade/pho.html",
    tag: "Vietnamese Food",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
  },
  {
    id: "runner",
    title: "Cyber Runner 3D",
    desc: "Chạy vượt chướng ngại vật trên đường băng tương lai với tốc độ gõ tăng dần.",
    path: "/arcade/runner.html",
    tag: "Speed Runner",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    id: "rhythm",
    title: "Rhythm Beat",
    desc: "Gõ phím chuẩn nhịp điệu âm nhạc, luyện phản xạ tay và giữ nhịp độ ổn định.",
    path: "/arcade/rhythm.html",
    tag: "Âm Nhạc",
    color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
  },
  {
    id: "orbit",
    title: "Quỹ Đạo Không Gian",
    desc: "Bảo vệ trạm vũ trụ khỏi các thiên thạch bằng cách gõ nhanh các mã tín hiệu.",
    path: "/arcade/orbit.html",
    tag: "Sci-Fi",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
  },
];

export const ArcadeView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeGame, setActiveGame] = useState<GameInfo | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft size={16} />
            <span>Quay lại luyện gõ</span>
          </button>

          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Gamepad2 className="text-cyan-400" />
              <span>Khu Trò Chơi 3D Arcade</span>
            </h2>
            <p className="text-xs text-gray-400">
              Các mini-game 3D WebGL / Three.js luyện phản xạ gõ phím đỉnh cao
            </p>
          </div>
        </div>

        {activeGame && (
          <div className="flex items-center gap-2">
            <a
              href={activeGame.path}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>Mở toàn màn hình</span>
            </a>
            <button
              onClick={() => setActiveGame(null)}
              className="px-3.5 py-2 rounded-xl bg-gray-800 border border-white/10 text-gray-300 text-xs font-medium"
            >
              Đổi game khác
            </button>
          </div>
        )}
      </div>

      {/* Active Game Stage View */}
      {activeGame ? (
        <div className="w-full bg-[#05070e] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="p-3 bg-[#0c1220] border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-semibold">{activeGame.title}</span>
              <span>· {activeGame.tag}</span>
            </div>
            <span>Nhấp chuột vào màn hình để bắt đầu gõ</span>
          </div>

          <div className="relative w-full aspect-[16/9] min-h-[580px]">
            <iframe
              src={activeGame.path}
              className="w-full h-full border-0"
              title={activeGame.title}
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      ) : (
        /* Game Selection Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARCADE_GAMES.map((game) => (
            <div
              key={game.id}
              className={`p-6 rounded-3xl bg-gradient-to-br ${game.color} border backdrop-blur-md transition-all hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 border border-current">
                    {game.tag}
                  </span>
                  <Sparkles size={16} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                <p className="text-xs text-gray-300/80 leading-relaxed mb-6">
                  {game.desc}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveGame(game)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs transition-all hover:bg-gray-200 flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Play size={14} className="fill-current" />
                  <span>Chơi Ngay</span>
                </button>

                <a
                  href={game.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-black/40 border border-white/15 text-gray-300 hover:text-white transition-all"
                  title="Mở tab mới"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
