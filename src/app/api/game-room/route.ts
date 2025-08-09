import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Station = {
  id: number;
  running: boolean;
  startTime: number | null; // epoch ms
  playerCount?: 2 | 4 | null;
  ratePerMinute?: number | null;
};

type AppState = {
  date: string; // YYYY-MM-DD
  revenue: number;
  stations: Station[];
};

const DATA_PATH = path.join(process.cwd(), "data.json");

function todayKey(): string {
   return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function defaultState(): AppState {
  return {
    date: todayKey(),
    revenue: 0,
  stations: Array.from({ length: 7 }, (_, i) => ({ id: i + 1, running: false, startTime: null, playerCount: null, ratePerMinute: null })),
  };
}

async function writeState(state: AppState): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(state, null, 2), "utf-8");
}

async function readState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.stations) || parsed.stations.length !== 7) throw new Error("invalid");
    return parsed;
  } catch {
    const init = defaultState();
    await writeState(init);
    return init;
  }
}

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

function isStation(x: unknown): x is Station {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  const idOk = typeof s.id === "number" && Number.isFinite(s.id);
  const runningOk = typeof s.running === "boolean";
  const startOk = s.startTime === null || typeof s.startTime === "number";
  return idOk && runningOk && startOk;
}

function parseBodyAsState(x: unknown): AppState | null {
  if (!x || typeof x !== "object") return null;
  const obj = x as Record<string, unknown>;
  const date = typeof obj.date === "string" ? obj.date : todayKey();
  const revenueVal = obj.revenue;
  const revenue = typeof revenueVal === "number" && Number.isFinite(revenueVal) ? revenueVal : 0;
  const list = Array.isArray(obj.stations) ? (obj.stations as unknown[]) : [];
  const stations: Station[] = Array.from({ length: 7 }, (_, i) => {
    let found: unknown = undefined;
    for (const item of list) {
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        if (typeof rec.id === "number" && rec.id === i + 1) {
          found = item;
          break;
        }
      }
    }
    if (isStation(found)) {
      const rec = found as Record<string, unknown>;
      const pc = rec.playerCount === 2 || rec.playerCount === 4 ? (rec.playerCount as 2 | 4) : null;
      const rpm = typeof rec.ratePerMinute === "number" && Number.isFinite(rec.ratePerMinute as number)
        ? (rec.ratePerMinute as number)
        : null;
      return {
        id: i + 1,
        running: !!found.running,
        startTime: found.running && typeof rec.startTime === "number" ? (rec.startTime as number) : null,
        playerCount: pc,
        ratePerMinute: rpm,
      };
    }
    return { id: i + 1, running: false, startTime: null, playerCount: null, ratePerMinute: null };
  });
  return { date, revenue, stations };
}

export async function PUT(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = parseBodyAsState(raw);
    if (!parsed) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    await writeState(parsed);
    return NextResponse.json(parsed, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
