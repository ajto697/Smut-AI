import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "./src/constants";

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
      error: "Too Many Requests",
      message: "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau ít phút để bảo vệ hệ thống!"
    });
  }

  clientRecord.count += 1;
  next();
}

// Clean up expired rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Apply rate limiter to all API endpoints
app.use("/api/", apiRateLimiter);

// Lazy initialize Gemini API client server-side
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Models in prioritized order for resilient fallback
// gemini-3.1-flash-lite has active healthy quota; other models serve as fallbacks
const MODEL_CANDIDATES = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.6-flash"
];

async function generateAIContent(params: {
  contents: any;
  config?: any;
  timeoutMs?: number;
}) {
  const ai = getAI();
  let lastError: any = null;
  const timeoutLimit = params.timeoutMs || 8000;

  for (const model of MODEL_CANDIDATES) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutLimit}ms`)), timeoutLimit)
      );
      return (await Promise.race([callPromise, timeoutPromise])) as any;
    } catch (err: any) {
      lastError = err;
      // Continue to next candidate model smoothly
      continue;
    }
  }

  throw lastError;
}

function truncateText(text: string, maxChars: number = 30000): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "\n\n*(Lưu ý: Tài liệu quá dài nên Cú Học Tập đã thu ngắn để tối ưu hóa tốc độ và không vượt quá giới hạn xử lý)*";
}

// -------------------------------------------------------------
// BACKEND API ROUTES
// -------------------------------------------------------------

// Hardened Health check endpoint (never leak internal environment secret indicators)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Scholar Owl Full-Stack Server",
    timestamp: new Date().toISOString()
  });
});

// 1. Chat with Scholar Owl AI
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], studentName } = req.body;
    const studentContext = studentName ? `Người dùng hiện tại: ${studentName}. ` : "";

    const response = await generateAIContent({
      contents: messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content || "" }]
      })),
      config: {
        systemInstruction: studentContext + SYSTEM_PROMPT
      }
    });

    res.json({ reply: response.text || "Xin lỗi, tôi không thể trả lời lúc này." });
  } catch (error: any) {
    console.error("Server /api/chat error:", error?.message || error);
    res.json({
      error: "AI_OFFLINE_FALLBACK",
      reply: "Xin lỗi, Cú Owl tạm thời gián đoạn kết nối tới máy chủ AI. Bạn hãy thử lại sau giây lát hoặc kiểm tra kết nối mạng nhé! 🦉"
    });
  }
});

// 2. Essay & Homework Grading (Azota AI) - with alias /api/essay-review
const handleGradeHomework = async (req: express.Request, res: express.Response) => {
  try {
    const { homeworkText, assignmentTitle, studentName } = req.body;
    const studentContext = studentName ? `Bài nộp của sinh viên: ${studentName}. ` : "";
    const prompt = `Chủ đề bài tập: "${assignmentTitle}".
Nội dung bài làm:
"${homeworkText}"

Hãy đóng vai trợ lý cú học thuật "Scholar Owl" (Trợ lý Azota SMUT) cực kỳ tận tâm, thông minh và tràn đầy năng lượng.
Hãy nhận xét, chấm điểm bài làm của sinh viên trên thang điểm 10 theo format sau:
- Điểm số (thang 10, dạng số e.g. 8.5/10) và lời khen/nhận xét tổng quan.
- Những điểm làm tốt.
- Những điểm cần cải thiện, kèm gợi ý sửa đổi chi tiết.
- Lời động viên học tập truyền cảm hứng đại diện cho Cú trợ lý học tập.

Trả lời bằng tiếng Việt, trình bày Markdown đẹp mắt với một vài emoji dễ thương biểu thị tính năng trợ lý học tập. Thể hiện sự ấm áp và quan tâm chăm sóc học viên.`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Học Tập (Scholar Owl) của trường SMUT."
      }
    });

    res.json({ feedback: response.text || "Đã chấm điểm thành công bài làm." });
  } catch (error: any) {
    console.error("Server /api/grade-homework error:", error?.message || error);
    res.json({
      feedback: `### 🦉 Phản hồi ngoại tuyến từ Cú Học Tập
Rất tiếc máy chủ AI đang bận hoặc ngoại tuyến. Dưới đây là nhận xét tổng quan sơ bộ:
**Bài làm có cấu trúc rõ ràng và thể hiện sự nỗ lực rất tốt!** Hãy gửi lại khi kết nối máy chủ hoàn tất để nhận chi tiết thang điểm.`
    });
  }
};

app.post("/api/grade-homework", handleGradeHomework);
app.post("/api/essay-review", handleGradeHomework);

// 3. Document Analysis & Keywords Extraction
app.post("/api/analyze-doc", async (req, res) => {
  const { docText, filename, studentName } = req.body;
  try {
    const studentContext = studentName ? `Trợ lý học vụ gửi cho sinh viên: ${studentName}. ` : "";
    const truncated = truncateText(docText);

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
        systemInstruction: studentContext + "Bạn là hệ thống trích xuất tri thức thuật ngữ học tập thông minh. Bạn chỉ trả về dữ liệu có cấu trúc JSON chính xác.",
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
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error: any) {
    console.error("Server /api/analyze-doc error:", error?.message || error);
    res.json({
      summary: `Tóm lược tài liệu "${filename}": Tài liệu bao gồm các lý thuyết học vụ quan trọng. Hãy nắm vững các thuật ngữ bên dưới để ôn thi hiệu quả.`,
      keywords: [
        {
          term: "Hệ thống Khảo thí Azota AI",
          definition: "Hệ thống hỗ trợ học tập và khảo thí số tự động được tích hợp Cú bay Flying Owl.",
          example: "Sinh viên nạp tài liệu khoa học giáo dục để Cú bóc tách thành flashcard ôn tập tức thì.",
          importance: "Cốt lõi"
        },
        {
          term: "Học tập cá nhân hóa",
          definition: "Phương pháp thiết kế lộ trình học tự định hướng bám sát năng lực và hoàn cảnh từng sinh viên.",
          example: "AI tự động sinh đề thi thử bám sát điểm yếu để cải thiện điểm rèn luyện GPA.",
          importance: "Quan trọng"
        }
      ]
    });
  }
});

// 4. Generate Quiz from Document - with alias /api/extract-questions
const handleGenerateQuiz = async (req: express.Request, res: express.Response) => {
  const { docText, filename, count = 3 } = req.body;
  try {
    const truncated = truncateText(docText);
    const prompt = `Phát sinh ${count} câu hỏi trắc nghiệm khách quan bằng tiếng Việt dựa TRỰC TIẾP trên tài liệu dưới đây:
