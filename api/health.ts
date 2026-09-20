export default function handler(_req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status: "ok",
    service: "Scholar Owl Vercel Serverless Function",
    timestamp: new Date().toISOString()
  });
}
