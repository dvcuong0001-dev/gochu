"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Drill } from "@/types";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { UserProfile } from "./AuthModal";
import confetti from "canvas-confetti";
import { Volume2, VolumeX, RotateCcw, Trophy, CheckCircle2, ArrowRight } from "lucide-react";

interface TypingAreaProps {
  drill: Drill;
  onNextDrill?: () => void;
  onOpenLeaderboard?: () => void;
  user?: UserProfile | null;
  onAwardXp?: (xp: number) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  drill,
  onNextDrill,
  onOpenLeaderboard,
  user,
  onAwardXp,
}) => {
  // Flatten drill lines into a target string
  const lines = drill.lines.map((l) => l.groups.join(" "));
  const fullText = lines.join("\n");

  const [inputIndex, setInputIndex] = useState(0);
  const [typedChars, setTypedChars] = useState<{ char: string; isCorrect: boolean }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Score submission state (auto-fill with logged-in user)
  const [username, setUsername] = useState(user?.username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const buzzAudioRef = useRef<HTMLAudioElement | null>(null);

  // Keep username updated if user logs in
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Initialize sounds
  useEffect(() => {
    clickAudioRef.current = new Audio("/sounds/click.wav");
    buzzAudioRef.current = new Audio("/sounds/buzz.wav");
  }, []);

  const playSound = useCallback((correct: boolean) => {
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
  }, [soundEnabled]);

  // Reset when drill changes
  const resetDrill = useCallback(() => {
    setInputIndex(0);
    setTypedChars([]);
    setStartTime(null);
    setElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    setIsSubmitted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (containerRef.current) containerRef.current.focus();
  }, []);

  useEffect(() => {
    resetDrill();
  }, [drill, resetDrill]);

  // Timer loop
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const seconds = Math.max(1, (now - startTime) / 1000);
        setElapsed(Math.round(seconds));

        // Calculate WPM & Accuracy
        const correctCount = typedChars.filter((c) => c.isCorrect).length;
        const currentWpm = Math.round((correctCount / 5) / (seconds / 60));
        setWpm(currentWpm);

        if (typedChars.length > 0) {
          const acc = (correctCount / typedChars.length) * 100;
          setAccuracy(parseFloat(acc.toFixed(1)));
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, typedChars]);

  // Handle typing key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isCompleted) return;

      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "CapsLock") {
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        if (inputIndex > 0) {
          setInputIndex((prev) => prev - 1);
          setTypedChars((prev) => prev.slice(0, prev.length - 1));
        }
        return;
      }

      let inputChar = e.key;
      if (e.key === "Enter") {
        inputChar = "\n";
      }

      if (inputChar.length !== 1 && inputChar !== "\n") {
        return;
      }

      e.preventDefault();

      if (!startTime) {
        setStartTime(Date.now());
      }

      const expectedChar = fullText[inputIndex];
      const isCorrect = inputChar === expectedChar;

      playSound(isCorrect);

      const nextTyped = [...typedChars, { char: inputChar, isCorrect }];
      setTypedChars(nextTyped);
      const nextIndex = inputIndex + 1;
      setInputIndex(nextIndex);

      // Check completion
      if (nextIndex >= fullText.length) {
        setIsCompleted(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Award XP
        if (onAwardXp) {
          const earned = Math.max(10, Math.round(fullText.length * 0.8));
          onAwardXp(earned);
        }
      }
    },
    [isCompleted, inputIndex, fullText, typedChars, startTime, playSound, onAwardXp]
  );

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
          lessonId: drill.lessonId,
          drillId: drill.id,
          wpm,
          accuracy,
          timeSpent: elapsed,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        if (onOpenLeaderboard) {
          setTimeout(onOpenLeaderboard, 1200);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeChar = inputIndex < fullText.length ? fullText[inputIndex] : "";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-6"
    >
      {/* Metric HUD Bar */}
      <div className="w-full flex items-center justify-between bg-[#0e1628]/90 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Tốc độ
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold text-cyan-400">{wpm}</span>
              <span className="text-xs text-gray-400">WPM</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Chính xác
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-mono font-bold ${accuracy >= 95 ? "text-emerald-400" : "text-amber-400"}`}>
                {accuracy}%
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Thời gian
            </span>
            <span className="text-3xl font-mono font-bold text-gray-200">
              {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                : "bg-gray-800/50 border-white/5 text-gray-500 hover:text-gray-300"
            }`}
            title={soundEnabled ? "Tắt âm thanh gõ" : "Bật âm thanh gõ"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            onClick={resetDrill}
            className="p-2.5 rounded-xl bg-gray-800/60 border border-white/10 text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Luyện lại bài này"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Làm lại</span>
          </button>
        </div>
      </div>

      {/* Main Typing Display Canvas */}
      <div className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl p-6 sm:p-8 min-h-[160px] font-mono text-xl sm:text-2xl leading-relaxed tracking-wider mb-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-baseline select-none">
          {fullText.split("").map((targetChar, idx) => {
            const typed = typedChars[idx];
            let charClass = "text-gray-500"; // default untyped

            if (typed) {
              charClass = typed.isCorrect
                ? "text-cyan-300 font-semibold"
                : "text-red-400 bg-red-950/60 rounded underline decoration-red-500";
            }

            const isCurrent = idx === inputIndex;

            if (targetChar === "\n") {
              return (
                <span key={idx} className="w-full block my-2 border-b border-white/5 relative">
                  {isCurrent && (
                    <span className="inline-block w-2.5 h-6 bg-cyan-400 typing-caret -mb-1 rounded-sm" />
                  )}
                  <span className="text-xs text-gray-600 ml-1">↵</span>
                </span>
              );
            }

            return (
              <span key={idx} className={`relative transition-colors ${charClass}`}>
                {isCurrent && (
                  <span className="absolute -left-0.5 top-0 w-2.5 h-7 bg-cyan-400 typing-caret rounded-sm" />
                )}
                {targetChar === " " ? (
                  <span className={typed && !typed.isCorrect ? "bg-red-900/50 rounded px-1" : ""}>
                    &nbsp;
                  </span>
                ) : (
                  targetChar
                )}
              </span>
            );
          })}
        </div>

        {!startTime && (
          <div className="absolute inset-x-0 bottom-3 text-center pointer-events-none">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-sans rounded-full animate-bounce">
              Nhấn phím bất kỳ để bắt đầu gõ...
            </span>
          </div>
        )}
      </div>

      {/* Virtual Keyboard Guidance */}
      <div className="w-full mb-6">
        <VirtualKeyboard activeChar={activeChar} />
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e1628] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative glow-cyan animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black shadow-lg shadow-cyan-500/30">
              <Trophy size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">Xuất Sắc! Hoàn Thành Bài</h3>
            <p className="text-sm text-gray-400 mb-6">
              {drill.title} ({drill.lessonId})
            </p>

            {/* Results Grid */}
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

            {/* Submit to Leaderboard Form */}
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

            {/* Next / Replay Actions */}
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
