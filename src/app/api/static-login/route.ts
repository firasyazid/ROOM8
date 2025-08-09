import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const USERS_PATH = path.join(process.cwd(), "users.json");

type StaticUser = { username: string; password: string };

type LoginBody = { username?: string; password?: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginBody;
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const raw = await fs.readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(raw) as StaticUser[];

    const match = users.find((u) => u.username === username && u.password === password);
    if (!match) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

  // Simple static session: return a fake token and username
  const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
  const res = NextResponse.json({ token, username }, { status: 200 });
  // Set cookie for middleware to read
  res.cookies.set('admin_token', token, { path: '/', httpOnly: false, sameSite: 'strict', maxAge: 60 * 60 * 24 });
  return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
