import { LeaderboardUserRecord, UserProfile } from "@/types";
import fs from "fs";
import path from "path";

// Local persistent fallback file path
const USERS_DB_PATH = path.join(process.cwd(), "src", "data", "users_db.json");

// Default initial leaderboard mock
const DEFAULT_MOCK_USERS: LeaderboardUserRecord[] = [
  {
    username: "pro_typer_vn",
    pin: "123456",
    avatar: "👑",
    level: 18,
    xp: 1840,
    bestWpm: 98,
    avgAccuracy: 99.4,
    totalTimeSeconds: 5240,
    completedDrills: 45,
    unlockedLessons: ["lesson1", "lesson2", "lesson3", "lesson4", "lesson5"],
    lastActive: new Date().toISOString(),
  },
  {
    username: "banphimthan",
    pin: "112233",
    avatar: "⚡",
    level: 15,
    xp: 1520,
    bestWpm: 88,
    avgAccuracy: 98.6,
    totalTimeSeconds: 4320,
    completedDrills: 38,
    unlockedLessons: ["lesson1", "lesson2", "lesson3"],
    lastActive: new Date().toISOString(),
  },
  {
    username: "cyber_ninja",
    pin: "654321",
    avatar: "🎮",
    level: 12,
    xp: 1240,
    bestWpm: 82,
    avgAccuracy: 97.2,
    totalTimeSeconds: 3800,
    completedDrills: 30,
    unlockedLessons: ["lesson1", "lesson2"],
    lastActive: new Date().toISOString(),
  },
  {
    username: "tap_go_nhanh",
    pin: "999888",
    avatar: "🚀",
    level: 10,
    xp: 1050,
    bestWpm: 74,
    avgAccuracy: 96.5,
    totalTimeSeconds: 3100,
    completedDrills: 26,
    unlockedLessons: ["lesson1", "lesson2"],
    lastActive: new Date().toISOString(),
  },
  {
    username: "cuong_dev",
    pin: "123456",
    avatar: "🐱",
    level: 8,
    xp: 820,
    bestWpm: 66,
    avgAccuracy: 95.8,
    totalTimeSeconds: 2400,
    completedDrills: 19,
    unlockedLessons: ["lesson1", "lesson2", "lesson3"],
    lastActive: new Date().toISOString(),
  },
];

// Helper to read local users DB
function readLocalUsers(): LeaderboardUserRecord[] {
  let list: LeaderboardUserRecord[] = [...DEFAULT_MOCK_USERS];
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const content = fs.readFileSync(USERS_DB_PATH, "utf-8").replace(/^\uFEFF/, "").trim();
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    }
  } catch (err) {
    console.error("Error reading users_db.json:", err);
  }

  // Deduplicate and aggregate on read so same account never duplicates
  const map = new Map<string, LeaderboardUserRecord>();
  list.forEach((u) => {
    const rawName = (u.username || "").trim();
    if (!rawName) return;
    const key = rawName.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { ...u, username: rawName });
    } else {
      const ex = map.get(key)!;
      ex.xp = Math.max(Number(ex.xp) || 0, Number(u.xp) || 0);
      ex.level = 1 + Math.floor(ex.xp / 100);
      ex.bestWpm = Math.max(Number(ex.bestWpm) || 0, Number(u.bestWpm) || 0);
      ex.avgAccuracy = Math.round((((Number(ex.avgAccuracy) || 100) + (Number(u.avgAccuracy) || 100)) / 2) * 10) / 10;
      ex.totalTimeSeconds = Math.max(Number(ex.totalTimeSeconds) || 0, Number(u.totalTimeSeconds) || 0);
      ex.completedDrills = Math.max(Number(ex.completedDrills) || 0, Number(u.completedDrills) || 0);
      if (u.pin) ex.pin = u.pin;
      if (u.avatar && u.avatar !== "🐱") ex.avatar = u.avatar;
    }
  });

  return Array.from(map.values());
}

// Helper to save local users DB
function writeLocalUsers(users: LeaderboardUserRecord[]) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving users_db.json:", err);
  }
}

// In-memory cache
let cachedUsers: LeaderboardUserRecord[] = readLocalUsers();

/**
 * Fetch leaderboard records sorted by criteria (Guaranteed strictly unique per account)
 */
