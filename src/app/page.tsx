"use client";

import React, { useState, useEffect } from "react";
import lessonsData from "@/data/lessons.json";
import { Lesson, Drill } from "@/types";
import { Navbar } from "@/components/Navbar";
import { TypingArea } from "@/components/TypingArea";
import { LessonSelector } from "@/components/LessonSelector";
import { ArcadeView } from "@/components/ArcadeView";
import { LeaderboardView } from "@/components/LeaderboardView";
import { SheetsGuideView } from "@/components/SheetsGuideView";
import { BookOpen, Sparkles, Trophy, Gamepad2, ArrowRight } from "lucide-react";

export default function Home() {
  const lessons = lessonsData as unknown as Lesson[];
  const [currentLessonId, setCurrentLessonId] = useState("lesson1");
  const [currentDrillId, setCurrentDrillId] = useState("1.1");
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(true);

  const [currentTab, setCurrentTab] = useState<
    "practice" | "arcade" | "leaderboard" | "sheets-guide"
  >("practice");
  const [isLessonSelectorOpen, setIsLessonSelectorOpen] = useState(false);

  // Load drill
  useEffect(() => {
    async function loadDrill() {
      setLoadingDrill(true);
      try {
        const res = await fetch(
          `/api/drill?id=${encodeURIComponent(currentDrillId)}&lessonId=${encodeURIComponent(currentLessonId)}`
        );
        if (res.ok) {
          const drill = await res.json();
          setCurrentDrill(drill);
        }
      } catch (err) {
        console.error("Failed to load drill:", err);
      } finally {
        setLoadingDrill(false);
      }
    }
    loadDrill();
  }, [currentLessonId, currentDrillId]);

  // Current lesson object
  const currentLesson =
    lessons.find((l) => l.id === currentLessonId) || lessons[0];

  // Next drill handler
  const handleNextDrill = () => {
    const metas = Array.isArray(currentLesson?.drillsMeta)
      ? currentLesson.drillsMeta
      : [];

    const currentIndex = metas.findIndex((m) => m.drill_id === currentDrillId);

    if (currentIndex !== -1 && currentIndex < metas.length - 1) {
      setCurrentDrillId(metas[currentIndex + 1].drill_id);
    } else {
      // Next lesson
      const lessonIndex = lessons.findIndex((l) => l.id === currentLessonId);
      if (lessonIndex !== -1 && lessonIndex < lessons.length - 1) {
        const nextLesson = lessons[lessonIndex + 1];
        setCurrentLessonId(nextLesson.id);
        const nextMetas = Array.isArray(nextLesson.drillsMeta)
          ? nextLesson.drillsMeta
          : [];
        if (nextMetas.length > 0) {
          setCurrentDrillId(nextMetas[0].drill_id);
        } else {
          setCurrentDrillId(`${nextLesson.code}.1`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-gray-100">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentLessonTitle={currentLesson?.title}
        currentDrillId={currentDrillId}
        onOpenLessonSelector={() => setIsLessonSelectorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-6">
        {currentTab === "practice" && (
          <div className="w-full flex flex-col items-center">
            {/* Top Info Banner */}
            <div className="w-full max-w-5xl mx-auto px-4 mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLessonSelectorOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11192d] hover:bg-[#16213c] border border-white/10 text-xs text-gray-300 hover:text-white transition-all shadow-sm"
                >
                  <BookOpen size={14} className="text-cyan-400" />
                  <span className="font-semibold text-white">
                    {currentLesson?.title}
                  </span>
                  <span className="text-gray-500">·</span>
                  <span className="font-mono text-cyan-300">
                    Bài {currentDrillId}
                  </span>
                  <span className="text-[10px] text-gray-400">▾</span>
                </button>

                {currentLesson?.subtitle && (
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    ({currentLesson.subtitle})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab("arcade")}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Gamepad2 size={14} />
                  <span>Chơi Game 3D</span>
                </button>

                <button
                  onClick={() => setCurrentTab("leaderboard")}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Trophy size={14} />
                  <span>Xếp Hạng</span>
                </button>
              </div>
            </div>

            {/* Typing Canvas */}
            {loadingDrill || !currentDrill ? (
              <div className="w-full max-w-5xl mx-auto p-16 text-center text-gray-400">
                <div className="inline-block animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mb-3" />
                <p className="text-sm">Đang tải bài tập {currentDrillId}...</p>
              </div>
            ) : (
              <TypingArea
                drill={currentDrill}
                onNextDrill={handleNextDrill}
                onOpenLeaderboard={() => setCurrentTab("leaderboard")}
              />
            )}
          </div>
        )}

        {currentTab === "arcade" && (
          <ArcadeView onBack={() => setCurrentTab("practice")} />
        )}

        {currentTab === "leaderboard" && (
          <LeaderboardView
            onBack={() => setCurrentTab("practice")}
            currentDrillId={currentDrillId}
          />
        )}

        {currentTab === "sheets-guide" && (
          <SheetsGuideView onBack={() => setCurrentTab("practice")} />
        )}
      </main>

      {/* Lesson Selector Drawer / Modal */}
      <LessonSelector
        lessons={lessons}
        currentLessonId={currentLessonId}
        currentDrillId={currentDrillId}
        onSelectDrill={(lid, did) => {
          setCurrentLessonId(lid);
          setCurrentDrillId(did);
        }}
        isOpen={isLessonSelectorOpen}
        onClose={() => setIsLessonSelectorOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-4 text-center text-[11px] text-gray-500 font-mono">
        Tự Học Typing Web · 81 Bài Học · 414 Bài Tập · Hỗ Trợ Game 3D & Google Sheets Leaderboard
      </footer>
    </div>
  );
}
