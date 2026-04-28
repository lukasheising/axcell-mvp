"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../../lib/supabase";

type Conversation = {
  id: string;
  customer_name?: string | null;
  customer_message?: string | null;
  ai_response?: string | null;
  transcript?: string | null;
  status: string | null;
  created_at: string;
};

type IntakeDetails = Partial<
  Record<"Request type" | "Urgency" | "Phone" | "Address" | "Message", string>
>;

const requestTypes = [
  "New lead",
  "Price request",
  "Booking request",
  "Existing customer request",
  "Urgent job",
] as const;

function getRequestType(conversation: Conversation) {
  const text = [
    conversation.customer_message,
    conversation.transcript,
    conversation.ai_response,
    conversation.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    text.includes("urgent") ||
    text.includes("emergency") ||
    text.includes("asap")
  ) {
    return "Urgent job";
  }

  if (
    text.includes("book") ||
    text.includes("schedule") ||
    text.includes("appointment")
  ) {
    return "Booking request";
  }

  if (
    text.includes("price") ||
    text.includes("quote") ||
    text.includes("estimate") ||
    text.includes("cost")
  ) {
    return "Price request";
  }

  if (
    text.includes("existing customer") ||
    text.includes("again") ||
    text.includes("subscription")
  ) {
    return "Existing customer request";
  }

  return "New lead";
}

function parseIntakeDetails(message?: string | null) {
  if (!message) {
    return null;
  }

  const details = message
    .split("\n")
    .reduce<IntakeDetails>((current, line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return current;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (
        key === "Request type" ||
        key === "Urgency" ||
        key === "Phone" ||
        key === "Address" ||
        key === "Message"
      ) {
        return {
          ...current,
          [key]: value,
        };
      }

      return current;
    }, {});

  return details["Request type"] ||
    details.Urgency ||
    details.Phone ||
    details.Address ||
    details.Message
    ? details
    : null;
}

function RequestDetails({
  conversation,
}: {
  conversation: Conversation;
}) {
  const intakeDetails = parseIntakeDetails(conversation.customer_message);

  if (!intakeDetails) {
    return (
      <>
        {conversation.customer_message ||
          conversation.transcript ||
          "No request message saved."}
      </>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      {(
        [
          ["Phone", intakeDetails.Phone],
          ["Address", intakeDetails.Address],
          ["Urgency", intakeDetails.Urgency],
          ["Message", intakeDetails.Message],
        ] as const
      ).map(([label, value]) => (
        <div key={label}>
          <span className="text-gray-500">{label}: </span>
          <span>{value || "Not provided"}</span>
        </div>
      ))}
    </div>
  );
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
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
        .from("conversations")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setConversations(data);
    };

    loadConversations();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Conversations</h1>
        <p className="text-gray-400 mb-8">
          Window cleaning leads, price requests, booking requests, existing
          customer requests, and urgent jobs handled by Axcell.
        </p>

        <div className="mb-6 grid grid-cols-5 gap-4">
          {requestTypes.map((requestType) => (
            <div key={requestType} className="rounded-xl bg-zinc-900 p-4">
              <h2 className="text-sm font-medium text-gray-400">
                {requestType}
              </h2>
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl bg-zinc-900">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 text-sm text-gray-400">
              <tr>
                <th className="p-4 font-medium">Request type</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Message / request</th>
                <th className="p-4 font-medium">AI response / notes</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={6}>
                    No window cleaning requests yet.
                  </td>
                </tr>
              ) : (
                conversations.map((conversation) => (
                  <tr
                    key={conversation.id}
                    className="border-b border-zinc-800 last:border-b-0"
                  >
                    <td className="p-4 text-gray-300">
                      {parseIntakeDetails(conversation.customer_message)?.[
                        "Request type"
                      ] || getRequestType(conversation)}
                    </td>
                    <td className="p-4">
                      {conversation.customer_name || "Unknown customer"}
                    </td>
                    <td className="p-4 text-gray-300">
                      <RequestDetails conversation={conversation} />
                    </td>
                    <td className="p-4 text-gray-300">
                      {conversation.ai_response || "No AI response saved."}
                    </td>
                    <td className="p-4 text-gray-300">
                      {conversation.status || "No status saved"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {conversation.created_at
                        ? new Date(conversation.created_at).toLocaleString()
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
