const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json(
      { error: "Message is required." },
      { status: 400, headers: corsHeaders }
    );
  }

  return Response.json(
    {
      reply: "Tak for din besked. Axcell API svarer nu fra backend.",
    },
    { headers: corsHeaders }
  );
}
