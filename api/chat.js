import {
  AiServiceError,
  PORTAL_SYSTEM_PROMPT,
  generateAIContent,
  normalizeChatContents,
  setCorsHeaders
} from "./_lib/gemini.js";

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { messages = [], studentName } = body;
    const contents = normalizeChatContents(messages);
    if (contents.length === 0) {
      return res.status(400).json({
        error: true,
        code: "EMPTY_MESSAGE",
        message: "Vui lòng nhập nội dung câu hỏi trước khi gửi."
      });
    }

    const studentContext = studentName ? `Người dùng hiện tại: ${studentName}. ` : "";
    const response = await generateAIContent({
      contents,
      config: {
        systemInstruction: studentContext + PORTAL_SYSTEM_PROMPT
      }
    });

    return res.status(200).json({ reply: response.text });
  } catch (err) {
    const status = err instanceof AiServiceError ? err.statusCode : 500;
    const code = err instanceof AiServiceError ? err.errorCode : "AI_CHAT_ERROR";
    console.error("Vercel /api/chat error:", code, err?.message || err);
    return res.status(status).json({
      error: true,
      code,
      message: err?.message || "Không thể kết nối tới máy chủ Gemini AI."
    });
  }
}
