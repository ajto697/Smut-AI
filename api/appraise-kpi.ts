import { AiServiceError, generateAIContent, setCorsHeaders } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });
  }

  try {
    const { kpiCode, description, evidenceFileName, evidenceDescription, studentName } = req.body || {};
    const studentContext = studentName ? `Sinh viên: ${studentName}. ` : "";
    const prompt = `Bạn là Trợ lý Cú Học Tập "Scholar Owl" - Trưởng ban Đánh giá rèn luyện tự động.
Bạn cần thẩm định minh chứng cho hạng mục kiểm tra sau:
- Mã số tiêu chí: ${kpiCode}
- Nội dung tiêu chí: ${description}
- Tệp đính kèm: ${evidenceFileName}
- Mô tả minh chứng từ sinh viên: "${evidenceDescription}"

Nhiệm vụ của bạn:
1. Hãy thẩm định xem minh chứng này có hợp lý và thuyết phục để tính điểm rèn luyện không.
2. Trả về một phản hồi tràn đầy cảm hứng bằng tiếng Việt dưới dạng Markdown:
   - Đánh giá sơ bộ về tính xác thực của tệp "${evidenceFileName}" (Khen ngợi nỗ lực hoặc nhắc nhở bổ sung nếu thiếu sót).
   - Đưa ra quyết định rõ ràng: "ĐÃ DUYỆT THÀNH CÔNG ✅" hoặc "CẦN BỔ SUNG MINH CHỨNG ⏳".
   - Nhận xét ngắn gọn, dí dỏm, thông thái của một chú Cú học thuật.
   - Ước tính số điểm rèn luyện được cộng thêm dựa trên tiêu chí.

Yêu cầu: Viết ngắn gọn tầm 3-5 câu, giàu xúc cảm sư phạm, tạo động lực rèn luyện nếp sống cực kỳ tích cực.`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Đánh Giá Điểm Rèn Luyện AI."
      }
    });

    return res.status(200).json({ assessment: response.text });
  } catch (err: any) {
    const status = err instanceof AiServiceError ? err.statusCode : 500;
    const code = err instanceof AiServiceError ? err.errorCode : "AI_KPI_ERROR";
    console.error("Vercel /api/appraise-kpi error:", code, err?.message || err);
    return res.status(status).json({
      error: true,
      code,
      message: err?.message || "Không thể thẩm định minh chứng KPI lúc này."
    });
  }
}
