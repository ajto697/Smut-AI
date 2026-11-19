import { setCorsHeaders, verifyAiConnection } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const forceRefresh = req.query?.refresh === "1" || req.query?.refresh === "true";
  const aiStatus = await verifyAiConnection(forceRefresh);

  return res.status(200).json({
    status: "ok",
    service: "Scholar Owl Serverless API",
    aiAvailable: aiStatus.available,
    model: aiStatus.model || null,
    aiStatusReason: aiStatus.reason || null,
    timestamp: new Date().toISOString()
  });
}
