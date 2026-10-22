"use client";

import React, { useState, useMemo } from "react";
import { Lesson } from "@/types";
import { Keyboard, Check, Sparkles, X, ChevronDown, CheckCircle2 } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calculate total drills across all lessons
  const totalDrillsCount = useMemo(() => {
    return lessons.reduce((acc, l) => {
      const metas = Array.isArray(l.drillsMeta) ? l.drillsMeta : [];
      return acc + (metas.length > 0 ? metas.length : 1);
    }, 0);
  }, [lessons]);

  // Filter lessons by category
  const filteredLessons = useMemo(() => {
    if (selectedCategory === "basic") {
      return lessons.filter((_, idx) => idx < 15);
    }
    if (selectedCategory === "intermediate") {
      return lessons.filter((_, idx) => idx >= 15 && idx < 45);
    }
    if (selectedCategory === "advanced") {
      return lessons.filter((_, idx) => idx >= 45);
    }
    return lessons;
  }, [lessons, selectedCategory]);

  const currentCategoryTitle = useMemo(() => {
    if (selectedCategory === "basic") return "Cơ bản";
    if (selectedCategory === "intermediate") return "Trung cấp & Phím số";
    if (selectedCategory === "advanced") return "Nâng cao & Tiếng Việt";
    return "Cơ bản";
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
        {/* Top Filter Bar (Image 3 Header) */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0a1126]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              DANH MỤC
            </span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#111c38] border border-white/15 focus:border-amber-400 text-white text-xs font-semibold rounded-xl pl-3.5 pr-8 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tất cả — {totalDrillsCount} bài</option>
                <option value="basic">Cơ bản (Home row & Phím chính) — 64 bài</option>
                <option value="intermediate">Trung cấp & Phím số</option>
                <option value="advanced">Nâng cao & Văn bản thực chiến</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Header Card (Image 3 Banner) */}
        <div className="p-5 border-b border-white/5 bg-[#080f24] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
            <Keyboard size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{currentCategoryTitle}</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              {currentCategoryDrillsCount} bài tập · 0 đã hoàn thành
            </p>
          </div>
        </div>

        {/* Timeline Lessons List (Image 3 Exact Layout) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-900/60 space-y-7">
            {filteredLessons.map((lesson) => {
              const isCurrentLesson = lesson.id === currentLessonId;
              const metas = Array.isArray(lesson.drillsMeta)
                ? lesson.drillsMeta
                : [];
              const drillItems = metas.length > 0 ? metas : [{ drill_id: `${lesson.code}.1` }];

              return (
                <div key={lesson.id} className="relative group">
                  {/* Timeline node dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isCurrentLesson
                        ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/60 scale-125"
                        : "bg-[#0b142c] border-blue-800 group-hover:border-blue-500"
                    }`}
                  />

                  {/* Lesson Title & Code */}
                  <div className="flex flex-wrap items-baseline gap-2.5 mb-2.5">
                    <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
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
                  </div>

                  {/* Horizontal Drill Capsules (Image 3 Dashes) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {drillItems.map((m, dIdx) => {
                      const isDrillActive =
                        lesson.id === currentLessonId &&
                        m.drill_id === currentDrillId;

                      return (
                        <button
                          key={dIdx}
                          onClick={() => {
                            onSelectDrill(lesson.id, m.drill_id);
                            onClose();
                          }}
                          className={`h-2.5 sm:h-3 w-7 sm:w-10 rounded-full transition-all duration-150 ${
                            isDrillActive
                              ? "bg-amber-400 ring-2 ring-amber-300 shadow-md shadow-amber-400/70 scale-110"
                              : "bg-[#152342] hover:bg-cyan-500/50 border border-white/5"
                          }`}
                          title={`Bài tập ${m.drill_id}`}
                        />
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
