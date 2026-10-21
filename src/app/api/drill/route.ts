import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "1.1";
    const lessonId = searchParams.get("lessonId");

    const drillsDir = path.join(process.cwd(), "src", "data", "drills");

    // Try finding by exact file match
    let targetFile = "";
    const files = fs.readdirSync(drillsDir);

    if (lessonId) {
      const match = files.find(
        (f) => f.startsWith(`${lessonId}_`) && f.endsWith(`_${id}.json`)
      ) || files.find(
        (f) => f.startsWith(`${lessonId}_${id}`)
      );
      if (match) targetFile = match;
    }

    if (!targetFile) {
      const match = files.find((f) => f.includes(`_${id}.json`)) || files[0];
      targetFile = match;
    }

    if (!targetFile) {
      return NextResponse.json({ error: "Drill not found" }, { status: 404 });
    }

    const content = fs.readFileSync(path.join(drillsDir, targetFile), "utf-8");
    const drill = JSON.parse(content);

    return NextResponse.json(drill);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
