import express from "express";
import path from "path";
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "./src/constants";
import {
  AiServiceError,
  Type,
  generateAIContent,
  isAiConfigured,
  normalizeChatContents,
  truncateText,
  verifyAiConnection
} from "./api/_lib/gemini.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// -------------------------------------------------------------
// IN-MEMORY RATE LIMITER & SECURITY HEADERS
// -------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP

function apiRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "anonymous-client";
  const now = Date.now();
  const clientRecord = rateLimitMap.get(ip);

  if (!clientRecord || now > clientRecord.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (clientRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: true,
      code: "TOO_MANY_REQUESTS",
      message: "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau ít phút để bảo vệ hệ thống!"
    });
  }

  clientRecord.count += 1;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

app.use("/api/", apiRateLimiter);

function sendAiError(res: express.Response, err: any, fallbackMessage: string, fallbackCode: string) {
  const status = err instanceof AiServiceError ? err.statusCode : 500;
  const code = err instanceof AiServiceError ? err.errorCode : fallbackCode;
  return res.status(status).json({
    error: true,
    code,
    message: err?.message || fallbackMessage
  });
}

// -------------------------------------------------------------
// BACKEND API ROUTES
// -------------------------------------------------------------

// Health check endpoint (verifies live Gemini API connectivity without leaking secrets)
app.get("/api/health", async (req, res) => {
  const forceRefresh = req.query?.refresh === "1" || req.query?.refresh === "true";
  const aiStatus = await verifyAiConnection(forceRefresh);
  res.json({
    status: "ok",
    service: "Scholar Owl Full-Stack Server",
    aiAvailable: aiStatus.available,
    model: aiStatus.model || null,
    aiStatusReason: aiStatus.reason || null,
    timestamp: new Date().toISOString()
  });
});

// 1. Chat with Scholar Owl AI
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], studentName } = req.body || {};
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
        systemInstruction: studentContext + SYSTEM_PROMPT
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Server /api/chat error:", error?.message || error);
    sendAiError(res, error, "Không thể kết nối tới máy chủ Gemini AI.", "AI_CHAT_ERROR");
  }
});

// 2. Essay & Homework Grading (Azota AI) - with alias /api/essay-review
const handleGradeHomework = async (req: express.Request, res: express.Response) => {
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

    res.json({ feedback: response.text });
  } catch (error: any) {
    console.error("Server /api/grade-homework error:", error?.message || error);
    sendAiError(res, error, "Không thể chấm điểm bài làm lúc này.", "AI_GRADE_ERROR");
  }
};

app.post("/api/grade-homework", handleGradeHomework);
app.post("/api/essay-review", handleGradeHomework);

