
"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<{ start: () => void; stop: () => void; abort: () => void } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      update().then(() => {
        toast.success("Welcome to Pro! ðŸ™");
        router.replace("/dashboard");
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    fetch("/api/user/referral-code")
      .then((r) => r.json())
      .then(({ referralCode: code }: { referralCode: string }) => setReferralCode(code))
      .catch(() => {});
  }, []);

  const copyReferralCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error("Could not start checkout. Please try again.");
  };

  const callAsk = async (mode?: "simpler" | "detailed") => {
    if (!question.trim()) return;
    setLoading(true);
    if (!mode) setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode, previousAnswer: answer }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setAnswer(data.answer);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    type SREvent = { results: { [i: number]: { [i: number]: { transcript: string } } } };
    const recognition = new SpeechRecognitionAPI() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((e: SREvent) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
      abort: () => void;
    };
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuestion((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (status === "loading") {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "linear-gradient(180deg, #fdf8f0 0%, #fff5e8 100%)" }}
      >
        <span className="text-3xl text-olive-300 animate-pulse">✝</span>
      </div>
    );
  }

  const isPro = session?.user?.isPro;
  const beliefLabel = session?.user?.beliefSystem ?? "Spiritual";
  const langLabel = session?.user?.language ?? "English";
  const nameLabel = session?.user?.email?.split("@")[0] ?? "friend";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #fdf8f0 0%, #fff5e8 100%)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-olive-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-olive-700">✝</span>
            <span className="font-semibold text-olive-900">Pocket Jesus</span>
            {isPro && (
              <span className="ml-1 text-xs bg-gold-50 text-gold-600 border border-gold-200 px-2 py-0.5 rounded-full font-semibold">
                Pro
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <button
                onClick={handleUpgrade}
                className="text-xs bg-gold-500 hover:bg-gold-400 text-white font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm"
              >
                Upgrade to Pro
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-olive-400 hover:text-olive-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-olive-900">
            Good {getTimeOfDay()}, {nameLabel}
          </h1>
          <p className="text-olive-500 text-sm mt-1">
            {beliefLabel} guidance &middot; {langLabel}
          </p>
        </div>

        {/* Ask card */}
        <div className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden mb-5">
          <div className="bg-olive-50 border-b border-olive-100 px-5 py-4">
            <h2 className="font-semibold text-olive-800 text-sm">Ask a Question</h2>
            <p className="text-olive-400 text-xs mt-0.5">
              {isPro
                ? "Up to 30 questions per day"
                : "1 question per day · Free plan"}
            </p>
          </div>
          <div className="p-5">
            <div className="relative">
              <textarea
                className="w-full min-h-30 px-4 py-3 pr-12 rounded-xl border border-olive-200 text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent text-sm resize-none bg-cream leading-relaxed transition-shadow"
                placeholder={`What's on your heart? Ask in ${langLabel}…`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) callAsk();
                }}
              />
              {/* Mic button */}
              <button
                type="button"
                onClick={toggleVoice}
                title={listening ? "Stop listening" : "Speak your question"}
                className={`absolute right-3 top-3 p-1.5 rounded-lg transition-colors ${
                  listening
                    ? "bg-red-100 text-red-500 animate-pulse"
                    : "text-olive-300 hover:text-olive-600 hover:bg-olive-50"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 18.93V22h2v-2.07A8.001 8.001 0 0 0 20 12h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z"/>
                </svg>
              </button>
            </div>
            {listening && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Listening… speak now
              </p>
            )}
            <button
              onClick={() => callAsk()}
              disabled={loading || !question.trim()}
              className="mt-3 w-full py-3 rounded-xl bg-olive-700 hover:bg-olive-600 active:bg-olive-800 text-white font-semibold text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Seeking wisdom…" : "Seek Guidance"}
            </button>
          </div>
        </div>

        {/* Answer */}
        {(answer || loading) && (
          <div className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden mb-5">
            <div className="border-b border-sunrise-100 bg-sunrise-50 px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sunrise-500 text-sm">✦</span>
                <h2 className="font-semibold text-sunrise-800 text-sm">
                  Spiritual Guidance
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Rephrase buttons */}
                {answer && (
                  <>
                    <button
                      onClick={() => callAsk("simpler")}
                      disabled={loading}
                      className="py-1 px-2.5 rounded-md border border-olive-200 text-olive-600 text-xs font-medium hover:bg-olive-100 transition-colors disabled:opacity-40"
                    >
                      ↓ Shorter
                    </button>
                    <button
                      onClick={() => callAsk("detailed")}
                      disabled={loading}
                      className="py-1 px-2.5 rounded-md border border-sunrise-200 text-sunrise-700 text-xs font-medium hover:bg-white transition-colors disabled:opacity-40"
                    >
                      ↑ Detailed
                    </button>
                  </>
                )}
                {/* Codex indicator */}
                <span className="text-xs text-olive-400 flex items-center gap-1" title="Admin codex is active">
                  <span className="w-1.5 h-1.5 bg-olive-400 rounded-full" />
                  Codex active
                </span>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex items-center gap-3 text-olive-400">
                  <div className="w-4 h-4 border-2 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
                  <span className="text-sm italic">
                    Seeking wisdom from scripture…
                  </span>
                </div>
              ) : (
                <div className="border-l-4 border-gold-300 pl-4">
                  <p className="text-olive-800 leading-relaxed text-sm italic whitespace-pre-wrap">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pro upsell */}
        {!isPro && (
          <div className="bg-linear-to-r from-gold-50 to-sunrise-50 border border-gold-200 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gold-800 text-sm">
                Unlock Pro Guidance
              </p>
              <p className="text-gold-600 text-xs mt-0.5">
                30 questions/day · Deeper exploration · $10/month
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              className="shrink-0 bg-gold-500 hover:bg-gold-400 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              Upgrade →
            </button>
          </div>
        )}

        {/* Referral code */}
        {referralCode && (
          <div className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden">
            <div className="bg-olive-50 border-b border-olive-100 px-5 py-4">
              <h2 className="font-semibold text-olive-800 text-sm">Your Referral Code</h2>
              <p className="text-olive-400 text-xs mt-0.5">
                Share this code with friends to invite them to Pocket Jesus.
              </p>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <span className="font-mono text-2xl font-bold text-olive-700 tracking-widest">
                {referralCode}
              </span>
              <button
                onClick={copyReferralCode}
                className="shrink-0 px-4 py-2 rounded-xl border border-olive-200 text-olive-600 text-xs font-semibold hover:bg-olive-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
