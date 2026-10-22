"use client";

import React, { useState, useEffect } from "react";
import { LeaderboardUserRecord } from "@/types";
import {
  Trophy,
  Zap,
  Clock,
  RefreshCw,
  ArrowLeft,
  Award,
} from "lucide-react";

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [records, setRecords] = useState<LeaderboardUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"xp" | "wpm" | "time">("xp");

  const fetchRecords = async (sort: "xp" | "wpm" | "time") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?sort=${sort}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(sortBy);
  }, [sortBy]);

  const formatSeconds = (rawSecs: any) => {
    const secs = Math.max(0, Math.round(Number(rawSecs) || 0));
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${remainingSecs}s`;
    }
    return `${remainingSecs}s`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>

          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Trophy className="text-amber-400" />
              <span>Bảng Xếp Hạng Tổng Toàn Nền Tảng</span>
            </h2>
            <p className="text-xs text-gray-400">
              Vinh danh các cao thủ theo Cấp độ (LV), Điểm kinh nghiệm (XP), Tốc độ (WPM) và Thời gian luyện tập
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchRecords(sortBy)}
          disabled={loading}
          className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 3 Sorting Criteria Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setSortBy("xp")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
            sortBy === "xp"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/20"
              : "bg-[#0e1628] text-gray-400 border-white/10 hover:text-gray-200"
          }`}
        >
          <Award size={16} className="text-amber-400" />
          <span>Xếp Hạng Cấp Độ & XP</span>
        </button>

        <button
          onClick={() => setSortBy("wpm")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
            sortBy === "wpm"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/20"
              : "bg-[#0e1628] text-gray-400 border-white/10 hover:text-gray-200"
          }`}
        >
          <Zap size={16} className="text-cyan-400" />
          <span>Xếp Hạng Tốc Độ (WPM)</span>
        </button>

        <button
          onClick={() => setSortBy("time")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
            sortBy === "time"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
              : "bg-[#0e1628] text-gray-400 border-white/10 hover:text-gray-200"
          }`}
        >
          <Clock size={16} className="text-emerald-400" />
          <span>Xếp Hạng Thời Gian Luyện</span>
        </button>
      </div>

      {/* Leaderboard Table Card */}
      <div className="w-full bg-[#0a101f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-2 p-4 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-black/40">
          <div className="col-span-1 text-center">Hạng</div>
          <div className="col-span-3">Người chơi</div>
          <div className="col-span-2 text-center">Cấp độ (LV)</div>
          <div className="col-span-2 text-right">Kinh nghiệm (XP)</div>
          <div className="col-span-2 text-right">Tốc độ (WPM)</div>
          <div className="col-span-2 text-right pr-2">Thời gian luyện</div>
        </div>

        <div className="divide-y divide-white/5 font-mono text-xs">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400">
              <RefreshCw className="animate-spin inline-block mr-2" size={18} />
              Đang tải bảng xếp hạng tổng thể...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Chưa có dữ liệu người chơi.
            </div>
          ) : (
            records.map((rec, index) => {
              const rank = index + 1;
              let rankBadge = (
                <span className="font-bold text-gray-400">{rank}</span>
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

              const xpVal = Number(rec?.xp) || 0;
              const lvlVal = Number(rec?.level) || 1;
              const wpmVal = Number(rec?.bestWpm ?? (rec as any)?.wpm) || 0;
              const timeVal = Number(rec?.totalTimeSeconds ?? (rec as any)?.timeSpent) || 0;
              const completedVal = Number(rec?.completedDrills) || 1;

              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-white/[0.03] transition-colors"
                >
                  <div className="col-span-1 flex justify-center">{rankBadge}</div>

                  <div className="col-span-3 flex items-center gap-2.5 font-sans">
                    <span className="text-xl">{rec?.avatar || "🐱"}</span>
                    <div>
                      <span className="font-bold text-white block truncate">
                        {rec?.username || "Ẩn danh"}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {completedVal} bài hoàn thành
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs">
                      Cấp {lvlVal}
                    </span>
                  </div>

                  <div className="col-span-2 text-right font-bold text-amber-400">
                    {xpVal.toLocaleString()} <span className="text-[10px] text-gray-500">XP</span>
                  </div>

                  <div className="col-span-2 text-right font-bold text-cyan-300 text-sm">
                    {wpmVal} <span className="text-[10px] text-gray-500 font-normal">WPM</span>
                  </div>

                  <div className="col-span-2 text-right pr-2 text-gray-300 flex items-center justify-end gap-1.5">
                    <Clock size={13} className="text-gray-500" />
                    <span>{formatSeconds(timeVal)}</span>
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
