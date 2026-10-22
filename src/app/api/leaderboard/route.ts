import { NextRequest, NextResponse } from "next/server";
import { fetchGlobalLeaderboard, updateLeaderboardUser } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = (searchParams.get("sort") as "xp" | "wpm" | "time") || "xp";

    const records = await fetchGlobalLeaderboard(sortBy);
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.username || typeof body.wpm !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const saved = await updateLeaderboardUser({
      username: body.username.trim().slice(0, 25),
      avatar: body.avatar,
      wpm: Math.round(body.wpm),
      accuracy: parseFloat(Number(body.accuracy || 100).toFixed(1)),
      timeSpent: Math.round(body.timeSpent || 0),
      earnedXp: body.earnedXp,
    });

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit score" },
      { status: 500 }
    );
  }
}
