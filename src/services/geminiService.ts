import { Message, QuizQuestion, DocumentAnalysisResult } from "../types";
import { showCyberToast } from "./toastService";

/**
 * Client-side service communicating with backend API routes (/api/*).
 * API keys and AI logic are strictly processed server-side.
 */

export interface AiHealthStatus {
  available: boolean;
  reason?: string | null;
}

export class AiApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "AI_ERROR") {
    super(message);
    this.name = "AiApiError";
    this.status = status;
    this.code = code;
  }
}

export async function checkAiHealth(): Promise<AiHealthStatus> {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    if (!res.ok) {
      return {
        available: false,
        reason: `Máy chủ API trả về mã lỗi HTTP ${res.status}.`
      };
    }
    const data = await res.json();
    return {
      available: Boolean(data.aiAvailable),
      reason: data.aiStatusReason || null
    };
  } catch {
    return {
      available: false,
      reason: "Không thể kết nối tới máy chủ backend (/api/health)."
    };
  }
}

async function parseErrorResponse(res: Response, fallbackMsg: string): Promise<AiApiError> {
  try {
    const data = await res.json();
    return new AiApiError(
      data?.message || fallbackMsg,
      res.status,
      data?.code || `HTTP_${res.status}`
    );
  } catch {
    return new AiApiError(`${fallbackMsg} (HTTP ${res.status})`, res.status, `HTTP_${res.status}`);
  }
}

export async function getChatResponse(messages: Message[], studentName?: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, studentName })
    });

    if (!res.ok) {
      const apiErr = await parseErrorResponse(res, "Máy chủ AI hiện không phản hồi.");
      showCyberToast({
        type: "warning",
        title: `TRỢ LÝ CÚ // ${apiErr.code}`,
        message: apiErr.message
      });

      if (apiErr.code === "MISSING_API_KEY" || apiErr.status === 503) {
        return "⚠️ **Dịch vụ Cú Owl AI chưa được kích hoạt trên máy chủ** (thiếu biến môi trường `GEMINI_API_KEY`).\n\nBạn vẫn có thể tra cứu nhanh quy chế, lịch thi, dự báo GPA và luyện đề Azota Mock trên thanh menu trong khi quản trị viên cấu hình khóa API nhé! 🦉";
      }
      return `⚠️ **Cú Owl AI tạm thời gián đoạn kết nối** (${apiErr.code}: ${apiErr.message}).\n\nBạn hãy thử gửi lại sau giây lát, hoặc liên hệ Phòng Đào tạo (Hotline: 028-1234-5678) nếu cần hỗ trợ học vụ khẩn cấp nhé! 🦉`;
    }

    const data = await res.json();
    if (!data?.reply) {
      throw new AiApiError("Phản hồi từ AI bị trống.", 502, "EMPTY_RESPONSE");
    }
    return data.reply;
  } catch (error: any) {
    console.error("Chat API error:", error);
    const msg = error?.message || "Không thể kết nối tới máy chủ AI.";
    showCyberToast({
      type: "error",
      title: "TRỢ LÝ CÚ // LỖI KẾT NỐI",
      message: msg
    });
    return `⚠️ **Không thể kết nối tới máy chủ Cú Owl AI** (${msg}).\n\nVui lòng kiểm tra kết nối mạng hoặc thử lại sau ít phút nhé! 🦉`;
  }
}

export async function gradeHomework(
  homeworkText: string,
  assignmentTitle: string,
  studentName?: string
): Promise<string> {
  const res = await fetch("/api/grade-homework", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ homeworkText, assignmentTitle, studentName })
  });

  if (!res.ok) {
    const apiErr = await parseErrorResponse(res, "Không thể chấm điểm bài làm qua AI.");
    showCyberToast({
      type: "error",
      title: `AZOTA AI // ${apiErr.code}`,
      message: apiErr.message
    });
    throw apiErr;
  }

  const data = await res.json();
  showCyberToast({
    type: "success",
    title: "AZOTA // CHẤM BÀI XONG",
    message: `Đã hoàn tất đánh giá bài làm "${assignmentTitle}".`
  });
  return data.feedback;
}

export async function analyzeDocumentKeywords(
  docText: string,
  filename: string,
  studentName?: string
): Promise<DocumentAnalysisResult> {
  const res = await fetch("/api/analyze-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docText, filename, studentName })
  });

  if (!res.ok) {
    const apiErr = await parseErrorResponse(res, "Không thể phân tích tài liệu bằng AI.");
    showCyberToast({
      type: "error",
      title: `TÀI LIỆU AI // ${apiErr.code}`,
      message: apiErr.message
    });
    throw apiErr;
  }

  const data: DocumentAnalysisResult = await res.json();
  showCyberToast({
    type: "success",
    title: "TÀI LIỆU // BÓC TÁCH XONG",
    message: `Đã phân tích từ khóa và nội dung cho tệp "${filename}".`
  });
  return data;
}

export async function generateQuizFromDocument(
  docText: string,
  filename: string,
  studentName?: string,
  count: number = 3
): Promise<QuizQuestion[]> {
  const res = await fetch("/api/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docText, filename, studentName, count })
  });

  if (!res.ok) {
    const apiErr = await parseErrorResponse(res, "Không thể tạo đề thi từ tài liệu qua AI.");
    showCyberToast({
      type: "error",
      title: `ĐỀ THI AI // ${apiErr.code}`,
      message: apiErr.message
    });
    throw apiErr;
  }

  const questions: QuizQuestion[] = await res.json();
  showCyberToast({
    type: "success",
    title: "ĐỀ THI // TẠO THÀNH CÔNG",
    message: `Đã sinh ${questions.length} câu hỏi trắc nghiệm từ tài liệu.`
  });
  return questions;
}

export async function appraiseKpiEvidence(
  kpiCode: string,
  description: string,
  evidenceFileName: string,
  evidenceDescription: string,
  studentName?: string
): Promise<string> {
  const res = await fetch("/api/appraise-kpi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kpiCode, description, evidenceFileName, evidenceDescription, studentName })
  });

  if (!res.ok) {
    const apiErr = await parseErrorResponse(res, "Không thể thẩm định minh chứng KPI qua AI.");
    showCyberToast({
      type: "warning",
      title: `THẨM ĐỊNH KPI // ${apiErr.code}`,
      message: apiErr.message
    });
    throw apiErr;
  }

  const data = await res.json();
  showCyberToast({
    type: "success",
    title: "THẨM ĐỊNH KPI // HOÀN TẤT",
    message: `Đã thẩm định xong minh chứng cho tiêu chí ${kpiCode}.`
  });
  return data.assessment;
}

export async function generateLoginGreeting(): Promise<string> {
  try {
    const res = await fetch("/api/greeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "login" })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.greeting || "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!";
  } catch {
    return "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!";
  }
}

export async function generateDashboardGreeting(
  userName: string,
  major?: string,
  role?: string
): Promise<string> {
  try {
    const res = await fetch("/api/greeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "dashboard", userName, major, role })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return (
      data.greeting ||
      `Mừng bạn trở lại trạm không gian ${major || "Công nghệ Giáo dục"}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`
    );
  } catch {
    return `Mừng bạn trở lại trạm không gian ${major || "Công nghệ Giáo dục"}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`;
  }
}
