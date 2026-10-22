"use client";

import React, { useState, useMemo } from "react";
import { Lesson, LessonMeta } from "@/types";
import {
  Keyboard,
  Check,
  Sparkles,
  X,
  ChevronDown,
  Lock,
  Unlock,
  Crown,
  Flame,
  Award,
} from "lucide-react";

interface LessonSelectorProps {
  lessons: Lesson[];
  currentLessonId: string;
  currentDrillId: string;
  onSelectDrill: (lessonId: string, drillId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  unlockedLessons?: string[];
  isFreeMode?: boolean;
  onToggleFreeMode?: () => void;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  currentLessonId,
  currentDrillId,
  onSelectDrill,
  isOpen,
  onClose,
  unlockedLessons = ["lesson1"],
  isFreeMode = false,
  onToggleFreeMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calculate total drills across all lessons
  const totalDrillsCount = useMemo(() => {
    return lessons.reduce((acc, l) => {
      const metas = Array.isArray(l.drillsMeta) ? l.drillsMeta : [];
      return acc + (metas.length > 0 ? metas.length : 1);
    }, 0);
  }, [lessons]);

  // Filter lessons by stage / category
  const filteredLessons = useMemo(() => {
    if (selectedCategory === "stage1") {
      return lessons.filter((l) => {
        const num = parseInt(l.code);
        return num >= 1 && num <= 12;
      });
    }
    if (selectedCategory === "stage2") {
      return lessons.filter((l) => {
        const num = parseInt(l.code);
        return num >= 13 && num <= 24;
      });
    }
    if (selectedCategory === "stage3") {
      return lessons.filter((l) => l.id === "lesson25" || l.id === "lesson26");
    }
    if (selectedCategory === "stage4") {
      return lessons.filter((l) => {
        const num = parseInt(l.code);
        return num >= 27 && num <= 30;
      });
    }
    if (selectedCategory === "stage5") {
      return lessons.filter((l) => {
        const num = parseInt(l.code);
        return num >= 31;
      });
    }
    return lessons;
  }, [lessons, selectedCategory]);

  const currentCategoryInfo = useMemo(() => {
    switch (selectedCategory) {
      case "stage1":
        return {
          title: "Chặng 1: Vỡ Lòng Bàn Phím (Bài 1 ➔ 12)",
          desc: "Làm chủ 26 phím chữ cái Alphabet, hàng cơ sở và phản xạ 10 ngón.",
        };
      case "stage2":
        return {
          title: "Chặng 2: Hàng Phím Số & Ký Hiệu (Bài 13 ➔ 24)",
          desc: "Phím số 0-9, các loại ngoặc (), [], {}, toán tử và ký hiệu lập trình.",
        };
      case "stage3":
        return {
          title: "Chặng 3: Tiếng Việt Chuẩn Telex (Bài 25 ➔ 26)",
          desc: "5 dấu thanh, nguyên âm đôi, chữ Đ, thành ngữ và ca dao tục ngữ.",
        };
      case "stage4":
        return {
          title: "Chặng 4: Tốc Ký Thực Chiến & Đoạn Văn Bản (Bài 27 ➔ 30)",
          desc: "Soạn thảo văn bản báo chí, email công sở và triết lý sống đỉnh cao.",
        };
      case "stage5":
        return {
          title: "Chặng 5: Lập Trình Viên Chuyên Nghiệp (Bài 31 ➔ 82)",
          desc: "Cú pháp code Python, JavaScript, C++, Java, C#, Kotlin, React.",
        };
      default:
        return {
          title: "Lộ Trình Toàn Diện (Tất cả 81 Bài Học)",
          desc: "Từ người mới bắt đầu đến tốc độ gõ phím siêu đẳng cấp.",
        };
    }
  }, [selectedCategory]);

  const currentCategoryDrillsCount = useMemo(() => {
    return filteredLessons.reduce((acc, l) => {
      const metas = Array.isArray(l.drillsMeta) ? l.drillsMeta : [];
      return acc + (metas.length > 0 ? metas.length : 1);
    }, 0);
  }, [filteredLessons]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#070d1e] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0a1126]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              DANH MỤC
            </span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#111c38] border border-white/15 focus:border-amber-400 text-white text-xs font-semibold rounded-xl pl-3.5 pr-8 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tất cả bài học ({totalDrillsCount} bài tập)</option>
                <option value="stage1">Chặng 1: Vỡ Lòng Bàn Phím (Bài 1 ➔ 12)</option>
                <option value="stage2">Chặng 2: Phím Số & Ký Hiệu (Bài 13 ➔ 24)</option>
                <option value="stage3">Chặng 3: Tiếng Việt Telex (Bài 25 ➔ 26)</option>
                <option value="stage4">Chặng 4: Tốc Ký Văn Bản (Bài 27 ➔ 30)</option>
                <option value="stage5">Chặng 5: Lập Trình Viên (Bài 31 ➔ 82)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Mode switch (Lộ trình vs Tự do) */}
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

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Header Card */}
        <div className="p-4 sm:p-5 border-b border-white/5 bg-[#080f24] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
            <Keyboard size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{currentCategoryInfo.title}</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {currentCategoryInfo.desc} ·{" "}
              <span className="text-amber-400 font-semibold">{currentCategoryDrillsCount} bài tập</span>
            </p>
          </div>
        </div>

