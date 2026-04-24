"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);

  const saveCompany = async () => {
    setSaving(true);

    const { error } = await supabase.from("companies").insert({
      name: companyName,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Company saved");
    setCompanyName("");
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