// 3. Document Analysis & Keywords Extraction
app.post("/api/analyze-doc", async (req, res) => {
  const { docText = "", filename = "Tài liệu học tập", studentName } = req.body || {};
  if (!docText.toString().trim()) {
    return res.status(400).json({
      error: true,
      code: "EMPTY_DOCUMENT",
      message: "Vui lòng tải lên hoặc dán nội dung tài liệu trước khi phân tích."
    });
  }

  try {
    const studentContext = studentName ? `Trợ lý học vụ gửi cho sinh viên: ${studentName}. ` : "";
    const truncated = truncateText(docText.toString());

    const prompt = `Bạn là Trợ lý Cú Học Tập (Scholar Owl). Bạn vừa nhận được file tài liệu có tên "${filename}".
Nhiệm vụ của bạn:
1. Hãy tóm tắt cực kỳ ngắn gọn, dễ thương nội dung tài liệu này (khoảng 2-3 câu).
2. Hãy trích xuất từ 3-6 từ khóa học thuật cốt lõi quan trọng nhất trong tài liệu.
3. Với mỗi từ khóa, hãy viết định nghĩa sư phạm chi tiết và đưa ra ví dụ áp dụng thực tế sinh động để người học nắm bắt vững vàng.
4. Gán tầm quan trọng cho mỗi từ khóa: 'Cốt lõi' (Core), 'Quan trọng' (Important), hoặc 'Mở rộng' (Extended).

Hãy dồn nén trí tuệ và trả về kết cấu JSON chuẩn xác tuyệt đối bám sát tài liệu dưới đây:
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

    const text = response.text || "{}";
    const cleanedText = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error: any) {
    console.error("Server /api/analyze-doc error:", error?.message || error);
    sendAiError(res, error, "Không thể phân tích tài liệu lúc này.", "AI_ANALYZE_ERROR");
  }
});

// 4. Generate Quiz from Document - with alias /api/extract-questions
const handleGenerateQuiz = async (req: express.Request, res: express.Response) => {
  const { docText = "", count = 3 } = req.body || {};
  if (!docText.toString().trim()) {
    return res.status(400).json({
      error: true,
      code: "EMPTY_DOCUMENT",
      message: "Vui lòng tải lên hoặc dán nội dung tài liệu trước khi tạo đề thi."
    });
  }

  try {
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
        systemInstruction: `Bạn là hệ thống tạo đề thi tự động chính xác. Bạn chỉ trả về JSON mảng gồm ĐÚNG ${safeCount} câu hỏi bám sát tài liệu được cung cấp.`,
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

    const text = response.text || "[]";
    const cleanedText = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleanedText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new AiServiceError("AI không trả về danh sách câu hỏi hợp lệ.", 502, "INVALID_QUIZ_FORMAT");
    }
    res.json(parsed.slice(0, safeCount));
  } catch (error: any) {
    console.error("Server /api/generate-quiz error:", error?.message || error);
    sendAiError(res, error, "Không thể tạo đề thi từ tài liệu lúc này.", "AI_QUIZ_ERROR");
  }
};

app.post("/api/generate-quiz", handleGenerateQuiz);
app.post("/api/extract-questions", handleGenerateQuiz);

// 5. Appraise KPI Evidence
app.post("/api/appraise-kpi", async (req, res) => {
  const { kpiCode, description, evidenceFileName, evidenceDescription, studentName } = req.body || {};
  try {
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

    res.json({ assessment: response.text });
  } catch (error: any) {
    console.error("Server /api/appraise-kpi error:", error?.message || error);
    sendAiError(res, error, "Không thể thẩm định minh chứng KPI lúc này.", "AI_KPI_ERROR");
  }
});

// 6. Dynamic Owl Greetings
app.post("/api/greeting", async (req, res) => {
  const { type = "login", userName, major, role } = req.body || {};
  const studentMajor = major || "Công nghệ Giáo dục";
  const studentRole = role || "Sinh viên K25";

  const defaultLoginGreetings = [
    "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!",
    "Chào bạn! Cú Scholar Owl đã sẵn sàng bay cùng bạn trong học kỳ này! 🚀",
    "Sẵn sàng bứt phá GPA chưa? Đăng nhập ngay để nhận lộ trình học vụ nhé! ✨🦉"
  ];
  const defaultDashboardGreetings = [
    `Mừng bạn trở lại trạm không gian ${studentMajor}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`,
    `Chào mừng ${userName || "bạn"} (${studentRole})! Cú Owl chúc bạn có một ngày học tập tràn đầy năng lượng! 🦉✨`,
    `Tuyệt vời! Hệ thống đã đồng bộ toàn bộ bảng điểm và KPI rèn luyện của bạn. Bắt đầu thôi! 📚`
  ];

  if (!isAiConfigured()) {
    const chosenList = type === "dashboard" ? defaultDashboardGreetings : defaultLoginGreetings;
    const fallbackText = chosenList[Math.floor(Math.random() * chosenList.length)];
    return res.json({ greeting: fallbackText, isAi: false });
  }

  try {
    const prompt =
      type === "dashboard"
        ? `Bạn là Scholar Owl Flying Owl. Sinh viên vừa đăng nhập thành công vào Dashboard.
Thông tin: Tên sinh viên là ${userName || "bạn"}, ngành ${studentMajor}, trạng thái: ${studentRole}.
Hãy tạo 1 câu chào mừng ngắn gọn, truyền cảm hứng (dưới 35 chữ). Lồng ghép khéo léo một lời động viên. Giọng điệu: Thông minh, đắc lực, đồng hành.`
        : `Bạn là Scholar Owl Flying Owl, trợ lý AI học vụ thông minh của hệ thống Student Portal. Bạn đang bay lượn ở giao diện đăng nhập. Hãy tạo 1 câu thoại ngắn (tối đa 25 chữ), vui vẻ, năng động để chào mừng sinh viên. Hãy nhắc khéo họ nhập Mã số sinh viên và mã OTP. Giọng điệu: Gen Z, công nghệ, bí ẩn nhưng gần gũi, sử dụng 1-2 emoji phù hợp.`;

    const response = await generateAIContent({
      contents: prompt,
      timeoutMs: 8000
    });
    const generated = response.text?.trim().replace(/^"(.*)"$/, "$1");
    res.json({
      greeting: generated || (type === "dashboard" ? defaultDashboardGreetings[0] : defaultLoginGreetings[0]),
      isAi: true
    });
  } catch {
    const chosenList = type === "dashboard" ? defaultDashboardGreetings : defaultLoginGreetings;
    const fallbackText = chosenList[Math.floor(Math.random() * chosenList.length)];
    res.json({ greeting: fallbackText, isAi: false });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC HOSTING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Scholar Owl Server] Running at http://0.0.0.0:${PORT} (PID: ${process.pid})`);
  });
}

// Only listen on port if not running in a Serverless environment (like Vercel)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
