import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUser, saveUser, getCodex } from "@/lib/db";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUser(session.user.email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Parse body early before any async writes
  const { question, mode, previousAnswer } = await req.json();

  // Check Limits — rephrases of an existing answer don't count against the daily limit
  const today = new Date().toISOString().split('T')[0];
  const limit = user.isPro ? 30 : 1;
  const isRephrase = mode === "simpler" || mode === "detailed";

  if (!isRephrase) {
    if (user.lastQuestionDate === today && user.dailyCount >= limit) {
      return NextResponse.json({ error: `Limit reached. ${user.isPro ? '30' : '1'} questions max per day.` }, { status: 429 });
    }
    user.dailyCount = user.lastQuestionDate === today ? user.dailyCount + 1 : 1;
    user.lastQuestionDate = today;
    await saveUser(user);
  }

  const codex = await getCodex();

  // System instruction: codex is non-negotiable behavior, processed before any user content
  const systemInstruction = `You are a compassionate spiritual guide for the Pocket Jesus app.

BEHAVIORAL CODEX (non-negotiable — these rules override everything else):
${codex}

THEOLOGICAL LENS: All answers must draw exclusively from verified ${user.beliefSystem} sacred texts and tradition. Never cite texts outside this tradition. Never speculate beyond what scripture supports. Always ground responses in the user's faith.

LANGUAGE: Respond in ${user.language}.`;

  let userPrompt: string;
  if (mode === "simpler") {
    userPrompt = `The user wants a shorter version of the previous answer. Rewrite it at roughly half the length. Keep the core scriptural message intact. Use plain, everyday words. Be warm and direct.

ORIGINAL QUESTION: ${question}
PREVIOUS ANSWER: ${previousAnswer}`;
  } else if (mode === "detailed") {
    userPrompt = `The user wants a deeper exploration. Expand the previous answer with additional ${user.beliefSystem} scripture references, theological context, and practical application. Stay strictly within verified ${user.beliefSystem} texts.

ORIGINAL QUESTION: ${question}
PREVIOUS ANSWER: ${previousAnswer}`;
  } else {
    userPrompt = `Answer the following question grounded entirely in verified ${user.beliefSystem} scripture. Be compassionate, clear, and cite specific texts where applicable.

QUESTION: ${question}`;
  }

  // Dynamically discover the best available model
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
  let modelName = "gemini-2.5-flash";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await res.json();
    const supported: string[] = (data.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: { name: string }) => m.name.replace("models/", ""));
    const preferred = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
    modelName = preferred.find((p) => supported.includes(p)) ?? supported[0] ?? modelName;
  } catch {
    // use fallback
  }

  const model = genAI.getGenerativeModel(
    { model: modelName, systemInstruction },
    { apiVersion: "v1beta" }
  );
  const result = await model.generateContent(userPrompt);
  
  return NextResponse.json({ answer: result.response.text() });
}