import { NextRequest, NextResponse } from "next/server";
import { fetchLeaderboard, saveLeaderboardEntry } from "@/lib/sheets";
import { LeaderboardRecord } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const drillId = searchParams.get("drillId") || undefined;
    const records = await fetchLeaderboard(drillId);
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
    const body: LeaderboardRecord = await req.json();

    if (!body.username || typeof body.wpm !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRecord: LeaderboardRecord = {
      username: body.username.trim().slice(0, 25),
      lessonId: body.lessonId || "custom",
      drillId: body.drillId || "1.1",
      wpm: Math.round(body.wpm),
      accuracy: parseFloat(body.accuracy.toFixed(1)),
      timeSpent: Math.round(body.timeSpent),
      createdAt: new Date().toISOString(),
    };

    const saved = await saveLeaderboardEntry(newRecord);
    return NextResponse.json({ success: true, saved, data: newRecord });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit score" },
      { status: 500 }
    );
  }
}
