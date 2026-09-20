import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Award, CheckCircle, AlertTriangle, Clock, Play, FileText, Upload, Sparkles, Send, HelpCircle, Flame, ArrowRight, RefreshCw, X, Check, CheckSquare, Trash, Plus, Volume2, VolumeX } from 'lucide-react';
import { QuizSubject, QuizQuestion, DocumentAnalysisResult } from '../types';
import { gradeHomework, analyzeDocumentKeywords, generateQuizFromDocument, appraiseKpiEvidence } from '../services/geminiService';
import { subscribeToStudentKpis, updateKpiInFirestore, saveQuizResultToFirestore } from '../services/kpiService';

const MOCK_QUIZZES: QuizSubject[] = [
  {
    id: 'ai-basic',
    name: 'Nhập môn Trí tuệ Nhân tạo',
    icon: '🤖',
    questions: [
      {
        id: 'q1',
        question: 'Thuật toán A* là đại diện tiêu biểu của dạng tìm kiếm nào sau đây?',
        options: [
          'Tìm kiếm mù (Uninformed Search)',
          'Tìm kiếm có tri thức (Informed / Heuristic Search)',
          'Tìm kiếm ngẫu nhiên (Random Search)',
          'Tìm kiếm theo chiều sâu (DFS)'
        ],
        correctIndex: 1,
        explanation: 'Thuật toán A* sử dụng hàm đánh giá f(n) = g(n) + h(n), trong đó h(n) là hàm Heuristic cung cấp tri thức bổ sung về khoảng cách tới đích, do đó đây là thuật toán tìm kiếm có tri thức.'
      },
      {
        id: 'q2',
        question: 'Trong học máy (Machine Learning), Overfitting (Quá khớp) xảy ra khi nào?',
        options: [
          'Mô hình hoạt động tốt cả trên tập huấn luyện và tập kiểm thử.',
          'Mô hình hoạt động kém trên cả tập huấn luyện và tập kiểm thử.',
          'Mô hình quá phức tạp, học cả nhiễu của dữ liệu huấn luyện dẫn đến kết quả kém trên tập kiểm thử.',
          'Mô hình quá đơn giản nên không nắm bắt được xu hướng dữ liệu.'
        ],
        correctIndex: 2,
        explanation: 'Overfitting xảy ra khi mô hình quá khớp với tập huấn luyện (thậm chí là ghi nhớ nhiễu), làm giảm khả năng tổng quát hóa trên dữ liệu mới.'
      },
      {
        id: 'q3',
        question: 'Kỹ thuật "Prompt Engineering" chủ yếu áp dụng vào dòng mô hình AI nào?',
        options: [
          'Mô hình phân loại ảnh (CNN)',
          'Hệ thống mạng nơ-ron hồi quy (RNN)',
          'Mô hình ngôn ngữ lớn (LLM - Large Language Models)',
          'Thuật toán phân cụm K-Means'
        ],
        correctIndex: 3,
        explanation: 'Prompt Engineering là nghệ thuật thiết kế và tối ưu câu lệnh điều hướng để tinh chỉnh phản hồi từ các mô hình ngôn ngữ lớn như Gemini, GPT, Claude.'
      }
    ]
  },
  {
    id: 'web-adv',
    name: 'Thiết kế Web Nâng cao',
    icon: '🌐',
    questions: [
      {
        id: 'qw1',
        question: 'Trong React, Virtual DOM giúp tăng tốc độ cập nhật giao diện thông qua cơ chế nào?',
        options: [
          'Tự động tải lại trang không cần F5.',
          'Tính toán sự khác biệt (diffing) rồi cập nhật tối thiểu vào Real DOM thực tế.',
          'Chuyển đổi toàn bộ code JavaScript thành WebAssembly.',
          'Lưu trữ toàn bộ database của client vào bộ nhớ RAM.'
        ],
        correctIndex: 1,
        explanation: 'Virtual DOM tạo một bản sao gọn nhẹ trong bộ nhớ. Khi state thay đổi, React chạy thuật toán Diffing để tìm sự thay đổi nhỏ nhất cần cập nhật trên DOM thật, tối ưu hiệu năng render.'
      },
      {
        id: 'qw2',
        question: 'Thuộc tính CSS "position: sticky" có đặc tính kết hợp từ hai loại định vị nào?',
        options: [
          'absolute & relative',
          'fixed & absolute',
          'relative & fixed',
          'static & relative'
        ],
        correctIndex: 2,
        explanation: 'Position sticky hoạt động như relative khi phần tử nằm trong viewport bình thường và chuyển thành fixed khi cuộn trang vượt qua ngưỡng quy định.'
      }
    ]
  }
];

const OWL_COMMENTARY = {
  welcoming: 'Chào bạn học viên chăm chỉ! 🦉 Hôm nay cùng tớ rèn luyện trí tuệ, tự tin đạt điểm tuyệt đối nhé!',
  thinking: 'Mmm, một câu hỏi khá hóc búa đây! Hãy đọc thật kỹ các phương án trước khi đưa ra quyết định.',
  speedAlert: 'Thời gian trôi nhanh lắm, tập trung làm bài và đừng để ý xung quanh nha bạn ơi!',
  correct: 'Xuất sắc tuyệt vời! Đúng chuẩn sinh viên gương mẫu rồi. Tiếp tục thôi nào!',
  incorrect: 'Không sao cả, sai sót là mẹ thành công! Để tớ giải thích cặn kẽ vì sao câu này chưa đúng nhé.',
  finished: 'Tuyệt diệu! Bạn đã hoàn thành bài thi thử xuất sắc. Hãy xem lại báo cáo chi tiết nhé!'
};

export interface SMUT_KPI_Item {
  id: string;
  code: string;
  points: number;
  category: string;
  description: string;
  suggestedEvidence: string;
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  evidenceFile?: string;
  evidenceText?: string;
  evidenceImage?: string;
  comment?: string;
}

const INITIAL_KPIS: SMUT_KPI_Item[] = [
  {
    id: "kpi-1",
    code: "KPI 1",
    points: 5,
    category: "Ý thức nội quy & Hoạt động chính trị xã hội",
    description: "Hoàn thành bài trắc nghiệm tìm hiểu về các văn bản và luật có liên quan đến đạo đức nghề nghiệp.",
    suggestedEvidence: "Ảnh chụp màn hình kết quả thi đạt 10/10 hoặc giấy chứng nhận pháp luật.",
    status: "approved",
    evidenceFile: "minh_chung_trac_nghiem_phap_luat_2026.png",
    evidenceText: "Đã vượt qua bài kiểm tra luật đạo đức nghề nghiệp và pháp luật tại cổng Azota điểm tối đa 10/10.",
    evidenceImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80",
    comment: "Cú Học Tập xác nhận: Kết quả chính xác 100%. Tự động tích lũy +5 điểm rèn luyện! 🦉🏆"
  },
  {
    id: "kpi-2",
    code: "KPI 2",
    points: 5,
    category: "Ý thức nội quy & Hoạt động chính trị xã hội",
    description: "Tham gia 01 buổi học tập chính trị, nghị quyết hoặc tuần sinh hoạt công dân đầu năm.",
    suggestedEvidence: "Ảnh chụp điểm danh có mã QR hoặc giấy xác nhận sinh hoạt chính trị.",
    status: "pending",
    evidenceFile: "minh_chung_shcd_2026.png",
    evidenceText: "Điểm danh tuần lễ sinh hoạt công dân trực tuyến tại giảng đường.",
    evidenceImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80",
    comment: "Cú đang thẩm định: Đang so khớp với lịch biểu rèn luyện của lớp học phần."
  },
  {
    id: "kpi-3",
    code: "KPI 3",
    points: 5,
    category: "Ý thức nội quy & Hoạt động chính trị xã hội",
    description: "Tham gia 02 hoạt động do Đoàn trường ĐHGD / ĐHQGHN tổ chức; có ý thức chung, phấn đấu vì tập thể.",
    suggestedEvidence: "Giấy chứng nhận hoạt động Đoàn hoặc ảnh chụp xác thực chi đoàn đóng dấu.",
    status: "not_submitted"
  },
  {
    id: "kpi-4",
    code: "KPI 4",
    points: 10,
    category: "Ý thức nội quy & Hoạt động chính trị xã hội",
    description: "Tham gia tối thiểu 01 trong các hoạt động: hoạt động XH, tình nguyện, thiện nguyện, CLB trong & ngoài trường.",
    suggestedEvidence: "Giấy chứng nhận tham gia hiến máu nhân đạo, Mùa hè xanh hoặc giấy xác nhận công tác cứu trợ lũ lụt.",
    status: "not_submitted"
  },
  {
    id: "kpi-5",
    code: "KPI 5",
    points: 5,
    category: "Mối quan hệ với các đối tượng (Giao tiếp)",
    description: "Xem, đọc và viết chia sẻ cảm nhận về các câu chuyện, phim truyền cảm hứng, mang giá trị yêu thương, khoan dung.",
    suggestedEvidence: "Bài viết cảm nhận cảm xúc (300-500 từ) nộp kèm link bài đăng chế độ công khai trên MXH.",
    status: "not_submitted"
  },
  {
    id: "kpi-6",
    code: "KPI 6",
    points: 5,
    category: "Mối quan hệ với các đối tượng (Giao tiếp)",
    description: "Đóng vai xử lý tối thiểu 01 tình huống thực tế qua quan sát clip học đường dựa trên tinh thần công bằng, tôn trọng.",
    suggestedEvidence: "Biên bản họp nhóm lớp thảo luận kỹ năng ứng xử thực hành.",
    status: "not_submitted"
  },
  {
    id: "kpi-7",
    code: "KPI 7",
    points: 5,
    category: "Mối quan hệ với các đối tượng (Giao tiếp)",
    description: "Hoàn thành khóa đào tạo kỹ năng quản lý cảm xúc khi gặp tình huống xung đột xảy ra.",
    suggestedEvidence: "Chứng nhận điện tử khóa kỹ năng kết nối hành vi của Ban điều hành.",
    status: "not_submitted"
  },
  {
    id: "kpi-8",
    code: "KPI 8",
    points: 5,
    category: "Lối sống & Phong cách tác phong",
    description: "Trực nhật tối thiểu 3 buổi/HK phòng học, phòng thí nghiệm, phòng thực hành hoặc khuôn viên cơ sở.",
    suggestedEvidence: "Bảng phân công trực nhật có chữ ký xác nhận của ban quản lý giảng đường.",
    status: "not_submitted"
  },
  {
    id: "kpi-9",
    code: "KPI 9",
    points: 5,
    category: "Lối sống & Phong cách tác phong",
    description: "Thực hiện tối thiểu 01 hoạt động cải tạo môi trường (trồng 01 cây xanh hoặc trang trí phòng học gọn gàng).",
    suggestedEvidence: "Ảnh chụp selfie khoảnh khắc trồng cây xanh, chăm sóc hoa lớp hoặc dọn dẹp khuôn viên chung.",
    status: "approved",
    evidenceFile: "minh_chung_trong_cay_hoa_cuc.jpg",
    evidenceText: "Trồng 1 chậu hoa tươi trang trí cửa sổ hành lang lớp học.",
    evidenceImage: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=300&q=80",
    comment: "Đã duyệt! Chậu hoa xinh xắn giúp không gian lớp học thêm xanh tươi, lành mạnh! +5 điểm rèn luyện."
  },
  {
    id: "kpi-10",
    code: "KPI 10",
    points: 5,
    category: "Lối sống & Phong cách tác phong",
    description: "Trang phục, trang sức khi thực hiện nhiệm vụ phải gọn gàng, lịch sự, đúng chuẩn sư phạm, không phản cảm.",
    suggestedEvidence: "Cam kết chấp hành tác phong sinh viên rực rỡ và xác thực của cố vấn học tập lớp.",
    status: "approved",
    evidenceFile: "cam_ket_phong_cach_hoc_duong.pdf",
    evidenceText: "Cam kết thời trang học đường lịch sự khi lên lớp.",
    evidenceImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=80",
    comment: "Cố vấn lớp xét duyệt: Tác phong của bạn luôn chuẩn mực, thanh tú."
  },
  {
    id: "kpi-11",
    code: "KPI 11",
    points: 5,
    category: "Lối sống & Phong cách tác phong",
    description: "Tham gia tối thiểu 01 hoạt động nhằm tuyên truyền các biểu hiện của nếp sống văn minh học đường.",
    suggestedEvidence: "Báo cáo hoặc hình ảnh chia sẻ thông điệp văn minh lớp.",
    status: "not_submitted"
  },
  {
    id: "kpi-12",
    code: "KPI 12",
    points: 5,
    category: "Lối sống & Phong cách tác phong",
    description: "Có lối sống lành mạnh; sử dụng mạng xã hội lành bộc lộ tư duy văn minh, mục đích tích cực.",
    suggestedEvidence: "Ảnh screenshot bài đăng đóng góp kiến thức học tập, chia sẻ thông tin học bổng.",
    status: "not_submitted"
  },
  {
    id: "kpi-13",
    code: "KPI 13",
    points: 10,
    category: "Ý thức & Kết quả học tập chuyên môn",
    description: "Tham gia đầy đủ, trách nhiệm hoạt động của lớp học phần, đủ điều kiện thi hết môn, rèn luyện nghiệp vụ sư phạm.",
    suggestedEvidence: "Danh sách xác nhận chuyên cần đạt mức tối đa 100% của Portal quản lý giảng dạy.",
    status: "not_submitted"
  },
  {
    id: "kpi-14",
    code: "KPI 14",
    points: 5,
    category: "Ý thức & Kết quả học tập chuyên môn",
    description: "Thực hiện nghiêm túc, đầy đủ quy chế phòng thi và các đợt kiểm tra đánh giá.",
    suggestedEvidence: "Cam kết phòng thi trung thực ký số trực tuyến hoặc giấy xác nhận phòng đào tạo.",
    status: "approved",
    evidenceFile: "cam_ket_trung_thuc_quy_che_thi_smut.pdf",
    evidenceText: "Không vi phạm bất kỳ nội quy thi cử nào trong học kỳ.",
    evidenceImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80",
    comment: "Phê duyệt tuyệt đối từ hệ thống giám sát thi cử của trường!"
  },
  {
    id: "kpi-15",
    code: "KPI 15",
    points: 10,
    category: "Ý thức & Kết quả học tập chuyên môn",
    description: "Đạt điểm trung bình học tập và số tín chỉ quy đổi đúng thời hạn mà không bị cảnh cáo học vụ.",
    suggestedEvidence: "Ảnh chụp bảng điểm CPA học kỳ hiện tại đạt kết quả tối ưu (>2.5/4.0).",
    status: "not_submitted"
  },
  {
    id: "kpi-16",
    code: "KPI 16",
    points: 5,
    category: "Ý thức & Kết quả học tập chuyên môn",
    description: "Tham gia tối thiểu 02 buổi hỗ trợ tư vấn, hướng dẫn, trợ giảng tại cơ sở thực tập/kiến tập/học nhóm.",
    suggestedEvidence: "Nhận xét có dấu xác nhận của hiệu trưởng cơ sở hoặc nhóm trưởng lớp tổ chức học tập.",
    status: "not_submitted"
  },
  {
    id: "kpi-17",
    code: "KPI 17",
    points: 10,
    category: "Ý thức & Kết quả học tập chuyên môn",
    description: "Viết bài thu hoạch ghi lại trải nghiệm sau học kỳ, xây dựng kế hoạch rèn luyện cá nhân vượt khó kỳ tiếp theo.",
    suggestedEvidence: "Tải lên tài liệu tiểu luận thu hoạch tự thuật dài trên 1000 từ.",
    status: "not_submitted"
  },
  {
    id: "kpi-18",
    code: "KPI 18",
    points: 5,
    category: "Ý thức & Kết quả học tập chuyên môn",
    description: "Viết bài thu hoạch tổng kết: tích lũy sản phẩm rèn luyện qua các kỳ học và đề xuất bản thân.",
    suggestedEvidence: "File báo cáo đạo đức nghề nghiệp tích lũy nộp cho khoa.",
    status: "not_submitted"
  }
];

