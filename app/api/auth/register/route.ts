import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUser, saveUser } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password, language = "English", beliefSystem = "Christian" } =
    await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await getUser(email.toLowerCase());
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await saveUser({
    email: email.toLowerCase(),
    password: passwordHash,
    language,
    beliefSystem,
    isPro: false,
    dailyCount: 0,
  });

  return NextResponse.json({ ok: true });
}
