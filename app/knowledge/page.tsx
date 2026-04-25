"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

const knowledgeFields = [
  "Shipping policy",
  "Return policy",
  "Refund policy",
  "Product FAQ",
  "General FAQ",
] as const;

type KnowledgeField = (typeof knowledgeFields)[number];

const emptyEntries: Record<KnowledgeField, string> = {
  "Shipping policy": "",
  "Return policy": "",
  "Refund policy": "",
  "Product FAQ": "",
  "General FAQ": "",
};

export default function KnowledgePage() {
  const [entries, setEntries] = useState<Record<KnowledgeField, string>>(
    emptyEntries
  );
  const [saving, setSaving] = useState(false);

  const getUserCompany = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        company: null,
        error: userError?.message ?? "You must be logged in.",
      };
    }

    const { data: company, error } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return { company: null, error: error.message };
    }

    return { company, error: null };
  };

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      const { company, error: companyError } = await getUserCompany();

      if (companyError) {
        alert(companyError);
        return;
      }

      if (!company) {
        return;
      }

      const { data, error } = await supabase
        .from("knowledge_base")
        .select("question, answer")
        .eq("company_id", company.id);

      if (error) {
        alert(error.message);
        return;
      }

      setEntries(
        data.reduce<Record<KnowledgeField, string>>(
          (current, entry) =>
            knowledgeFields.includes(entry.question as KnowledgeField)
              ? {
                  ...current,
                  [entry.question]: entry.answer,
                }
              : current,
          emptyEntries
        )
      );
    };

    loadKnowledgeBase();
  }, []);

  const saveKnowledgeBase = async () => {
    const { company, error: companyError } = await getUserCompany();

    if (companyError) {
      alert(companyError);
      return;
    }

    if (!company) {
      alert("Save your company settings before adding knowledge base entries.");
      return;
    }

    const rows = knowledgeFields
      .map((question) => ({
        company_id: company.id,
        question,
        answer: entries[question].trim(),
      }))
      .filter((entry) => entry.answer);

    if (rows.length === 0) {
      alert("Add at least one FAQ entry before saving.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("knowledge_base")
      .upsert(rows, { onConflict: "company_id,question" });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Knowledge base saved");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-5xl">
        <h1 className="text-4xl font-bold mb-4">Knowledge Base</h1>
        <p className="text-gray-400 mb-8">
          Information the AI should use when answering customers.
        </p>

        <div className="space-y-6">
          {knowledgeFields.map((field) => (
            <textarea
              key={field}
              className="w-full bg-zinc-900 p-4 rounded-xl h-32"
              placeholder={field}
              value={entries[field]}
              onChange={(e) =>
                setEntries((current) => ({
                  ...current,
                  [field]: e.target.value,
                }))
              }
            />
          ))}

          <button
            onClick={saveKnowledgeBase}
            disabled={saving}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save knowledge base"}
          </button>
        </div>
      </div>
    </main>
  );
}
