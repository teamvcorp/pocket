import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCodex } from "@/lib/db";

export async function GET() {
  const text = await getCodex();
  return NextResponse.json({ text });
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await put("admin/codex.txt", text, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Codex save error:", err);
    return NextResponse.json({ error: "Failed to save codex" }, { status: 500 });
  }
}
