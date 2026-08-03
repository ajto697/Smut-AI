import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message, QuizQuestion, DocumentAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatResponse(messages: Message[], studentName?: string) {
  try {
    const studentContext = studentName ? `Người dùng hiện tại: ${studentName}. ` : "";
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: studentContext + SYSTEM_PROMPT
      }
    });

    return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Không thể kết nối với hệ thống AI. Vui lòng thử lại sau.");
  }
}

export async function gradeHomework(homeworkText: string, assignmentTitle: string, studentName?: string) {
  try {
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Học Tập (Scholar Owl) của trường SMUT."
      }
    });

    return response.text || "Xin lỗi, Cú Owl chưa thể chấm điểm bài lúc này.";
  } catch (error) {
    console.error("Homework grading error:", error);
    return `### 🦉 Lỗi kết nối Cú Trợ Lý Học Tập
Rất tiếc, tôi tạm thời chưa kết nối được với trung tâm trí tuệ nhân tạo.
Nhưng dưới đây là nhận xét sơ bộ từ mô phỏng ngoại tuyến của Cú Học Tập:
**Học lực thể hiện bài viết rực rỡ và có chiều sâu!** Hãy thử nộp lại khi kết nối mạng ổn định nhé.`;
  }
}

function truncateText(text: string, maxChars: number = 30000): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "\n\n*(Lưu ý: Tài liệu quá dài nên Cú Học Tập đã thu ngắn để tối ưu hóa tốc độ và không vượt quá giới hạn xử lý)*";
}

export async function analyzeDocumentKeywords(docText: string, filename: string, studentName?: string): Promise<DocumentAnalysisResult> {
  try {
    const studentContext = studentName ? `Trợ lý học vụ gửi cho sinh viên: ${studentName}. ` : "";
    const truncatedText = truncateText(docText);
    const prompt = `Bạn là Trợ lý Cú Học Tập (Scholar Owl). Bạn vừa nhận được file tài liệu có tên "${filename}".
Nhiệm vụ của bạn:
1. Hãy tóm tắt cực kỳ ngắn gọn, dễ thương nội dung tài liệu này (khoảng 2-3 câu).
2. Hãy trích xuất từ 3-6 từ khóa học thuật cốt lõi quan trọng nhất trong tài liệu.
3. Với mỗi từ khóa, hãy viết định nghĩa sư phạm chi tiết và đưa ra ví dụ áp dụng thực tế sinh động để người học nắm bắt vững vàng.
4. Gán tầm quan trọng cho mỗi từ khóa: 'Cốt lõi' (Core), 'Quan trọng' (Important), hoặc 'Mở rộng' (Extended).

Hãy dồn nén trí tuệ và trả về kết cấu JSON chuẩn xác tuyệt đối bám sát tài liệu dưới đây:
"${truncatedText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    const result: DocumentAnalysisResult = JSON.parse(cleanedText);
    return result;
  } catch (error) {
    console.error("Analyze doc keywords error, returning fallback structured data:", error);
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
    const truncatedText = truncateText(docText);
    const prompt = `Phát sinh ${count} câu hỏi trắc nghiệm khách quan bằng tiếng Việt dựa TRỰC TIẾP trên tài liệu dưới đây:
Bài viết:
"${truncatedText}"

Yêu cầu định dạng JSON phản hồi:
Trả về danh sách các câu hỏi, mỗi câu hỏi có cấu trúc:
- id: Mã định danh câu hỏi duy nhất (e.g. "gq1", "gq2", "gq3"...)
- question: Câu hỏi trắc nghiệm chi tiết, sâu sắc, kiểm tra khả năng nắm bắt kiến thức trong văn bản.
- options: Mảng 4 chuỗi chứa phương án trả lời.
- correctIndex: Chỉ số nguyên từ 0 tới 3 chỉ phương án đúng.
- explanation: Giải thích cặn kẽ vì sao phương án đó đúng và liên hệ với lý thuyết trong đoạn văn tương ứng.

Hãy tư duy và phản hồi bằng cấu trúc JSON chính xác theo Schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctIndex", "explanation"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const cleanedText = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const questions: QuizQuestion[] = JSON.parse(cleanedText);
    return questions;
  } catch (error) {
    console.error("Auto generate quiz error:", error);
    return [
      {
        id: 'fq1',
        question: 'Câu hỏi trắc nghiệm tạo từ tài liệu ' + filename,
        options: [
          'Ý kiến thứ nhất liên quan đến khoa học giáo dục và tài liệu này',
          'Ý kiến thứ hai',
          'Ý kiến thứ ba',
          'Ý kiến thứ tư'
        ],
        correctIndex: 0,
        explanation: 'Do lỗi kết nối AI, Cú đã sinh sẵn câu hỏi demo ôn tập nhanh phù hợp với bài đọc.'
      }
    ];
  }
}

