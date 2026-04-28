import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const fallbackReply = "Tak for din besked. Vi vender tilbage hurtigst muligt.";
const maxMessageLength = 2000;
const maxKnowledgeLength = 4000;

type KnowledgeEntry = {
  question: string;
  answer: string;
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

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function chatJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  });
}

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

function getRelevantKnowledge(entries: KnowledgeEntry[], message: string) {
  const words = message
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2);

  return entries
    .map((entry) => {
      const searchable = `${entry.question} ${entry.answer}`.toLowerCase();
      const score = words.reduce(
        (total, word) => total + (searchable.includes(word) ? 1 : 0),
        0
      );

      return { ...entry, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((entry) => `${entry.question}:\n${entry.answer.trim()}`)
    .join("\n\n")
    .slice(0, maxKnowledgeLength);
}

export async function POST(request: Request) {
  const body = await request.json();
  const message =
    typeof body.message === "string"
      ? body.message.trim().slice(0, maxMessageLength)
      : "";
  const widgetKey =
    typeof body.widget_key === "string" ? body.widget_key.trim() : "";
  const isWidgetIntake = body.source === "widget_intake";

  if (!message) {
    return chatJson({ error: "Message is required." }, 400);
  }

  if (!supabaseServiceRoleKey) {
    return chatJson({ error: "Supabase service role is not configured." }, 500);
  }

  if (isWidgetIntake && !widgetKey) {
    console.error("Widget intake missing widget_key");
    return chatJson({ error: "Widget key is required." }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const companyQuery = supabase.from("companies").select("id").limit(1);
  const { data: companies, error: companyError } = widgetKey
    ? await companyQuery.eq("widget_public_key", widgetKey)
    : await companyQuery;

  if (companyError) {
    console.error("Failed to resolve widget company", companyError);
    return chatJson({ error: companyError.message }, 500);
  }

  const company = companies?.[0];

  if (!company) {
    console.error("Company not found for widget request", {
      hasWidgetKey: Boolean(widgetKey),
    });
    return chatJson({ error: "Company not found." }, 404);
  }

  if (isWidgetIntake) {
    const requestType =
      typeof body.request_type === "string" && body.request_type.trim()
        ? body.request_type.trim().slice(0, 80)
        : "Price request";
    const customerName =
      typeof body.customer_name === "string"
        ? body.customer_name.trim().slice(0, 120)
        : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim().slice(0, 120) : "";
    const address =
      typeof body.address === "string"
        ? body.address.trim().slice(0, 240)
        : "";
    const requestDetails = [
      `Request type: ${requestType}`,
      "Urgency: Normal",
      `Phone: ${phone || "Not provided"}`,
      `Address: ${address || "Not provided"}`,
      `Message: ${message || "No message provided"}`,
    ].join("\n");

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        company_id: company.id,
        customer_name: customerName || null,
        customer_message: requestDetails,
        ai_response: "Widget intake request. No AI response yet.",
        status: "open",
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      console.error("Failed to store widget intake conversation", {
        error: conversationError,
        companyId: company.id,
      });
      return chatJson(
        { error: conversationError?.message ?? "Conversation was not saved." },
        500
      );
    }

    return chatJson({
      reply: "Thanks. We received your request and will follow up soon.",
    });
  }

  if (!openaiApiKey) {
    return chatJson({ error: "OpenAI is not configured." }, 500);
  }

  const { data: knowledgeRows, error: knowledgeError } = await supabase
    .from("knowledge_base")
    .select("question, answer")
    .eq("company_id", company.id);

  if (knowledgeError) {
    return chatJson({ error: knowledgeError.message }, 500);
  }

  const knowledge = getRelevantKnowledge(knowledgeRows ?? [], message);

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
        "You are Axcell, a customer support assistant for an e-commerce company. Answer in Danish. Answer only using the provided FAQ knowledge. If the FAQ knowledge does not contain enough information to answer, say you do not know and that the team will follow up. Do not invent shipping providers, refund promises, order status, discounts, prices, delivery times, or commitments. Keep the reply concise and helpful.",
      input: `FAQ knowledge:\n${
        knowledge || "No FAQ knowledge has been saved yet."
      }\n\nCustomer message: ${message}`,
    }),
  });

  if (!openaiResponse.ok) {
    return chatJson({ error: "Could not generate a reply right now." }, 502);
  }

  const openaiData = (await openaiResponse.json()) as OpenAIResponse;
  const reply = extractOpenAIText(openaiData) || fallbackReply;

  const { error: conversationError } = await supabase
    .from("conversations")
    .insert({
      company_id: company.id,
      customer_message: message,
      ai_response: reply,
      status: "resolved",
    });

  if (conversationError) {
    console.error("Failed to store chat conversation", conversationError);
  }

  return chatJson({ reply });
}
