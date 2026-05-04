"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

const knowledgeFields = [
  "Price per window type",
  "Subscription discount",
  "Scraping surcharge",
  "Interior cleaning pricing",
  "Service areas",
  "General rules",
] as const;

type KnowledgeField = (typeof knowledgeFields)[number];

const knowledgeLabels: Record<KnowledgeField, string> = {
  "Price per window type": "Pris pr. vinduestype",
  "Subscription discount": "Abonnementsrabat",
  "Scraping surcharge": "Tillæg for skrabning",
  "Interior cleaning pricing": "Pris for indvendig pudsning",
  "Service areas": "Serviceområder",
  "General rules": "Generelle regler",
};

const emptyEntries: Record<KnowledgeField, string> = {
  "Price per window type": "",
  "Subscription discount": "",
  "Scraping surcharge": "",
  "Interior cleaning pricing": "",
  "Service areas": "",
  "General rules": "",
};

export default function KnowledgePage() {
  const [entries, setEntries] = useState<Record<KnowledgeField, string>>(
    emptyEntries
  );
  const [savedEntries, setSavedEntries] =
    useState<Record<KnowledgeField, string>>(emptyEntries);
  const [saving, setSaving] = useState(false);

  const getUserCompany = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        company: null,
        error: userError?.message ?? "Du skal være logget ind.",
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

      const loadedEntries = (data ?? []).reduce<Record<KnowledgeField, string>>(
        (current, entry) =>
          knowledgeFields.includes(entry.question as KnowledgeField)
            ? {
                ...current,
                [entry.question]: entry.answer,
              }
            : current,
        { ...emptyEntries }
      );

      setEntries(loadedEntries);
      setSavedEntries(loadedEntries);
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
      alert("Gem virksomhedsindstillinger, før du tilføjer serviceviden.");
      return;
    }

    const rows = knowledgeFields.map((question) => ({
      company_id: company.id,
      question,
      answer: entries[question].trim(),
    }));

    if (!rows.some((entry) => entry.answer)) {
      alert("Tilføj mindst én service- eller prisregel, før du gemmer.");
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

    setSavedEntries(
      rows.reduce<Record<KnowledgeField, string>>(
        (current, row) => ({
          ...current,
          [row.question]: row.answer,
        }),
        { ...emptyEntries }
      )
    );
    alert("Serviceopsætning gemt");
  };

  const visibleSavedEntries = knowledgeFields.filter((field) =>
    savedEntries[field].trim()
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-5xl">
        <h1 className="text-4xl font-bold mb-4">Vidensbase</h1>
        <p className="text-gray-400 mb-8">
          Regler og svar, som AI-receptionisten skal bruge over for kunder.
        </p>

        <div className="space-y-6">
          {knowledgeFields.map((field) => (
            <textarea
              key={field}
              className="w-full bg-zinc-900 p-4 rounded-xl h-32"
              placeholder={knowledgeLabels[field]}
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
            {saving ? "Gemmer..." : "Gem serviceopsætning"}
          </button>
        </div>

        <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Gemt viden</h2>

          {visibleSavedEntries.length === 0 ? (
            <p className="text-gray-400">Ingen gemt viden endnu.</p>
          ) : (
            <div className="space-y-4">
              {visibleSavedEntries.map((field) => (
                <div
                  key={field}
                  className="border-b border-zinc-800 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-gray-400">
                    {knowledgeLabels[field]}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-gray-200">
                    {savedEntries[field]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
