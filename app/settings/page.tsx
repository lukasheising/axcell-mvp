"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

const profileFields = [
  {
    key: "Company phone number",
    legacyKey: "",
    label: "Telefonnummer",
    placeholder: "+45 12 34 56 78",
    type: "input",
  },
  {
    key: "Company service areas",
    legacyKey: "Service areas",
    label: "Serviceområder",
    placeholder: "København, Frederiksberg, Gentofte",
    type: "textarea",
  },
  {
    key: "Company opening hours",
    legacyKey: "Opening hours",
    label: "Åbningstider",
    placeholder: "Mandag-fredag 08:00-17:00, lørdag 09:00-14:00",
    type: "textarea",
  },
  {
    key: "Emergency jobs accepted",
    legacyKey: "Emergency jobs",
    label: "Akutte opgaver",
    placeholder: "",
    type: "select",
  },
  {
    key: "General company info",
    legacyKey: "",
    label: "Generel virksomhedsinfo",
    placeholder:
      "Hvad skal AI-receptionisten vide om din vinduespudser-virksomhed?",
    type: "textarea",
  },
] as const;

type ProfileField = (typeof profileFields)[number]["key"];

const emptyProfile: Record<ProfileField, string> = {
  "Company phone number": "",
  "Company service areas": "",
  "Company opening hours": "",
  "Emergency jobs accepted": "No",
  "General company info": "",
};

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [profile, setProfile] =
    useState<Record<ProfileField, string>>(emptyProfile);
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
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        alert(error.message);
        return;
      }

      if (data?.name) {
        setCompanyName(data.name);
      }

      if (!data?.id) {
        return;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("knowledge_base")
        .select("question, answer")
        .eq("company_id", data.id);

      if (profileError) {
        alert(profileError.message);
        return;
      }

      setProfile(
        (profileRows ?? []).reduce<Record<ProfileField, string>>(
          (current, entry) => {
            const matchingField = profileFields.find(
              (field) =>
                field.key === entry.question ||
                field.legacyKey === entry.question
            );

            return matchingField
              ? {
                  ...current,
                  [matchingField.key]: entry.answer,
                }
              : current;
          },
          { ...emptyProfile }
        )
      );
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
      alert(userError?.message ?? "Du skal være logget ind for at gemme.");
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
      .select("id, name")
      .single();

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    const profileRows = profileFields.map((field) => ({
      company_id: data.id,
      question: field.key,
      answer: profile[field.key].trim(),
    }));

    const { error: profileError } = await supabase
      .from("knowledge_base")
      .upsert(profileRows, { onConflict: "company_id,question" });

    setSaving(false);

    if (profileError) {
      alert(profileError.message);
      return;
    }

    alert("Virksomhedsindstillinger gemt");
    setCompanyName(data.name);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Virksomhedsindstillinger</h1>
        <p className="text-gray-400 mb-8">
          Fortæl AI-receptionisten, hvordan din vinduespudser-virksomhed
          arbejder.
        </p>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Virksomhedsnavn
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Virksomhedsnavn"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>

          {profileFields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                {field.label}
              </span>

              {field.type === "select" ? (
                <select
                  className="w-full rounded-xl bg-zinc-900 p-4"
                  value={profile[field.key]}
                  onChange={(e) =>
                    setProfile((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                >
                  <option value="No">Ingen akutte opgaver</option>
                  <option value="Yes">Accepter akutte opgaver</option>
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="h-32 w-full rounded-xl bg-zinc-900 p-4"
                  placeholder={field.placeholder}
                  value={profile[field.key]}
                  onChange={(e) =>
                    setProfile((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              ) : (
                <input
                  className="w-full rounded-xl bg-zinc-900 p-4"
                  placeholder={field.placeholder}
                  value={profile[field.key]}
                  onChange={(e) =>
                    setProfile((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              )}
            </label>
          ))}

          <button
            onClick={saveCompany}
            disabled={saving || !companyName}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? "Gemmer..." : "Gem indstillinger"}
          </button>
        </div>
      </div>
    </main>
  );
}
