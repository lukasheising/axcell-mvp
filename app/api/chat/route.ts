import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import {
  parseSupabaseSession,
  SUPABASE_SESSION_COOKIE,
} from "../../../lib/supabase-session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const placeholderReply = "Tak for din besked. Vi vender tilbage hurtigst muligt.";
const maxCustomerMessageLength = 2000;
const maxKnowledgeLength = 4000;
const escalationTriggers = [
  "refund",
  "return",
  "missing package",
  "where is my order",
  "speak to human",
  "damaged item",
  "complaint",
];
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractOpenAIText(data: OpenAIResponse) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .find((text): text is string => Boolean(text?.trim()))
      ?.trim() ?? ""
  );
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function chatJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  });
}

function getEscalationTrigger(message: string) {
  const normalized = message.toLowerCase();

  return escalationTriggers.find((trigger) => normalized.includes(trigger));
}

function formatKnowledgeSection(question: string) {
  const normalized = question.trim().toLowerCase();

  if (normalized === "shipping policy") {
    return "Shipping Policy";
  }

  if (normalized === "return policy") {
    return "Return Policy";
  }

  if (normalized === "refund policy") {
    return "Refund Policy";
  }

  if (normalized === "product faq") {
    return "Product FAQ";
  }

  if (normalized === "general faq") {
    return "General FAQ";
  }

  return question.trim();
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const widgetKey =
    typeof body.widget_key === "string" ? body.widget_key.trim() : "";
  const customerName =
    typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const customerEmail =
    typeof body.customer_email === "string" && body.customer_email.trim()
      ? body.customer_email.trim()
      : null;
  const message =
    typeof body.message === "string"
      ? truncate(body.message.trim(), maxCustomerMessageLength)
      : "";

  if (!customerName || !message) {
    return chatJson({ error: "customer_name and message are required." }, 400);
  }

  if (!openaiApiKey) {
    return chatJson({ error: "OpenAI is not configured." }, 500);
  }

  let supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  let company: { id: string } | null = null;

  if (widgetKey) {
    if (!supabaseServiceRoleKey) {
      return chatJson({ error: "Public widget chat is not configured." }, 500);
    }

    supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .eq("widget_public_key", widgetKey)
      .maybeSingle();

    if (error) {
      return chatJson({ error: error.message }, 500);
    }

    company = data;
  } else {
    const session = parseSupabaseSession(
      request.cookies.get(SUPABASE_SESSION_COOKIE)?.value
    );

    if (!session?.access_token) {
      return chatJson({ error: "Unauthorized." }, 401);
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(session.access_token);

    if (userError || !user) {
      return chatJson({ error: "Unauthorized." }, 401);
    }

    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return chatJson({ error: error.message }, 500);
    }

    company = data;
  }

  if (!company) {
    return chatJson({ error: "Company not found." }, 404);
  }

  const { data: knowledgeRows, error: knowledgeError } = await supabase
    .from("knowledge_base")
    .select("question, answer")
    .eq("company_id", company.id);

  if (knowledgeError) {
    return chatJson({ error: knowledgeError.message }, 500);
  }

  const knowledge = truncate(
    knowledgeRows
      .map(
        (row) =>
          `${formatKnowledgeSection(row.question)}:\n${row.answer.trim()}`
      )
      .join("\n\n"),
    maxKnowledgeLength
  );

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      store: false,
      max_output_tokens: 220,
      instructions:
        "You are Axcell, a customer support assistant for an e-commerce company. Answer in Danish. Answer only using the provided company knowledge base. If the knowledge base does not contain enough information to answer, say you do not know and that the team will follow up. Never invent shipping providers, refund promises, order status, discounts, policies, prices, delivery times, or commitments. Do not ask for sensitive payment information. Keep the reply concise and helpful.",
      input: `Company knowledge base:\n${
        knowledge || "No knowledge base entries saved yet."
      }\n\nCustomer name: ${customerName}\nCustomer message: ${message}`,
    }),
  });

  if (!openaiResponse.ok) {
    const openaiErrorBody = await openaiResponse.text();

    console.error("OpenAI chat response failed", {
      status: openaiResponse.status,
      statusText: openaiResponse.statusText,
      body: openaiErrorBody,
    });

    return chatJson({ error: "Could not generate a reply right now." }, 502);
  }

  const openaiData = (await openaiResponse.json()) as OpenAIResponse;
  const reply = extractOpenAIText(openaiData) || placeholderReply;
  const escalationTrigger = getEscalationTrigger(message);

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      company_id: company.id,
      customer_name: customerName,
      customer_email: customerEmail,
      issue_type: "General",
      transcript: `Customer: ${message}\n\nAxcell: ${reply}`,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    return chatJson({ error: error.message }, 500);
  }

  if (escalationTrigger) {
    const { error: caseError } = await supabase.from("cases").insert({
      company_id: company.id,
      conversation_id: conversation.id,
      customer_name: customerName,
      issue_type: escalationTrigger,
      priority: "high",
      status: "open",
      notes: "Automatically escalated by AI",
    });

    if (caseError) {
      return chatJson({ error: caseError.message }, 500);
    }
  }

  return chatJson({ reply });
}