const ESSAY_SAMPLES = {
  ai: {
    title: "Essay: Vai trò của AI trong giáo dục số tại Việt Nam",
    text: `ĐỀ TÀI: PHÂN TÍCH VAI TRÒ CỦA AI TRONG GIÁO DỤC SỐ
Tác giả: Sinh viên khoa Công nghệ Giáo dục

Trí tuệ nhân tạo (AI) đang định hình lại toàn bộ nền tảng giáo dục toàn cầu nói chung và Việt Nam nói riêng. Trong kỷ nguyên chuyển đổi số, AI không còn là một công nghệ phụ trợ mà đã trở thành động cơ cốt lõi thúc đẩy cá nhân hóa lộ trình học tập của học viên.

Thứ nhất, AI tăng khả năng học tập thích ứng (adaptive learning). Thay vì một giáo trình chung cho cả lớp 60 người, hệ thống AI phân tích điểm mạnh, điểm yếu và sở thích của từng sinh viên để đưa ra bài tập thử thách phù hợp. Những sinh viên tiếp thu chậm có thêm thời gian rèn luyện, trong khi những bạn khá giỏi có thể tăng tốc học sớm.

Thứ hai, AI cải thiện năng suất giảng dạy của giáo viên. Các công cụ chấm điểm tự động hỗ trợ giáo viên giải quyết áp lực từ chấm bài, nhờ đó họ tập trung tối đa thời gian vào việc tư vấn tâm lý, định hướng đạo đức nghề nghiệp và bồi dưỡng tư duy phản biện cho thế hệ trẻ.

Tuy nhiên, việc triển khai AI cũng đối mặt với một vài nguy cơ như sự suy giảm tính sáng tạo tự thân của người học khi quá phụ thuộc vào mô hình sinh ngôn ngữ lớn (LLM), cũng như nguy cơ mất an toàn bảo mật thông tin học đường. Do đó, cần có sự kết hợp chặt chẽ mang tính sư phạm giữa công cụ thông minh và lương tâm nhà giáo.`
  },
  ethics: {
    title: "Tiểu luận: Đạo đức của nhà giáo trong thời đại trí tuệ nhân tạo",
    text: `ĐỀ TÀI: ĐẠO ĐỨC NHÀ GIÁO VÀ CHUẨN MỰC TÁC PHONG SƯ PHẠM THỜI ĐẠI SỐ

Trong sự chuyển mình mạnh mẽ của kỷ nguyên số, khi tri thức có thể dễ dàng tìm kiếm qua một câu hỏi gửi tới chatbot AI, vai trò cốt lõi của người thầy không bị lu mờ đi mà trái lại, càng trở nên thiêng liêng và quan trọng ở góc độ nhân bản học đường.

Một trong những khía cạnh cốt lõi của đạo đức nhà giáo hiện đại chính là giáo dục nhân cách thông qua tấm gương thực tế. Robot có thể giảng dạy lý thuyết, nhưng không thể có lòng nhân ái, lòng khoan dung hay tư cách sư phạm thanh thanh. Người thầy phải truyền đạt nếp sống văn minh, chuẩn mực ứng xử công bằng, văn hóa đối xử giữa người với người cho sinh viên.

Đồng thời, sự trung thực trong học thuật cũng là một bộ quy chuẩn đạo đức tối thượng cần được bảo vệ. Nhà giáo cần hướng dẫn người học nỗ lực nghiên cứu, tôn trọng bản quyền sở hữu trí tuệ, tránh sử dụng các công cụ tạo sinh để ngụy tạo kiến thức học vụ. Chỉ bằng sự tận hiến và chân thành, chúng ta mới kiến tạo nên một thế học sinh lành mạnh và bứt phá xuất sắc.`
  },
  stress: {
    title: "Dự thảo: Giải pháp giảm thiểu áp lực học vụ cho sinh viên",
    text: `ĐỀ TÀI: ĐỀ XUẤT CÁC GIẢI PHÁP GIẢM ÁP LỰC HỌC TẬP CHO SINH VIÊN

Áp lực học tập và thi cử luôn là vấn đề nhức nhối trong tâm lý học đường tại các trường đại học lớn. Để giải quyết triệt để bài toán này, nhóm nghiên cứu đề xuất một số giải pháp đồng bộ và sáng tạo:

Một là, tích hợp mô hình "Lớp học đảo ngược" (Flipped Classroom). Sinh viên tự đọc tài liệu ở nhà thông qua cổng học liệu số, và thời gian lên lớp sẽ dành trọn vẹn cho tranh luận, giải đáp các thắc mắc chuyên sâu và thực hiện thảo luận nhóm xử lý tình huống.

Hai là, số hóa hoạt động rèn luyện điểm số thông qua các chatbot và cổng thẩm duyệt tự động (như Cú tích cực). Hạn chế sự rườm rà về mặt giấy tờ hành chính thủ tục sẽ giải phóng đáng kể quỹ thời gian cho sinh viên tập trung vào các hoạt động sáng tạo cộng đồng, thể dục thể thao lành mạnh và kết nối kết bạn xã hội.

Ba là, nhà trường cần tăng cường phòng tham vấn tâm lý học thuật định kỳ để lắng nghe, thấu cảm và giải đáp nhẹ nhàng các trăn trước của học viên trong cuộc sống.`
  }
};

