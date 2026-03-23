"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const SESSION_KEY = "admin_authed";

interface ProUser {
  email: string;
  proSince?: string;
}

interface ProGroup {
  referralCode: string;
  referrerEmail: string | null;
  referrerName: string;
  proUsers: ProUser[];
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [checking, setChecking] = useState(false);

  // Persist auth for the browser session
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  const handlePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAuthed(true);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Incorrect passcode");
        setPasscode("");
      }
    } catch {
      toast.error("Could not verify passcode");
    } finally {
      setChecking(false);
    }
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #fdf8f0 0%, #fff5e8 100%)" }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl text-olive-600">✝</span>
            <h1 className="mt-3 text-2xl font-bold text-olive-900">Admin Access</h1>
            <p className="text-olive-400 text-sm mt-1">Enter the admin passcode to continue</p>
          </div>
          <form onSubmit={handlePasscode} className="bg-white rounded-2xl border border-olive-100 shadow-sm p-6 flex flex-col gap-4">
            <input
              type="password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-olive-200 text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-500 text-sm bg-cream"
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            <button
              type="submit"
              disabled={checking || !passcode}
              className="w-full py-3 rounded-xl bg-olive-700 hover:bg-olive-600 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? "Verifying…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminConsole />;
}

function AdminConsole() {
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newRule, setNewRule] = useState("");
  const editRef = useRef<HTMLTextAreaElement>(null);

  const [proGroups, setProGroups] = useState<ProGroup[]>([]);
  const [proLoading, setProLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/codex")
      .then((r) => r.json())
      .then(({ text }: { text: string }) => {
        const parsed = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        setRules(parsed.length ? parsed : []);
      })
      .catch(() => toast.error("Failed to load codex"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(({ groups }: { groups: ProGroup[] }) => setProGroups(groups))
      .catch(() => toast.error("Failed to load pro accounts"))
      .finally(() => setProLoading(false));
  }, []);

  useEffect(() => {
    if (editingIndex !== null) editRef.current?.focus();
  }, [editingIndex]);

  const saveToBlob = async (updatedRules: string[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/codex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: updatedRules.join("\n") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      toast.success("Codex saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save codex");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditValue(rules[i]);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      deleteRule(editingIndex);
    } else {
      const updated = rules.map((r, i) => (i === editingIndex ? trimmed : r));
      setRules(updated);
      saveToBlob(updated);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const deleteRule = (i: number) => {
    const updated = rules.filter((_, idx) => idx !== i);
    setRules(updated);
    saveToBlob(updated);
    if (editingIndex === i) { setEditingIndex(null); setEditValue(""); }
  };

  const addRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    const updated = [...rules, trimmed];
    setRules(updated);
    setNewRule("");
    saveToBlob(updated);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #fdf8f0 0%, #fff5e8 100%)" }}
    >
      {/* Header */}
      <header className="border-b border-olive-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-olive-700">✝</span>
          <span className="font-semibold text-olive-900">Pocket Jesus</span>
          <span className="text-olive-300">/</span>
          <span className="text-sm text-olive-500 font-medium">Admin Console</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-olive-900">Behavioral Codex</h1>
          <p className="text-olive-500 text-sm mt-1">
            Each rule below is applied globally to every AI response. Click a rule to edit it.
          </p>
        </div>

        {/* Rules list */}
        <div className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden mb-5">
          <div className="bg-olive-50 border-b border-olive-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-olive-800 text-sm">Active Rules</h2>
              <p className="text-olive-400 text-xs mt-0.5">
                Stored in Vercel Blob &middot; Applied globally to all AI responses
              </p>
            </div>
            <span className="text-xs text-olive-400 bg-olive-100 px-2 py-1 rounded-full">
              {rules.length} rule{rules.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-olive-50">
            {loading ? (
              <div className="px-5 py-8 flex items-center gap-3 text-olive-400">
                <div className="w-4 h-4 border-2 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
                <span className="text-sm">Loading codex from Blob…</span>
              </div>
            ) : rules.length === 0 ? (
              <div className="px-5 py-8 text-center text-olive-400 text-sm">
                No rules yet. Add one below.
              </div>
            ) : (
              rules.map((rule, i) => (
                <div key={i} className="px-5 py-4 group">
                  {editingIndex === i ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        ref={editRef}
                        className="w-full px-3 py-2 rounded-lg border border-olive-300 text-olive-900 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500 resize-y bg-cream font-mono leading-relaxed"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={Math.max(2, editValue.split("\n").length)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") cancelEdit();
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitEdit();
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={commitEdit}
                          disabled={saving}
                          className="px-3 py-1.5 bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 border border-olive-200 text-olive-600 text-xs font-medium rounded-lg hover:bg-olive-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteRule(i)}
                          className="ml-auto px-3 py-1.5 border border-red-200 text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete rule
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-xs text-olive-300 font-mono w-5 shrink-0 text-right">{i + 1}</span>
                      <p
                        className="flex-1 text-sm text-olive-800 leading-relaxed cursor-pointer hover:text-olive-600 transition-colors"
                        onClick={() => startEdit(i)}
                      >
                        {rule}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(i)}
                          className="p-1.5 rounded-lg text-olive-400 hover:text-olive-700 hover:bg-olive-50 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteRule(i)}
                          className="p-1.5 rounded-lg text-olive-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add new rule */}
        <div className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden">
          <div className="bg-olive-50 border-b border-olive-100 px-5 py-4">
            <h2 className="font-semibold text-olive-800 text-sm">Add New Rule</h2>
          </div>
          <div className="p-5">
            <textarea
              className="w-full min-h-20 px-4 py-3 rounded-xl border border-olive-200 text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent text-sm resize-y bg-cream leading-relaxed transition-shadow"
              placeholder="Always cite chapter and verse. Never speculate beyond scripture…"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addRule();
              }}
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-olive-400 text-xs">⌘ Enter to add</p>
              <button
                onClick={addRule}
                disabled={saving || !newRule.trim()}
                className="px-5 py-2.5 bg-olive-700 hover:bg-olive-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Add Rule"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-sunrise-50 border border-sunrise-100 rounded-2xl p-4 text-sm text-sunrise-700">
          <strong className="text-sunrise-800">Note:</strong> Changes take effect
          immediately on all new AI requests.
        </div>

        {/* Pro Accounts by Referral */}
        <div className="mt-10 mb-2">
          <h1 className="text-2xl font-bold text-olive-900">Pro Accounts</h1>
          <p className="text-olive-500 text-sm mt-1">
            Paid subscribers organized by the referral code used at sign-up.
          </p>
        </div>

        <div className="space-y-4">
          {proLoading ? (
            <div className="bg-white rounded-2xl border border-olive-100 shadow-sm px-5 py-8 flex items-center gap-3 text-olive-400">
              <div className="w-4 h-4 border-2 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
              <span className="text-sm">Loading pro accounts…</span>
            </div>
          ) : proGroups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-olive-100 shadow-sm px-5 py-8 text-center text-olive-400 text-sm">
              No pro accounts yet.
            </div>
          ) : (
            proGroups.map((group) => (
              <div
                key={group.referralCode}
                className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden"
              >
                <div className="bg-olive-50 border-b border-olive-100 px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-olive-800 text-sm">
                        {group.referrerName}
                      </span>
                      <span className="font-mono text-xs text-olive-400 bg-olive-100 px-2 py-0.5 rounded-full">
                        {group.referralCode}
                      </span>
                    </div>
                    {group.referrerEmail && (
                      <p className="text-olive-400 text-xs mt-0.5">
                        {group.referrerEmail}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-olive-400 bg-olive-100 px-2 py-1 rounded-full shrink-0">
                    {group.proUsers.length} pro user{group.proUsers.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {group.proUsers.length === 0 ? (
                  <div className="px-5 py-4 text-olive-400 text-sm italic">
                    No pro users under this code yet.
                  </div>
                ) : (
                  <div className="divide-y divide-olive-50">
                    {group.proUsers.map((u) => (
                      <div key={u.email} className="px-5 py-3 flex items-center justify-between">
                        <span className="text-sm text-olive-800">{u.email}</span>
                        {u.proSince && (
                          <span className="text-xs text-olive-400">
                            Pro since{" "}
                            {new Date(u.proSince).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}