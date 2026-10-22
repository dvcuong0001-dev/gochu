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
    totalTimeSeconds: 5240, // ~1h 27m
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

export async function fetchGlobalLeaderboard(sortBy: "xp" | "wpm" | "time" = "xp"): Promise<LeaderboardUserRecord[]> {
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

  // Sort based on chosen criteria
  if (sortBy === "wpm") {
    records.sort((a, b) => b.bestWpm - a.bestWpm);
  } else if (sortBy === "time") {
    records.sort((a, b) => b.totalTimeSeconds - a.totalTimeSeconds);
  } else {
    // default: by level & xp
    records.sort((a, b) => b.xp - a.xp);
  }

  return records;
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

  // Update in-memory / fallback
  const existing = mockGlobalLeaderboard.find(
    (u) => u.username.toLowerCase() === data.username.toLowerCase()
  );

  const xpGained = data.earnedXp || Math.max(10, Math.round(data.wpm * 0.8));

  if (existing) {
    existing.xp += xpGained;
    existing.level = 1 + Math.floor(existing.xp / 100);
    existing.bestWpm = Math.max(existing.bestWpm, Math.round(data.wpm));
    existing.totalTimeSeconds += Math.round(data.timeSpent);
    existing.completedDrills += 1;
    existing.avgAccuracy = parseFloat(
      ((existing.avgAccuracy + data.accuracy) / 2).toFixed(1)
    );
    if (data.avatar) existing.avatar = data.avatar;
    existing.lastActive = new Date().toISOString();
  } else {
    const newXp = xpGained;
    mockGlobalLeaderboard.push({
      username: data.username,
      avatar: data.avatar || "🐱",
      level: 1 + Math.floor(newXp / 100),
      xp: newXp,
      bestWpm: Math.round(data.wpm),
      avgAccuracy: parseFloat(data.accuracy.toFixed(1)),
      totalTimeSeconds: Math.round(data.timeSpent),
      completedDrills: 1,
      lastActive: new Date().toISOString(),
    });
  }

  if (!sheetUrl) return true;

  try {
    const res = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to post score to Google Sheets:", err);
    return false;
  }
}
