"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

type Case = {
  id: string;
  customer_name: string;
  issue_type: string;
  priority: string;
  status: string;
  created_at: string;
};

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
          Customer issues that need follow-up.
        </p>

        <div className="overflow-hidden rounded-xl bg-zinc-900">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 text-sm text-gray-400">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Issue</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={5}>
                    No cases yet.
                  </td>
                </tr>
              ) : (
                cases.map((customerCase) => (
                  <tr
                    key={customerCase.id}
                    className="border-b border-zinc-800 last:border-b-0"
                  >
                    <td className="p-4">{customerCase.customer_name}</td>
                    <td className="p-4 text-gray-300">
                      {customerCase.issue_type}
                    </td>
                    <td className="p-4 text-gray-300">
                      {customerCase.priority}
                    </td>
                    <td className="p-4 text-gray-300">
                      {customerCase.status}
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(customerCase.created_at).toLocaleString()}
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