        {/* Timeline Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-900/60 space-y-7">
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

              return (
                <div
                  key={lesson.id}
                  className={`relative group transition-opacity ${
                    isUnlocked ? "opacity-100" : "opacity-45"
                  }`}
                >
                  {/* Timeline node dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isCurrentLesson
                        ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/60 scale-125"
                        : isUnlocked
                        ? "bg-[#0b142c] border-blue-800 group-hover:border-blue-500"
                        : "bg-gray-900 border-gray-700"
                    }`}
                  />

                  {/* Lesson Title & Code */}
                  <div className="flex flex-wrap items-baseline gap-2.5 mb-2.5">
                    <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      {!isUnlocked && <Lock size={12} className="text-red-400" />}
                      BÀI {lesson.code}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      {lesson.title}
                    </span>
                    {lesson.subtitle && (
                      <span className="px-2 py-0.5 rounded-md bg-black/60 border border-amber-400/30 text-amber-300 font-mono text-xs">
                        {lesson.subtitle}
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="text-[11px] text-amber-400/80 font-mono">
                        (Cần vượt ải bài trước để mở khóa)
                      </span>
                    )}
                  </div>

                  {/* Horizontal Drill Capsules */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {drillItems.map((m: any, dIdx: number) => {
                      const dId = m.id || m.drill_id || m.drillId || `${lesson.code}.${dIdx + 1}`;
                      const isDrillActive =
                        lesson.id === currentLessonId && dId === currentDrillId;
                      const isExam = m.isExam || m.type === "exam" || dId.includes("EXAM");
                      const isWarmup = m.type === "warmup" || dId.includes(".0");

                      return (
                        <button
                          key={dIdx}
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked) {
                              onSelectDrill(lesson.id, dId);
                              onClose();
                            }
                          }}
                          className={`relative flex items-center justify-center transition-all duration-150 rounded-full font-mono text-[10px] ${
                            isExam
                              ? "h-6 px-3 bg-gradient-to-r from-amber-500/30 to-yellow-400/30 border border-amber-400 text-amber-300 hover:scale-105 shadow-md shadow-amber-400/20"
                              : isWarmup
                              ? "h-5 px-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                              : "h-5 px-2 bg-[#152342] border border-blue-500/20 text-gray-300 hover:bg-blue-600/40"
                          } ${
                            isDrillActive
                              ? "ring-2 ring-amber-300 scale-110 !border-amber-300 font-bold !bg-amber-400 !text-black shadow-lg shadow-amber-400/60"
                              : ""
                          }`}
                          title={
                            isExam
                              ? `👑 BÀI KIỂM TRA VƯỢT ẢI (WPM ≥ ${m.targetWpm || 20}, Acc ≥ ${m.minAccuracy || 95}%)`
                              : `${m.title || dId}: ${m.desc || ""}`
                          }
                        >
                          {isExam ? (
                            <span className="flex items-center gap-1 font-bold">
                              <Crown size={12} className={isDrillActive ? "text-black" : "text-amber-400"} />
                              <span>Vượt Ải</span>
                            </span>
                          ) : (
                            <span>{dId.split(".")[1] || dId}</span>
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
      </div>
    </div>
  );
};
