"use client";

import React, { useState, useMemo } from "react";
import { Lesson, LessonMeta } from "@/types";
import {
  Keyboard,
  Check,
  Sparkles,
  Lock,
  Unlock,
  Crown,
  Search,
  ArrowRight,
  BookOpen,
  Trophy,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface LessonsCatalogViewProps {
  lessons: Lesson[];
  currentLessonId: string;
  currentDrillId: string;
  onSelectDrill: (lessonId: string, drillId: string) => void;
  unlockedLessons?: string[];
  completedDrillIds?: string[];
  isFreeMode?: boolean;
  onToggleFreeMode?: () => void;
}

export const LessonsCatalogView: React.FC<LessonsCatalogViewProps> = ({
  lessons,
  currentLessonId,
  currentDrillId,
  onSelectDrill,
  unlockedLessons = ["lesson1"],
  completedDrillIds = [],
  isFreeMode = false,
  onToggleFreeMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Total drills across all lessons
  const totalDrillsCount = useMemo(() => {
    return lessons.reduce((acc, l) => {
      const metas = Array.isArray(l.drillsMeta) ? l.drillsMeta : [];
      return acc + (metas.length > 0 ? metas.length : 1);
    }, 0);
  }, [lessons]);

  // Total completed drills
  const totalCompletedCount = useMemo(() => {
    let count = 0;
    lessons.forEach((l) => {
      const metas = (Array.isArray(l.drillsMeta) ? l.drillsMeta : []) as LessonMeta[];
      const items = metas.length > 0 ? metas : [{ id: `${l.code}.1` }];
      items.forEach((m: any) => {
        const dId = m.id || m.drill_id || m.drillId;
        if (
          completedDrillIds.includes(dId) ||
          completedDrillIds.includes(`${l.id}_${dId}`)
        ) {
          count++;
        }
      });
    });
    return count;
  }, [lessons, completedDrillIds]);

  // Overall progress percentage
  const overallProgress = useMemo(() => {
    if (totalDrillsCount === 0) return 0;
    return Math.min(100, Math.round((totalCompletedCount / totalDrillsCount) * 100));
  }, [totalCompletedCount, totalDrillsCount]);

  // Filter lessons by stage / category and search query
  const filteredLessons = useMemo(() => {
    let list = lessons;

    if (selectedCategory === "stage1") {
      list = list.filter((l) => {
        const num = parseInt(l.code);
        return num >= 1 && num <= 12;
      });
    } else if (selectedCategory === "stage2") {
      list = list.filter((l) => {
        const num = parseInt(l.code);
        return num >= 13 && num <= 24;
      });
    } else if (selectedCategory === "stage3") {
      list = list.filter((l) => l.id === "lesson25" || l.id === "lesson26");
    } else if (selectedCategory === "stage4") {
      list = list.filter((l) => {
        const num = parseInt(l.code);
        return num >= 27 && num <= 30;
      });
    } else if (selectedCategory === "stage5") {
      list = list.filter((l) => {
        const num = parseInt(l.code);
        return num >= 31;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.subtitle && l.subtitle.toLowerCase().includes(q)) ||
          l.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [lessons, selectedCategory, searchQuery]);

  const currentCategoryInfo = useMemo(() => {
    switch (selectedCategory) {
      case "stage1":
        return {
          title: "Chặng 1: Vỡ Lòng Bàn Phím (Bài 1 ➔ 12)",
          desc: "26 chữ cái Alphabet, hàng phím cơ sở và phản xạ 10 ngón tay.",
        };
      case "stage2":
        return {
          title: "Chặng 2: Hàng Phím Số & Ký Hiệu (Bài 13 ➔ 24)",
          desc: "Phím số 0-9, các loại ngoặc (), [], {}, toán tử và ký hiệu đặc biệt.",
        };
      case "stage3":
        return {
          title: "Chặng 3: Tiếng Việt Chuẩn Telex (Bài 25 ➔ 26)",
          desc: "5 dấu thanh (s, f, r, x, j), nguyên âm đôi, ca dao tục ngữ và văn bản tiếng Việt.",
        };
      case "stage4":
        return {
          title: "Chặng 4: Tốc Ký Thực Chiến & Đoạn Văn Bản (Bài 27 ➔ 30)",
          desc: "Tăng tốc toàn diện với các đoạn văn dài, danh ngôn và câu chuyện văn học.",
        };
      case "stage5":
        return {
          title: "Chặng 5: Lập Trình & Code Đa Ngôn Ngữ (Bài 31 ➔ 82)",
          desc: "Luyện cú pháp Python, JavaScript, C++, Java, C#, Kotlin, HTML/CSS, React.",
        };
      default:
        return {
          title: "Toàn Bộ Lộ Trình Luyện Gõ 10 Ngón",
          desc: "Hệ thống bài tập bài bản từ vỡ lòng ngón trỏ đến gõ văn bản và lập trình chuyên nghiệp.",
        };
    }
  }, [selectedCategory]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Progress Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c162d] via-[#101b38] to-[#0b1429] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-md">
              <Keyboard size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>{currentCategoryInfo.title}</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {currentCategoryInfo.desc}
              </p>
            </div>
          </div>

          {/* Quick Continue Button */}
          <button
            onClick={() => onSelectDrill(currentLessonId, currentDrillId)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20"
          >
            <span>Tiếp tục: Bài {currentDrillId}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Progress Bar & Mode Toggle */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center justify-between mb-1.5 font-mono">
              <span className="text-gray-300">
                Tiến độ: <strong className="text-emerald-400 font-bold">{totalCompletedCount}</strong> / {totalDrillsCount} bài đã hoàn thành
              </span>
              <span className="text-cyan-400 font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 transition-all duration-500 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Free Mode Toggle */}
          {onToggleFreeMode && (
            <button
              onClick={onToggleFreeMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isFreeMode
                  ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                  : "bg-blue-950/40 border-blue-500/40 text-blue-300"
              }`}
              title="Bật/tắt chế độ khóa bài theo lộ trình học"
            >
              {isFreeMode ? <Unlock size={13} /> : <Lock size={13} />}
              <span>{isFreeMode ? "Chế độ: Tự do mở hết" : "Chế độ: Khóa theo lộ trình"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a1020] p-3 rounded-2xl border border-white/10">
        {/* Stage Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "Tất Cả" },
            { id: "stage1", label: "Chặng 1 (Cơ Bản)" },
            { id: "stage2", label: "Chặng 2 (Số & Ký Hiệu)" },
            { id: "stage3", label: "Chặng 3 (Telex)" },
            { id: "stage4", label: "Chặng 4 (Tốc Ký)" },
            { id: "stage5", label: "Chặng 5 (Code)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Color Legend (Giải thích màu sắc) */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-gray-400">
        <span className="font-semibold text-gray-300 flex items-center gap-1.5">
          <Filter size={13} className="text-cyan-400" />
          <span>Chú thích trạng thái:</span>
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-400 inline-block" />
            <span className="text-emerald-300 font-bold">✓ Đã làm</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-cyan-950/60 border border-cyan-500/40 inline-block" />
            <span className="text-cyan-300">Chưa làm</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-400 inline-block" />
            <span className="text-amber-300">👑 Kiểm tra vượt ải</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-800 border border-gray-600 inline-block" />
            <span className="text-gray-500">🔒 Đang khóa</span>
          </span>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons.map((lesson) => {
          const isCurrentLesson = lesson.id === currentLessonId;
          const isUnlocked = isFreeMode || unlockedLessons.includes(lesson.id);
          const metas = (Array.isArray(lesson.drillsMeta)
            ? lesson.drillsMeta
            : []) as LessonMeta[];

          const drillItems =
            metas.length > 0
              ? metas
              : [{ id: `${lesson.code}.1`, drill_id: `${lesson.code}.1`, title: `Bài ${lesson.code}.1` }];

          // Check completed count inside this lesson
          let completedInLesson = 0;
          drillItems.forEach((m: any) => {
            const dId = m.id || m.drill_id || m.drillId;
            if (
              completedDrillIds.includes(dId) ||
              completedDrillIds.includes(`${lesson.id}_${dId}`)
            ) {
              completedInLesson++;
            }
          });

          const isLessonFullyCompleted =
            drillItems.length > 0 && completedInLesson === drillItems.length;

          return (
            <div
              key={lesson.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                !isUnlocked
                  ? "bg-[#090d19]/60 border-white/5 opacity-50"
                  : isCurrentLesson
                  ? "bg-[#0c162e] border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "bg-[#0a1122] border-white/10 hover:border-white/20"
              }`}
            >
              {/* Lesson Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    {!isUnlocked && <Lock size={12} className="text-red-400" />}
                    BÀI {lesson.code}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {lesson.title}
                  </h4>
                  {lesson.subtitle && (
                    <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-gray-300 font-mono text-xs">
                      {lesson.subtitle}
                    </span>
                  )}
                </div>

                {/* Status Indicator */}
                <div>
                  {isLessonFullyCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Đã xong {completedInLesson}/{drillItems.length}</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-mono">
                      {completedInLesson > 0
                        ? `Đã làm ${completedInLesson}/${drillItems.length}`
                        : `${drillItems.length} bài tập`}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400/80 font-mono flex items-center gap-1">
                      <Lock size={11} />
                      <span>Cần vượt ải bài trước</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Horizontal Drill Capsules (TÔ MÀU ĐÃ LÀM) */}
              <div className="flex flex-wrap items-center gap-2">
                {drillItems.map((m: any, dIdx: number) => {
                  const dId = m.id || m.drill_id || m.drillId || `${lesson.code}.${dIdx + 1}`;
                  const isDrillActive =
                    lesson.id === currentLessonId && dId === currentDrillId;
                  const isExam = m.isExam || m.type === "exam" || dId.includes("EXAM");
                  const isWarmup = m.type === "warmup" || dId.includes(".0");
                  const isCompleted =
                    completedDrillIds.includes(dId) ||
                    completedDrillIds.includes(`${lesson.id}_${dId}`);

                  return (
                    <button
                      key={dIdx}
                      disabled={!isUnlocked}
                      onClick={() => onSelectDrill(lesson.id, dId)}
                      className={`relative flex items-center justify-center transition-all duration-150 rounded-full font-mono text-xs font-semibold ${
                        !isUnlocked
                          ? "h-7 px-2.5 bg-gray-800/40 border border-gray-700/40 text-gray-500 cursor-not-allowed"
                          : isDrillActive
                          ? "h-7 px-3 ring-2 ring-amber-300 scale-105 font-bold !bg-amber-400 !text-black shadow-lg shadow-amber-400/60"
                          : isCompleted
                          ? isExam
                            ? "h-7 px-3.5 bg-gradient-to-r from-emerald-500/30 via-yellow-400/30 to-amber-500/30 border border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20 hover:scale-105"
                            : "h-7 px-2.5 bg-emerald-500/25 border border-emerald-400/80 text-emerald-300 shadow-sm shadow-emerald-500/25 hover:bg-emerald-500/40 hover:scale-105"
                          : isExam
                          ? "h-7 px-3 bg-gradient-to-r from-amber-500/25 to-yellow-400/25 border border-amber-400 text-amber-300 hover:scale-105 shadow-md shadow-amber-400/20"
                          : isWarmup
                          ? "h-7 px-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300/80 hover:bg-emerald-500/30"
                          : "h-7 px-2.5 bg-[#14203a] border border-blue-500/30 text-gray-200 hover:bg-blue-600/30"
                      }`}
                      title={
                        isExam
                          ? `👑 BÀI KIỂM TRA VƯỢT ẢI (WPM ≥ ${m.targetWpm || 20}, Acc ≥ ${m.minAccuracy || 95}%)`
                          : `${m.title || dId}: ${m.desc || ""}`
                      }
                    >
                      {isExam ? (
                        <span className="flex items-center gap-1 font-bold">
                          <Crown size={13} className={isDrillActive ? "text-black" : isCompleted ? "text-emerald-300" : "text-amber-400"} />
                          <span>{isCompleted ? "Vượt Ải ✓" : "Vượt Ải"}</span>
                        </span>
                      ) : (
                        <span>
                          {isCompleted ? `✓ ${dId.split(".")[1] || dId}` : dId.split(".")[1] || dId}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
