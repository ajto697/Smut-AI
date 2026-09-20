import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

type Req = IncomingMessage & { body: any; query?: any };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (data: any) => void;
  send: (data: any) => void;
  end: () => void;
};

const SYSTEM_PROMPT = `Bạn là Trợ lý Học vụ AI "Scholar Owl" (Cú Học Tập SMUT) của Trường Đại học Sư phạm Kỹ thuật / ĐH Sư phạm (SMUT - Saigon Metropolitan University of Technology / Sư Phạm).
- Luôn xưng hô thân thiện, tận tâm, văn phong sinh viên vui tươi, thông minh (dùng xưng "Cú", "mình" và gọi "bạn", kèm emoji 🦉 ✨ 🎓).
- Nắm rõ thông tin học vụ: tín chỉ (120-140 TC tốt nghiệp), thang điểm GPA 4.0, điểm rèn luyện (ĐRL), đăng ký môn học, các cơ sở học tập, học phí, lịch thi, tra cứu biểu mẫu.
- Trả lời bằng tiếng Việt gãy gọn, có cấu trúc markdown dễ đọc.`;

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-2.5-pro"
];

export default async function handler(req: Req, res: Res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      error: "MISSING_API_KEY",
      reply: "Hú hù! 🦉 Cú Học Tập đã kết nối tới máy chủ Vercel thành công, nhưng biến môi trường `GEMINI_API_KEY` chưa được thiết lập trên Vercel Dashboard. Bạn hãy vào Settings > Environment Variables trên Vercel để thêm nhé!"
    });
  }

  try {
    const { messages = [], studentName } = req.body || {};
    const studentContext = studentName ? `Người dùng hiện tại: ${studentName}. ` : "";

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }]
    }));

    let lastError: any = null;
    let replyText = "";

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: studentContext + SYSTEM_PROMPT
          }
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!replyText) {
      throw lastError || new Error("No response generated");
    }

    return res.status(200).json({ reply: replyText });
  } catch (error: any) {
    console.error("Vercel Chat Error:", error);
    return res.status(200).json({
      error: "AI_OFFLINE_FALLBACK",
      reply: "Hú hù! 🦉 Cú Owl xin chào bạn! Cú đang gặp sự cố kết nối tới mô hình AI (mã lỗi: " + (error?.message || "Timeout") + "). Bạn kiểm tra lại quota hoặc mã GEMINI_API_KEY trên Vercel nhé!"
    });
  }
}
