import { AiServiceError, Type, generateAIContent, setCorsHeaders, truncateText } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });
  }

  try {
    const { docText = "", count = 3 } = req.body || {};
    if (!docText.toString().trim()) {
      return res.status(400).json({
        error: true,
        code: "EMPTY_DOCUMENT",
        message: "Vui lòng tải lên hoặc dán nội dung tài liệu trước khi tạo đề thi."
      });
    }

    const safeCount = Math.min(15, Math.max(1, Number(count) || 3));
    const truncated = truncateText(docText.toString());
    const prompt = `Phát sinh ${safeCount} câu hỏi trắc nghiệm khách quan bằng tiếng Việt dựa TRỰC TIẾP trên tài liệu dưới đây:
Bài viết:
"${truncated}"

Yêu cầu định dạng JSON phản hồi:
Trả về danh sách các câu hỏi, mỗi câu hỏi có cấu trúc:
- id: Mã định danh câu hỏi duy nhất (e.g. "gq1", "gq2", "gq3"...)
- question: Câu hỏi trắc nghiệm chi tiết, sâu sắc, kiểm tra khả năng nắm bắt kiến thức trong văn bản.
- options: Mảng đúng 4 chuỗi chứa phương án trả lời.
- correctIndex: Chỉ số nguyên từ 0 tới 3 chỉ phương án đúng.
- explanation: Giải thích cặn kẽ vì sao phương án đó đúng và liên hệ với lý thuyết trong đoạn văn tương ứng.`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction:
          "Bạn là hệ thống tạo đề thi tự động thông minh. Bạn chỉ trả về dữ liệu có cấu trúc JSON chính xác.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctIndex", "explanation"]
          }
        }
      },
      timeoutMs: 25000
    });

    const cleanedText = (response.text || "[]")
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const questions = JSON.parse(cleanedText);
    return res.status(200).json(questions);
  } catch (err: any) {
    const status = err instanceof AiServiceError ? err.statusCode : 500;
    const code = err instanceof AiServiceError ? err.errorCode : "AI_QUIZ_ERROR";
    console.error("Vercel /api/generate-quiz error:", code, err?.message || err);
    return res.status(status).json({
      error: true,
      code,
      message: err?.message || "Không thể tạo đề thi từ tài liệu lúc này."
    });
  }
}