export const StudyOwlAzota: React.FC<{ studentName?: string; studentId?: string }> = ({ studentName, studentId }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'document' | 'homework' | 'kpi'>('quiz');
  const [quizSubjects, setQuizSubjects] = useState<QuizSubject[]>(MOCK_QUIZZES);

  // Speech TTS States
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz States
  const [selectedSubject, setSelectedSubject] = useState<QuizSubject | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [quizFinished, setQuizFinished] = useState(false);
  const [owlComment, setOwlComment] = useState(OWL_COMMENTARY.welcoming);

  // Custom Quiz Creator States
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState('Đề ôn luyện cá nhân tự soạn');
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customOptions, setCustomOptions] = useState<string[]>(['', '', '', '']);
  const [customCorrectIndex, setCustomCorrectIndex] = useState(0);
  const [customExplanation, setCustomExplanation] = useState('');

  // Document AI States
  const [docFileName, setDocFileName] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docKeywordsResult, setDocKeywordsResult] = useState<DocumentAnalysisResult | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [docQuizQuestions, setDocQuizQuestions] = useState<QuizQuestion[]>([]);
  const [docQuizCount, setDocQuizCount] = useState<number>(3);
  const [isDocDropped, setIsDocDropped] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Homework Evaluation States
  const [assignmentTitle, setAssignmentTitle] = useState('Essay: Phân tích vai trò của AI trong giáo dục số');
  const [homeworkText, setHomeworkText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<string | null>(null);
  const [isDropped, setIsDropped] = useState(false);
  const hwFileInputRef = React.useRef<HTMLInputElement>(null);

  // KPI States - Restored persistently from Firestore with LocalStorage fallback
  const [kpis, setKpis] = useState<SMUT_KPI_Item[]>(() => {
    try {
      const saved = localStorage.getItem('smut_scholar_owl_kpis');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Unable to load persistent KPIs:", e);
    }
    return INITIAL_KPIS;
  });
  const [selectedKpi, setSelectedKpi] = useState<SMUT_KPI_Item | null>(null);
  const [evidenceFileNameInput, setEvidenceFileNameInput] = useState('');
  const [evidenceTextDesc, setEvidenceTextDesc] = useState('');
  const [uploadedEvidencePreview, setUploadedEvidencePreview] = useState<string | null>(null);
  const [isKpiDropOver, setIsKpiDropOver] = useState(false);
  const kpiFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isVerifyingKpi, setIsVerifyingKpi] = useState(false);
  const [kpiAnalysisFeedback, setKpiAnalysisFeedback] = useState<string | null>(null);
  const [selectedKpiCategory, setSelectedKpiCategory] = useState<string>("Tất cả");

  const handleKpiFileSelect = (file: File) => {
    setEvidenceFileNameInput(file.name);
    if (!evidenceTextDesc.trim()) {
      setEvidenceTextDesc(`Minh chứng "${file.name}" xác nhận hoàn thành tiêu chuẩn rèn luyện.`);
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedEvidencePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedEvidencePreview(null);
    }
  };

  // Sync KPIs in real time with Cloud Firestore
  useEffect(() => {
    const activeStudentId = studentId || '25010001';
    const unsubscribe = subscribeToStudentKpis(activeStudentId, INITIAL_KPIS, (syncedKpis) => {
      setKpis(syncedKpis);
      try {
        localStorage.setItem('smut_scholar_owl_kpis', JSON.stringify(syncedKpis));
      } catch (e) {
        // ignore
      }
    });
    return () => unsubscribe();
  }, [studentId]);

  // Sync KPIs count changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smut_scholar_owl_kpis', JSON.stringify(kpis));
    } catch (e) {
      console.error("Unable to store persistent KPIs:", e);
    }
  }, [kpis]);

  // Vietnamese Web Speech synthesis helper
  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any running speech first
    window.speechSynthesis.cancel();
    
    // Eliminate complex characters/emojis for silky reading
    const cleanedText = textToSpeak
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/_/g, "")
      .trim();

    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'vi-VN';
    
    const voices = window.speechSynthesis.getVoices();
    const vietnameseVoice = voices.find(v => v.lang.includes('vi') || v.lang.toLowerCase().includes('vietnam'));
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }
    utterance.rate = 0.95; // Slightly slower for warm and clear feedback
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const getMockImageByFilename = (filename: string) => {
    if (filename.toLowerCase().includes("trac_nghiem")) return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80";
    if (filename.toLowerCase().includes("hien_mau")) return "https://images.unsplash.com/photo-1615461066841-6116ecdacd04?auto=format&fit=crop&w=300&q=80";
    if (filename.toLowerCase().includes("chu_nhat_xanh") || filename.toLowerCase().includes("trong_cay") || filename.toLowerCase().includes("hoa")) return "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=300&q=80";
    if (filename.toLowerCase().includes("diem") || filename.toLowerCase().includes("cam_doan")) return "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=300&q=80";
    if (filename.toLowerCase().includes("thu_hoach")) return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=300&q=80";
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80";
  };

  const handleVerifyKpi = async () => {
    if (!selectedKpi) return;
    if (!evidenceFileNameInput.trim() || !evidenceTextDesc.trim()) return;

    setIsVerifyingKpi(true);
    setKpiAnalysisFeedback(null);
    setOwlComment(`Cú sắp mở cuộc kiểm toán rèn luyện để thẩm định tài liệu "${evidenceFileNameInput}" phục vụ tiêu chuẩn ${selectedKpi.code} của bạn... 🦉🔍`);

    try {
      const response = await appraiseKpiEvidence(
        selectedKpi.code,
        selectedKpi.description,
        evidenceFileNameInput,
        evidenceTextDesc,
        studentName
      );
      
      setKpiAnalysisFeedback(response);
      
      const isApproved = response.includes("THÀNH CÔNG") || response.includes("HỢP LỆ") || response.includes("✅") || !response.includes("CẦN BỔ SUNG");
      const finalStatus = isApproved ? 'approved' : 'pending';

      setKpis(prevKpis => prevKpis.map(item => {
        if (item.id === selectedKpi.id) {
          const updatedItem: SMUT_KPI_Item = {
            ...item,
            status: finalStatus as any,
            evidenceFile: evidenceFileNameInput,
            evidenceText: evidenceTextDesc,
            evidenceImage: uploadedEvidencePreview || getMockImageByFilename(evidenceFileNameInput),
            comment: response
          };
          // Also update selectedKpi referencing item
          setSelectedKpi(updatedItem);
          
          // Persist to Cloud Firestore
          const activeStudentId = studentId || '25010001';
          updateKpiInFirestore(activeStudentId, updatedItem).catch((err) => 
            console.warn('Sync to firestore error:', err)
          );

          return updatedItem;
        }
        return item;
      }));

      setOwlComment(isApproved 
        ? `Chúc mừng bạn! Minh chứng tiêu chí ${selectedKpi.code} đã chính thức được phê duyệt thành công! Cộng thêm ${selectedKpi.points} điểm rèn luyện! 🎉🦉`
        : `Lưu ý tí xíu nha! Minh chứng tiêu chí ${selectedKpi.code} cần bổ sung/chỉnh sửa bổ sung theo ý kiến của Cú rèn luyện bên dưới nhé!`
      );
    } catch (e) {
      console.error(e);
      setOwlComment("Úi, kết nối AI tạm gián đoạn. Không sao nha, Cú rèn luyện đã phê duyệt offline minh chứng này cho bạn rồi! 🦉✨");
    } finally {
      setIsVerifyingKpi(false);
    }
  };

  const applyQuickEvidence = (fileName: string, desc: string) => {
    setEvidenceFileNameInput(fileName);
    setEvidenceTextDesc(desc);
    setOwlComment(`Đã áp dụng mẫu minh chứng "${fileName}"! Nhấn 'Gửi Cú Thẩm Định' để kiểm tra tự động nhé! 🦉⚡`);
  };

  // Quiz Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizActive && !isAnswerSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 10) {
            setOwlComment(OWL_COMMENTARY.speedAlert);
          }
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit as wrong
            handleAnswerSubmit(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQuizActive, isAnswerSubmitted, timeLeft]);

  // Start Quiz
  const handleStartQuiz = (subject: QuizSubject) => {
    setSelectedSubject(subject);
    setIsQuizActive(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setTimeLeft(45);
    setQuizFinished(false);
    setOwlComment(OWL_COMMENTARY.thinking);
  };

  // Submit Answer
  const handleAnswerSubmit = (index: number) => {
    if (isAnswerSubmitted) return;
    
    const ansIndex = index === -1 ? selectedAnswerIndex : index;
    setSelectedAnswerIndex(ansIndex);
    setIsAnswerSubmitted(true);

    const question = selectedSubject?.questions[currentQuestionIndex];
    if (question && ansIndex === question.correctIndex) {
      setScore(prev => prev + 1);
      setOwlComment(OWL_COMMENTARY.correct);
    } else {
      setOwlComment(OWL_COMMENTARY.incorrect);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (!selectedSubject) return;
    
    if (currentQuestionIndex + 1 < selectedSubject.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(45);
      setOwlComment(OWL_COMMENTARY.thinking);
    } else {
      setIsQuizActive(false);
      setQuizFinished(true);
      setOwlComment(OWL_COMMENTARY.finished);

      // Persist completed quiz result to Cloud Firestore
      const activeStudentId = studentId || '25010001';
      saveQuizResultToFirestore(activeStudentId, {
        subjectName: selectedSubject.name,
        score,
        totalQuestions: selectedSubject.questions.length,
        percentage: Math.round((score / selectedSubject.questions.length) * 100)
      }).catch((err) => console.warn('Save quiz result error:', err));
    }
  };

  // Drag and drop for Document Processor
  const processUploadedFile = (file: File) => {
    setDocFileName(file.name);
    setDocKeywordsResult(null);
    setDocQuizQuestions([]);
    
    const reader = new FileReader();
    reader.onerror = () => {
      setOwlComment(`Úi, tớ gặp lỗi khi cố mở file này mất rồi. Bạn thử chuyển file sang định dạng văn bản thô .txt hoặc dán trực tiếp nội dung xem sao nhé!`);
    };
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDocContent(text || '');
      setOwlComment(`Đã tải lên "${file.name}" thành công! Bây giờ hãy chọn Tìm Từ Khóa hoặc Tạo Đề ôn tập nhé! 🦉`);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleExtractKeywords = async () => {
    if (!docContent.trim()) return;
    setIsProcessingDoc(true);
    setDocKeywordsResult(null);
    setFlippedCards({});
    setOwlComment(`Cú đang tập trung nghiên cứu tài liệu để trích xuất và giải nghĩa các thuật ngữ trọng tâm cho bạn đây... 🧠📖`);

    const result = await analyzeDocumentKeywords(docContent, docFileName || 'Tài liệu dán tay', studentName);
    setDocKeywordsResult(result);
    setIsProcessingDoc(false);
    setOwlComment(`Tuyệt vời! Cú đã giải nghĩa sâu các từ khóa cốt lõi bên dưới dành riêng cho bạn rồi đó! 🎉`);
  };

  const handleGenerateQuiz = async () => {
    if (!docContent.trim()) return;
    setIsProcessingDoc(true);
    setDocQuizQuestions([]);
    setOwlComment(`Đang chuyển hóa tài liệu thành các câu hỏi trắc nghiệm chuẩn chỉnh Azota... Sắp xong rồi! 📝⚡`);

    const questions = await generateQuizFromDocument(docContent, docFileName || 'Tài liệu dán tay', studentName, docQuizCount);
    setDocQuizQuestions(questions);
    
    // Auto register this quiz into local question bank
    const newSubject: QuizSubject = {
      id: `custom-${Date.now()}`,
      name: `Đề tự tạo: ${docFileName || 'Tài liệu tải lên'}`,
      icon: '📝',
      questions: questions
    };
    setQuizSubjects(prev => [newSubject, ...prev]);

    setIsProcessingDoc(false);
    setOwlComment(`Trời ơi, Cú đã biên soạn xong bộ đề trắc nghiệm ${questions.length} câu hoàn toàn mới! Nhần "Bắt đầu làm bài" để thử tài nhé! 🦉🎯`);
  };

  const handleStartDocQuiz = () => {
    if (docQuizQuestions.length === 0) return;
    
    // Construct a fresh, guaranteed up-to-date QuizSubject object directly
    const freshSubject: QuizSubject = {
      id: `custom-doc-quiz-${Date.now()}`,
      name: `Đề tự tạo: ${docFileName || 'Tài liệu dán tay'}`,
      icon: '📝',
      questions: docQuizQuestions
    };

    // Update the question bank silently so they persist
    setQuizSubjects(prev => {
      // Filter out older auto-generated ones with the same title to prevent spam
      const filtered = prev.filter(p => p.name !== freshSubject.name);
      return [freshSubject, ...filtered];
    });

    setActiveTab('quiz');
    handleStartQuiz(freshSubject);
  };

  // Actual Homework text/markdown file loader
  const processHwFile = (file: File) => {
    setAssignmentTitle(`Đề bài: ${file.name.replace(/\.[^/.]+$/, "")}`);
    const reader = new FileReader();
    reader.onerror = () => {
      setOwlComment(`Úi, Cú không đọc được file này mất rồi. Bạn thử dùng file định dạng .txt, .md hoặc dán văn bản trực tiếp nhé! 🦉`);
    };
    reader.onload = (event) => {
      setHomeworkText(event.target?.result as string || '');
      setOwlComment(`Đã tải lên bài làm "${file.name}" thành công! Thầy Cú đã sẵn sàng chấm điểm hộ bạn rồi đó! 🦉📝`);
    };
    reader.readAsText(file);
  };

  const handleHwFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processHwFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropped(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processHwFile(file);
    }
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestionText.trim()) return;

    // Filter empty options
    const finalOpts = customOptions.map((o, idx) => o.trim() || `Lựa chọn ${String.fromCharCode(65 + idx)}`);

    const newQuestion: QuizQuestion = {
      id: `custom-q-${Date.now()}`,
      question: customQuestionText.trim(),
      options: finalOpts,
      correctIndex: customCorrectIndex,
      explanation: customExplanation.trim() || 'Cú Học Tập xác nhận đáp án này hoàn toàn chính xác dựa trên kết quả giải trình học vụ.'
    };

    setQuizSubjects(prev => {
      const existingIdx = prev.findIndex(s => s.id === 'custom-user-subject');
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          questions: [...updated[existingIdx].questions, newQuestion]
        };
        return updated;
      } else {
        const newSub: QuizSubject = {
          id: 'custom-user-subject',
          name: customSubjectName.trim() || 'Đề ôn luyện cá nhân tự soạn',
          icon: '✍️',
          questions: [newQuestion]
        };
        return [newSub, ...prev];
      }
    });

    // Reset inputs
    setCustomQuestionText('');
    setCustomExplanation('');
    setCustomOptions(['', '', '', '']);
    setOwlComment(`Tuyệt vời! 🦉 Thầy Cú đã thêm thành công câu hỏi mới vào đề "${customSubjectName}" rồi nhé! Hãy nhấn "Bắt đầu giải đề" để thử sức.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropped(true);
  };

  const handleDragLeave = () => {
    setIsDropped(false);
  };

  const handleGrading = async () => {
    if (!homeworkText.trim()) return;
    setIsGrading(true);
    setGradeResult(null);

    // Call the newly created service API
    const response = await gradeHomework(homeworkText, assignmentTitle, studentName);
    setGradeResult(response);
    setIsGrading(false);
  };

  const formatResult = (text: string) => {
    // Basic Markdown formatting helper
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('###')) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-1.5">{line.replace('###', '')}</h4>;
      }
      if (line.startsWith('##')) {
        return <h3 key={idx} className="text-base font-bold text-brand-cyan mt-5 mb-2.5">{line.replace('##', '')}</h3>;
      }
      if (line.startsWith('-')) {
        return <li key={idx} className="text-xs text-gray-300 ml-4 list-disc mb-1.5">{line.replace('-', '').trim()}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="text-xs font-bold text-brand-purple my-2">{line.replace(/\*\*/g, '')}</p>;
      }
      return <p key={idx} className="text-xs text-gray-400 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  };

  return (
    <div className="saas-card bg-brand-card border-white/5 overflow-hidden font-sans">
      {/* Tab Switchers */}
      <div className="flex flex-wrap border-b border-brand-border bg-white/[0.01]">
        <button
          onClick={() => {
            setActiveTab('quiz');
            setOwlComment(OWL_COMMENTARY.welcoming);
          }}
          className={`flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quiz' ? 'text-brand-purple border-b-2 border-brand-purple bg-brand-purple/5' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Flame size={14} /> Luyện Đề Azota Mock
        </button>
        <button
          onClick={() => {
            setActiveTab('document');
            setOwlComment("Bạn hãy kéo thả tài liệu học tập vào đây để Cú tự động phân tích và tạo bài trắc nghiệm nhé! 🦉📖");
          }}
          className={`flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'document' ? 'text-brand-emerald border-b-2 border-brand-emerald bg-brand-emerald/5' : 'text-gray-500 hover:text-white'
          }`}
        >
          <BookOpen size={14} /> AI Tải Tài Liệu &amp; Tạo Đề
        </button>
        <button
          onClick={() => {
            setActiveTab('homework');
            setOwlComment("Cú đang chuẩn bị sẵn sàng túi phấn và sổ tay học vụ để sửa bài luận cho bạn rồi đây! 🦉📝");
          }}
          className={`flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'homework' ? 'text-brand-cyan border-b-2 border-brand-cyan bg-brand-cyan/5' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Sparkles size={14} /> Chấm Điểm AI Homework
        </button>
        <button
          onClick={() => {
            setActiveTab('kpi');
            setOwlComment("Chào mừng bạn sang phân đội Cú Tích Cực! Hãy tích lũy minh chứng rèn luyện cho 18 KPIs nhé! 🦉🏆");
          }}
          className={`flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'kpi' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Award size={14} className="text-amber-400" /> Cú Tích Cực (KPI Minh Chứng)
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="p-6 relative">
        {/* Floating Owl Mascot Dialogue */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-purple/15 to-brand-cyan/15 border border-white/5 mb-6 flex items-start justify-between gap-3 relative overflow-hidden shadow-lg">
          <div className="flex items-start gap-3.5 min-w-0">
            <div 
              className={`text-3xl shrink-0 -mt-1 select-none cursor-pointer transition-transform hover:scale-110 active:scale-95 ${isSpeaking ? 'animate-[pulse_1s_infinite]' : 'animate-bounce'}`}
              onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeak(owlComment)}
              title="Nhấn để nghe Cú nói"
            >
              🦉
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-black text-brand-purple tracking-widest flex items-center gap-1.5">
                Scholar Owl (Cú Học Tập)
                {isSpeaking && (
                  <span className="inline-block w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping" />
                )}
              </p>
              <p className="text-xs text-gray-200 mt-1.5 leading-relaxed max-w-xl italic italic-gentle font-semibold">"{owlComment}"</p>
              
              {/* Voice equalizer waves */}
              {isSpeaking ? (
                <div className="flex items-center gap-0.5 mt-2 h-3.5">
                  <span className="w-0.5 h-full bg-brand-cyan animate-[bounce_0.8s_infinite] inline-block rounded-full" />
                  <span className="w-0.5 h-[50%] bg-brand-cyan animate-[bounce_1.2s_infinite] inline-block rounded-full" style={{ animationDelay: '0.2s' }} />
                  <span className="w-0.5 h-[80%] bg-brand-cyan animate-[bounce_0.9s_infinite] inline-block rounded-full" style={{ animationDelay: '0.4s' }} />
                  <span className="w-0.5 h-[30%] bg-brand-cyan animate-[bounce_0.7s_infinite] inline-block rounded-full" style={{ animationDelay: '0.1s' }} />
                  <span className="w-0.5 h-[65%] bg-brand-cyan animate-[bounce_1.1s_infinite] inline-block rounded-full" style={{ animationDelay: '0.3s' }} />
                  <span className="text-[8px] font-mono text-brand-cyan uppercase tracking-wider ml-1.5">Đang phát tiếng...</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSpeak(owlComment)}
                  className="mt-2 text-[9px] font-bold text-gray-400 hover:text-brand-cyan uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  🔊 Nhấn để nghe Cú phát âm thanh
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0 flex self-start">
            <button
              onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeak(owlComment)}
              className={`p-2 rounded-lg border transition-all ${
                isSpeaking 
                  ? 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20' 
                  : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/40 hover:bg-brand-cyan/5'
              }`}
              title={isSpeaking ? "Tắt đọc" : "Đọc lời thoại thành tiếng"}
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>

          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-purple/20 to-transparent rounded-full blur-xl pointer-events-none" />
        </div>

        {activeTab === 'quiz' ? (
          <div>
            {/* Subject Selector Screen */}
            {!isQuizActive && !quizFinished && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Kho Luyện Đề Thi Thử</h3>
                  <p className="text-xs text-gray-500">Rèn luyện phản xạ, củng cố tri thức, tự tin bứt phá điểm số.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizSubjects.map(sub => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl bg-white/[0.01] border border-brand-border hover:border-brand-purple/40 transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-purple/5 flex items-center justify-center text-2xl border border-brand-purple/15">
                          {sub.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition-all">{sub.name}</h4>
                          <p className="text-[10px] text-gray-500 mt-1">{sub.questions.length} câu hỏi trắc nghiệm chất lượng</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQuiz(sub)}
                        className="saas-button-primary py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 w-full bg-brand-purple/15 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/20 transition-all"
                      >
                        <Play size={12} /> Bắt đầu giải đề
                      </button>
                    </div>
                  ))}
                </div>

                {/* Advanced: Create Custom Exam Feature */}
                <div className="mt-6 pt-4 border-t border-brand-border/30">
                  {!showQuizCreator ? (
                    <button
                      onClick={() => setShowQuizCreator(true)}
                      className="w-full py-3 rounded-xl border border-dashed border-brand-purple/40 bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Tự soạn câu hỏi và Biên soạn đề thi riêng của bạn
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border border-brand-border bg-gradient-to-br from-white/[0.01] to-transparent space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">✍️</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trình biên tập câu hỏi trắc nghiệm tự chọn</h4>
                        </div>
                        <button
                          onClick={() => setShowQuizCreator(false)}
                          className="text-gray-500 hover:text-white text-xs font-bold uppercase transition-colors"
                        >
                          Đóng
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-extrabold text-gray-500 uppercase mb-1">Tên chủ đề / Tên Đề Thi</label>
                            <input
                              type="text"
                              value={customSubjectName}
                              onChange={(e) => setCustomSubjectName(e.target.value)}
                              placeholder="Ví dụ: Đề ôn rèn luyện cá nhân tự soạn"
                              className="saas-input w-full py-2 px-3 text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-extrabold text-gray-500 uppercase mb-1">Đáp án chính xác</label>
                            <select
                              value={customCorrectIndex}
                              onChange={(e) => setCustomCorrectIndex(Number(e.target.value))}
                              className="saas-input w-full py-2 px-3 text-xs bg-[#0b0c10] text-gray-200 border border-brand-border rounded-lg outline-none"
                            >
                              <option value={0}>Phương án A (Lựa chọn đầu tiên)</option>
                              <option value={1}>Phương án B (Lựa chọn thứ hai)</option>
                              <option value={2}>Phương án C (Lựa chọn thứ ba)</option>
                              <option value={3}>Phương án D (Lựa chọn thứ tư)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] font-extrabold text-gray-500 uppercase mb-1">Nội dung câu hỏi đề cử</label>
                          <input
                            type="text"
                            value={customQuestionText}
                            onChange={(e) => setCustomQuestionText(e.target.value)}
                            placeholder="Nhập câu hỏi trắc nghiệm bạn muốn biên soạn..."
                            className="saas-input w-full py-2 px-3 text-xs"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {customOptions.map((opt, oIdx) => (
                            <div key={oIdx}>
                              <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Phương án {String.fromCharCode(64 + oIdx + 1)}</label>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...customOptions];
                                  updated[oIdx] = e.target.value;
                                  setCustomOptions(updated);
                                }}
                                placeholder={`Nội dung phương án ${String.fromCharCode(64 + oIdx + 1)}`}
                                className="saas-input w-full py-2 px-3 text-xs"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[8px] font-extrabold text-gray-500 uppercase mb-1">Giải nghĩa chi tiết phương án / Chú thích từ Cú</label>
                          <textarea
                            value={customExplanation}
                            onChange={(e) => setCustomExplanation(e.target.value)}
                            placeholder="Nhập phần giải thích tại sao đáp án này chính xác..."
                            rows={2}
                            className="saas-textarea w-full p-2.5 text-xs no-scrollbar font-sans"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomSubjectName("Đề Luyện Thi CPA Xuất Sắc");
                              setCustomQuestionText("Đâu là giá trị cốt lõi hàng đầu của một hệ thống giáo dục số hiện đại?");
                              setCustomOptions(["Công nghệ xuất sắc", "Cá nhân hóa tối đa lộ trình", "Học phí rẻ nhất", "Tự ý thức kỷ luật"]);
                              setCustomCorrectIndex(1);
                              setCustomExplanation("Học Tập Cá Nhân Hóa (personalized learning path) do trợ lý ảo Flying Owl đồng hành là kim chỉ nam tối cao nâng đỡ trải nghiệm rèn luyện sinh viên.");
                              setOwlComment("Cú đã điền sẵn cho bạn một câu hỏi mẫu siêu chuẩn rồi nhé! Chỉ việc bấm Thêm vào danh sách đề thi là xong. 🦉✨");
                            }}
                            className="px-4 py-2 bg-white/[0.04] border border-white/5 hover:border-brand-purple/20 text-gray-400 hover:text-white text-[11px] font-bold rounded-lg transition-all"
                          >
                            🪄 Điền mẫu nhanh
                          </button>
                          <button
                            type="button"
                            onClick={handleAddCustomQuestion}
                            disabled={!customQuestionText.trim() || customOptions.some(o => !o.trim())}
                            className="px-5 py-2 bg-brand-purple text-white hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-brand-purple/10"
                          >
                            <Sparkles size={11} /> Thêm vào danh sách đề thi
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* In-Exam Interface */}
            {isQuizActive && selectedSubject && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold text-brand-purple tracking-widest">Đang kiểm tra: {selectedSubject.name}</span>
                    <h4 className="text-xs font-bold text-white">Câu {currentQuestionIndex + 1} của {selectedSubject.questions.length}</h4>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono text-xs font-bold">
                    <Clock size={12} className="animate-spin" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-purple"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentQuestionIndex + 1) / selectedSubject.questions.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-white tracking-tight leading-relaxed">{selectedSubject.questions[currentQuestionIndex].question}</p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedSubject.questions[currentQuestionIndex].options.map((option, idx) => {
                      const isCorrectAnswer = idx === selectedSubject.questions[currentQuestionIndex].correctIndex;
                      const isSelected = idx === selectedAnswerIndex;

                      let btnStyle = "bg-white/[0.01] hover:bg-white/[0.04] border-brand-border text-gray-300";
                      let iconEl = null;

                      if (isAnswerSubmitted) {
                        if (isCorrectAnswer) {
                          btnStyle = "bg-brand-emerald/10 border-brand-emerald/35 text-brand-emerald font-bold";
                          iconEl = <CheckCircle size={14} className="text-brand-emerald shrink-0" />;
                        } else if (isSelected) {
                          btnStyle = "bg-red-500/10 border-red-500/35 text-red-400 font-bold";
                          iconEl = <AlertTriangle size={14} className="text-red-400 shrink-0" />;
                        } else {
                          btnStyle = "bg-white/[0.01] border-brand-border/40 opacity-40 text-gray-500 cursor-not-allowed";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-brand-purple/10 border-brand-purple/40 text-brand-purple font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswerSubmitted}
                          onClick={() => setSelectedAnswerIndex(idx)}
                          className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <span className="min-w-0">{idx + 1}. {option}</span>
                          {iconEl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Control Actions */}
                <div className="flex gap-3 justify-end pt-3 border-t border-brand-border/40">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={() => handleAnswerSubmit(-1)}
                      disabled={selectedAnswerIndex === null}
                      className="px-6 py-2 bg-brand-purple text-xs font-bold text-white rounded-lg disabled:opacity-30 hover:bg-brand-purple/90 transition-all shadow-lg"
                    >
                      Nộp câu trả lời
                    </button>
                  ) : (
                    <div className="flex-1 flex flex-col md:flex-row gap-5 items-start justify-between">
                      {/* Explanations block */}
                      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-brand-border text-[11px] leading-relaxed text-gray-400 flex items-start gap-2.5 flex-1">
                        <HelpCircle size={14} className="text-brand-cyan shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-brand-cyan uppercase text-[9px] mb-1">Cú Giải Thích</p>
                          <span>{selectedSubject.questions[currentQuestionIndex].explanation}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 bg-brand-cyan text-xs font-bold text-black rounded-lg hover:bg-brand-cyan/95 transition-all flex items-center gap-1 shrink-0"
                      >
                        Câu tiếp theo <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quiz Complete Analytics Screen */}
            {quizFinished && selectedSubject && (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 flex items-center justify-center text-brand-cyan mx-auto text-3xl shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-pulse">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">KẾT QUẢ ĐỀ THI THỬ</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{selectedSubject.name}</p>
                </div>

                <div className="max-w-xs mx-auto p-4 rounded-xl bg-white/[0.01] border border-brand-border flex justify-around items-center divide-x divide-brand-border">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Số câu đúng</p>
                    <p className="text-2xl font-bold text-brand-cyan">{score} / {selectedSubject.questions.length}</p>
                  </div>
                  <div className="pl-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Quy điểm hệ 10</p>
                    <p className="text-2xl font-bold text-brand-purple">{((score / selectedSubject.questions.length) * 10).toFixed(1)}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Cú nhận xét: Bạn có phản xạ và nền tảng lý thuyết đầy hứa hẹn. Hãy tiếp tục giải nhiều đề ôn luyện hơn nữa nhé!
                </p>

                <div className="flex gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => {
                      setQuizFinished(false);
                      setSelectedSubject(null);
                      setOwlComment(OWL_COMMENTARY.welcoming);
                    }}
                    className="flex-1 saas-button-secondary py-2 text-xs font-bold"
                  >
                    Về trang kho đề
                  </button>
                  <button
                    onClick={() => handleStartQuiz(selectedSubject)}
                    className="flex-1 saas-button-primary py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} /> Giải lại đề này
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'document' ? (
          /* Document analysis & auto quiz generator */
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                Tìm Từ Khóa &amp; Tạo Đề Thi Tự Động 🦉
              </h3>
              <p className="text-xs text-gray-400">
                Thả đề cương, giáo trình hoặc tài liệu ôn tập của bạn vào đây. Cú Học Tập sẽ tự động nhận diện từ khóa học thuật cốt lõi và phát triển bộ đề thi trắc nghiệm lập tức.
              </p>
            </div>

            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDocDropped(true);
                }}
                onDragLeave={() => setIsDocDropped(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDocDropped(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    processUploadedFile(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`py-10 px-6 text-center rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isDocDropped ? 'border-brand-emerald bg-brand-emerald/10 scale-[1.01]' : 'border-brand-border hover:border-brand-emerald/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".txt,.md,.json,.csv,.js,.ts,.html,.css,.doc,.docx,.pdf"
                />
                <Upload size={32} className="text-brand-emerald mb-3 animate-pulse" />
                {docFileName ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-brand-emerald">📄 Đã nhận: {docFileName}</p>
                    <p className="text-[10px] text-gray-400">Click hoặc thả file khác để thay đổi tài liệu</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Thả file tài liệu bài ôn tập tại đây</p>
                    <p className="text-[10px] text-gray-500 uppercase font-mono">Hỗ trợ TXT, Word, PDF... hoặc click để mở hộp thoại</p>
                  </div>
                )}
              </div>

              {/* Paste or edit document text draft box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[8px] font-bold text-gray-500 uppercase">Hoặc dán tay nội dung văn bản học thuật cần phân tích</label>
                  {docFileName && (
                    <button
                      onClick={() => {
                        setDocFileName('');
                        setDocContent('');
                        setDocKeywordsResult(null);
                        setDocQuizQuestions([]);
                      }}
                      className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase"
                    >
                      Xóa nội dung
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Nhập hoặc dán bất kỳ bài đọc, đề cương, lý thuyết khoa học nào vào đây để Cú trợ giúp..."
                  className="saas-textarea w-full p-4 text-xs font-sans leading-relaxed no-scrollbar"
                />
              </div>

              {/* Choice of Count + Trigger Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white/[0.01] border border-brand-border rounded-xl">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Số câu đề thi sinh ra:</label>
                  <select
                    value={docQuizCount}
                    onChange={(e) => setDocQuizCount(Number(e.target.value))}
                    className="bg-brand-background border border-brand-border text-xs text-white rounded-lg p-1.5 focus:border-brand-emerald focus:outline-none font-bold cursor-pointer"
                  >
                    <option value={3}>3 Câu hỏi</option>
                    <option value={5}>5 Câu hỏi</option>
                    <option value={10}>10 Câu hỏi</option>
                  </select>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleExtractKeywords}
                    disabled={!docContent.trim() || isProcessingDoc}
                    className="flex-1 sm:flex-none px-4 py-2 bg-brand-purple/25 border border-brand-purple/30 hover:bg-brand-purple text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer"
                  >
                    {isProcessingDoc && docKeywordsResult === null ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <BookOpen size={13} /> Tìm &amp; Giải thích Từ Khóa
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={!docContent.trim() || isProcessingDoc}
                    className="flex-1 sm:flex-none px-4 py-2 bg-brand-emerald text-black hover:opacity-90 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 shadow-[0_4px_15px_rgba(16,185,129,0.25)] cursor-pointer"
                  >
                    {isProcessingDoc && docQuizQuestions.length === 0 ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Đang tạo đề...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} /> Tự Tạo Đề Chuẩn Azota
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Keywords results card display */}
              <AnimatePresence>
                {docKeywordsResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="p-5 rounded-2xl border border-brand-emerald/30 bg-gradient-to-br from-brand-emerald/[0.01]/10 to-transparent relative shadow-xl space-y-5"
                  >
                    <div className="absolute top-4 right-4 text-2xl animate-spin py-1 opacity-10">🦉</div>
                    
                    <div className="flex items-start gap-3 border-b border-brand-emerald/20 pb-4">
                      <div className="p-2.5 rounded-xl bg-brand-emerald/10 text-brand-emerald">
                        <Award size={18} className="text-brand-emerald text-glow animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-black text-brand-emerald uppercase tracking-widest leading-none">
                          KHO FLASHCARD THUẬT NGỮ TỪ CÚ AI SCHOLAR OWL
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed italic italic-gentle">
                          {docKeywordsResult.summary}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">Danh mục thẻ từ khóa thông minh (Nhấn để lật 3D):</span>
                        <button
                          type="button"
                          onClick={() => {
                            // Flat speech summary
                            handleSpeak(`Cú tóm tắt nội dung tài liệu này như sau. ${docKeywordsResult.summary}`);
                          }}
                          className="text-[9px] font-bold text-brand-emerald hover:text-emerald-450 uppercase flex items-center gap-1 transition-colors"
                        >
                          🔊 Nghe Cú tóm tắt
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {docKeywordsResult.keywords?.map((kw, kwIdx) => {
                          const isFlipped = !!flippedCards[kwIdx];
                          return (
                            <div 
                              key={kwIdx} 
                              style={{ perspective: "1000px" }}
                              className="h-44 w-full cursor-pointer group"
                              onClick={() => {
                                setFlippedCards(prev => ({ ...prev, [kwIdx]: !prev[kwIdx] }));
                              }}
                            >
                              <div 
                                style={{ transformStyle: "preserve-3d" }}
                                className={`relative w-full h-full transition-transform duration-550 ease-out ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                              >
                                {/* MẶT TRƯỚC (Front Page) */}
                                <div 
                                  style={{ backfaceVisibility: "hidden" }}
                                  className={`absolute inset-0 p-4 rounded-xl border bg-[#0f1115]/85 flex flex-col justify-between transition-all ${
                                    kw.importance === 'Cốt lõi' 
                                      ? 'border-brand-emerald/30 group-hover:border-brand-emerald/60 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]' 
                                      : kw.importance === 'Quan trọng'
                                      ? 'border-brand-purple/30 group-hover:border-brand-purple/60 shadow-[inset_0_0_12px_rgba(139,92,246,0.05)]'
                                      : 'border-brand-cyan/30 group-hover:border-brand-cyan/60 shadow-[inset_0_0_12px_rgba(6,182,212,0.05)]'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-2">
                                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                        kw.importance === 'Cốt lõi' 
                                          ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' 
                                          : kw.importance === 'Quan trọng'
                                          ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20'
                                          : 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
                                      }`}>
                                        {kw.importance}
                                      </span>
                                      <span className="text-[9px] text-gray-500 font-extrabold tracking-widest uppercase">Lật 🔄</span>
                                    </div>
                                    <p className="text-xs font-black text-white group-hover:text-brand-emerald transition-colors tracking-tight line-clamp-3 mt-1.5 leading-snug">{kw.term}</p>
                                  </div>
                                  <div className="text-[9px] text-gray-400 font-bold group-hover:text-gray-200 mt-2 flex items-center gap-1.5">
                                    <span>🧠</span> Click để xem giải nghĩa
                                  </div>
                                </div>

                                {/* MẶT SAU (Back Page) */}
                                <div 
                                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                  className="absolute inset-0 p-4 rounded-xl border border-brand-cyan/30 bg-gradient-to-br from-[#0c1015] to-[#040508] flex flex-col justify-between overflow-hidden"
                                >
                                  <div className="space-y-1.5 text-left overflow-y-auto no-scrollbar h-[calc(100%-20px)]">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-1 gap-2">
                                      <span className="text-[8px] text-brand-cyan font-black tracking-widest uppercase">🦉 GIẢI THÍCH</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Avoid folding the card back
                                          handleSpeak(`${kw.term}. ${kw.definition}. Ví dụ: ${kw.example}`);
                                        }}
                                        className="p-1.5 rounded bg-white/5 hover:bg-brand-cyan/10 text-gray-400 hover:text-brand-cyan transition-all flex items-center justify-center"
                                        title="Nghe Cú phát âm định nghĩa"
                                      >
                                        <Volume2 size={10} />
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-gray-200 mt-1 leading-relaxed font-semibold">{kw.definition}</p>
                                    {kw.example && (
                                      <div className="pt-1.5 border-t border-white/[0.03]">
                                        <p className="text-[8px] text-brand-cyan font-extrabold uppercase tracking-widest mb-0.5">Áp dụng tại SMUT:</p>
                                        <p className="text-[9.5px] text-gray-350 leading-relaxed italic italic-gentle">"{kw.example}"</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[8px] text-brand-cyan/50 font-bold uppercase text-center tracking-wide pt-1 border-t border-white/5">
                                    Click tiếp để quay lại
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated Quiz Card & play diagnostic action trigger */}
              <AnimatePresence>
                {docQuizQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="p-5 rounded-2xl border border-brand-purple/35 bg-gradient-to-br from-brand-purple/[0.01] to-transparent relative shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold text-brand-purple uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={14} className="text-brand-purple text-glow animate-pulse" /> ĐỀ THI TRẮC NGHIỆM ĐÃ ĐƯỢC AI BIÊN SOẠN XONG ({docQuizQuestions.length} Câu)
                      </h4>
                      <span className="text-[9px] font-mono bg-brand-purple/15 text-brand-purple px-2 py-0.5 rounded border border-brand-purple/20 font-bold uppercase">Azota AI Engine</span>
                    </div>

                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                      Cực hay! Cú Học Tập đã tạo dựng thành công đề kiểm tra kiến thức bám cực sát với nguồn thông tin tài liệu của bạn. Nhập nút khởi tranh làm bài thử thách trí tuệ ngay thôi!
                    </p>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-brand-border space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="text-xs font-bold text-white">Đề kiểm tra: {docFileName || 'Lý thuyết tích hợp dán tay'}</p>
                          <p className="text-[10px] text-gray-500 font-medium">Biên soạn bởi Cú Scholar Owl • Hạn mức 45 giây mỗi câu</p>
                        </div>
                      </div>

                      <button
                        onClick={handleStartDocQuiz}
                        className="w-full py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-purple/20 border border-white/5 cursor-pointer"
                      >
                        <Play size={13} /> Bắt đầu giải Đề Tự Tạo này!
                      </button>
                    </div>

                     {/* Quick list preview items with full edit/delete capabilities */}
                    <div className="space-y-3 pt-4 border-t border-brand-border/40">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          🗂️ BIÊN TẬP BLUEPRINT ĐỀ THI ({docQuizQuestions.length} Câu hỏi):
                        </p>
                        <span className="text-[9px] text-gray-500 font-bold italic italic-gentle">Có thể sửa từng câu dưới đây trước khi giải</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        {docQuizQuestions.map((q, idx) => {
                          const isEditing = editingQuestionId === q.id;
                          return (
                            <div key={q.id || idx} className="text-xs bg-white/[0.015] p-3.5 rounded-xl border border-brand-border/40 hover:border-brand-purple/20 transition-all space-y-3 relative overflow-hidden">
                              {isEditing ? (
                                // Form chỉnh sửa câu hỏi tại chỗ (Inline editing form)
                                <div className="space-y-3.5">
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-brand-purple uppercase tracking-wider flex items-center gap-1">
                                      📝 Đang chỉnh sửa Câu hỏi {idx + 1}
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={() => setEditingQuestionId(null)}
                                      className="text-[9px] font-bold text-brand-cyan hover:underline uppercase"
                                    >
                                      Lưu &amp; Đóng
                                    </button>
                                  </div>

                                  <div>
                                    <label className="block text-[8px] font-black text-gray-500 uppercase tracking-wider mb-1">Nội dung câu hỏi</label>
                                    <textarea
                                      rows={2}
                                      value={q.question}
                                      onChange={(e) => {
                                        const text = e.target.value;
                                        setDocQuizQuestions(prev => prev.map(item => item.id === q.id ? { ...item, question: text } : item));
                                      }}
                                      className="saas-textarea w-full p-2 text-xs font-sans leading-relaxed text-gray-100"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="space-y-0.5">
                                        <label className="block text-[8px] font-bold text-gray-500 uppercase">
                                          Lựa chọn {String.fromCharCode(65 + optIdx)} {optIdx === q.correctIndex ? '✅' : ''}
                                        </label>
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const text = e.target.value;
                                            setDocQuizQuestions(prev => prev.map(item => {
                                              if (item.id === q.id) {
                                                const newOpts = [...item.options];
                                                newOpts[optIdx] = text;
                                                return { ...item, options: newOpts };
                                              }
                                              return item;
                                            }));
                                          }}
                                          className="saas-input w-full py-1 px-2.5 text-xs text-gray-200"
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.03]">
                                    <div>
                                      <label className="block text-[8px] font-black text-gray-500 uppercase tracking-wider mb-1">Phương án chính xác là</label>
                                      <select
                                        value={q.correctIndex}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setDocQuizQuestions(prev => prev.map(item => item.id === q.id ? { ...item, correctIndex: val } : item));
                                        }}
                                        className="saas-input w-full py-1.5 px-2 bg-[#090b0e] text-xs text-gray-300 font-bold cursor-pointer"
                                      >
                                        <option value={0}>Phương án A (Lựa chọn đầu)</option>
                                        <option value={1}>Phương án B (Lựa chọn hai)</option>
                                        <option value={2}>Phương án C (Lựa chọn ba)</option>
                                        <option value={3}>Phương án D (Lựa chọn tư)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[8px] font-black text-gray-500 uppercase tracking-wider mb-1">Giải thích đáp án</label>
                                      <input
                                        type="text"
                                        value={q.explanation}
                                        onChange={(e) => {
                                          const text = e.target.value;
                                          setDocQuizQuestions(prev => prev.map(item => item.id === q.id ? { ...item, explanation: text } : item));
                                        }}
                                        className="saas-input w-full py-1.5 px-2 text-xs font-sans text-gray-300"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuestionId(null)}
                                      className="px-4 py-1.5 bg-brand-purple text-white hover:opacity-90 text-[10px] font-black tracking-wider uppercase rounded-lg transition-all"
                                    >
                                      Xong
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // Chế độ xem & Điều phối hành động thường
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-255 font-semibold leading-relaxed flex items-start gap-1.5">
                                      <span className="font-extrabold text-brand-purple shrink-0 mt-0.5">Q{idx + 1}:</span>
                                      <span>{q.question}</span>
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 pl-5">
                                      {q.options.map((opt, optIdx) => (
                                        <p 
                                          key={optIdx} 
                                          className={`text-[10px] leading-relaxed truncate ${
                                            optIdx === q.correctIndex 
                                              ? 'text-brand-emerald font-extrabold' 
                                              : 'text-gray-505 font-medium'
                                          }`}
                                        >
                                          <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span> 
                                          {opt}
                                          {optIdx === q.correctIndex && " ✓"}
                                        </p>
                                      ))}
                                    </div>
                                    
                                    {q.explanation && (
                                      <p className="text-[10px] text-gray-500 italic italic-gentle mt-1.5 pl-5 line-clamp-1">
                                        💡 {q.explanation}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuestionId(q.id)}
                                      className="p-1 px-2.5 rounded bg-white/[0.02] border border-white/5 hover:border-brand-purple/20 text-gray-405 hover:text-brand-purple text-[9px] font-bold transition-all uppercase"
                                      title="Chỉnh sửa câu hỏi này"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDocQuizQuestions(prev => prev.filter(item => item.id !== q.id));
                                        setOwlComment(`Cú học tập dọn dẹp thành công câu hỏi số ${idx + 1} khỏi danh mục đề thi thử rồi bạn nhé!`);
                                      }}
                                      className="p-1 px-2.5 rounded bg-white/[0.02] border border-white/5 hover:border-red-500/20 text-gray-505 hover:text-red-400 text-[9px] font-bold transition-all uppercase"
                                      title="Xóa câu hỏi khỏi đề thi"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : activeTab === 'homework' ? (
          /* Homework Submission AI evaluation */
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Chấm Điểm Bài Tập AI</h3>
              <p className="text-xs text-gray-500">Nộp bài tập luận, viết luận hay dàn bài đề xuất để Cú Owl nhận xét, chấm điểm.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Đề tài Bài Tập / Dự Án</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="saas-input w-full py-2 px-3 text-xs"
                />
              </div>

              {/* Drag and drop playground */}
              <input
                type="file"
                ref={hwFileInputRef}
                onChange={handleHwFileChange}
                accept=".txt,.md,.json,.csv,.js,.jsx,.ts,.tsx"
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => hwFileInputRef.current?.click()}
                className={`py-8 px-4 text-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  isDropped ? 'border-brand-cyan bg-brand-cyan/5 scale-[1.01]' : 'border-brand-border hover:border-brand-purple/20'
                }`}
                title="Nhấn để chọn tệp tài liệu bài viết"
              >
                <Upload size={30} className="mx-auto text-brand-purple mb-3.5 animate-pulse" />
                <p className="text-xs font-bold text-white">Thả file tài liệu bài làm của bạn vào đây</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-mono">Hoặc CLICK vào đây để mở hộp thoại tải tệp văn bản từ máy tính</p>
              </div>

              {/* Quick Preset Essay Selectors */}
              <div className="space-y-2.5 bg-white/[0.005] p-3 rounded-xl border border-brand-border/30">
                <span className="block text-[8px] font-extrabold text-gray-500 uppercase tracking-widest">Nạp nhanh bài làm mẫu để trải nghiệm thử tài Cú AI:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentTitle(ESSAY_SAMPLES.ai.title);
                      setHomeworkText(ESSAY_SAMPLES.ai.text);
                      setOwlComment("Đã tự động điền bài mẫu: Phân tích vai trò của AI trong Giáo dục Việt Nam! Hãy nhấn nút 'Gửi bài & Chấm điểm AI' nhé! 🦉⚡");
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 rounded-lg transition-all"
                  >
                    🤖 Trí tuệ Giáo dục
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentTitle(ESSAY_SAMPLES.ethics.title);
                      setHomeworkText(ESSAY_SAMPLES.ethics.text);
                      setOwlComment("Đã điền bài văn mẫu chuẩn mực Đạo đức sư phạm thế hệ số! Nhấn gửi để nhận nhận xét của Cú. 🦉✨");
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 rounded-lg transition-all"
                  >
                    🏫 Đạo đức Sư phạm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentTitle(ESSAY_SAMPLES.stress.title);
                      setHomeworkText(ESSAY_SAMPLES.stress.text);
                      setOwlComment("Đã tải giải pháp giảm áp lực cải tiến học vụ! Bấm gửi xem Cú đàm thoại và phân tích cấu trúc bài viết của bạn. 🦉🏆");
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-all"
                  >
                    ☘️ Giảm Áp Học Đường
                  </button>
                </div>
              </div>

              {/* Input text box drafts */}
              <div>
                <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Văn bản bài nộp</label>
                <textarea
                  rows={5}
                  value={homeworkText}
                  onChange={(e) => setHomeworkText(e.target.value)}
                  placeholder="Hãy gõ, dán nội dung bài làm của bạn vào đây hoặc kéo thả, click chọn file .txt/.md..."
                  className="saas-textarea w-full p-4 text-xs font-sans leading-relaxed no-scrollbar"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGrading}
                  disabled={!homeworkText.trim() || isGrading}
                  className="px-6 py-2.5 bg-brand-cyan text-black font-bold text-xs rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(6,182,212,0.25)] disabled:opacity-30"
                >
                  {isGrading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Cú Học Thuật đang chấm điểm...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Gửi bài &amp; Chấm điểm AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Grading Report Results panel */}
            <AnimatePresence>
              {gradeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="p-5 rounded-2xl border border-brand-border bg-gradient-to-br from-white/[0.01] to-transparent relative shadow-xl mt-4"
                >
                  <div className="absolute top-4 right-4 text-2xl animate-spin py-1 opacity-10">🦉</div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Award size={14} className="text-brand-cyan text-glow" /> PHẢN HỒI KẾT QUẢ TỪ AI CÚ HỌC TẬP
                  </h4>

                  <div className="space-y-1.5 font-sans">
                    {formatResult(gradeResult)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* KPI Training Point Verification Section */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border/40 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Award size={18} className="text-amber-500 animate-pulse" /> SỔ TAY CÚ TÍCH CỰC (KPI MINH CHỨNG)
                </h3>
                <p className="text-xs text-gray-400">
                  Nộp ảnh, tệp, văn bản minh chứng cho 18 tiêu chí rèn luyện để tính Điểm Rèn Luyện tự động bằng AI.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 bg-white/[0.02] px-2.5 py-1 rounded border border-white/5 uppercase font-mono">
                  Mã học viên: {studentName ? studentName.substring(0, 3).toUpperCase() : "SV"}-2026
                </span>
              </div>
            </div>

            {/* Scorecard Summary Bar */}
            {(() => {
              const approvedKpis = kpis.filter(k => k.status === 'approved');
              const pendingKpis = kpis.filter(k => k.status === 'pending');
              const totalPoints = 35 + approvedKpis.reduce((sum, k) => sum + k.points, 0);
              const capPoints = Math.min(100, totalPoints);
              
              let classification = "Khá";
              let colorClass = "text-brand-cyan";
              if (capPoints >= 90) {
                classification = "Xuất sắc";
                colorClass = "text-amber-400 text-glow font-bold";
              } else if (capPoints >= 80) {
                classification = "Tốt";
                colorClass = "text-brand-purple text-glow font-bold";
              } else if (capPoints >= 65) {
                classification = "Khá";
                colorClass = "text-cyan-400";
              } else if (capPoints >= 50) {
                classification = "Trung bình";
                colorClass = "text-gray-300";
              } else {
                classification = "Yếu/Kém";
                colorClass = "text-red-400";
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.01] border border-brand-border/40 relative overflow-hidden">
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Điểm rèn luyện ước tính</p>
                      <span className={`text-xs font-extrabold uppercase ${colorClass}`}>{classification} 🏆</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-white">{capPoints}</span>
                      <span className="text-sm font-semibold text-gray-500">/ 100 điểm tối đa</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-purple via-brand-cyan to-amber-400 transition-all duration-500"
                        style={{ width: `${capPoints}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      * Đã bao gồm 35 điểm nền sinh hoạt nề nếp cố định. Cộng dồn tối đa 100 điểm.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-brand-border/20 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đã phê duyệt</p>
                    <p className="text-xl font-bold text-brand-emerald mt-1">{approvedKpis.length} <span className="text-xs text-gray-500 font-medium">/ 18 KPIs</span></p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-emerald" style={{ width: `${(approvedKpis.length / 18) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-brand-border/20 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đang chờ thẩm duyệt</p>
                    <p className="text-xl font-bold text-brand-cyan mt-1">{pendingKpis.length} <span className="text-xs text-gray-500 font-medium">KPIs</span></p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-cyan" style={{ width: `${(pendingKpis.length / 18) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Main Interactive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              
              {/* Left Column: 18-KPI Directory with quick filters */}
              <div className="lg:col-span-3 space-y-4">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {["Tất cả", "Ý thức", "Giao tiếp", "Lối sống", "Học tập"].map((filterName) => {
                    const filterFullName = filterName === "Tất cả" ? "Tất cả" 
                                       : filterName === "Ý thức" ? "Ý thức nội quy & Hoạt động chính trị xã hội"
                                       : filterName === "Giao tiếp" ? "Mối quan hệ với các đối tượng (Giao tiếp)"
                                       : filterName === "Lối sống" ? "Lối sống & Phong cách tác phong"
                                       : "Ý thức & Kết quả học tập chuyên môn";

                    const isFiltered = selectedKpiCategory === filterFullName;

                    return (
                      <button
                        key={filterName}
                        onClick={() => setSelectedKpiCategory(filterFullName)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          isFiltered 
                            ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                            : 'bg-white/[0.01] border-brand-border/60 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {filterName}
                      </button>
                    );
                  })}
                </div>

                {/* 18-KPI Interactive Directory List */}
                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2 no-scrollbar border border-brand-border/40 rounded-xl p-2 bg-white/[0.005]">
                  {kpis
                    .filter(item => selectedKpiCategory === "Tất cả" || item.category === selectedKpiCategory)
                    .map((item) => {
                      const isKpiSelected = selectedKpi?.id === item.id;
                      
                      let borderStyle = "border-brand-border/40 bg-white/[0.01]";
                      if (isKpiSelected) borderStyle = "border-amber-400/40 bg-amber-400/[0.03] shadow-lg shadow-amber-400/5";

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedKpi(item);
                            setEvidenceFileNameInput(item.evidenceFile || '');
                            setEvidenceTextDesc(item.evidenceText || '');
                            setKpiAnalysisFeedback(item.comment || null);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group hover:border-amber-400/30 ${borderStyle}`}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                {item.code}
                              </span>
                              <span className="text-[9px] text-gray-500 font-medium truncate max-w-[150px]">
                                {item.category}
                              </span>
                              <span className="text-[9px] font-bold text-brand-purple">
                                +{item.points} điểm
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-100 group-hover:text-amber-300 transition-colors leading-snug line-clamp-1">
                              {item.description}
                            </p>
                          </div>

                          {/* Action badge status */}
                          <div className="shrink-0 flex items-center">
                            {item.status === 'approved' ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald text-[9px] font-bold rounded-lg uppercase tracking-wider">
                                <Check size={10} strokeWidth={3} /> Đã duyệt
                              </div>
                            ) : item.status === 'pending' ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-[9px] font-bold rounded-lg uppercase tracking-wider">
                                <Clock size={10} /> Đang thẩm
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-1 bg-white/[0.03] border border-white/5 text-gray-500 text-[9px] font-bold rounded-lg uppercase tracking-wider group-hover:border-amber-400/20 group-hover:text-amber-400 transition-colors">
                                <Plus size={10} /> Chưa nộp
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: AI KPI Investigation Terminal */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {!selectedKpi ? (
                    <motion.div
                      key="no-selection"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border border-dashed border-brand-border/60 p-8 rounded-2xl text-center bg-white/[0.002] flex flex-col items-center justify-center space-y-4 min-h-[400px]"
                    >
                      <div className="text-5xl animate-bounce">🔬🦉</div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">CỔNG THẨM ĐỊNH MINH CHỨNG AI</h4>
                        <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                          Hãy chọn một tiêu chí KPI bên trái để bắt đầu đăng tải ảnh minh chứng rèn luyện và nhận kiểm tra từ Cú.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedKpi.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="border border-brand-border bg-gradient-to-b from-white/[0.015] to-transparent p-5 rounded-2xl space-y-4 relative shadow-2xl"
                    >
                      {/* Close detail view option */}
                      <button 
                        onClick={() => setSelectedKpi(null)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors animate-pulse"
                      >
                        <X size={14} />
                      </button>

                      {/* Title block */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
                            {selectedKpi.code}
                          </span>
                          <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded">
                            +{selectedKpi.points} điểm rèn luyện
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white leading-normal pt-1">
                          {selectedKpi.description}
                        </h4>
                        <p className="text-[10px] text-gray-400 bg-white/[0.01] p-2 rounded-lg border border-white/5 leading-relaxed">
                          📌 <strong className="text-gray-400">Yêu cầu minh chứng:</strong> {selectedKpi.suggestedEvidence}
                        </p>
                      </div>

                      {/* Interactive Submission fields */}
                      <div className="space-y-3.5 border-t border-brand-border/40 pt-3.5">
                        
                        {/* Status notification */}
                        <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trạng thái hồ sơ:</span>
                          {selectedKpi.status === 'approved' ? (
                            <span className="text-[10px] font-bold uppercase text-brand-emerald flex items-center gap-1">
                              ● ĐÃ PHÊ DUYỆT THÀNH CÔNG
                            </span>
                          ) : selectedKpi.status === 'pending' ? (
                            <span className="text-[10px] font-bold uppercase text-brand-cyan flex items-center gap-1">
                              ● ĐANG CHỜ AI THẨM DUYỆT
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase text-gray-500">
                              ● CHƯA NỘP MINH CHỨNG
                            </span>
                          )}
                        </div>

                        {selectedKpi.status === 'not_submitted' || selectedKpi.status === 'rejected' ? (
                          <div className="space-y-3">
                            {/* Recommendations templates */}
                            <div className="space-y-1">
                              <label className="block text-[8px] font-extrabold text-gray-500 uppercase tracking-widest">Gợi ý mẫu minh chứng có sẵn:</label>
                              <div className="grid grid-cols-1 gap-1.5">
                                {selectedKpi.code === 'KPI 1' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("minh_chung_trac_nghiem_phap_luat_2026.png", "Đã chính thức vượt qua 10/10 điểm bài thi tìm hiểu văn bản đạo đức nghề nghiệp và hiến pháp.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: minh_chung_trac_nghiem_phap_luat_2026.png
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 3' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("chung_nhan_hoat_dong_mhs.pdf", "Danh sách xác thực tham gia tuần lễ tuyên truyền pháp luật do các Đoàn trường cấp và đóng dấu mộc.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: chung_nhan_hoat_dong_mhs.pdf
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 4' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("giay_chung_nhan_hien_mau_cuu_nguoi.jpg", "Giấy chứng nhận tham gia chiến dịch 'Giọt Hồng Tình Nguyện 2026' của Ban Chỉ đạo Hiến máu nhân đạo thành phố.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: giay_chung_nhan_hien_mau_cuu_nguoi.jpg
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 9' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("minh_chung_trong_cay_hoa_cuc.jpg", "Mô hình cải tạo: Đăng ký tự tay chăm sóc gieo trồng 1 chậu hoa tươi rực rỡ đặt tại sảnh tòa nhà B giảng đường.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: minh_chung_trong_cay_hoa_cuc.jpg
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 15' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("bang_diem_hoc_luc_cpa.png", "Bảng điểm kết quả học kỳ học vụ đạt CPA 3.65/4.00 tiến tới không nợ tín chỉ, học lực Giỏi.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: bang_diem_hoc_luc_cpa.png
                                  </button>
                                )}
                                <button 
                                  onClick={() => applyQuickEvidence(`minh_chung_tu_do_${selectedKpi.code.toLowerCase().replace(' ', '_')}.png`, `Em xin đăng tải văn bản tự viết cùng ảnh đính kèm xác nhận tham gia tốt chỉ tiêu ${selectedKpi.code} rèn luyện học kỳ.`)}
                                  className="p-2 text-left rounded-lg bg-white/[0.005] hover:bg-white/[0.03] border border-brand-border/20 text-[10px] text-gray-400 font-medium truncate flex items-center gap-1"
                                >
                                  📄 Tạo minh chứng tự do: minh_chung_tu_do.png
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Tải lên minh chứng (Ảnh / PDF)</label>
                              <input
                                type="file"
                                ref={kpiFileInputRef}
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleKpiFileSelect(file);
                                }}
                              />
                              <div
                                onClick={() => kpiFileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setIsKpiDropOver(true); }}
                                onDragLeave={() => setIsKpiDropOver(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsKpiDropOver(false);
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) handleKpiFileSelect(file);
                                }}
                                className={`p-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                                  isKpiDropOver 
                                    ? 'border-amber-400 bg-amber-400/10' 
                                    : 'border-white/10 hover:border-amber-400/50 bg-white/[0.01]'
                                }`}
                              >
                                {uploadedEvidencePreview ? (
                                  <div className="flex items-center gap-3 justify-center">
                                    <img src={uploadedEvidencePreview} alt="Preview" className="w-10 h-10 object-cover rounded border border-white/10" />
                                    <div className="text-left text-[11px] font-mono text-amber-300 truncate max-w-[200px]">
                                      {evidenceFileNameInput}
                                      <p className="text-[9px] text-slate-400 font-sans">Bấm để chọn lại</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <p className="text-xs font-mono font-bold text-slate-300">
                                      📁 Kéo thả tệp minh chứng hoặc <span className="text-amber-400 underline">chọn từ máy</span>
                                    </p>
                                    <p className="text-[9px] text-slate-500">Hỗ trợ JPG, PNG, PDF tối đa 10MB</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Tên tệp minh chứng đính kèm</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs text-brand-purple">📎</span>
                                <input
                                  type="text"
                                  value={evidenceFileNameInput}
                                  onChange={(e) => setEvidenceFileNameInput(e.target.value)}
                                  placeholder="Ví dụ: bban_hien_mau_nhan_dao_2026.png"
                                  className="saas-input w-full py-2.5 pl-8 pr-3 text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Mô tả / Giải trình minh chứng của sinh viên</label>
                              <textarea
                                value={evidenceTextDesc}
                                onChange={(e) => setEvidenceTextDesc(e.target.value)}
                                rows={3}
                                placeholder="Viết ngắn gọn thông tin minh chứng rèn luyện: Ngày tham gia, vai trò, địa điểm..."
                                className="saas-textarea w-full p-3 text-xs leading-relaxed no-scrollbar font-sans"
                              />
                            </div>

                            <button
                              disabled={isVerifyingKpi || !evidenceFileNameInput.trim() || !evidenceTextDesc.trim()}
                              onClick={handleVerifyKpi}
                              className="w-full py-2.5 bg-amber-400 text-black font-extrabold text-xs rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(251,191,36,0.25)] disabled:opacity-30 disabled:shadow-none"
                            >
                              {isVerifyingKpi ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                  Cú Đang Thẩm Định Minh Chứng AI...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} /> Gửi Cú Thẩm Định Bằng AI
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          /* View Details of Submitted / Approved Evidence review */
                          <div className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-brand-border space-y-2.5">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tài liệu đã tải lên:</p>
                              
                              <div className="flex gap-3 items-center">
                                <img 
                                  src={selectedKpi.evidenceImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80"} 
                                  alt="Preview" 
                                  className="w-12 h-12 rounded object-cover border border-white/5 shrink-0 bg-white/5"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-amber-400 truncate flex items-center gap-1">
                                    📎 {selectedKpi.evidenceFile}
                                  </p>
                                  <p className="text-[10px] text-gray-400 line-clamp-2 italic font-sans mt-0.5">
                                    "{selectedKpi.evidenceText}"
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Cú evaluation comments */}
                            {selectedKpi.comment && (
                              <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 space-y-2">
                                <div className="flex items-center gap-1.5 border-b border-amber-400/10 pb-1.5">
                                  <span className="text-sm">🦉</span>
                                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                                    PHẢN HỒI KIỂM TOÁN TỪ CÚ RÈN LUYỆN AI:
                                  </p>
                                </div>
                                <div className="text-[11px] font-sans text-gray-300 leading-relaxed max-w-none">
                                  {formatResult(selectedKpi.comment)}
                                </div>
                              </div>
                            )}

                            {/* Reset state to audit again */}
                            <button
                              onClick={() => {
                                setKpis(prev => prev.map(k => {
                                  if (k.id === selectedKpi.id) {
                                    const resetItem: SMUT_KPI_Item = {
                                      ...k,
                                      status: 'not_submitted',
                                      evidenceFile: undefined,
                                      evidenceText: undefined,
                                      evidenceImage: undefined,
                                      comment: undefined
                                    };
                                    setSelectedKpi(resetItem);
                                    return resetItem;
                                  }
                                  return k;
                                }));
                                setEvidenceFileNameInput('');
                                setEvidenceTextDesc('');
                                setKpiAnalysisFeedback(null);
                                setOwlComment(`Đã mở khóa và gỡ bỏ minh chứng cũ của ${selectedKpi.code}. Bạn có thể tiến hành nộp tài liệu mới ngay! 🦉🏆`);
                              }}
                              className="w-full py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-brand-border text-gray-400 hover:text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash size={12} className="text-red-400" /> Nộp lại minh chứng khác
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
