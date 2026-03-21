"use client";
import { put } from "@vercel/blob";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Admin() {
  const [text, setText] = useState("");

  const updateCodex = async () => {
    await put('admin/codex.txt', text, { access: 'public', addRandomSuffix: false });
    toast.success("Codex Updated");
  };

  return (
    <div className="p-10">
      <h2 className="text-xl font-bold">Admin: Behavioral Codex</h2>
      <textarea 
        className="w-full h-40 border p-2 mt-4 text-black"
        onChange={(e) => setText(e.target.value)}
        placeholder="Program the AI's core behavior here..."
      />
      <button onClick={updateCodex} className="bg-black text-white p-2 mt-2">Save Codex</button>
    </div>
  );
}