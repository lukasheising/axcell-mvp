"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({
      email,
    });

    alert("Check din email for login link");
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-xl w-96">
        <h1 className="text-2xl font-bold mb-6">Axcell Login</h1>

        <input
          type="email"
          placeholder="Din email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-zinc-800 mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-white text-black p-3 rounded"
        >
          Login
        </button>
      </div>
    </main>
  );
}