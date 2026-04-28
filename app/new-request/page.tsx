"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

const requestTypes = [
  "New lead",
  "Price request",
  "Booking request",
  "Existing customer request",
  "Urgent job",
] as const;

const urgencyOptions = ["Normal", "High", "Urgent"] as const;

export default function NewRequestPage() {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [requestType, setRequestType] =
    useState<(typeof requestTypes)[number]>("New lead");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] =
    useState<(typeof urgencyOptions)[number]>("Normal");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const saveRequest = async () => {
    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      alert(userError?.message ?? "You must be logged in to save requests.");
      return;
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (companyError || !company) {
      setSaving(false);
      alert(companyError?.message ?? "Save company settings before requests.");
      return;
    }

    const requestDetails = [
      `Request type: ${requestType}`,
      `Urgency: ${urgency}`,
      `Phone: ${phoneNumber || "Not provided"}`,
      `Address: ${address || "Not provided"}`,
      `Message: ${message || "No message provided"}`,
    ].join("\n");

    const { error } = await supabase.from("conversations").insert({
      company_id: company.id,
      customer_name: customerName || null,
      customer_message: requestDetails,
      ai_response: "Internal intake request. No AI response yet.",
      status: "open",
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/conversations");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 max-w-4xl p-10">
        <h1 className="mb-4 text-4xl font-bold">New Request</h1>
        <p className="mb-8 text-gray-400">
          Add a window cleaning lead, price request, booking request, existing
          customer request, or urgent job manually.
        </p>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Customer name
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Customer name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Phone number
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              placeholder="+45 12 34 56 78"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Address
            </span>
            <input
              className="w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Street, city, postal code"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Request type
            </span>
            <select
              className="w-full rounded-xl bg-zinc-900 p-4"
              value={requestType}
              onChange={(event) =>
                setRequestType(event.target.value as typeof requestType)
              }
            >
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Message
            </span>
            <textarea
              className="h-32 w-full rounded-xl bg-zinc-900 p-4"
              placeholder="Describe the request"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Urgency
            </span>
            <select
              className="w-full rounded-xl bg-zinc-900 p-4"
              value={urgency}
              onChange={(event) =>
                setUrgency(event.target.value as typeof urgency)
              }
            >
              {urgencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={saveRequest}
            disabled={saving || !customerName}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save request"}
          </button>
        </div>
      </div>
    </main>
  );
}
