"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "customer" | "bot";
  text: string;
};

export default function ChatWidget() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!customerName.trim() || !trimmedMessage) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "customer", text: trimmedMessage },
    ]);
    setMessage("");
    setSending(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        message: trimmedMessage,
      }),
    });

    const data = await response.json();
    setSending(false);

    if (!response.ok) {
      alert(data.error ?? "Could not send message.");
      return;
    }

    setMessages((current) => [...current, { role: "bot", text: data.reply }]);
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 rounded-xl p-5 text-white">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Chat with Axcell</h2>
        <p className="text-sm text-gray-400">Send a customer message.</p>
      </div>

      <div className="mb-4 h-72 space-y-3 overflow-y-auto rounded-xl bg-black p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet.</p>
        ) : (
          messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`rounded-xl p-3 text-sm ${
                item.role === "customer"
                  ? "ml-8 bg-white text-black"
                  : "mr-8 bg-zinc-800 text-gray-100"
              }`}
            >
              {item.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="space-y-3">
        <input
          className="w-full rounded-xl bg-zinc-800 p-3"
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <input
          className="w-full rounded-xl bg-zinc-800 p-3"
          placeholder="Customer email"
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
        />
        <div className="flex gap-3">
          <input
            className="min-w-0 flex-1 rounded-xl bg-zinc-800 p-3"
            placeholder="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            className="rounded-xl bg-white px-5 font-semibold text-black disabled:opacity-50"
            disabled={sending || !customerName.trim() || !message.trim()}
            type="submit"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
