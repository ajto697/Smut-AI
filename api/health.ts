import { getAiStatus, setCorsHeaders } from "./_lib/gemini";

export default function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const aiStatus = getAiStatus();
  return res.status(200).json({
    status: "ok",
    service: "Scholar Owl Serverless API",
    aiAvailable: aiStatus.available,
    aiStatusReason: aiStatus.reason || null,
    timestamp: new Date().toISOString()
  });
}
