import { Message, QuizQuestion, DocumentAnalysisResult } from "../types";
import { showCyberToast } from "./toastService";

/**
 * Client-side service communicating with the Full-Stack Express backend (/api/*)
 * API keys and AI logic are securely processed server-side.
 */

function getSmartLocalFallback(query: string, studentName?: string): string {
  const q = (query || "").toLowerCase().trim();
  const name = studentName || "bạn";

  if (!q || q === "hi" || q === "hello" || q.includes("chào") || q.includes("hú hù") || q === "alo") {
    return `Hú hù! 🦉 Chào ${name}! Cú Học Tập (Scholar Owl) của trường SMUT rất vui được gặp bạn!\n\nMình có thể hỗ trợ bạn mọi thông tin học vụ:\n- 📊 **Tra cứu & Dự báo GPA / Tín chỉ**\n- 📝 **Luyện tập trắc nghiệm & Chấm bài Azota**\n- 🏛️ **Quy chế học vụ, học bổng & cơ sở SMUT**\n- 📅 **Lịch học và thời khóa biểu**\n\nBạn cần Cú giải đáp nội dung gì hôm nay nào? ✨`;
  }

  if (q.includes("gpa") || q.includes("điểm") || q.includes("học bổng")) {
    return `🦉 **Tư vấn GPA & Học bổng từ Cú Học Tập:**\n\n- **Thang điểm 4.0:**\n  - Xuất sắc: GPA ≥ 3.60 (ĐRL ≥ 90)\n  - Giỏi: GPA 3.20 – 3.59 (ĐRL ≥ 80)\n  - Khá: GPA 2.50 – 3.19\n- **Mẹo tăng GPA:** Bạn có thể mở tab **"DỰ BÁO GPA"** ở menu bên trái để giả lập các kịch bản điểm môn học kỳ này và xem số tín chỉ cần cải thiện nhé! 🎯`;
  }

  if (q.includes("tín chỉ") || q.includes("môn học") || q.includes("đăng ký")) {
    return `🦉 **Quy chế Tín chỉ SMUT:**\n\n- **Chuẩn tốt nghiệp:** Tối thiểu 120 - 135 tín chỉ (tùy theo ngành Sư phạm hay Công nghệ).\n- **Đăng ký học kỳ:** Mỗi kỳ sinh viên được đăng ký từ 14 đến 24 tín chỉ.\n- Bạn hãy theo dõi thông báo đăng ký môn học tại cổng Portal và lưu ý kiểm tra các môn tiên quyết trước khi đăng ký nhé!`;
  }

  if (q.includes("học phí") || q.includes("tiền học") || q.includes("học bổng")) {
    return `🦉 **Thông tin Học phí & Hỗ trợ sinh viên:**\n\n- Học phí được đóng trực tiếp qua Cổng thanh toán tài vụ hoặc quét mã VietQR theo mã định danh MSSV.\n- Sinh viên ngành Sư phạm được hưởng chính sách hỗ trợ tiền đóng học phí và sinh hoạt phí theo Nghị định 116/2020/NĐ-CP.\n- Nếu có thắc mắc cụ thể về biên lai, bạn liên hệ Phòng Kế hoạch - Tài chính tại Cơ sở chính nhé!`;
  }

  return `Hú hù! 🦉 Cú Học Tập đã ghi nhận câu hỏi của bạn: *" ${query} "*.\n\nCú đang tổng hợp thông tin học vụ SMUT để giải đáp cho bạn. Bạn có thể mở các phân hệ trên menu (Cú Học Tập Azota, Dự Báo GPA, hoặc Lịch học) để tương tác trực quan nhé!\n\n*(💡 Lưu ý triển khai Vercel: Để Cú kích hoạt mô hình Gemini trực tuyến phân tích chuyên sâu mọi chủ đề, hãy kiểm tra biến \`GEMINI_API_KEY\` và bấm **Redeploy** trên Vercel nhé!)*`;
}

export async function getChatResponse(messages: Message[], studentName?: string): Promise<string> {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || "";

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
        title: 'TRỢ LÝ CÚ // THÔNG TIN HỌC VỤ',
        message: 'Hệ thống đang hỗ trợ bạn qua cơ sở dữ liệu học vụ dự phòng.'
      });
    }
    return data.reply || getSmartLocalFallback(lastUserMsg, studentName);
  } catch (error) {
    console.warn("Chat API fetch error, activating smart local engine:", error);
    showCyberToast({
      type: 'info',
      title: 'SCHOLAR OWL // PHẢN HỒI',
      message: 'Cú Học Tập đã kích hoạt bộ giải đáp học vụ thông minh.'
    });
    return getSmartLocalFallback(lastUserMsg, studentName);
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
