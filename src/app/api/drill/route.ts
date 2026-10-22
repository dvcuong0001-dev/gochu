import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

// In-memory cache for all_drills.json fallback
let allDrillsCache: Record<string, any> | null = null;

function getAllDrills() {
  if (!allDrillsCache) {
    try {
      const allDrillsPath = path.join(process.cwd(), "src", "data", "all_drills.json");
      if (fs.existsSync(allDrillsPath)) {
        allDrillsCache = JSON.parse(fs.readFileSync(allDrillsPath, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading all_drills.json:", e);
    }
  }
  return allDrillsCache || {};
}

// Ensure drill has usable lines even if original was rawText only (e.g. programming lessons)
function ensureDrillLines(drill: any) {
  if (Array.isArray(drill.lines) && drill.lines.length > 0) {
    return drill;
  }

  // If lines are empty but rawText exists, synthesize lines from rawText
  if (drill.rawText && typeof drill.rawText === "string") {
    const rawLines = drill.rawText.split("\n");
    const synthesizedLines = rawLines
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => {
        // Split line into words separated by spaces, preserving spaces when rejoined
        const tokens = line.split(" ").filter((t: string) => t.length > 0);
        return {
          groups: tokens.length > 0 ? tokens : [line],
          isLoopStart: false,
        };
      });

    return {
      ...drill,
      lines: synthesizedLines.length > 0 ? synthesizedLines : [{ groups: [drill.rawText], isLoopStart: false }],
    };
  }

  return {
    ...drill,
    lines: Array.isArray(drill.lines) ? drill.lines : [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = (searchParams.get("id") || "").trim() || "1.1";
    const lessonId = (searchParams.get("lessonId") || "").trim();

    const drillsDir = path.join(process.cwd(), "src", "data", "drills");
    let drillObj: any = null;

    // 1. Direct match by ${lessonId}_${id}.json
    if (lessonId && id) {
      const exactPath = path.join(drillsDir, `${lessonId}_${id}.json`);
      if (fs.existsSync(exactPath)) {
        drillObj = JSON.parse(fs.readFileSync(exactPath, "utf-8"));
      }
    }

    // 2. Direct match by ${id}.json if filename didn't prefix lessonId
    if (!drillObj && id) {
      const directIdPath = path.join(drillsDir, `${id}.json`);
      if (fs.existsSync(directIdPath)) {
        drillObj = JSON.parse(fs.readFileSync(directIdPath, "utf-8"));
      }
    }

    // 3. Search directory for filename ending with _${id}.json
    if (!drillObj && id && fs.existsSync(drillsDir)) {
      const files = fs.readdirSync(drillsDir);
      // If lessonId is known, try files starting with lessonId
      if (lessonId) {
        const match = files.find(
          (f) => f.startsWith(`${lessonId}_`) && (f === `${lessonId}_${id}.json` || f.endsWith(`_${id}.json`))
        );
        if (match) {
          drillObj = JSON.parse(fs.readFileSync(path.join(drillsDir, match), "utf-8"));
        }
      }

      // If still not found, search by exact ending _${id}.json
      if (!drillObj) {
        const match = files.find((f) => f.endsWith(`_${id}.json`) || f === `${id}.json`);
        if (match) {
          drillObj = JSON.parse(fs.readFileSync(path.join(drillsDir, match), "utf-8"));
        }
      }
    }

    // 4. Fallback to all_drills.json lookup
    if (!drillObj) {
      const all = getAllDrills();
      if (all[id]) {
        drillObj = all[id];
      } else {
        // Try searching values in all_drills
        const found = Object.values(all).find((d: any) => d.id === id || (lessonId && d.lessonId === lessonId && d.id === id));
        if (found) {
          drillObj = found;
        }
      }
    }

    // 5. Final fallback to 1.1 if not found
    if (!drillObj) {
      const fallbackPath = path.join(drillsDir, "lesson1_1.1.json");
      if (fs.existsSync(fallbackPath)) {
        drillObj = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
      } else {
        const all = getAllDrills();
        drillObj = all["1.1"] || Object.values(all)[0];
      }
    }

    if (!drillObj) {
      return NextResponse.json({ error: "Drill not found" }, { status: 404 });
    }

    const processedDrill = ensureDrillLines(drillObj);
    return NextResponse.json(processedDrill);
  } catch (err: any) {
    console.error("Error in /api/drill:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

