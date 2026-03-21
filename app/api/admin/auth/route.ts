import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { passcode } = await req.json();
  const correct = process.env.ADMIN_PASSCODE;

  if (!correct) {
    return NextResponse.json({ error: "Admin access not configured" }, { status: 500 });
  }

  if (passcode !== correct) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
