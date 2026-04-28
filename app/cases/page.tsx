"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

type Case = {
  id: string;
  customer_name?: string | null;
  issue_type?: string | null;
  priority?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const caseTypes = [
  "Complaints",
  "Damage reports",
  "Manual follow-ups",
  "Urgent jobs",
] as const;

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const loadCases = async () => {
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

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (companyError) {
        alert(companyError.message);
        return;
      }

      if (!company) {
        return;
      }

      const { data, error } = await supabase
        .from("cases")
        .select("id, customer_name, issue_type, priority, status, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setCases(data);
    };

    loadCases();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Cases</h1>
        <p className="text-gray-400 mb-8">
          Complaints, damage reports, manual follow-ups, and urgent window
          cleaning jobs that need attention.
        </p>

        <div className="mb-6 grid grid-cols-4 gap-4">
          {caseTypes.map((caseType) => (
            <div key={caseType} className="rounded-xl bg-zinc-900 p-4">
              <h2 className="text-sm font-medium text-gray-400">
                {caseType}
              </h2>
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl bg-zinc-900">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 text-sm text-gray-400">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Case type</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={5}>
                    No complaint, damage, follow-up, or urgent job cases yet.
                  </td>
                </tr>
              ) : (
                cases.map((customerCase) => (
                  <tr
                    key={customerCase.id}
                    className="border-b border-zinc-800 last:border-b-0"
                  >
                    <td className="p-4">
                      {customerCase.customer_name || "Unknown customer"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {customerCase.issue_type || "Manual follow-up"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {customerCase.priority || "No priority saved"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {customerCase.status || "No status saved"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {customerCase.created_at
                        ? new Date(customerCase.created_at).toLocaleString()
                        : "No date saved"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
