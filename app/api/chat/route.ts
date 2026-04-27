export async function POST(request: Request) {
  const body = await request.json();
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  return Response.json({
    reply: "Tak for din besked. Axcell API svarer nu fra backend.",
  });
}
