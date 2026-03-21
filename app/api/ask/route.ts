import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUser, saveUser, getCodex } from "@/lib/db";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const user = await getUser(session.user.email);
  if (!user) return new Response("User not found", { status: 404 });

  // Check Limits
  const today = new Date().toISOString().split('T')[0];
  const limit = user.isPro ? 30 : 1;

  if (user.lastQuestionDate === today && user.dailyCount >= limit) {
    return NextResponse.json({ error: `Limit reached. ${user.isPro ? '30' : '1'} questions max.` }, { status: 429 });
  }

  // Update Usage
  user.dailyCount = user.lastQuestionDate === today ? user.dailyCount + 1 : 1;
  user.lastQuestionDate = today;
  await saveUser(user);

  const { question } = await req.json();
  const codex = await getCodex();

  const prompt = `
    BEHAVIORAL CODEX: ${codex}
    USER BELIEF: ${user.beliefSystem}
    LANGUAGE: ${user.language}
    
    INSTRUCTION: Answer this question using the Codex first, then referencing only verified ${user.beliefSystem} texts.
    QUESTION: ${question}
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  
  return NextResponse.json({ answer: result.response.text() });
}