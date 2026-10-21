"use client";

import React, { useState, useEffect } from "react";
import { LeaderboardRecord } from "@/types";
import { Trophy, Medal, RefreshCw, FileSpreadsheet, ArrowLeft, CheckCircle, Clock } from "lucide-react";

interface LeaderboardViewProps {
  onBack: () => void;
  currentDrillId?: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onBack,
  currentDrillId,
}) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrill, setFilterDrill] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = filterDrill && currentDrillId
        ? `/api/leaderboard?drillId=${encodeURIComponent(currentDrillId)}`
        : `/api/leaderboard`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterDrill, currentDrillId]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
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
              <Trophy className="text-amber-400" />
              <span>Bảng Xếp Hạng Cao Thủ</span>
            </h2>
            <p className="text-xs text-gray-400">
              Đồng bộ dữ liệu thời gian thực qua Google Sheets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentDrillId && (
            <button
              onClick={() => setFilterDrill(!filterDrill)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterDrill
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                  : "bg-gray-800/60 border-white/10 text-gray-400 hover:text-gray-200"
              }`}
            >
              Chỉ bài {currentDrillId}
            </button>
          )}

          <button
            onClick={fetchRecords}
            disabled={loading}
            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Google Sheets Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-300">
          <FileSpreadsheet size={20} className="text-emerald-400" />
          <span>
            Kết nối sẵn sàng với Google Sheets. Bạn chỉ cần điền link Web App trong file <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-200 border border-emerald-800">.env.local</code>.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>Tự động xếp hạng theo WPM</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full bg-[#0d1322] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-2 p-4 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-black/30">
          <div className="col-span-1 text-center">Hạng</div>
          <div className="col-span-4">Người chơi</div>
          <div className="col-span-2 text-center">Bài tập</div>
          <div className="col-span-2 text-right">Tốc độ (WPM)</div>
          <div className="col-span-1 text-right">Độ chính xác</div>
          <div className="col-span-2 text-right pr-2">Thời gian</div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400">
              <RefreshCw className="animate-spin inline-block mr-2" size={18} />
              Đang tải bảng xếp hạng...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Chưa có ai ghi danh bài này. Hãy là người đầu tiên hoàn thành và lưu điểm!
            </div>
          ) : (
            records.map((rec, index) => {
              const rank = index + 1;
              let rankBadge = (
                <span className="font-mono text-gray-400 font-bold">{rank}</span>
              );

              if (rank === 1) {
                rankBadge = (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">
                    🥇
                  </span>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 font-bold text-xs border border-slate-400/40">
                    🥈
                  </span>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 font-bold text-xs border border-amber-700/40">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-3.5 items-center text-xs hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-1 flex justify-center">{rankBadge}</div>

                  <div className="col-span-4 flex items-center gap-2">
                    <span className="font-semibold text-white truncate">
                      {rec.username}
                    </span>
                  </div>

                  <div className="col-span-2 text-center font-mono text-gray-400">
                    {rec.drillId ? `Bài ${rec.drillId}` : "Tự do"}
                  </div>

                  <div className="col-span-2 text-right font-mono font-bold text-cyan-400 text-sm">
                    {rec.wpm} <span className="text-[10px] text-gray-500">WPM</span>
                  </div>

                  <div className="col-span-1 text-right font-mono text-emerald-400 font-semibold">
                    {rec.accuracy}%
                  </div>

                  <div className="col-span-2 text-right pr-2 text-gray-400 font-mono flex items-center justify-end gap-1">
                    <Clock size={12} className="text-gray-500" />
                    <span>{rec.timeSpent}s</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
