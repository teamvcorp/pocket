
"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  const askAi = async () => {
    setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (data.error) toast.error(data.error);
    else setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pocket Jesus</h1>
        {!session?.user?.isPro && (
          <button onClick={handleUpgrade} className="bg-gold-500 bg-yellow-500 text-white px-4 py-2 rounded">
            Upgrade to Pro ($10/mo)
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <textarea 
          className="w-full p-4 border rounded shadow-inner text-black"
          placeholder={`Ask a question in ${session?.user?.language ?? 'your language'}...`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button 
          onClick={askAi}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
        >
          {loading ? "Interpreting..." : "Get Spiritual Guidance"}
        </button>
      </div>

      {answer && (
        <div className="mt-8 p-6 bg-slate-50 border-l-4 border-blue-500 italic">
          {answer}
        </div>
      )}
    </div>
  );
}