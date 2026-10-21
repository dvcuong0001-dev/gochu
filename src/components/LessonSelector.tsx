"use client";

import React, { useState, useMemo } from "react";
import { Lesson } from "@/types";
import { Search, BookOpen, ChevronRight, Sparkles, Filter } from "lucide-react";

interface LessonSelectorProps {
  lessons: Lesson[];
  currentLessonId: string;
  currentDrillId: string;
  onSelectDrill: (lessonId: string, drillId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  currentLessonId,
  currentDrillId,
  onSelectDrill,
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<number | null>(null);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase());

      const matchDiff =
        filterDifficulty === null || l.difficulty === filterDifficulty;

      return matchSearch && matchDiff;
    });
  }, [lessons, search, filterDifficulty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0c1220] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Chọn Bài Học Luyện Tập</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-normal">
                  81 Bài học · 414 Bài tập
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Lộ trình chuẩn từ phím cơ sở đến gõ văn bản nâng cao
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-black/20 border-b border-white/5 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm bài học (ví dụ: home row, shift, dấu, số)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121929] border border-white/10 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterDifficulty(null)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterDifficulty === null
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-medium"
                  : "bg-gray-800/50 border-white/5 text-gray-400 hover:text-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterDifficulty(1)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterDifficulty === 1
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium"
                  : "bg-gray-800/50 border-white/5 text-gray-400 hover:text-gray-200"
              }`}
            >
              Cơ bản
            </button>
            <button
              onClick={() => setFilterDifficulty(2)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterDifficulty === 2
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300 font-medium"
                  : "bg-gray-800/50 border-white/5 text-gray-400 hover:text-gray-200"
              }`}
            >
              Nâng cao
            </button>
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLessons.map((lesson) => {
            const isSelected = lesson.id === currentLessonId;
            const metas = Array.isArray(lesson.drillsMeta)
              ? lesson.drillsMeta
              : [];

            return (
              <div
                key={lesson.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-[#111c33] border-cyan-500/50 shadow-lg shadow-cyan-950/40"
                    : "bg-[#0f1627]/70 border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gray-800/80 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                      {lesson.code}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {lesson.title}
                      </h4>
                      {lesson.subtitle && (
                        <p className="text-xs text-gray-400">{lesson.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md ${
                      lesson.difficulty === 1
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    Độ khó: {lesson.difficulty}
                  </span>
                </div>

                {/* Drill Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                  {metas.length > 0 ? (
                    metas.map((m) => {
                      const isDrillActive =
                        lesson.id === currentLessonId &&
                        m.drill_id === currentDrillId;

                      return (
                        <button
                          key={m.drill_id}
                          onClick={() => {
                            onSelectDrill(lesson.id, m.drill_id);
                            onClose();
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                            isDrillActive
                              ? "bg-cyan-500 text-black font-bold border-cyan-300 shadow-md shadow-cyan-500/30"
                              : "bg-black/30 border-white/10 text-gray-300 hover:border-cyan-500/40 hover:text-white"
                          }`}
                        >
                          Bài {m.drill_id}
                        </button>
                      );
                    })
                  ) : (
                    <button
                      onClick={() => {
                        onSelectDrill(lesson.id, `${lesson.code}.1`);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-black/30 border border-white/10 text-gray-300 hover:border-cyan-500/40 hover:text-white"
                    >
                      Bắt đầu bài tập
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