export async function fetchGlobalLeaderboard(
  sortBy: "xp" | "wpm" | "time" = "xp"
): Promise<LeaderboardUserRecord[]> {
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  cachedUsers = readLocalUsers();
  let records: LeaderboardUserRecord[] = [...cachedUsers];

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
      console.error("Failed to fetch from Google Sheets, using local DB:", error);
    }
  }

  // Deduplicate and aggregate across all records (No account can appear more than once)
  const uniqueUsersMap = new Map<string, LeaderboardUserRecord>();

  records.forEach((r: any) => {
    const rawName = (r?.username || "Ẩn danh").trim();
    if (!rawName) return;
    const key = rawName.toLowerCase();

    const wpm = Number(r?.bestWpm ?? r?.wpm ?? 0);
    const acc = Number(r?.avgAccuracy ?? r?.accuracy ?? 100);
    const timeSpent = Number(r?.totalTimeSeconds ?? r?.timeSpent ?? 0);
    const drills = Number(r?.completedDrills ?? 1);
    const xp = Number(r?.xp ?? 0);
    const level = Number(r?.level) || (1 + Math.floor(xp / 100));
    const avatar = r?.avatar || "🐱";
    const lastActive = r?.lastActive || r?.createdAt || new Date().toISOString();
    const unlocked = Array.isArray(r?.unlockedLessons)
      ? r.unlockedLessons
      : typeof r?.unlockedLessons === "string"
      ? JSON.parse(r.unlockedLessons || "[]")
      : ["lesson1"];

    if (!uniqueUsersMap.has(key)) {
      uniqueUsersMap.set(key, {
        username: rawName,
        avatar,
        level,
        xp,
        bestWpm: wpm,
        avgAccuracy: acc,
        totalTimeSeconds: timeSpent,
        completedDrills: drills,
        unlockedLessons: unlocked,
        lastActive,
      });
    } else {
      const existing = uniqueUsersMap.get(key)!;
      existing.bestWpm = Math.max(existing.bestWpm, wpm);
      existing.xp = Math.max(existing.xp, xp);
      existing.level = Math.max(existing.level, level);
      existing.totalTimeSeconds = Math.max(existing.totalTimeSeconds, timeSpent);
      existing.completedDrills = Math.max(existing.completedDrills, drills);
      existing.avgAccuracy = parseFloat((((existing.avgAccuracy + acc) / 2)).toFixed(1));
      if (avatar && avatar !== "🐱") existing.avatar = avatar;
      if (new Date(lastActive) > new Date(existing.lastActive || 0)) {
        existing.lastActive = lastActive;
      }
      existing.unlockedLessons = Array.from(new Set([...(existing.unlockedLessons || []), ...unlocked]));
    }
  });

  const safeRecords = Array.from(uniqueUsersMap.values());

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

/**
 * Authenticate student by Username and 6-digit PIN
 * - If user exists: checks PIN. If correct, returns user profile + progress.
 * - If user does not exist: creates a new student account.
 */
