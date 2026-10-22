"use client";

import React, { useState, useEffect } from "react";
import lessonsData from "@/data/lessons.json";
import { Lesson, Drill } from "@/types";
import { Navbar, NavTab } from "@/components/Navbar";
import { HomeView } from "@/components/HomeView";
import { TypingArea } from "@/components/TypingArea";
import { LessonSelector } from "@/components/LessonSelector";
import { ArcadeView } from "@/components/ArcadeView";
import { LeaderboardView } from "@/components/LeaderboardView";
import { SheetsGuideView } from "@/components/SheetsGuideView";
import { AuthModal, UserProfile } from "@/components/AuthModal";
import { BookOpen, Trophy, Gamepad2 } from "lucide-react";

export default function Home() {
  const lessons = lessonsData as unknown as Lesson[];

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Navigation tab - Default to "home" as requested by user
  const [currentTab, setCurrentTab] = useState<NavTab>("home");

  // Progression & Unlocked lessons state
  const [unlockedLessons, setUnlockedLessons] = useState<string[]>(["lesson1"]);
  const [isFreeMode, setIsFreeMode] = useState(false);

  // Lesson & Drill state
  const [currentLessonId, setCurrentLessonId] = useState("lesson1");
  const [currentDrillId, setCurrentDrillId] = useState("1.01");
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(true);
  const [isLessonSelectorOpen, setIsLessonSelectorOpen] = useState(false);

  // Load user & progression from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("tuhoc_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedUnlocked = localStorage.getItem("unlocked_lessons");
      if (savedUnlocked) {
        setUnlockedLessons(JSON.parse(savedUnlocked));
      }
      const savedFreeMode = localStorage.getItem("typing_free_mode");
      if (savedFreeMode) {
        setIsFreeMode(savedFreeMode === "true");
      }
    } catch (_) {}
  }, []);

  const handleToggleFreeMode = () => {
    const nextVal = !isFreeMode;
    setIsFreeMode(nextVal);
    localStorage.setItem("typing_free_mode", String(nextVal));
  };

  const handleLoginSuccess = (newProfile: UserProfile) => {
    setUser(newProfile);
    if (Array.isArray(newProfile.unlockedLessons) && newProfile.unlockedLessons.length > 0) {
      setUnlockedLessons(newProfile.unlockedLessons);
      try {
        localStorage.setItem("unlocked_lessons", JSON.stringify(newProfile.unlockedLessons));
      } catch (_) {}
    }
  };

  const handleUnlockNextLesson = (completedLessonId: string) => {
    const idx = lessons.findIndex((l) => l.id === completedLessonId);
    if (idx !== -1 && idx < lessons.length - 1) {
      const nextLesson = lessons[idx + 1];
      setUnlockedLessons((prev) => {
        if (prev.includes(nextLesson.id)) return prev;
        const updated = [...prev, nextLesson.id];
        try {
          localStorage.setItem("unlocked_lessons", JSON.stringify(updated));
        } catch (_) {}

        // Background sync to server if logged in
        if (user && !user.isGuest) {
          fetch("/api/leaderboard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: user.username,
              pin: user.pin,
              avatar: user.avatar,
              wpm: 0,
              accuracy: 100,
              timeSpent: 0,
              earnedXp: 0,
              unlockedLessons: updated,
            }),
          }).catch(() => {});
        }

        return updated;
      });
    }
  };

  // Award XP and handle level up
  const handleAwardXp = (gainedXp: number) => {
    if (!user) return;
    const newXp = (user.xp || 0) + gainedXp;
    // Level formula: level = 1 + floor(xp / 100)
    const newLevel = 1 + Math.floor(newXp / 100);

    const updatedUser: UserProfile = {
      ...user,
      xp: newXp,
      level: newLevel,
    };

    setUser(updatedUser);
    try {
      localStorage.setItem("tuhoc_user", JSON.stringify(updatedUser));
    } catch (_) {}
  };

  const handleLogout = () => {
    setUser(null);
    setUnlockedLessons(["lesson1"]);
    try {
      localStorage.removeItem("tuhoc_user");
      localStorage.removeItem("unlocked_lessons");
    } catch (_) {}
  };

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

    const getMetaId = (m: any) => m?.id || m?.drill_id || m?.drillId;

    const currentIndex = metas.findIndex((m: any) => getMetaId(m) === currentDrillId);

    if (currentIndex !== -1 && currentIndex < metas.length - 1) {
      const nextId = getMetaId(metas[currentIndex + 1]);
      if (nextId) setCurrentDrillId(nextId);
    } else {
      const lessonIndex = lessons.findIndex((l) => l.id === currentLessonId);
      if (lessonIndex !== -1 && lessonIndex < lessons.length - 1) {
        const nextLesson = lessons[lessonIndex + 1];
        setCurrentLessonId(nextLesson.id);
        const nextMetas = Array.isArray(nextLesson.drillsMeta)
          ? nextLesson.drillsMeta
          : [];
        if (nextMetas.length > 0) {
          const firstId = getMetaId(nextMetas[0]);
          setCurrentDrillId(firstId || `${nextLesson.code}.1`);
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
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-6">
        {/* Tab 1: Trang Chủ (Home) */}
        {currentTab === "home" && (
          <HomeView
            onStartPractice={() => setCurrentTab("practice")}
            onOpenArcade={() => setCurrentTab("arcade")}
            onOpenLeaderboard={() => setCurrentTab("leaderboard")}
            onOpenAuth={() => setIsAuthOpen(true)}
            user={user}
          />
        )}

        {/* Tab 2: Luyện Gõ (Practice) */}
        {currentTab === "practice" && (
          <div className="w-full flex flex-col items-center">
            {/* Top Lesson Header Pill */}
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
                onExit={() => setCurrentTab("home")}
                user={user}
                onAwardXp={handleAwardXp}
                onUnlockNextLesson={handleUnlockNextLesson}
              />
            )}
          </div>
        )}

        {/* Tab 3: Khu Trò Chơi 3D Arcade */}
        {currentTab === "arcade" && (
          <ArcadeView onBack={() => setCurrentTab("home")} />
        )}

        {/* Tab 4: Bảng Xếp Hạng */}
        {currentTab === "leaderboard" && (
          <LeaderboardView onBack={() => setCurrentTab("home")} />
        )}

        {/* Tab 5: Hướng Dẫn Google Sheets */}
        {currentTab === "sheets-guide" && (
          <SheetsGuideView onBack={() => setCurrentTab("home")} />
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
          setCurrentTab("practice");
        }}
        isOpen={isLessonSelectorOpen}
        onClose={() => setIsLessonSelectorOpen(false)}
        unlockedLessons={unlockedLessons}
        isFreeMode={isFreeMode}
        onToggleFreeMode={handleToggleFreeMode}
      />

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={user}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-gray-500 font-mono">
        <div className="flex items-center justify-center gap-4 mb-2">
          <button onClick={() => setCurrentTab("home")} className="hover:text-gray-300">
            Trang Chủ
          </button>
          <span>·</span>
          <button onClick={() => setCurrentTab("practice")} className="hover:text-gray-300">
            Luyện Gõ
          </button>
          <span>·</span>
          <button onClick={() => setCurrentTab("arcade")} className="hover:text-gray-300">
            Game 3D
          </button>
          <span>·</span>
          <button onClick={() => setCurrentTab("leaderboard")} className="hover:text-gray-300">
            Bảng Xếp Hạng
          </button>
        </div>
        <p>Tự Học Typing Web · Chuyển thể từ Tự Học Typing Desktop 3.1.0 · Sẵn sàng Vercel & Google Sheets</p>
      </footer>
    </div>
  );
}
