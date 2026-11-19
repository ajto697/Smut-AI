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
    const { docText = "", filename = "Tài liệu học tập", studentName } = req.body || {};
    if (!docText.toString().trim()) {
      return res.status(400).json({
        error: true,
        code: "EMPTY_DOCUMENT",
        message: "Vui lòng tải lên hoặc dán nội dung tài liệu trước khi phân tích."
      });
    }

    const studentContext = studentName ? `Trợ lý học vụ gửi cho sinh viên: ${studentName}. ` : "";
    const truncated = truncateText(docText.toString());

    const prompt = `Bạn là Trợ lý Cú Học Tập (Scholar Owl). Bạn vừa nhận được file tài liệu có tên "${filename}".
Nhiệm vụ của bạn:
1. Hãy tóm tắt cực kỳ ngắn gọn, dễ thương nội dung tài liệu này (khoảng 2-3 câu).
2. Hãy trích xuất từ 3-6 từ khóa học thuật cốt lõi quan trọng nhất trong tài liệu.
3. Với mỗi từ khóa, hãy viết định nghĩa sư phạm chi tiết và đưa ra ví dụ áp dụng thực tế sinh động để người học nắm bắt vững vàng.
4. Gán tầm quan trọng cho mỗi từ khóa: 'Cốt lõi', 'Quan trọng', hoặc 'Mở rộng'.

Hãy trả về dữ liệu JSON chuẩn xác tuyệt đối bám sát tài liệu dưới đây:
"${truncated}"`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction:
          studentContext +
          "Bạn là hệ thống trích xuất tri thức thuật ngữ học tập thông minh. Bạn chỉ trả về dữ liệu có cấu trúc JSON chính xác.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  example: { type: Type.STRING },
                  importance: {
                    type: Type.STRING,
                    enum: ["Cốt lõi", "Quan trọng", "Mở rộng"]
                  }
                },
                required: ["term", "definition", "example", "importance"]
              }
            }
          },
          required: ["summary", "keywords"]
        }
      },
      timeoutMs: 25000
    });

    const cleanedText = (response.text || "{}")
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const result = JSON.parse(cleanedText);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AiServiceError ? err.statusCode : 500;
    const code = err instanceof AiServiceError ? err.errorCode : "AI_ANALYZE_ERROR";
    console.error("Vercel /api/analyze-doc error:", code, err?.message || err);
    return res.status(status).json({
      error: true,
      code,
      message: err?.message || "Không thể phân tích tài liệu lúc này."
    });
  }
}