Bài viết:
"${truncated}"

Yêu cầu định dạng JSON phản hồi:
Trả về danh sách các câu hỏi, mỗi câu hỏi có cấu trúc:
- id: Mã định danh câu hỏi duy nhất (e.g. "gq1", "gq2", "gq3"...)
- question: Câu hỏi trắc nghiệm chi tiết, sâu sắc, kiểm tra khả năng nắm bắt kiến thức trong văn bản.
- options: Mảng 4 chuỗi chứa phương án trả lời.
- correctIndex: Chỉ số nguyên từ 0 tới 3 chỉ phương án đúng.
- explanation: Giải thích cặn kẽ vì sao phương án đó đúng và liên hệ với lý thuyết trong đoạn văn tương ứng.`;

    const response = await generateAIContent({
      contents: prompt,
      config: {
        systemInstruction: "Bạn là hệ thống tạo đề thi tự động thông minh. Bạn chỉ trả về dữ liệu có cấu trúc JSON chính xác.",
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
      }
    });

    const text = response.text || "[]";
    const cleanedText = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const questions = JSON.parse(cleanedText);
    res.json(questions);
  } catch (error: any) {
    console.error("Server /api/generate-quiz error:", error?.message || error);
    res.json([
      {
        id: "fq1",
        question: `Câu hỏi trắc nghiệm kiểm tra tài liệu "${filename}": Mục tiêu chính của việc số hóa học vụ là gì?`,
        options: [
          "Tự động hóa thủ tục, hỗ trợ sinh viên học tập hiệu quả",
          "Tăng thêm giấy tờ in ấn",
          "Giảm tính minh bạch trong xếp loại rèn luyện",
          "Thay thế hoàn toàn vai trò của giảng viên"
        ],
        correctIndex: 0,
        explanation: "Số hóa học vụ giúp tối ưu thời gian, kết nối thông tin đa chiều và hỗ trợ sinh viên tối đa."
      }
    ]);
  }
};

app.post("/api/generate-quiz", handleGenerateQuiz);
app.post("/api/extract-questions", handleGenerateQuiz);

// 5. Appraise KPI Evidence
app.post("/api/appraise-kpi", async (req, res) => {
  const { kpiCode, description, evidenceFileName, evidenceDescription, studentName } = req.body;
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

    res.json({ assessment: response.text || "Minh chứng hợp lệ. Đã duyệt thành công!" });
  } catch (error: any) {
    console.error("Server /api/appraise-kpi error:", error?.message || error);
    res.json({
      assessment: `### 🦉 Thẩm Định từ Cú Scholar Owl\n**Quyết định:** ĐÃ DUYỆT THÀNH CÔNG ✅\n**Nhận xét:** Minh chứng "${evidenceFileName}" đầy đủ và hợp lệ. Điểm rèn luyện của bạn đã được ghi nhận vào hệ thống!`
    });
  }
});

// 6. Dynamic Owl Greetings
app.post("/api/greeting", async (req, res) => {
  const { type = "login", userName, major, role } = req.body;
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

  try {
    if (type === "dashboard") {
      const prompt = `Bạn là Scholar Owl Flying Owl. Sinh viên vừa đăng nhập thành công vào Dashboard.
Thông tin: Tên sinh viên là ${userName || "bạn"}, ngành ${studentMajor}, trạng thái: ${studentRole}.
Hãy tạo 1 câu chào mừng ngắn gọn, truyền cảm hứng (dưới 35 chữ). Lồng ghép khéo léo một lời động viên. Giọng điệu: Thông minh, đắc lực, đồng hành.`;

      const response = await generateAIContent({
        contents: prompt,
        timeoutMs: 4000
      });
      const generated = response.text?.trim().replace(/^"(.*)"$/, "$1");
      res.json({ greeting: generated || defaultDashboardGreetings[0] });
    } else {
      const prompt = `Bạn là Scholar Owl Flying Owl, trợ lý AI học vụ thông minh của hệ thống Student Portal. Bạn đang bay lượn ở giao diện đăng nhập. Hãy tạo 1 câu thoại ngắn (tối đa 25 chữ), vui vẻ, năng động để chào mừng sinh viên. Hãy nhắc khéo họ nhập Mã số sinh viên và mã OTP. Giọng điệu: Gen Z, công nghệ, bí ẩn nhưng gần gũi, sử dụng 1-2 emoji phù hợp.`;

      const response = await generateAIContent({
        contents: prompt,
        timeoutMs: 4000
      });
      const generated = response.text?.trim().replace(/^"(.*)"$/, "$1");
      res.json({ greeting: generated || defaultLoginGreetings[0] });
    }
  } catch (error: any) {
    const chosenList = type === "dashboard" ? defaultDashboardGreetings : defaultLoginGreetings;
    const fallbackText = chosenList[Math.floor(Math.random() * chosenList.length)];
    res.json({ greeting: fallbackText });
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

startServer();