export async function authenticateStudent(
  username: string,
  pin: string,
  avatar: string = "🐱"
): Promise<{ success: boolean; user?: UserProfile; isNew?: boolean; error?: string }> {
  const cleanName = (username || "").trim();
  const cleanPin = (pin || "").trim();

  if (!cleanName || cleanName.length < 2 || cleanName.length > 30) {
    return { success: false, error: "Tên đăng nhập phải từ 2 đến 30 ký tự." };
  }

  if (!/^\d{6}$/.test(cleanPin)) {
    return { success: false, error: "Mã PIN phải bao gồm đúng 6 chữ số!" };
  }

  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  // Try Google Sheets if configured
  if (sheetUrl) {
    try {
      const res = await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auth",
          username: cleanName,
          pin: cleanPin,
          avatar: avatar,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.user) {
          return {
            success: true,
            user: {
              username: result.user.username,
              avatar: result.user.avatar || avatar,
              level: Number(result.user.level) || 1,
              xp: Number(result.user.xp) || 0,
              pin: cleanPin,
              joinedAt: result.user.joinedAt || new Date().toISOString(),
              unlockedLessons: result.user.unlockedLessons || ["lesson1"],
              bestWpm: Number(result.user.bestWpm) || 0,
              avgAccuracy: Number(result.user.avgAccuracy) || 100,
              totalTimeSeconds: Number(result.user.totalTimeSeconds) || 0,
              isGuest: false,
            },
            isNew: !!result.isNew,
          };
        } else if (result.error) {
          return { success: false, error: result.error };
        }
      }
    } catch (err) {
      console.error("Auth via Google Sheets failed, falling back to local storage:", err);
    }
  }

  // Local fallback auth
  cachedUsers = readLocalUsers();
  const existingIndex = cachedUsers.findIndex(
    (u) => u.username.toLowerCase() === cleanName.toLowerCase()
  );

  if (existingIndex !== -1) {
    const existing = cachedUsers[existingIndex];
    // Check PIN
    if (existing.pin && existing.pin !== cleanPin) {
      return {
        success: false,
        error: "Mã PIN 6 số không đúng cho tài khoản này! Vui lòng kiểm tra lại hoặc đổi tên khác.",
      };
    }

    // If existing had no PIN, attach this PIN
    if (!existing.pin) {
      existing.pin = cleanPin;
      writeLocalUsers(cachedUsers);
    }

    const profile: UserProfile = {
      username: existing.username,
      avatar: existing.avatar || avatar,
      level: existing.level || 1,
      xp: existing.xp || 0,
      pin: cleanPin,
      joinedAt: existing.lastActive || new Date().toISOString(),
      unlockedLessons: existing.unlockedLessons || ["lesson1"],
      bestWpm: existing.bestWpm || 0,
      avgAccuracy: existing.avgAccuracy || 100,
      totalTimeSeconds: existing.totalTimeSeconds || 0,
      isGuest: false,
    };

    return { success: true, user: profile, isNew: false };
  }

  // Create new user
  const newUser: LeaderboardUserRecord = {
    username: cleanName,
    pin: cleanPin,
    avatar: avatar,
    level: 1,
    xp: 0,
    bestWpm: 0,
    avgAccuracy: 100,
    totalTimeSeconds: 0,
    completedDrills: 0,
    unlockedLessons: ["lesson1"],
    lastActive: new Date().toISOString(),
  };

  cachedUsers.push(newUser);
  writeLocalUsers(cachedUsers);

  const profile: UserProfile = {
    username: cleanName,
    avatar: avatar,
    level: 1,
    xp: 0,
    pin: cleanPin,
    joinedAt: newUser.lastActive!,
    unlockedLessons: ["lesson1"],
    bestWpm: 0,
    avgAccuracy: 100,
    totalTimeSeconds: 0,
    isGuest: false,
  };

  return { success: true, user: profile, isNew: true };
}

/**
 * Update Leaderboard & Sync progress (XP, Unlocked lessons, WPM)
 */
export async function updateLeaderboardUser(data: {
  username: string;
  avatar?: string;
  pin?: string;
  wpm: number;
  accuracy: number;
  timeSpent: number;
  earnedXp?: number;
  unlockedLessons?: string[];
}): Promise<boolean> {
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

  const validName = (data.username || "Ẩn danh").trim();
  const validWpm = Math.max(0, Math.round(Number(data.wpm) || 0));
  const validAcc = Math.max(0, Math.min(100, Number(data.accuracy) || 100));
  const validTime = Math.max(0, Math.round(Number(data.timeSpent) || 0));
  const xpGained = Math.max(10, Math.round(Number(data.earnedXp) || validWpm * 0.8));

  cachedUsers = readLocalUsers();
  const existing = cachedUsers.find(
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
    if (data.pin) existing.pin = data.pin;
    if (Array.isArray(data.unlockedLessons) && data.unlockedLessons.length > 0) {
      // Merge unique lessons
      const current = existing.unlockedLessons || ["lesson1"];
      const merged = Array.from(new Set([...current, ...data.unlockedLessons]));
      existing.unlockedLessons = merged;
    }
    existing.lastActive = new Date().toISOString();
    // Ensure no duplicate records remain in cache
    cachedUsers = cachedUsers.filter(
      (u) => u === existing || u.username.toLowerCase() !== validName.toLowerCase()
    );
  } else {
    cachedUsers.push({
      username: validName,
      pin: data.pin || "",
      avatar: data.avatar || "🐱",
      level: 1 + Math.floor(xpGained / 100),
      xp: xpGained,
      bestWpm: validWpm,
      avgAccuracy: parseFloat(validAcc.toFixed(1)),
      totalTimeSeconds: validTime,
      completedDrills: 1,
      unlockedLessons: data.unlockedLessons || ["lesson1"],
      lastActive: new Date().toISOString(),
    });
  }

  writeLocalUsers(cachedUsers);

  if (!sheetUrl) return true;

  try {
    const res = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_score",
        ...data,
        username: validName,
        wpm: validWpm,
        accuracy: validAcc,
        timeSpent: validTime,
        earnedXp: xpGained,
        unlockedLessons: JSON.stringify(data.unlockedLessons || ["lesson1"]),
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to post score to Google Sheets:", err);
    return false;
  }
}
