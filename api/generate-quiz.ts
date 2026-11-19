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
    const prompt = `Phát sinh CHÍNH XÁC ĐÚNG ${safeCount} câu hỏi trắc nghiệm khách quan bằng tiếng Việt dựa 100% TRỰC TIẾP trên nội dung Bài viết dưới đây (không bịa đặt hay lấy kiến thức ngoài chủ đề bài viết).
Bài viết:
"${truncated}"

Yêu cầu BẮT BUỘC:
- Mảng JSON kết quả PHẢI có đúng ${safeCount} phần tử (không ít hơn, không nhiều hơn).
- Mỗi câu hỏi có cấu trúc:
  - id: Mã định danh câu hỏi duy nhất ("gq1", "gq2", ..., "gq${safeCount}")
  - question: Câu hỏi trắc nghiệm kiểm tra đúng kiến thức trong đoạn văn trên.
  - options: Mảng đúng 4 chuỗi phương án trả lời.
  - correctIndex: Chỉ số nguyên từ 0 tới 3 chỉ phương án đúng.
  - explanation: Giải thích chi tiết dựa theo nội dung đoạn văn.`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction:
          `Bạn là hệ thống tạo đề thi tự động chính xác. Bạn chỉ trả về JSON mảng gồm ĐÚNG ${safeCount} câu hỏi bám sát tài liệu được cung cấp.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          minItems: safeCount,
          maxItems: safeCount,
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
    const parsed = JSON.parse(cleanedText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new AiServiceError("AI không trả về danh sách câu hỏi hợp lệ.", 502, "INVALID_QUIZ_FORMAT");
    }
    const questions = parsed.slice(0, safeCount);
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
