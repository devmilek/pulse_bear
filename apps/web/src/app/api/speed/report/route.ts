import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  console.log("Received report:\n", JSON.stringify(body, null, 2));

  return new Response("Report received", { status: 200 });
};
