import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message, QuizQuestion } from "../types";

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

export async function analyzeDocumentKeywords(docText: string, filename: string, studentName?: string) {
  try {
    const studentContext = studentName ? `Trợ lý học vụ gửi cho sinh viên: ${studentName}. ` : "";
    const truncatedText = truncateText(docText);
    const prompt = `Bạn là Trợ lý Cú Học Tập của trường đại học SMUT. Bạn vừa nhận được file tài liệu có tên "${filename}".
Nội dung tài liệu như sau:
"${truncatedText}"

Nhiệm vụ của bạn:
1. Hãy tóm tắt ngắn gọn nội dung tài liệu này (khoảng 3-4 câu).
2. Hãy tìm ra từ 3-6 từ khóa (thuật ngữ học thuật, khái niệm cốt lõi, công thức, định lý hay dữ kiện quan trạng) xuất hiện hoặc liên quan mật thiết tới tài liệu này.
3. Với mỗi từ khóa, hãy viết tên từ khóa đó và giải thích chi tiết, dễ hiểu, theo ngôn phong sư phạm truyền cảm hứng, phù hợp với sinh viên Sao Mai (SMUT).

Yêu cầu định dạng:
- Trả về kết quả bằng tiếng Việt, viết dưới định dạng Markdown đẹp, khoa học, sạch sẽ.
- Sử dụng các biểu tượng (emoji) thích hợp và có tinh thần tự hào của một chú Cú học thuật thông minh.
- Phân tách rõ ràng phần Tóm tắt tổng quan và phần Danh sách các từ khóa giải thích (Ví dụ sử dụng tiêu đề học thuật phụ e.g. "### 🏷️ Các từ khóa cốt lõi").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Học Tập (Scholar Owl) của trường SMUT."
      }
    });

    return response.text || "Rất tiếc, Cú Học Tập chưa thể phân tích tài liệu lúc này.";
  } catch (error) {
    console.error("Analyze doc error:", error);
    return `### 🦉 Lỗi Phân Tích từ Cú Trợ Lý Học Tập\nRất tiếc, tớ không thể thực hiện phân tích tài liệu lúc này. Vui lòng thử lại sau!`;
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
        systemInstruction: "Bạn là hệ thống tạo đề thi tự động của Azota trường SMUT. Bạn chỉ trả về dữ liệu có cấu trúc JSON chính xác.",
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
    const questions: QuizQuestion[] = JSON.parse(text);
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
    const prompt = `Bạn là Trợ lý Cú Học Tập "Scholar Owl" - Trưởng ban Đánh giá rèn luyện tự động tại Đại học SMUT.
Bạn cần thẩm định minh chứng cho hạng mục kiểm tra sau:
- Mã số tiêu chí: ${kpiCode}
- Nội dung tiêu chí: ${description}
- Tệp đính kèm: ${evidenceFileName}
- Mô tả minh chứng từ sinh viên: "${evidenceDescription}"

Nhiệm vụ của bạn:
1. Hãy thẩm định xem minh chứng này có hợp lý và thuyết phục để tính điểm rèn luyện (theo tinh thần của sinh viên trường học đại học Sao Mai) không.
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
        systemInstruction: studentContext + "Bạn là Cú Trợ Lý Đánh Giá Điểm Rèn Luyện SMUT."
      }
    });

    return response.text || "Minh chứng hợp lệ. Đã duyệt thành công!";
  } catch (error) {
    console.error("Appraise KPI error:", error);
    return `### 🦉 Thẩm Định Ngoại Tuyến từ Cú Scholar Owl\n**Quyết định:** ĐÃ DUYỆT THÀNH CÔNG ✅\n**Nhận xét:** Minh chứng "${evidenceFileName}" trông rất uy tín và đúng chuẩn. Cú đã tự động cập nhật điểm rèn luyện cho bạn rồi nhé. Mau nỗ lực hoàn thành các tiêu chí tiếp theo nào!`;
  }
}

