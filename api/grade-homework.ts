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

Hãy đóng vai giảng viên & trợ lý học thuật "Scholar Owl" chấm điểm và nhận xét bài làm trên bằng tiếng Việt theo thang điểm 10 với định dạng Markdown rõ ràng sau:
### 📊 Kết quả & Thang điểm Rubric
- **Tổng điểm:** **X.X/10** (ghi điểm số cụ thể, ví dụ 8.0/10)
- **Tiêu chí 1 - Nội dung & Lập luận (4.0 điểm):** [Chấm điểm chi tiết .../4.0 + nhận xét ngắn]
- **Tiêu chí 2 - Bố cục & Tính mạch lạc (3.0 điểm):** [Chấm điểm chi tiết .../3.0 + nhận xét ngắn]
- **Tiêu chí 3 - Ngôn ngữ & Thuật ngữ (3.0 điểm):** [Chấm điểm chi tiết .../3.0 + nhận xét ngắn]

### ✅ Những điểm làm tốt
- ...

### 🛠️ Điểm cần cải thiện & Gợi ý sửa chi tiết
- ...

### 🦉 Lời khuyên từ Scholar Owl
- ...`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Học Tập (Scholar Owl) chuyên chấm bài tự luận theo rubric rõ ràng và khách quan."
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
