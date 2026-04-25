"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        alert(userError.message);
        return;
      }

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("companies")
        .select("name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        alert(error.message);
        return;
      }

      if (data?.name) {
        setCompanyName(data.name);
      }
    };

    loadCompany();
  }, []);

  const saveCompany = async () => {
    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      alert(userError?.message ?? "You must be logged in to save settings.");
      return;
    }

    const { data, error } = await supabase
      .from("companies")
      .upsert(
        {
          name: companyName,
          user_id: user.id,
        },
        { onConflict: "user_id" }
      )
      .select("name")
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Company saved");
    setCompanyName(data.name);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Company Settings</h1>
        <p className="text-gray-400 mb-8">
          Save your company profile to Supabase.
        </p>

        <div className="space-y-6">
          <input
            className="w-full bg-zinc-900 p-4 rounded-xl"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <button
            onClick={saveCompany}
            disabled={saving || !companyName}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>
    </main>
  );
}
