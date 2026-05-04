"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

type HenvendelsesType =
  | "Nyt lead"
  | "Flytning af tid"
  | "Aflysning"
  | "Andet";

type Henvendelse = {
  id: string;
  navn: string;
  telefonnummer: string;
  tidspunkt: string;
  type: HenvendelsesType;
  resume: string;
  transkript: string[];
};

const prikFarver: Record<HenvendelsesType, string> = {
  "Nyt lead": "bg-emerald-500",
  "Flytning af tid": "bg-yellow-400",
  Aflysning: "bg-red-500",
  Andet: "bg-zinc-500",
};

const farveforklaring: HenvendelsesType[] = [
  "Nyt lead",
  "Flytning af tid",
  "Aflysning",
  "Andet",
];

const henvendelser: Henvendelse[] = [
  {
    id: "rasmus-jensen",
    navn: "Rasmus Jensen",
    telefonnummer: "22 45 67 89",
    tidspunkt: "4. maj 2026, 10:42",
    type: "Flytning af tid",
    resume:
      "Rasmus ønsker at flytte sin tid fra den 29. juni til en dato i starten af juli.",
    transkript: [
      "AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?",
      "Rasmus: Hej, jeg vil gerne flytte min tid.",
      "AI: Hvilken dato har du tid nu?",
      "Rasmus: Den 29. juni.",
      "AI: Hvornår ønsker du i stedet?",
      "Rasmus: Gerne i starten af juli.",
    ],
  },
  {
    id: "maria-holm",
    navn: "Maria Holm",
    telefonnummer: "30 12 44 88",
    tidspunkt: "4. maj 2026, 11:08",
    type: "Nyt lead",
    resume:
      "Maria vil gerne kontaktes om et tilbud på fast vinduespudsning hver fjerde uge.",
    transkript: [
      "AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?",
      "Maria: Jeg vil gerne høre om fast vinduespudsning.",
      "AI: Hvad er dit telefonnummer?",
      "Maria: Det er 30 12 44 88.",
      "AI: Tak, vi vender tilbage med et tilbud.",
    ],
  },
  {
    id: "peter-larsen",
    navn: "Peter Larsen",
    telefonnummer: "28 91 10 33",
    tidspunkt: "4. maj 2026, 11:31",
    type: "Aflysning",
    resume:
      "Peter ønsker at aflyse sin kommende tid og beder om en bekræftelse på SMS.",
    transkript: [
      "AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?",
      "Peter: Jeg skal aflyse min tid.",
      "AI: Det hjælper jeg med. Hvad er dit telefonnummer?",
      "Peter: 28 91 10 33.",
      "AI: Tak, vi sender en bekræftelse.",
    ],
  },
  {
    id: "line-madsen",
    navn: "Line Madsen",
    telefonnummer: "24 60 18 72",
    tidspunkt: "4. maj 2026, 12:04",
    type: "Andet",
    resume:
      "Line spørger, om Axcell kan pudse indvendige glaspartier i en mindre butik.",
    transkript: [
      "AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?",
      "Line: Jeg har et spørgsmål om indvendige glaspartier.",
      "AI: Fortæl endelig lidt mere.",
      "Line: Det er til en butik, og jeg vil gerne vide, om I tilbyder det.",
    ],
  },
];

export default function HenvendelserPage() {
  const [valgtHenvendelse, setValgtHenvendelse] = useState(henvendelser[0]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-5xl">
        <h1 className="mb-4 text-4xl font-bold">Henvendelser</h1>
        <p className="mb-8 text-gray-400">
          Indgående kundehenvendelser fra Axcell.
        </p>

        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
          {farveforklaring.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${prikFarver[type]}`}
                aria-hidden="true"
              />
              <span>{type}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {henvendelser.map((henvendelse) => {
            const erValgt = henvendelse.id === valgtHenvendelse.id;

            return (
              <button
                key={henvendelse.id}
                type="button"
                onClick={() => setValgtHenvendelse(henvendelse)}
                className={`grid w-full grid-cols-[16px_minmax(150px,1fr)_130px_180px] items-center gap-3 border-b border-zinc-800 p-4 text-left transition last:border-b-0 hover:bg-zinc-800 ${
                  erValgt ? "bg-zinc-800" : ""
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    prikFarver[henvendelse.type]
                  }`}
                  aria-hidden="true"
                />
                <span className="font-medium">{henvendelse.navn}</span>
                <span className="text-gray-300">
                  {henvendelse.telefonnummer}
                </span>
                <span className="text-gray-300">{henvendelse.tidspunkt}</span>
              </button>
            );
          })}
        </div>

        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-5 text-2xl font-semibold">Detaljer</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-400">Navn</p>
              <p className="mt-1">{valgtHenvendelse.navn}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Telefonnummer</p>
              <p className="mt-1">{valgtHenvendelse.telefonnummer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Tidspunkt</p>
              <p className="mt-1">{valgtHenvendelse.tidspunkt}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Type</p>
              <p className="mt-1">{valgtHenvendelse.type}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-400">Resumé</p>
            <p className="mt-2 text-gray-200">{valgtHenvendelse.resume}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-400">Transkript</p>
            <div className="mt-2 space-y-2 text-gray-200">
              {valgtHenvendelse.transkript.map((linje) => (
                <p key={linje}>{linje}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