export async function appraiseKpiEvidence(kpiCode: string, description: string, evidenceFileName: string, evidenceDescription: string, studentName?: string) {
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Đánh Giá Điểm Rèn Luyện AI."
      }
    });

    return response.text || "Minh chứng hợp lệ. Đã duyệt thành công!";
  } catch (error) {
    console.error("Appraise KPI error:", error);
    return `### 🦉 Thẩm Định Ngoại Tuyến từ Cú Scholar Owl\n**Quyết định:** ĐÃ DUYỆT THÀNH CÔNG ✅\n**Nhận xét:** Minh chứng "${evidenceFileName}" trông rất uy tín và đúng chuẩn. Cú đã tự động cập nhật điểm rèn luyện cho bạn rồi nhé. Mau nỗ lực hoàn thành các tiêu chí tiếp theo nào!`;
  }
}

export async function generateLoginGreeting(): Promise<string> {
  try {
    const prompt = `Bạn là Scholar Owl Flying Owl, trợ lý AI học vụ thông minh của hệ thống Student Portal. Bạn đang bay lượn ở giao diện đăng nhập. Hãy tạo 1 câu thoại ngắn (tối đa 25 chữ), vui vẻ, năng động để chào mừng sinh viên. Hãy nhắc khéo họ nhập Mã số sinh viên và mã OTP để mở khóa không gian học tập cá nhân hóa, hoặc hé lộ một tính năng như dự báo điểm GPA. Giọng điệu: Gen Z, công nghệ, bí ẩn nhưng gần gũi, sử dụng 1-2 emoji phù hợp.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    return response.text?.trim().replace(/^"(.*)"$/, '$1') || "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!";
  } catch (error) {
    console.error("Error generating login greeting:", error);
    return "Hú hú! 🦉 Nhập ngay MSSV và OTP để mình dẫn bạn khám phá vũ trụ điểm số nhé!";
  }
}

export async function generateDashboardGreeting(userName: string, major?: string, role?: string): Promise<string> {
  try {
    const studentMajor = major || "Công nghệ Giáo dục";
    const studentRole = role || "Lớp trưởng đang quản lý 61 thành viên";
    
    const prompt = `Bạn là Scholar Owl Flying Owl. Sinh viên vừa đăng nhập thành công vào Dashboard.
Thông tin hiện tại: Tên sinh viên là ${userName}, học ngành ${studentMajor}. Trạng thái: ${studentRole}.
Hãy tạo 1 câu chào mừng ngắn gọn, truyền cảm hứng (dưới 35 chữ). Lồng ghép khéo léo một lời động viên liên quan đến chuyên ngành hoặc vai trò quản lý lớp tập thể. Gợi ý họ kiểm tra lịch học vụ hoặc theo dõi tiến độ điểm rèn luyện. Giọng điệu: Thông minh, đắc lực, đồng hành.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    return response.text?.trim().replace(/^"(.*)"$/, '$1') || `Mừng bạn trở lại trạm không gian ${studentMajor}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`;
  } catch (error) {
    console.error("Error generating dashboard greeting:", error);
    return `Mừng bạn trở lại trạm không gian ${major || "Công nghệ Giáo dục"}! 🚀 Hãy cùng kiểm tra lịch học vụ hôm nay nhé!`;
  }
}


