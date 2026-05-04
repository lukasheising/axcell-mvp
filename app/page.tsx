"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { supabase } from "../lib/supabase";

type Inquiry = {
  id: string;
  customer_name: string;
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
  { label: "Nye / ubehandlede", value: "newInquiries" },
  { label: "Nye leads", value: "newLeads" },
  { label: "Flytninger", value: "reschedules" },
  { label: "Aflysninger", value: "cancellations" },
] as const;

const kategoriLabels: Record<Inquiry["category"], string> = {
  new_lead: "Nyt lead",
  reschedule: "Flytning",
  cancellation: "Aflysning",
  other: "Andet",
};

const statusLabels: Record<Inquiry["status"], string> = {
  new: "Ny",
  in_progress: "I gang",
  handled: "Behandlet",
};

function formatTidspunkt(value: string) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [senesteHenvendelser, setSenesteHenvendelser] = useState<Inquiry[]>(
    []
  );
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
        .select("id, customer_name, category, status, received_at")
        .eq("company_id", company.id)
        .order("received_at", { ascending: false });

      if (error) {
        setFejl("Kunne ikke hente henvendelser.");
        setIndlaeser(false);
        return;
      }

      const inquiries = (data ?? []) as Inquiry[];
      setStats(getStats(inquiries));
      setSenesteHenvendelser(inquiries.slice(0, 5));
      setIndlaeser(false);
    };

    loadDashboardStats();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-5xl font-bold mb-4">Overblik</h1>
        <p className="text-xl text-gray-300 mb-10">
          Overblik over indgående kundehenvendelser.
        </p>

        {fejl ? <p className="mb-6 text-sm text-red-400">{fejl}</p> : null}

        {indlaeser ? (
          <p className="text-gray-400">Indlæser overblik...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              {statCards.map((card) => (
                <div
                  key={card.value}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <h2 className="mb-3 text-sm font-medium text-gray-400">
                    {card.label}
                  </h2>
                  <p className="text-3xl font-semibold">
                    {stats[card.value]}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 p-5">
                <h2 className="text-xl font-semibold">Seneste henvendelser</h2>
              </div>

              {senesteHenvendelser.length === 0 ? (
                <p className="p-5 text-gray-400">Ingen henvendelser endnu.</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {senesteHenvendelser.map((henvendelse) => (
                    <div
                      key={henvendelse.id}
                      className="grid gap-2 p-5 md:grid-cols-[minmax(160px,1fr)_140px_120px_190px] md:items-center"
                    >
                      <p className="font-medium">
                        {henvendelse.customer_name}
                      </p>
                      <p className="text-gray-300">
                        {kategoriLabels[henvendelse.category]}
                      </p>
                      <p className="text-gray-300">
                        {statusLabels[henvendelse.status]}
                      </p>
                      <p className="text-gray-400">
                        {formatTidspunkt(henvendelse.received_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
