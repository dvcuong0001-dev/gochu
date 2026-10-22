import { LeaderboardUserRecord } from "@/types";

// In-memory fallback global leaderboard data
let mockGlobalLeaderboard: LeaderboardUserRecord[] = [
  {
    username: "pro_typer_vn",
    avatar: "👑",
    level: 18,
    xp: 1840,
    bestWpm: 98,
    avgAccuracy: 99.4,
    totalTimeSeconds: 5240,
    completedDrills: 45,
    lastActive: new Date().toISOString(),
  },
  {
    username: "banphimthan",
    avatar: "⚡",
    level: 15,
    xp: 1520,
    bestWpm: 88,
    avgAccuracy: 98.6,
    totalTimeSeconds: 4320,
    completedDrills: 38,
    lastActive: new Date().toISOString(),
  },
  {
    username: "cyber_ninja",
    avatar: "🎮",
    level: 12,
    xp: 1240,
    bestWpm: 82,
    avgAccuracy: 97.2,
    totalTimeSeconds: 3800,
    completedDrills: 30,
    lastActive: new Date().toISOString(),
  },
  {
    username: "tap_go_nhanh",
    avatar: "🚀",
    level: 10,
    xp: 1050,
    bestWpm: 74,
    avgAccuracy: 96.5,
    totalTimeSeconds: 3100,
    completedDrills: 26,
    lastActive: new Date().toISOString(),
  },
  {
    username: "tets1",
    avatar: "🦊",
    level: 8,
    xp: 820,
    bestWpm: 66,
    avgAccuracy: 95.8,
    totalTimeSeconds: 2400,
    completedDrills: 19,
    lastActive: new Date().toISOString(),
  },
  {
    username: "nguoimoibatdau",
    avatar: "🌸",
    level: 5,
    xp: 510,
    bestWpm: 52,
    avgAccuracy: 94.0,
    totalTimeSeconds: 1520,
    completedDrills: 12,
    lastActive: new Date().toISOString(),
  },
  {
    username: "cuong_dev",
    avatar: "🐱",
    level: 4,
    xp: 430,
    bestWpm: 48,
    avgAccuracy: 93.5,
    totalTimeSeconds: 1100,
    completedDrills: 9,
    lastActive: new Date().toISOString(),
  },
];

export async function fetchGlobalLeaderboard(
  sortBy: "xp" | "wpm" | "time" = "xp"
): Promise<LeaderboardUserRecord[]> {
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  let records: LeaderboardUserRecord[] = [...mockGlobalLeaderboard];

  if (sheetUrl) {
    try {
      const res = await fetch(`${sheetUrl}?action=get_leaderboard`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          records = data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Google Sheets, using mock:", error);
    }
  }

  // Normalize all records to ensure no undefined / NaN fields
  const safeRecords: LeaderboardUserRecord[] = records.map((r: any) => ({
    username: r?.username || "Ẩn danh",
    avatar: r?.avatar || "🐱",
    level: Number(r?.level) || 1,
    xp: Number(r?.xp) || 0,
    bestWpm: Number(r?.bestWpm ?? r?.wpm ?? 0),
    avgAccuracy: Number(r?.avgAccuracy ?? r?.accuracy ?? 100),
    totalTimeSeconds: Number(r?.totalTimeSeconds ?? r?.timeSpent ?? 0),
    completedDrills: Number(r?.completedDrills ?? 1),
    lastActive: r?.lastActive || r?.createdAt || new Date().toISOString(),
  }));

  // Sort based on chosen criteria
  if (sortBy === "wpm") {
    safeRecords.sort((a, b) => b.bestWpm - a.bestWpm);
  } else if (sortBy === "time") {
    safeRecords.sort((a, b) => b.totalTimeSeconds - a.totalTimeSeconds);
  } else {
    safeRecords.sort((a, b) => b.xp - a.xp);
  }

  return safeRecords;
}

export async function updateLeaderboardUser(data: {
  username: string;
  avatar?: string;
  wpm: number;
  accuracy: number;
  timeSpent: number;
  earnedXp?: number;
}): Promise<boolean> {
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  const validName = (data.username || "Ẩn danh").trim();
  const validWpm = Math.max(0, Math.round(Number(data.wpm) || 0));
  const validAcc = Math.max(0, Math.min(100, Number(data.accuracy) || 100));
  const validTime = Math.max(0, Math.round(Number(data.timeSpent) || 0));
  const xpGained = Math.max(10, Math.round(Number(data.earnedXp) || validWpm * 0.8));

  // Update in-memory / fallback
  const existing = mockGlobalLeaderboard.find(
    (u) => u.username && u.username.toLowerCase() === validName.toLowerCase()
  );

  if (existing) {
    existing.xp = (Number(existing.xp) || 0) + xpGained;
    existing.level = 1 + Math.floor(existing.xp / 100);
    existing.bestWpm = Math.max(Number(existing.bestWpm) || 0, validWpm);
    existing.totalTimeSeconds = (Number(existing.totalTimeSeconds) || 0) + validTime;
    existing.completedDrills = (Number(existing.completedDrills) || 0) + 1;
    existing.avgAccuracy = parseFloat(
      (((Number(existing.avgAccuracy) || 100) + validAcc) / 2).toFixed(1)
    );
    if (data.avatar) existing.avatar = data.avatar;
    existing.lastActive = new Date().toISOString();
  } else {
    mockGlobalLeaderboard.push({
      username: validName,
      avatar: data.avatar || "🐱",
      level: 1 + Math.floor(xpGained / 100),
      xp: xpGained,
      bestWpm: validWpm,
      avgAccuracy: parseFloat(validAcc.toFixed(1)),
      totalTimeSeconds: validTime,
      completedDrills: 1,
      lastActive: new Date().toISOString(),
    });
  }

  if (!sheetUrl) return true;

  try {
    const res = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        username: validName,
        wpm: validWpm,
        accuracy: validAcc,
        timeSpent: validTime,
        earnedXp: xpGained,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to post score to Google Sheets:", err);
    return false;
  }
}
