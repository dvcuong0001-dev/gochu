import { LeaderboardRecord } from "@/types";

// In-memory fallback if Google Sheets URL is not configured yet
let mockLeaderboard: LeaderboardRecord[] = [
  {
    username: "pro_typer_vn",
    lessonId: "lesson1",
    drillId: "1.1",
    wpm: 85,
    accuracy: 99.2,
    timeSpent: 28,
    createdAt: new Date().toISOString(),
  },
  {
    username: "banphimthan",
    lessonId: "lesson1",
    drillId: "1.1",
    wpm: 72,
    accuracy: 98.0,
    timeSpent: 35,
    createdAt: new Date().toISOString(),
  },
  {
    username: "cyber_ninja",
    lessonId: "lesson2",
    drillId: "2.1",
    wpm: 68,
    accuracy: 96.5,
    timeSpent: 40,
    createdAt: new Date().toISOString(),
  },
  {
    username: "tap_go_nhanh",
    lessonId: "lesson1",
    drillId: "1.1",
    wpm: 55,
    accuracy: 94.0,
    timeSpent: 48,
    createdAt: new Date().toISOString(),
  },
];

export async function fetchLeaderboard(drillId?: string): Promise<LeaderboardRecord[]> {
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  if (!sheetUrl) {
    if (drillId) {
      return mockLeaderboard.filter((item) => item.drillId === drillId);
    }
    return mockLeaderboard;
  }

  try {
    const url = drillId ? `${sheetUrl}?drillId=${encodeURIComponent(drillId)}` : sheetUrl;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Google Sheets fetch failed with status ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : mockLeaderboard;
  } catch (error) {
    console.error("Failed to fetch from Google Sheets, using fallback:", error);
    return mockLeaderboard;
  }
}

export async function saveLeaderboardEntry(entry: LeaderboardRecord): Promise<boolean> {
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  // Always save to fallback
  mockLeaderboard.unshift(entry);
  mockLeaderboard.sort((a, b) => b.wpm - a.wpm);
  if (mockLeaderboard.length > 50) {
    mockLeaderboard = mockLeaderboard.slice(0, 50);
  }

  if (!sheetUrl) {
    return true;
  }

  try {
    const res = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    return res.ok;
  } catch (error) {
    console.error("Failed to post score to Google Sheets:", error);
    return false;
  }
}
