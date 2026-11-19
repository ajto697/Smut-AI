import { generateAIContent, isAiConfigured, setCorsHeaders } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
    return res.status(200).json({ greeting: fallbackText, isAi: false });
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
    return res.status(200).json({
      greeting: generated || (type === "dashboard" ? defaultDashboardGreetings[0] : defaultLoginGreetings[0]),
      isAi: true
    });
  } catch {
    const chosenList = type === "dashboard" ? defaultDashboardGreetings : defaultLoginGreetings;
    const fallbackText = chosenList[Math.floor(Math.random() * chosenList.length)];
    return res.status(200).json({ greeting: fallbackText, isAi: false });
  }
}
