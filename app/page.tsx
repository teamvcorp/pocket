"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const BELIEF_SYSTEMS = [
  "Christian",
  "Catholic",
  "Protestant",
  "Jewish",
  "Islamic",
  "Buddhist",
  "Hindu",
  "Latter-Day Saint",
  "Nondenominational",
  "Other",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Italian",
  "Arabic",
  "Hebrew",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Swahili",
];

const FEATURES = [
  {
    icon: "✝",
    title: "Scripture-Rooted Answers",
    desc: "Every response grounded in verified religious texts and sacred scripture.",
  },
  {
    icon: "🌿",
    title: "Multiple Traditions",
    desc: "Christian, Jewish, Islamic, Buddhist, Hindu, and more — your faith, your words.",
  },
  {
    icon: "☀️",
    title: "Daily Guidance",
    desc: "Free: 1 question per day. Pro: 30 questions for deeper daily exploration.",
  },
];

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [beliefSystem, setBeliefSystem] = useState("Christian");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "authenticated" || status === "loading") {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background:
            "linear-gradient(180deg, #e0ecbe 0%, #fdf8f0 50%, #fff5e8 100%)",
        }}
      >
        <span className="text-3xl text-olive-400 animate-pulse">✝</span>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      router.replace("/dashboard");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, language, beliefSystem }),
    });
    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (signInRes?.error) {
      toast.error("Account created. Please sign in.");
      setMode("signin");
    } else {
      router.replace("/dashboard");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-olive-200 text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent text-sm bg-cream transition-shadow";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #e0ecbe 0%, #fdf8f0 40%, #fff5e8 100%)",
      }}
    >
      {/* Header */}
      <header className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-olive-700">✝</span>
          <span className="text-xl font-semibold text-olive-900 tracking-wide">
            Pocket Jesus
          </span>
        </div>
      </header>

      {/* Hero + Auth */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Hero text */}
        <div className="text-center mb-10 max-w-lg">
          <p className="text-olive-500 text-xs uppercase tracking-widest mb-3 font-semibold">
            Spiritual AI Companion
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-olive-900 mb-4 leading-tight">
            Seek Wisdom.
            <br />
            Find Peace.
          </h1>
          <p className="text-olive-700 text-base italic">
            &ldquo;Ask, and it shall be given to you; seek, and you shall
            find.&rdquo;
          </p>
          <p className="text-olive-400 text-sm mt-1">— Matthew 7:7</p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-olive-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-olive-100">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "text-olive-900 bg-olive-50 border-b-2 border-olive-600"
                  : "text-olive-400 hover:text-olive-700 hover:bg-olive-50/50"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "text-olive-900 bg-olive-50 border-b-2 border-olive-600"
                  : "text-olive-400 hover:text-olive-700 hover:bg-olive-50/50"
              }`}
            >
              Create Account
            </button>
          </div>

          <form
            onSubmit={mode === "signin" ? handleSignIn : handleRegister}
            className="p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-olive-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-olive-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-olive-600 mb-1.5 uppercase tracking-wide">
                    Belief System
                  </label>
                  <select
                    value={beliefSystem}
                    onChange={(e) => setBeliefSystem(e.target.value)}
                    className={inputClass}
                  >
                    {BELIEF_SYSTEMS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-olive-600 mb-1.5 uppercase tracking-wide">
                    Preferred Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={inputClass}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-olive-700 hover:bg-olive-600 active:bg-olive-800 text-white font-semibold text-sm transition-colors shadow-md disabled:opacity-60 mt-2"
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Begin Your Journey"}
            </button>
          </form>
        </div>

        {/* Feature pills */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl w-full px-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-olive-100 text-center"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-olive-800 text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-olive-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-olive-300 text-xs">
        &copy; {new Date().getFullYear()} Pocket Jesus &middot; Seek first the
        kingdom
      </footer>
    </div>
  );
}
