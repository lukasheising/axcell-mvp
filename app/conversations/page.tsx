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
          Customer conversations handled by Axcell.
        </p>

        <div className="overflow-hidden rounded-xl bg-zinc-900">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 text-sm text-gray-400">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Customer message</th>
                <th className="p-4 font-medium">AI response</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={5}>
                    No conversations yet.
                  </td>
                </tr>
              ) : (
                conversations.map((conversation) => (
                  <tr
                    key={conversation.id}
                    className="border-b border-zinc-800 last:border-b-0"
                  >
                    <td className="p-4">
                      {conversation.customer_name || "Ukendt kunde"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {conversation.customer_message || conversation.transcript}
                    </td>
                    <td className="p-4 text-gray-300">
                      {conversation.ai_response || ""}
                    </td>
                    <td className="p-4 text-gray-300">
                      {conversation.status ?? "resolved"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(conversation.created_at).toLocaleString()}
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
