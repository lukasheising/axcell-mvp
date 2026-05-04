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
  const [gemmerStatusId, setGemmerStatusId] = useState<string | null>(null);
  const [statusBesked, setStatusBesked] = useState<{
    id: string;
    tekst: string;
    erFejl?: boolean;
  } | null>(null);

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

  const updateStatus = async (henvendelse: Inquiry, status: string) => {
    if (!statusOptions.includes(status as InquiryStatus)) {
      return;
    }

    const nextStatus = status as InquiryStatus;

    if (henvendelse.status === nextStatus) {
      return;
    }

    const tidligereStatus = henvendelse.status;
    const updatedHenvendelse = {
      ...henvendelse,
      status: nextStatus,
    };

    setGemmerStatusId(henvendelse.id);
    setStatusBesked({ id: henvendelse.id, tekst: "Gemmer..." });
    setHenvendelser((current) =>
      current.map((currentHenvendelse) =>
        currentHenvendelse.id === henvendelse.id
          ? updatedHenvendelse
          : currentHenvendelse
      )
    );
    setValgtHenvendelse((current) =>
      current?.id === henvendelse.id ? updatedHenvendelse : current
    );

    const { error } = await supabase
      .from("inquiries")
      .update({ status: nextStatus })
      .eq("id", henvendelse.id);

    setGemmerStatusId(null);

    if (error) {
      console.error(error);

      const previousHenvendelse = {
        ...henvendelse,
        status: tidligereStatus,
      };

      setHenvendelser((current) =>
        current.map((currentHenvendelse) =>
          currentHenvendelse.id === henvendelse.id
            ? previousHenvendelse
            : currentHenvendelse
        )
      );
      setValgtHenvendelse((current) =>
        current?.id === henvendelse.id ? previousHenvendelse : current
      );
      setStatusBesked({
        id: henvendelse.id,
        tekst: "Kunne ikke gemme status.",
        erFejl: true,
      });
      return;
    }

    setStatusBesked({ id: henvendelse.id, tekst: "Status er gemt." });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 max-w-7xl p-10">
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {indlaeser ? (
              <p className="p-4 text-gray-400">Indlæser henvendelser...</p>
            ) : henvendelser.length === 0 ? (
              <p className="p-4 text-gray-400">Ingen henvendelser endnu.</p>
            ) : (
              henvendelser.map((henvendelse) => {
                const erValgt = henvendelse.id === valgtHenvendelse?.id;

                return (
                  <div
                    key={henvendelse.id}
                    onClick={() => {
                      setValgtHenvendelse(henvendelse);
                      setStatusBesked(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setValgtHenvendelse(henvendelse);
                        setStatusBesked(null);
                      }
                    }}
                    role="button"
                    tabIndex={0}
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
                    <span>
                      <select
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                        value={henvendelse.status}
                        disabled={gemmerStatusId === henvendelse.id}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateStatus(henvendelse, event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                      {statusBesked?.id === henvendelse.id ? (
                        <span
                          className={`mt-1 block text-xs ${
                            statusBesked.erFejl
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {statusBesked.tekst}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {valgtHenvendelse ? (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 xl:sticky xl:top-6 xl:self-start">
              <h2 className="mb-5 text-2xl font-semibold">Detaljer</h2>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
                  <p className="mt-1">{statusLabels[valgtHenvendelse.status]}</p>
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
      </div>
    </main>
  );
}
