"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { supabase } from "../lib/supabase";

type Inquiry = {
  category: "new_lead" | "reschedule" | "cancellation" | "other";
  status: "new" | "in_progress" | "handled";
  received_at: string;
};

type DashboardStats = {
  inquiriesToday: number;
  newInquiries: number;
  newLeads: number;
  reschedules: number;
  cancellations: number;
};

const emptyStats: DashboardStats = {
  inquiriesToday: 0,
  newInquiries: 0,
  newLeads: 0,
  reschedules: 0,
  cancellations: 0,
};

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getStats(inquiries: Inquiry[]) {
  return inquiries.reduce<DashboardStats>(
    (current, inquiry) => ({
      inquiriesToday:
        current.inquiriesToday + (isToday(inquiry.received_at) ? 1 : 0),
      newInquiries: current.newInquiries + (inquiry.status === "new" ? 1 : 0),
      newLeads: current.newLeads + (inquiry.category === "new_lead" ? 1 : 0),
      reschedules:
        current.reschedules + (inquiry.category === "reschedule" ? 1 : 0),
      cancellations:
        current.cancellations + (inquiry.category === "cancellation" ? 1 : 0),
    }),
    emptyStats
  );
}

const statCards = [
  { label: "Henvendelser i dag", value: "inquiriesToday" },
  { label: "Nye henvendelser", value: "newInquiries" },
  { label: "Nye leads", value: "newLeads" },
  { label: "Flytning af tid", value: "reschedules" },
  { label: "Aflysninger", value: "cancellations" },
] as const;

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [indlaeser, setIndlaeser] = useState(true);
  const [fejl, setFejl] = useState("");

  useEffect(() => {
    const loadDashboardStats = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setFejl("Kunne ikke hente bruger.");
        setIndlaeser(false);
        return;
      }

      if (!user) {
        setFejl("Du skal være logget ind for at se dashboardet.");
        setIndlaeser(false);
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (companyError) {
        setFejl("Kunne ikke hente virksomheden.");
        setIndlaeser(false);
        return;
      }

      if (!company) {
        setIndlaeser(false);
        return;
      }

      const { data, error } = await supabase
        .from("inquiries")
        .select("category, status, received_at")
        .eq("company_id", company.id);

      if (error) {
        setFejl("Kunne ikke hente henvendelser.");
        setIndlaeser(false);
        return;
      }

      setStats(getStats((data ?? []) as Inquiry[]));
      setIndlaeser(false);
    };

    loadDashboardStats();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
        <p className="text-xl text-gray-300 mb-10">
          Overblik over indgående kundehenvendelser.
        </p>

        {fejl ? <p className="mb-6 text-sm text-red-400">{fejl}</p> : null}

        {indlaeser ? (
          <p className="text-gray-400">Indlæser dashboard...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map((card) => (
              <div
                key={card.value}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <h2 className="mb-3 text-sm font-medium text-gray-400">
                  {card.label}
                </h2>
                <p className="text-3xl font-semibold">{stats[card.value]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
