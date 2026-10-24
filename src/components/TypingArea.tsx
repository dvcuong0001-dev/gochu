"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Drill } from "@/types";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { FingerGuide } from "./FingerGuide";
import { UserProfile } from "./AuthModal";
import confetti from "canvas-confetti";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Pause,
  Play,
  LogOut,
  AlertCircle,
  Crown,
  XCircle,
  Sparkles,
  Loader2,
  BookOpen,
} from "lucide-react";

interface TypingAreaProps {
  drill: Drill;
  onNextDrill?: () => void;
  onOpenLeaderboard?: () => void;
  onExit?: () => void;
  onBackToCatalog?: () => void;
  onCompleteDrill?: (drillId: string) => void;
  user?: UserProfile | null;
  onAwardXp?: (xp: number) => void;
  onUnlockNextLesson?: (lessonId: string) => void;
}

interface CharTileData {
  char: string;
  isSpace: boolean;
  charIndexInLine: number;
}

interface GroupData {
  tiles: CharTileData[];
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  drill,
  onNextDrill,
  onOpenLeaderboard,
  onExit,
  onBackToCatalog,
  onCompleteDrill,
  user,
  onAwardXp,
  onUnlockNextLesson,
}) => {
  // Line-by-line structure
  const lines = drill.lines && drill.lines.length > 0 ? drill.lines : [{ groups: [drill.title || "Ready"], isLoopStart: false }];
  const totalLines = lines.length;

  const isExam = Boolean(drill.isExam || drill.type === "exam" || drill.id?.includes("EXAM"));
  const targetWpm = drill.targetWpm || 20;
  const minAccuracy = drill.minAccuracy || 95;

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndexInCurrentLine, setCharIndexInCurrentLine] = useState(0);
  const [lineTypedStatuses, setLineTypedStatuses] = useState<boolean[]>([]); // true for correct, false for error

  // Global metrics across the whole drill
  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const [totalErrorChars, setTotalErrorChars] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Pause / Blur state ("khi mất focus cửa sổ thì hiện bảng tạm dừng hoặc thoát bài")
  const [isPaused, setIsPaused] = useState(false);

  // Score submission state
  const [username, setUsername] = useState(user?.username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const buzzAudioRef = useRef<HTMLAudioElement | null>(null);
  const statsRef = useRef({
    correct: 0,
    errors: 0,
    startTime: null as number | null,
  });

  // Total characters in the entire drill
  const totalDrillChars = useMemo(() => {
    let count = 0;
    lines.forEach((l) => {
      l.groups.forEach((g) => {
        count += g.length + 1; // group chars + space
      });
    });
    return Math.max(1, count);
  }, [lines]);

  // Build the tile structure for the current line
  const currentLineData = useMemo(() => {
    const line = lines[currentLineIndex] || lines[0] || { groups: [] };
    const groups: GroupData[] = [];
    let runningIdx = 0;

    line.groups.forEach((groupStr) => {
      const tiles: CharTileData[] = [];
      for (let i = 0; i < groupStr.length; i++) {
        tiles.push({
          char: groupStr[i],
          isSpace: false,
          charIndexInLine: runningIdx++,
        });
      }
      // Trailing space between groups
      tiles.push({
        char: " ",
        isSpace: true,
        charIndexInLine: runningIdx++,
      });
      groups.push({ tiles });
    });

    return {
      groups,
      totalCharsInLine: Math.max(1, runningIdx),
    };
  }, [lines, currentLineIndex]);

  // Initialize Web Audio API beeps
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      (window as any).__audioCtx = ctx;
    } catch (_) {}
  }, []);

  const playSound = useCallback((isCorrect: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = (window as any).__audioCtx;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isCorrect) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      }
    } catch (_) {}
  }, [soundEnabled]);

  // Reset drill state when drill prop changes
  const resetDrill = useCallback(() => {
    statsRef.current = {
      correct: 0,
      errors: 0,
      startTime: null,
    };
    setCurrentLineIndex(0);
    setCharIndexInCurrentLine(0);
    setLineTypedStatuses([]);
    setTotalCorrectChars(0);
    setTotalErrorChars(0);
    setStartTime(null);
    setElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => containerRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    resetDrill();
  }, [drill.id, drill.lessonId, resetDrill]);

  // Handle window blur/focus
  useEffect(() => {
    const handleWindowBlur = () => {
      if (startTime && !isCompleted) {
        setIsPaused(true);
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => window.removeEventListener("blur", handleWindowBlur);
  }, [startTime, isCompleted]);

  // Auto submit score to Google Sheets / Leaderboard
  const autoSubmitScore = useCallback(
    async (subWpm: number, subAcc: number, subTime: number, subXp: number) => {
      setIsSubmitting(true);
      try {
        let finalName = (user?.username || "").trim();
        if (!finalName) {
          try {
            const saved = localStorage.getItem("tuhoc_user");
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed?.username) finalName = parsed.username;
            }
          } catch (_) {}
        }
        if (!finalName) finalName = "Khách";

        let savedUnlocked: string[] = ["lesson1"];
        try {
          const stored = localStorage.getItem("unlocked_lessons");
          if (stored) savedUnlocked = JSON.parse(stored);
        } catch (_) {}

        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: finalName,
            avatar: user?.avatar || "🐱",
            pin: user?.pin,
            unlockedLessons: savedUnlocked,
            lessonId: drill.lessonId || "lesson1",
            drillId: drill.id || "1.01",
            wpm: subWpm,
            accuracy: subAcc,
            timeSpent: subTime,
            earnedXp: subXp,
          }),
        });

        setIsSubmitted(true);
      } catch (err) {
        console.error("Auto submit score error:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, drill.lessonId, drill.id]
  );

  // Timer loop
  useEffect(() => {
    if (startTime && !isCompleted && !isPaused) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const start = statsRef.current.startTime || startTime;
        const seconds = Math.max(1, (now - start) / 1000);
        setElapsed(Math.round(seconds));

        // WPM: (correct chars / 5) / (seconds / 60)
        const words = statsRef.current.correct / 5;
        const minutes = seconds / 60;
        const currentWpm = minutes > 0 ? Math.round(words / minutes) : 0;
        setWpm(currentWpm);

        // Accuracy
        const totalTyped = statsRef.current.correct + statsRef.current.errors;
        const currentAcc =
          totalTyped > 0
            ? Math.max(0, Math.min(100, Math.round((statsRef.current.correct / totalTyped) * 100)))
            : 100;
        setAccuracy(currentAcc);
      }, 300);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, isPaused]);

  // Target character for current position in line
  const activeChar = useMemo(() => {
    for (const group of currentLineData.groups) {
      for (const tile of group.tiles) {
        if (tile.charIndexInLine === charIndexInCurrentLine) {
          return tile.char;
        }
      }
    }
    return "";
  }, [currentLineData, charIndexInCurrentLine]);

  // Check if exam is passed
  const isExamPassed = useMemo(() => {
    if (!isExam) return true;
    return wpm >= targetWpm && accuracy >= minAccuracy;
  }, [isExam, wpm, targetWpm, accuracy, minAccuracy]);

  // Handle typing input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isCompleted || isPaused) return;

      // Ignore modifier keys
      if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape"].includes(e.key)) {
        return;
      }

      // Backspace inside the current line
      if (e.key === "Backspace") {
        e.preventDefault();
        if (charIndexInCurrentLine > 0) {
          setCharIndexInCurrentLine((prev) => prev - 1);
          setLineTypedStatuses((prev) => prev.slice(0, prev.length - 1));
        }
        return;
      }

      let inputChar = e.key;
      if (e.key === "Enter") {
        inputChar = " "; // Enter can complete a trailing space
      }

      if (inputChar.length !== 1) {
        return;
      }

      e.preventDefault();

      // Start timer on first keypress
      if (!statsRef.current.startTime) {
        statsRef.current.startTime = Date.now();
        setStartTime(statsRef.current.startTime);
      }

      const expected = activeChar;
      const isCorrect = inputChar === expected;

      playSound(isCorrect);

      if (isCorrect) {
        statsRef.current.correct += 1;
        setTotalCorrectChars((prev) => prev + 1);
      } else {
        statsRef.current.errors += 1;
        setTotalErrorChars((prev) => prev + 1);
      }

      // Synchronous live accuracy calculation directly from statsRef
      const totalTyped = statsRef.current.correct + statsRef.current.errors;
      const liveAcc =
        totalTyped > 0
          ? Math.max(0, Math.min(100, Math.round((statsRef.current.correct / totalTyped) * 100)))
          : 100;
      setAccuracy(liveAcc);

      setLineTypedStatuses((prev) => [...prev, isCorrect]);
      const nextCharIndex = charIndexInCurrentLine + 1;

      // Check if finished current line
      if (nextCharIndex >= currentLineData.totalCharsInLine) {
        if (currentLineIndex + 1 < totalLines) {
          // Advance to next line
          setCurrentLineIndex((prev) => prev + 1);
          setCharIndexInCurrentLine(0);
          setLineTypedStatuses([]);
        } else {
          // Drill completed!
          if (timerRef.current) clearInterval(timerRef.current);

          const now = Date.now();
          const finalStart = statsRef.current.startTime || startTime || now;
          const finalSeconds = Math.max(1, Math.round((now - finalStart) / 1000));
          const finalCorrect = statsRef.current.correct;
          const finalErrors = statsRef.current.errors;
          const finalTotal = finalCorrect + finalErrors;
          const finalAcc =
            finalTotal > 0
              ? Math.max(0, Math.min(100, Math.round((finalCorrect / finalTotal) * 100)))
              : 100;
          const finalWpm = Math.max(1, Math.round((finalCorrect / 5) / (finalSeconds / 60)));

          const passed = !isExam || (finalWpm >= targetWpm && finalAcc >= minAccuracy);

          setElapsed(finalSeconds);
          setWpm(finalWpm);
          setAccuracy(finalAcc);
          setIsCompleted(true);

          if (passed) {
            try {
              confetti({
                particleCount: 160,
                spread: 90,
                origin: { y: 0.6 },
              });
            } catch (_) {}

            if (isExam && onUnlockNextLesson && drill.lessonId) {
              try {
                onUnlockNextLesson(drill.lessonId);
              } catch (e) {
                console.error("onUnlockNextLesson error:", e);
              }
            }
          }

          const baseEarned = Math.max(15, Math.round(totalDrillChars * 0.8));
          const bonus = isExam && passed ? 100 : 0;
          const earnedXp = baseEarned + bonus;

          if (onAwardXp) {
            try {
              onAwardXp(earnedXp);
            } catch (e) {
              console.error("onAwardXp error:", e);
            }
          }

          if (onCompleteDrill && drill.id) {
            try {
              onCompleteDrill(drill.id);
            } catch (e) {
              console.error("onCompleteDrill error:", e);
            }
          }

          // Automatically submit score to leaderboard
          try {
            autoSubmitScore(finalWpm, finalAcc, finalSeconds, earnedXp);
          } catch (e) {
            console.error("autoSubmitScore error:", e);
          }
        }
      } else {
        setCharIndexInCurrentLine(nextCharIndex);
      }
    },
    [
      isCompleted,
      isPaused,
      charIndexInCurrentLine,
      startTime,
      activeChar,
      playSound,
      currentLineData.totalCharsInLine,
      currentLineIndex,
      totalLines,
      onAwardXp,
      onCompleteDrill,
      drill.id,
      totalDrillChars,
      isExam,
      targetWpm,
      minAccuracy,
      onUnlockNextLesson,
      drill.lessonId,
      autoSubmitScore,
    ]
  );

  // Resume from pause
  const handleResume = () => {
    setIsPaused(false);
    setTimeout(() => containerRef.current?.focus(), 50);
  };

  // Submit score to Google Sheets
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = username.trim() || user?.username || "Ẩn danh";
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let savedUnlocked: string[] = ["lesson1"];
      try {
        const stored = localStorage.getItem("unlocked_lessons");
        if (stored) savedUnlocked = JSON.parse(stored);
      } catch (_) {}

      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: finalName,
          avatar: user?.avatar || "🦊",
          pin: user?.pin,
          unlockedLessons: savedUnlocked,
          lessonId: drill.lessonId || "lesson1",
          drillId: drill.id || "1.01",
          wpm: Math.max(0, Math.round(Number(wpm) || 0)),
          accuracy: Math.max(0, Math.min(100, parseFloat(Number(accuracy || 100).toFixed(1)))),
          timeSpent: Math.max(0, Math.round(Number(elapsed) || 0)),
          earnedXp: Math.max(10, Math.round((Number(wpm) || 0) * 0.8)) + (isExam && isExamPassed ? 100 : 0),
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        if (onOpenLeaderboard) {
          setTimeout(() => {
            try {
              onOpenLeaderboard();
            } catch (navErr) {
              console.error("Navigation error:", navErr);
            }
          }, 1000);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error("Lỗi API lưu điểm:", errJson);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall progress percentage
  const totalTypedSoFar = totalCorrectChars + totalErrorChars;
  const progressPercent = Math.min(
    100,
    Math.round((totalTypedSoFar / Math.max(1, totalDrillChars)) * 100)
  );

  const displayExpected = activeChar === " " ? "Phím Cách (Space)" : activeChar;

  // Helper render single tile
  const renderTile = (tile: CharTileData, isCompact = false) => {
    const isCurrent = tile.charIndexInLine === charIndexInCurrentLine;
    const hasTyped = tile.charIndexInLine < charIndexInCurrentLine;
    const status = hasTyped ? lineTypedStatuses[tile.charIndexInLine] : undefined;

    let tileStyle = "bg-[#141d33] text-gray-300 border-white/5";

    if (isCurrent) {
      tileStyle =
        "bg-amber-400 text-black font-extrabold border-amber-300 shadow-lg shadow-amber-400/50 scale-105 z-10 animate-pulse";
    } else if (status === true) {
      tileStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    } else if (status === false) {
      tileStyle = "bg-red-500/20 text-red-400 border-red-500/50";
    }

    const sizeClass = isCompact
      ? "min-w-[28px] sm:min-w-[32px] h-9 sm:h-10 px-1 text-sm sm:text-base rounded-lg"
      : "w-10 sm:w-12 h-12 sm:h-14 rounded-xl text-lg sm:text-xl";

    return (
      <div
        key={tile.charIndexInLine}
        className={`${sizeClass} flex items-center justify-center font-mono font-bold border transition-all duration-150 ${tileStyle}`}
      >
        {tile.isSpace ? (
          <span className="text-xs opacity-60">␣</span>
        ) : (
          tile.char
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-4 select-none"
    >
      {/* 👑 EXAM BANNER (If current drill is Gatekeeper Exam) */}
      {isExam && (
        <div className="w-full mb-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 border border-amber-400/40 flex items-center justify-between text-xs sm:text-sm font-semibold text-amber-300 shadow-lg shadow-amber-400/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-black flex items-center justify-center shadow-md">
              <Crown size={16} />
            </div>
            <span>👑 BÀI KIỂM TRA VƯỢT ẢI</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span>Mục tiêu: <strong className="text-white font-bold">{targetWpm} WPM</strong></span>
            <span>·</span>
            <span>Chính xác: <strong className="text-white font-bold">≥ {minAccuracy}%</strong></span>
          </div>
        </div>
      )}

      {/* 1. TOP PROGRESS BAR */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400 mb-2">
          <div className="flex items-center gap-2.5">
            {onBackToCatalog && (
              <button
                type="button"
                onClick={onBackToCatalog}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Quay lại danh sách các bài học"
              >
                <span>← Danh Sách Bài</span>
              </button>
            )}
            <span className="text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>DÒNG {currentLineIndex + 1}/{totalLines}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-300 truncate max-w-[240px] sm:max-w-md">{drill.title}</span>
            </span>
          </div>
          <span>{progressPercent}% HOÀN THÀNH</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. STATS & STATUS BAR */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#0c1322]/80 border border-white/5 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
          <span className="text-gray-300">
            Gõ phím <strong className="text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">{displayExpected}</strong> để tiếp tục
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-gray-400">Đúng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span className="text-gray-400">Hiện tại</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span className="text-gray-400">Sai</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gray-400 hover:text-white ml-2"
            title={soundEnabled ? "Tắt âm" : "Bật âm"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* 3. CURRENT LINE WORD-BLOCKS (Adaptive: 2x2 Grid if <= 4 words, Wrapping Sentence if > 4 words) */}
      {currentLineData.groups.length <= 4 ? (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {currentLineData.groups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="p-4 sm:p-5 rounded-2xl bg-[#0e1628]/90 border border-white/10 shadow-xl flex items-center justify-center gap-2"
            >
              {group.tiles.map((tile) => renderTile(tile, false))}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full p-4 sm:p-6 rounded-2xl bg-[#0e1628]/90 border border-white/10 shadow-xl flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 max-w-4xl">
          {currentLineData.groups.map((group, gIdx) => (
            <div key={gIdx} className="flex items-center gap-0.5 bg-[#141d33]/60 px-1.5 py-1 rounded-xl border border-white/5">
              {group.tiles.map((tile) => renderTile(tile, true))}
            </div>
          ))}
        </div>
      )}

      {/* 4. VIRTUAL KEYBOARD */}
      <div className="w-full mb-6">
        <VirtualKeyboard activeChar={activeChar} />
      </div>

      {/* 5. FINGER GUIDE & HAND VISUALIZER */}
      <div className="w-full mb-4">
        <FingerGuide
          activeChar={activeChar}
          targetWpm={targetWpm}
          difficultyText={isExam ? "👑 Bài kiểm tra vượt ải" : drill.title || "Bài tập rèn luyện"}
        />
      </div>

      {/* PAUSE MODAL ON BLUR */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#0c1220] border border-amber-400/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative glow-cyan">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
              <Pause size={28} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">BÀI TẬP ĐÃ TẠM DỪNG</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Bạn vừa chuyển sang cửa sổ khác hoặc mất tiêu điểm gõ phím. Thời gian làm bài đã được dừng lại.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30"
              >
                <Play size={16} fill="black" />
                <span>Tiếp tục bài tập</span>
              </button>

              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span>Thoát ra màn hình chính</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETION MODAL */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md bg-[#0e1628] rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200 border ${
            isExam
              ? isExamPassed
                ? "border-amber-400/60 shadow-amber-400/20"
                : "border-red-500/50 shadow-red-500/20"
              : "border-cyan-500/30 glow-cyan"
          }`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-black shadow-lg ${
              isExam
                ? isExamPassed
                  ? "bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-amber-400/40"
                  : "bg-gradient-to-tr from-red-500 to-rose-400 shadow-red-500/40 text-white"
                : "bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-cyan-500/30"
            }`}>
              {isExam ? (
                isExamPassed ? <Crown size={36} /> : <AlertCircle size={36} />
              ) : (
                <Trophy size={32} />
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">
              {isExam
                ? isExamPassed
                  ? "🎉 VƯỢT ẢI THÀNH CÔNG!"
                  : "⚠️ CHƯA ĐẠT CHUẨN VƯỢT ẢI"
                : "Hoàn Thành Bài Tập!"}
            </h3>

            <p className="text-xs text-gray-400 mb-6 font-mono">
              {isExam
                ? isExamPassed
                  ? "Chúc mừng! Bạn đã mở khóa bài học tiếp theo và nhận +100 XP thưởng!"
                  : `Bạn cần đạt tối thiểu ${targetWpm} WPM và độ chính xác ≥ ${minAccuracy}%. Hãy thử lại!`
                : drill.title}
            </p>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6 bg-black/30 p-4 rounded-2xl border border-white/5">
              <div>
                <p className="text-[11px] text-gray-400 font-mono">TỐC ĐỘ</p>
                <p className={`text-2xl font-extrabold font-mono ${
                  isExam && wpm < targetWpm ? "text-red-400" : "text-cyan-400"
                }`}>
                  {wpm} <span className="text-xs font-normal">WPM</span>
                </p>
                {isExam && (
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">Mục tiêu: {targetWpm}</p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-mono">CHÍNH XÁC</p>
                <p className={`text-2xl font-extrabold font-mono ${
                  isExam && accuracy < minAccuracy ? "text-red-400" : "text-emerald-400"
                }`}>
                  {accuracy}%
                </p>
                {isExam && (
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">Mục tiêu: {minAccuracy}%</p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-mono">THỜI GIAN</p>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  {elapsed}s
                </p>
                {isExam && isExamPassed && (
                  <p className="text-[9px] text-amber-300 font-mono mt-0.5">+100 XP 👑</p>
                )}
              </div>
            </div>

            {/* Auto Save Status Banner */}
            {isSubmitting ? (
              <div className="mb-6 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center gap-2.5 text-cyan-300 text-xs font-mono">
                <Loader2 size={16} className="animate-spin text-cyan-400" />
                <span>Đang tự động cập nhật kết quả lên Bảng Xếp Hạng...</span>
              </div>
            ) : isSubmitted ? (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-400 text-xs font-medium font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                  <span>
                    Đã tự động tính toán & ghi nhận vào Bảng Xếp Hạng!
                  </span>
                </div>
                {onOpenLeaderboard && (
                  <button
                    onClick={onOpenLeaderboard}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1"
                  >
                    <span>Xem Hạng</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ) : null}

            {user?.isGuest && (
              <p className="text-[11px] text-amber-400/90 mb-4 font-mono text-center">
                💡 Bạn đang ở Chế độ Khách. Đăng nhập với mã PIN 6 số để lưu trữ tài khoản vĩnh viễn.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={resetDrill}
                className="flex-1 min-w-[100px] py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>{isExam && !isExamPassed ? "Thi lại" : "Làm Lại"}</span>
              </button>

              {onBackToCatalog && (
                <button
                  onClick={onBackToCatalog}
                  className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-gray-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen size={15} className="text-cyan-400" />
                  <span>Danh Sách Bài</span>
                </button>
              )}

              {onNextDrill && (!isExam || isExamPassed) && (
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    onNextDrill();
                  }}
                  className="flex-1 min-w-[110px] py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/30"
                >
                  <span>Bài Tiếp</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
