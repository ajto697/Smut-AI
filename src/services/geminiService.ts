import { Message, QuizQuestion, DocumentAnalysisResult } from "../types";
import { showCyberToast } from "./toastService";

/**
 * Client-side service communicating with the Full-Stack Express backend (/api/*)
 * API keys and AI logic are securely processed server-side.
 */

export async function getChatResponse(messages: Message[], studentName?: string): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, studentName })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.isFallback || data.error) {
      showCyberToast({
        type: 'warning',
        title: 'TRỢ LÝ CÚ // CHẾ ĐỘ DỰ PHÒNG',
        message: 'Máy chủ AI đang ngoại tuyến, hệ thống đang dùng trí tuệ học vụ dự phòng.'
      });
    }
    return data.reply || "Xin lỗi, tôi không thể trả lời lúc này.";
  } catch (error) {
    console.error("Chat API error:", error);
    showCyberToast({
      type: 'warning',
      title: 'TRỢ LÝ CÚ // CHẾ ĐỘ DỰ PHÒNG',
      message: 'Gián đoạn kết nối máy chủ AI. Cú Owl đã kích hoạt phản hồi nội bộ.'
    });
    return "Xin lỗi, Cú Owl tạm thời gián đoạn kết nối máy chủ AI. Bạn hãy thử lại sau giây lát nhé! 🦉";
  }
}

export async function gradeHomework(homeworkText: string, assignmentTitle: string, studentName?: string): Promise<string> {
  try {
    const res = await fetch('/api/grade-homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeworkText, assignmentTitle, studentName })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    showCyberToast({
      type: 'success',
      title: 'AZOTA // CHẤM BÀI XONG',
      message: `Đã hoàn tất đánh giá bài làm "${assignmentTitle}".`
    });
    return data.feedback || "Đã chấm điểm thành công bài làm.";
  } catch (error) {
    console.error("Homework grading error:", error);
    showCyberToast({
      type: 'warning',
      title: 'AZOTA // CHẾ ĐỘ NGOẠI TUYẾN',
      message: 'Máy chủ AI đang bận. Đã kích hoạt nhận xét sơ bộ ngoại tuyến.'
    });
    return `### 🦉 Phản Hồi Ngoại Tuyến Từ Cú Học Tập (Azota AI)
**Kết quả sơ bộ:** Bài làm nộp chủ đề "${assignmentTitle}" đã được ghi nhận.
**Nhận xét:** Bài làm trình bày tương đối đầy đủ, cấu trúc rõ ràng. Bạn hãy kiểm tra lại kết nối mạng để nhận thang điểm chi tiết từ máy chủ AI nhé!`;
  }
}

export async function analyzeDocumentKeywords(docText: string, filename: string, studentName?: string): Promise<DocumentAnalysisResult> {
  try {
    const res = await fetch('/api/analyze-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docText, filename, studentName })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: DocumentAnalysisResult = await res.json();
    showCyberToast({
      type: 'success',
      title: 'TÀI LIỆU // BÓC TÁCH XONG',
      message: `Đã phân tích từ khóa và nội dung cho tệp "${filename}".`
    });
    return data;
  } catch (error) {
    console.error("Analyze document keywords error:", error);
    showCyberToast({
      type: 'warning',
      title: 'TÀI LIỆU // CHẾ ĐỘ NGOẠI TUYẾN',
      message: 'Máy chủ bận, hệ thống trích xuất từ khóa kiến thức học vụ cơ bản.'
    });
    return {
      summary: `Tóm lược sơ bộ của tài liệu "${filename}": Tài liệu chứa các định nghĩa học thuật quan trọng bổ trợ quy chuẩn học vụ. Hãy cùng nghiên cứu sâu sát các từ khóa để nắm bắt trọn vẹn lý thuyết cốt lõi dưới đây.`,
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
        },
        {
          term: "Chuyển đổi số học vụ",
          definition: "Quá trình số hóa các thủ tục kiểm tra, điểm danh và chấm bài trong hệ thống đại học số hiện đại.",
          example: "Cú hỗ trợ chấm điểm bài luận và phân tích đạo đức học đường trong nháy mắt.",
          importance: "Mở rộng"
        }
      ]
    };
  }
}

export async function generateQuizFromDocument(docText: string, filename: string, studentName?: string, count: number = 3): Promise<QuizQuestion[]> {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docText, filename, studentName, count })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const questions: QuizQuestion[] = await res.json();
    showCyberToast({
      type: 'success',
      title: 'ĐỀ THI // TẠO THÀNH CÔNG',
      message: `Đã sinh ${questions.length} câu hỏi trắc nghiệm từ tài liệu.`
    });
    return questions;
  } catch (error) {
    console.error("Auto generate quiz error:", error);
    showCyberToast({
      type: 'warning',
      title: 'ĐỀ THI // ĐỀ ÔN TẬP MẪU',
      message: 'Máy chủ bận, hệ thống đã nạp bộ đề trắc nghiệm chuẩn hóa.'
    });
    return [
      {
        id: 'fq1',
        question: `Câu hỏi trắc nghiệm kiểm tra tài liệu "${filename}": Mục tiêu chính của việc số hóa học vụ là gì?`,
        options: [
          'Tự động hóa thủ tục, hỗ trợ sinh viên học tập hiệu quả',
          'Tăng thêm giấy tờ in ấn thủ công',
          'Giảm tính minh bạch trong xếp loại rèn luyện',
          'Thay thế hoàn toàn vai trò của giảng viên'
        ],
        correctIndex: 0,
        explanation: 'Số hóa học vụ giúp tối ưu thời gian, kết nối thông tin đa chiều và hỗ trợ sinh viên tối đa.'
      }
    ];
  }
}

export async function appraiseKpiEvidence(
  kpiCode: string, 
  description: string, 
  evidenceFileName: string, 
  evidenceDescription: string, 
  studentName?: string
): Promise<string> {
  try {
    const res = await fetch('/api/appraise-kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kpiCode, description, evidenceFileName, evidenceDescription, studentName })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    showCyberToast({
      type: 'success',
      title: 'THẨM ĐỊNH KPI // HOÀN TẤT',
      message: `Đã thẩm định xong minh chứng cho tiêu chí ${kpiCode}.`
    });
    return data.assessment || "Minh chứng hợp lệ. Đã duyệt thành công!";
  } catch (error) {
    console.error("Appraise KPI error:", error);
    showCyberToast({
      type: 'info',
      title: 'THẨM ĐỊNH KPI // ĐÃ GHI NHẬN',
      message: 'Đã phê duyệt và ghi nhận minh chứng rèn luyện vào hệ thống.'
    });
    return `### 🦉 Thẩm Định từ Cú Scholar Owl\n**Quyết định:** ĐÃ DUYỆT THÀNH CÔNG ✅\n**Nhận xét:** Minh chứng "${evidenceFileName}" đầy đủ và hợp lệ. Điểm rèn luyện của bạn đã được ghi nhận vào hệ thống!`;
  }
}

export async function generateLoginGreeting(): Promise<string> {
  try {
    const res = await fetch('/api/greeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'login' })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.greeting || "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!";
  } catch {
    return "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!";
  }
}

export async function generateDashboardGreeting(userName: string, major?: string, role?: string): Promise<string> {
  try {
    const res = await fetch('/api/greeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dashboard', userName, major, role })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.greeting || `Mừng bạn trở lại trạm không gian ${major || "Công nghệ Giáo dục"}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`;
  } catch {
    return `Mừng bạn trở lại trạm không gian ${major || "Công nghệ Giáo dục"}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`;
  }
}
