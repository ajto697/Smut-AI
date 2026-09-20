import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      feedback: "### 🦉 Chế độ phản hồi nhanh\nBài làm đã được ghi nhận. Hãy cấu hình `GEMINI_API_KEY` trên Vercel để nhận chi tiết thang điểm và đánh giá nâng cao!"
    });
  }

  try {
    const { homeworkText, assignmentTitle } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Chủ đề bài tập: "${assignmentTitle}".
Nội dung bài làm:
"${homeworkText}"

Hãy đóng vai trợ lý cú học thuật "Scholar Owl" (Trợ lý Azota SMUT) cực kỳ tận tâm, thông minh và tràn đầy năng lượng.
Hãy nhận xét, chấm điểm bài làm của sinh viên trên thang điểm 10 theo format sau:
- Điểm số (thang 10, dạng số e.g. 8.5/10) và lời khen/nhận xét tổng quan.
- Những điểm làm tốt.
- Những điểm cần cải thiện, kèm gợi ý sửa đổi chi tiết.
- Lời động viên học tập truyền cảm hứng.
Trả lời bằng tiếng Việt, trình bày Markdown đẹp mắt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return res.status(200).json({ feedback: response.text || "Đã chấm điểm bài làm." });
  } catch (err: any) {
    return res.status(200).json({
      feedback: "### 🦉 Phản hồi sơ bộ từ Cú Học Tập\nBài làm của bạn đã được tiếp nhận. Máy chủ AI đang bận xử lý, bạn vui lòng kiểm tra lại sau!"
    });
  }
}
