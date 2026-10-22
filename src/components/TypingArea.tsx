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
} from "lucide-react";

interface TypingAreaProps {
  drill: Drill;
  onNextDrill?: () => void;
  onOpenLeaderboard?: () => void;
  onExit?: () => void;
  user?: UserProfile | null;
  onAwardXp?: (xp: number) => void;
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
  user,
  onAwardXp,
}) => {
  // Line-by-line structure
  const lines = drill.lines;
  const totalLines = lines.length;

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

  // Total characters in the entire drill
  const totalDrillChars = useMemo(() => {
    let count = 0;
    lines.forEach((l) => {
      l.groups.forEach((g) => {
        count += g.length + 1; // group chars + space
      });
    });
    return count;
  }, [lines]);

  // Build the tile structure for the current line
  const currentLineData = useMemo(() => {
    const line = lines[currentLineIndex] || lines[0];
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
      // Add space tile at the end of every group
      tiles.push({
        char: " ",
        isSpace: true,
        charIndexInLine: runningIdx++,
      });
      groups.push({ tiles });
    });

    return { groups, totalCharsInLine: runningIdx };
  }, [lines, currentLineIndex]);

  // Keep username updated if user logs in
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Audio setup
  useEffect(() => {
    clickAudioRef.current = new Audio("/sounds/click.wav");
    buzzAudioRef.current = new Audio("/sounds/buzz.wav");
  }, []);

  const playSound = useCallback(
    (correct: boolean) => {
      if (!soundEnabled) return;
      try {
        if (correct && clickAudioRef.current) {
          clickAudioRef.current.currentTime = 0;
          clickAudioRef.current.play().catch(() => {});
        } else if (!correct && buzzAudioRef.current) {
          buzzAudioRef.current.currentTime = 0;
          buzzAudioRef.current.play().catch(() => {});
        }
      } catch (_) {}
    },
    [soundEnabled]
  );

  // Reset drill
  const resetDrill = useCallback(() => {
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
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => containerRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    resetDrill();
  }, [drill, resetDrill]);

  // Listen to window blur & focus
  useEffect(() => {
    const handleWindowBlur = () => {
      // Pause only if drill has started and is not completed
      if (startTime && !isCompleted) {
        setIsPaused(true);
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [startTime, isCompleted]);

  // Timer loop
  useEffect(() => {
    if (startTime && !isCompleted && !isPaused) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const seconds = Math.max(1, (now - startTime) / 1000);
        setElapsed(Math.round(seconds));

        const currentWpm = Math.round((totalCorrectChars / 5) / (seconds / 60));
        setWpm(currentWpm);

        const totalAttempts = totalCorrectChars + totalErrorChars;
        if (totalAttempts > 0) {
          const acc = (totalCorrectChars / totalAttempts) * 100;
          setAccuracy(parseFloat(acc.toFixed(1)));
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, isPaused, totalCorrectChars, totalErrorChars]);

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
      if (!startTime) {
        setStartTime(Date.now());
      }

      const expected = activeChar;
      const isCorrect = inputChar === expected;

      playSound(isCorrect);

      if (isCorrect) {
        setTotalCorrectChars((prev) => prev + 1);
      } else {
        setTotalErrorChars((prev) => prev + 1);
      }

      setLineTypedStatuses((prev) => [...prev, isCorrect]);
      const nextCharIndex = charIndexInCurrentLine + 1;

      // Check if finished current line
      if (nextCharIndex >= currentLineData.totalCharsInLine) {
        if (currentLineIndex + 1 < totalLines) {
          // Advance to next line!
          setCurrentLineIndex((prev) => prev + 1);
          setCharIndexInCurrentLine(0);
          setLineTypedStatuses([]);
        } else {
          // Drill completed!
          setIsCompleted(true);
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
          });
          if (onAwardXp) {
            const earned = Math.max(15, Math.round(totalDrillChars * 0.8));
            onAwardXp(earned);
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
      totalDrillChars,
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
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: finalName,
          avatar: user?.avatar || "🐱",
          lessonId: drill.lessonId || "lesson1",
          drillId: drill.id || "1.01",
          wpm: Math.max(0, Math.round(Number(wpm) || 0)),
          accuracy: Math.max(0, Math.min(100, parseFloat(Number(accuracy || 100).toFixed(1)))),
          timeSpent: Math.max(0, Math.round(Number(elapsed) || 0)),
          earnedXp: Math.max(10, Math.round((Number(wpm) || 0) * 0.8)),
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

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-4 select-none"
    >
      {/* 1. TOP PROGRESS BAR (Image 2 Style) */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400 mb-1.5">
          <span className="uppercase tracking-wider text-amber-400">THỜI GIAN</span>
          <span className="text-gray-300">
            {totalTypedSoFar} ký tự · {progressPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#121a2f] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-amber-400 shadow-sm shadow-amber-400/50 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. SUBHEADER: Line count & Legend (Image 2 Style) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">
            DÒNG {currentLineIndex + 1}/{totalLines}
          </span>
          <span className="text-gray-500">·</span>
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

      {/* 3. CURRENT LINE WORD-BLOCKS (2x2 Grid Tiles - Image 2 Style) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {currentLineData.groups.map((group, gIdx) => (
          <div
            key={gIdx}
            className="p-4 sm:p-5 rounded-2xl bg-[#0e1628]/90 border border-white/10 shadow-xl flex items-center justify-center gap-2"
          >
            {group.tiles.map((tile) => {
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

              return (
                <div
                  key={tile.charIndexInLine}
                  className={`w-10 sm:w-12 h-12 sm:h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg sm:text-xl border transition-all duration-150 ${tileStyle}`}
                >
                  {tile.isSpace ? (
                    <span className="text-xs opacity-60">␣</span>
                  ) : (
                    tile.char
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 4. VIRTUAL KEYBOARD */}
      <div className="w-full mb-6">
        <VirtualKeyboard activeChar={activeChar} />
      </div>

      {/* 5. FINGER GUIDE & HAND VISUALIZER (Image 2 Style) */}
      <div className="w-full mb-4">
        <FingerGuide
          activeChar={activeChar}
          targetWpm={40}
          difficultyText={drill.lessonId ? "Bài tập cơ bản" : "Tiêu chuẩn"}
        />
      </div>

      {/* ⏸️ PAUSE MODAL ON BLUR ("khi mất focus cửa sổ thì hiện bảng tạm dừng hoặc thoát bài") */}
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
                <Play size={16} className="fill-current" />
                <span>Tiếp Tục Gõ</span>
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  if (onExit) onExit();
                }}
                className="w-full py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Thoát Bài Tập</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMPLETION RESULTS MODAL */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e1628] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative glow-cyan animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black shadow-lg shadow-cyan-500/30">
              <Trophy size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">Xuất Sắc! Hoàn Thành Bài</h3>
            <p className="text-sm text-gray-400 mb-6">
              {drill.title} ({drill.lessonId})
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl mb-6">
              <div>
                <span className="text-[11px] text-gray-400 block">Tốc độ</span>
                <span className="text-2xl font-mono font-bold text-cyan-400">{wpm}</span>
                <span className="text-[10px] text-gray-500 block">WPM</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Độ chính xác</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{accuracy}%</span>
                <span className="text-[10px] text-gray-500 block">Accuracy</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Thời gian</span>
                <span className="text-2xl font-mono font-bold text-gray-200">{elapsed}s</span>
                <span className="text-[10px] text-gray-500 block">Seconds</span>
              </div>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmitScore} className="mb-6">
                <label className="block text-xs font-medium text-gray-300 text-left mb-1.5">
                  Lưu vào Bảng Xếp Hạng (Google Sheets):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên của bạn..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={25}
                    className="flex-1 bg-black/50 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-sm text-white outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !username.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {isSubmitting ? "Đang lưu..." : "Lưu Điểm"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm mb-6">
                <CheckCircle2 size={18} />
                <span>Đã ghi nhận điểm số vào Bảng xếp hạng!</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetDrill}
                className="flex-1 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 text-sm font-medium transition-all"
              >
                Gõ Lại
              </button>

              {onNextDrill && (
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    onNextDrill();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30"
                >
                  <span>Bài Tiếp</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
