import { NextRequest, NextResponse } from "next/server";
import { fetchGlobalLeaderboard, updateLeaderboardUser } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = (searchParams.get("sort") as "xp" | "wpm" | "time") || "xp";

    const records = await fetchGlobalLeaderboard(sortBy);
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    console.error("GET Leaderboard Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const username = (body.username || "Ẩn danh").toString().trim().slice(0, 25);
    const wpm = Math.max(0, Math.round(Number(body.wpm) || 0));
    const accuracy = Math.max(0, Math.min(100, Number(body.accuracy) || 100));
    const timeSpent = Math.max(0, Math.round(Number(body.timeSpent) || 0));
    const earnedXp = Math.max(10, Math.round(Number(body.earnedXp) || wpm * 0.8));
    const avatar = body.avatar || "🐱";

    const saved = await updateLeaderboardUser({
      username,
      avatar,
      wpm,
      accuracy,
      timeSpent,
      earnedXp,
    });

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    console.error("POST Leaderboard Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit score" },
      { status: 500 }
    );
  }
}
