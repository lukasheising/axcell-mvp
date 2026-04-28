"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { supabase } from "../lib/supabase";

type Conversation = {
  customer_message?: string | null;
  ai_response?: string | null;
  transcript?: string | null;
  status?: string | null;
};

type DashboardStats = {
  newLeads: number;
  priceRequests: number;
  bookingRequests: number;
  urgentRequests: number;
};

const emptyStats: DashboardStats = {
  newLeads: 0,
  priceRequests: 0,
  bookingRequests: 0,
  urgentRequests: 0,
};

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

  return "New lead";
}

function getStats(conversations: Conversation[]) {
  return conversations.reduce<DashboardStats>((current, conversation) => {
    const requestType = getRequestType(conversation);
    const isUrgent =
      conversation.customer_message?.toLowerCase().includes("urgency: urgent") ??
      false;

    return {
      newLeads: current.newLeads + (requestType === "New lead" ? 1 : 0),
      priceRequests:
        current.priceRequests + (requestType === "Price request" ? 1 : 0),
      bookingRequests:
        current.bookingRequests + (requestType === "Booking request" ? 1 : 0),
      urgentRequests: current.urgentRequests + (isUrgent ? 1 : 0),
    };
  }, emptyStats);
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);

  useEffect(() => {
    const loadDashboardStats = async () => {
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
        .select("customer_message, ai_response, transcript, status")
        .eq("company_id", company.id);

      if (error) {
        alert(error.message);
        return;
      }

      setStats(getStats(data));
    };

    loadDashboardStats();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="ml-64 p-10">
        <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
        <p className="text-xl text-gray-300 mb-10">
          AI receptionist overview for window cleaning companies
        </p>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">New Leads</h2>
            <p>{stats.newLeads}</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Price Requests</h2>
            <p>{stats.priceRequests}</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Booking Requests</h2>
            <p>{stats.bookingRequests}</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Urgent Requests</h2>
            <p>{stats.urgentRequests}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
