"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

type InquiryCategory = "new_lead" | "reschedule" | "cancellation" | "other";
type InquiryStatus = "new" | "in_progress" | "handled";

type Inquiry = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  category: InquiryCategory;
  subject: string;
  summary: string | null;
  transcript: string | null;
  status: InquiryStatus;
  received_at: string;
};

const kategoriLabels: Record<InquiryCategory, string> = {
  new_lead: "Nyt lead",
  reschedule: "Flytning af tid",
  cancellation: "Aflysning",
  other: "Andet",
};

const statusLabels: Record<InquiryStatus, string> = {
  new: "Ny",
  in_progress: "I gang",
  handled: "Behandlet",
};

const statusOptions: InquiryStatus[] = ["new", "in_progress", "handled"];

const prikFarver: Record<InquiryCategory, string> = {
  new_lead: "bg-emerald-500",
  reschedule: "bg-yellow-400",
  cancellation: "bg-red-500",
  other: "bg-zinc-500",
};

const farveforklaring: InquiryCategory[] = [
  "new_lead",
  "reschedule",
  "cancellation",
  "other",
];

function formatTidspunkt(value: string) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function HenvendelserPage() {
  const [henvendelser, setHenvendelser] = useState<Inquiry[]>([]);
  const [valgtHenvendelse, setValgtHenvendelse] = useState<Inquiry | null>(
    null
  );
  const [indlaeser, setIndlaeser] = useState(true);
  const [fejl, setFejl] = useState("");
  const [gemmerStatus, setGemmerStatus] = useState(false);
  const [statusBesked, setStatusBesked] = useState("");

  useEffect(() => {
    const loadHenvendelser = async () => {
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
        setFejl("Du skal være logget ind for at se henvendelser.");
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
        .select(
          "id, customer_name, customer_phone, category, subject, summary, transcript, status, received_at"
        )
        .eq("company_id", company.id)
        .order("received_at", { ascending: false });

      if (error) {
        setFejl("Kunne ikke hente henvendelser.");
        setIndlaeser(false);
        return;
      }

      const inquiries = (data ?? []) as Inquiry[];
      setHenvendelser(inquiries);
      setValgtHenvendelse(inquiries[0] ?? null);
      setIndlaeser(false);
    };

    loadHenvendelser();
  }, []);

  const updateStatus = async (status: InquiryStatus) => {
    if (!valgtHenvendelse) {
      return;
    }

    setGemmerStatus(true);
    setStatusBesked("Gemmer...");

    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", valgtHenvendelse.id);

    setGemmerStatus(false);

    if (error) {
      setStatusBesked("Kunne ikke gemme status.");
      return;
    }

    const updatedHenvendelse = {
      ...valgtHenvendelse,
      status,
    };

    setValgtHenvendelse(updatedHenvendelse);
    setHenvendelser((current) =>
      current.map((henvendelse) =>
        henvendelse.id === updatedHenvendelse.id
          ? updatedHenvendelse
          : henvendelse
      )
    );
    setStatusBesked("Status er gemt.");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-5xl">
        <h1 className="mb-4 text-4xl font-bold">Henvendelser</h1>
        <p className="mb-8 text-gray-400">
          Indgående kundehenvendelser fra Axcell.
        </p>

        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
          {farveforklaring.map((kategori) => (
            <div key={kategori} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${prikFarver[kategori]}`}
                aria-hidden="true"
              />
              <span>{kategoriLabels[kategori]}</span>
            </div>
          ))}
        </div>

        {fejl ? <p className="mb-4 text-sm text-red-400">{fejl}</p> : null}

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {indlaeser ? (
            <p className="p-4 text-gray-400">Indlæser henvendelser...</p>
          ) : henvendelser.length === 0 ? (
            <p className="p-4 text-gray-400">Ingen henvendelser endnu.</p>
          ) : (
            henvendelser.map((henvendelse) => {
              const erValgt = henvendelse.id === valgtHenvendelse?.id;

              return (
                <button
                  key={henvendelse.id}
                  type="button"
                  onClick={() => {
                    setValgtHenvendelse(henvendelse);
                    setStatusBesked("");
                  }}
                  className={`grid w-full grid-cols-[16px_minmax(150px,1fr)_130px_180px_100px] items-center gap-3 border-b border-zinc-800 p-4 text-left transition last:border-b-0 hover:bg-zinc-800 ${
                    erValgt ? "bg-zinc-800" : ""
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      prikFarver[henvendelse.category]
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-medium">
                    {henvendelse.customer_name}
                  </span>
                  <span className="text-gray-300">
                    {henvendelse.customer_phone || "Intet telefonnummer"}
                  </span>
                  <span className="text-gray-300">
                    {formatTidspunkt(henvendelse.received_at)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {statusLabels[henvendelse.status]}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {valgtHenvendelse ? (
          <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Detaljer</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-400">Navn</p>
                <p className="mt-1">{valgtHenvendelse.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Telefonnummer</p>
                <p className="mt-1">
                  {valgtHenvendelse.customer_phone || "Intet telefonnummer"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Tidspunkt</p>
                <p className="mt-1">
                  {formatTidspunkt(valgtHenvendelse.received_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="mt-1">
                  {kategoriLabels[valgtHenvendelse.category]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <select
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
                  value={valgtHenvendelse.status}
                  disabled={gemmerStatus}
                  onChange={(event) =>
                    updateStatus(event.target.value as InquiryStatus)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
                {statusBesked ? (
                  <p
                    className={`mt-2 text-sm ${
                      statusBesked === "Kunne ikke gemme status."
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {statusBesked}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Resumé</p>
              <p className="mt-2 text-gray-200">
                {valgtHenvendelse.summary || "Intet resumé endnu."}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Transkript</p>
              <p className="mt-2 whitespace-pre-line text-gray-200">
                {valgtHenvendelse.transcript || "Intet transkript endnu."}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
