"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const sessionTimeout = new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error("Sessionstjekket tog for lang tid.")),
        3000
      );
    });

    Promise.race([supabase.auth.getSession(), sessionTimeout])
      .then(({ data }) => {
        if (!active) {
          return;
        }

        if (data.session) {
          router.replace("/");
          return;
        }

        setCheckingSession(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSessionError("Kunne ikke tjekke sessionen. Prøv at logge ind.");
        setCheckingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({
      email,
    });

    alert("Tjek din email for login-link");
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-xl w-96">
        <h1 className="text-2xl font-bold mb-6">Axcell login</h1>

        {checkingSession ? (
          <p className="text-gray-400">Tjekker session...</p>
        ) : (
          <>
            {sessionError ? (
              <p className="mb-4 text-sm text-red-400">{sessionError}</p>
            ) : null}

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
              Log ind
            </button>
          </>
        )}
      </div>
    </main>
  );
}
