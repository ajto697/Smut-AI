import { AiServiceError, generateAIContent, setCorsHeaders, truncateText } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });
  }

  try {
    const { homeworkText = "", assignmentTitle = "Bài tập học vụ", studentName } = req.body || {};
    if (!homeworkText.toString().trim()) {
      return res.status(400).json({
        error: true,
        code: "EMPTY_HOMEWORK",
        message: "Vui lòng nhập hoặc tải lên nội dung bài làm trước khi chấm điểm."
      });
    }

    const studentContext = studentName ? `Bài nộp của sinh viên: ${studentName}. ` : "";
    const truncatedHomework = truncateText(homeworkText.toString(), 25000);
    const prompt = `Chủ đề bài tập: "${assignmentTitle}".
Nội dung bài làm:
"${truncatedHomework}"

Hãy đóng vai trợ lý cú học thuật "Scholar Owl" (Trợ lý Azota SMUT) cực kỳ tận tâm, thông minh và tràn đầy năng lượng.
Hãy nhận xét, chấm điểm bài làm của sinh viên trên thang điểm 10 theo format sau:
- Điểm số (thang 10, dạng số e.g. 8.5/10) và lời khen/nhận xét tổng quan.
- Những điểm làm tốt.
- Những điểm cần cải thiện, kèm gợi ý sửa đổi chi tiết.
- Lời động viên học tập truyền cảm hứng đại diện cho Cú trợ lý học tập.

Trả lời bằng tiếng Việt, trình bày Markdown đẹp mắt với một vài emoji dễ thương biểu thị tính năng trợ lý học tập.`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Học Tập (Scholar Owl) của trường SMUT."
      },
      timeoutMs: 20000
    });

    return res.status(200).json({ feedback: response.text });
  } catch (err: any) {
    const status = err instanceof AiServiceError ? err.statusCode : 500;
    const code = err instanceof AiServiceError ? err.errorCode : "AI_GRADE_ERROR";
    console.error("Vercel /api/grade-homework error:", code, err?.message || err);
    return res.status(status).json({
      error: true,
      code,
      message: err?.message || "Không thể chấm điểm bài làm lúc này."
    });
  }
}
