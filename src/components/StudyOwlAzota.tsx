import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Award, CheckCircle, AlertTriangle, Clock, Play, FileText, Upload, Sparkles, Send, HelpCircle, Flame, ArrowRight, RefreshCw, X, Check, CheckSquare, Trash, Plus } from 'lucide-react';
import { QuizSubject, QuizQuestion } from '../types';
import { gradeHomework, analyzeDocumentKeywords, generateQuizFromDocument, appraiseKpiEvidence } from '../services/geminiService';

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
  correct: 'Xuất sắc tuyệt vời! Đúng chuẩn sinh viên SMUT gương mẫu rồi. Tiếp tục thôi nào!',
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
    suggestedEvidence: "Ảnh chụp màn hình kết quả thi đạt 10/10 hoặc giấy chứng nhận tích hợp pháp luật của SMUT.",
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
    evidenceFile: "minh_chung_shcd_smut_2026.png",
    evidenceText: "Điểm danh tuần lễ sinh hoạt công dân trực tuyến tại giảng đường SMUT.",
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
    description: "Hoàn thành khóa đào tạo kỹ năng quản lý cảm xúc khi gặp tình huống xung đột xảy ra tại SMUT.",
    suggestedEvidence: "Chứng nhận điện tử khóa kỹ năng kết nối hành vi của Ban điều hành SMUT.",
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
    evidenceText: "Trồng 1 chậu hoa tươi trang trí cửa sổ hành lang lớp học SMUT.",
    evidenceImage: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=300&q=80",
    comment: "Đã duyệt! Chậu hoa xinh xắn giúp không gian SMUT thêm xanh tươi, lành mạnh! +5 điểm rèn luyện."
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

export const StudyOwlAzota: React.FC<{ studentName?: string }> = ({ studentName }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'document' | 'homework' | 'kpi'>('quiz');
  const [quizSubjects, setQuizSubjects] = useState<QuizSubject[]>(MOCK_QUIZZES);

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

  // Document AI States
  const [docFileName, setDocFileName] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docKeywordsResult, setDocKeywordsResult] = useState<string | null>(null);
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

  // KPI States
  const [kpis, setKpis] = useState<SMUT_KPI_Item[]>(INITIAL_KPIS);
  const [selectedKpi, setSelectedKpi] = useState<SMUT_KPI_Item | null>(null);
  const [evidenceFileNameInput, setEvidenceFileNameInput] = useState('');
  const [evidenceTextDesc, setEvidenceTextDesc] = useState('');
  const [isVerifyingKpi, setIsVerifyingKpi] = useState(false);
  const [kpiAnalysisFeedback, setKpiAnalysisFeedback] = useState<string | null>(null);
  const [selectedKpiCategory, setSelectedKpiCategory] = useState<string>("Tất cả");

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
            evidenceImage: getMockImageByFilename(evidenceFileNameInput),
            comment: response
          };
          // Also update selectedKpi referencing item
          setSelectedKpi(updatedItem);
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
    const currentCustomSubject = quizSubjects[0]; // The latest added custom subject
    setActiveTab('quiz');
    handleStartQuiz(currentCustomSubject);
  };

  // Drag and Drop Simulator for Homework
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropped(true);
  };

  const handleDragLeave = () => {
    setIsDropped(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropped(false);
    // Mimic file upload text extraction
    setHomeworkText(prev => prev + `\n[Tải lệp đố vui bài tập từ File của bạn vào lúc ${new Date().toLocaleTimeString()}]\nĐề cương chi tiết: Sự tích hợp AI trong hệ thống thông tin trường học tạo bước nhảy vọt về trải nghiệm cá nhân hóa của sinh viên...`);
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
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 border border-white/5 mb-6 flex items-start gap-3.5 relative overflow-hidden">
          <div className="text-3xl shrink-0 -mt-1 select-none animate-bounce">🦉</div>
          <div>
            <p className="text-[10px] uppercase font-bold text-brand-purple tracking-widest">Scholar Owl (Cú Học Tập)</p>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed max-w-xl italic italic-gentle font-medium">"{owlComment}"</p>
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
                    className="p-5 rounded-2xl border border-brand-emerald/30 bg-gradient-to-br from-brand-emerald/[0.01] to-transparent relative shadow-xl space-y-3"
                  >
                    <div className="absolute top-4 right-4 text-2xl animate-spin py-1 opacity-10">🦉</div>
                    <h4 className="text-[11px] font-bold text-brand-emerald uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Award size={14} className="text-brand-emerald text-glow animate-pulse" /> PHÂN TÍCH &amp; GIẢI THÍCH TỪ KHÓA TỪ AI CÚ HỌC TẬP
                    </h4>

                    <div className="space-y-1.5 font-sans leading-relaxed text-xs text-gray-350">
                      {formatResult(docKeywordsResult)}
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

                    {/* Quick list preview items */}
                    <div className="space-y-2 pt-2 border-t border-brand-border/40">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Xem trước ngân hàng câu hỏi vừa phát sinh:</p>
                      {docQuizQuestions.map((q, idx) => (
                        <div key={q.id || idx} className="text-xs text-gray-300 bg-white/[0.005] p-2.5 rounded-lg border border-brand-border/40 flex gap-2 font-medium">
                          <span className="font-bold text-brand-purple shrink-0">Câu {idx + 1}:</span>
                          <span className="line-clamp-1">{q.question}</span>
                        </div>
                      ))}
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
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`py-8 px-4 text-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  isDropped ? 'border-brand-cyan bg-brand-cyan/5 scale-[1.01]' : 'border-brand-border hover:border-brand-purple/20'
                }`}
              >
                <Upload size={30} className="mx-auto text-brand-purple mb-3.5 animate-pulse" />
                <p className="text-xs font-bold text-white">Thả file tài liệu bài làm của bạn vào đây</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono">Hoặc nhập tay bản thảo ở hộp văn bản dưới đây (Hỗ trợ PDF, TXT)</p>
              </div>

              {/* Input text box drafts */}
              <div>
                <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Văn bản bài nộp</label>
                <textarea
                  rows={5}
                  value={homeworkText}
                  onChange={(e) => setHomeworkText(e.target.value)}
                  placeholder="Hãy gõ hoặc dán nội dung bài làm của bạn vào đây..."
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
                  Nộp ảnh, tệp, văn bản minh chứng cho 18 tiêu chí rèn luyện để tính Điểm Rèn Luyện SMUT tự động bằng AI.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 bg-white/[0.02] px-2.5 py-1 rounded border border-white/5 uppercase font-mono">
                  Mã học viên: {studentName ? studentName.substring(0, 3).toUpperCase() : "SMUT"}-2026
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
                                    onClick={() => applyQuickEvidence("minh_chung_trac_nghiem_phap_luat_2026.png", "Đã chính thức vượt qua 10/10 điểm bài thi tìm hiểu văn bản đạo đức nghề nghiệp và hiến pháp Đại học Sao Mai.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: minh_chung_trac_nghiem_phap_luat_2026.png
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 3' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("chung_nhan_hoat_dong_mhs_smut.pdf", "Danh sách xác thực tham gia tuần lễ tuyên truyền pháp luật do các Đoàn trưởng ĐHGD cấp và đóng dấu mộc.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: chung_nhan_hoat_dong_mhs_smut.pdf
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 4' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("giay_chung_nhan_hien_mau_cuu_nguoi_smut.jpg", "Giấy chứng nhận tham gia chiến dịch 'Giọt Hồng Sao Mai 2026' của Ban Chỉ đạo Hiến máu nhân đạo thành phố.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: giay_chung_nhan_hien_mau_cuu_nguoi_smut.jpg
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 9' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("minh_chung_trong_cay_hoa_cuc.jpg", "Mô hình cải tạo: Đăng ký tự tay chăm sóc gieo trồng 1 chậu hoa tươi rực rỡ đặt tại sảnh tòa nhà B trường Đại học SMUT.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: minh_chung_trong_cay_hoa_cuc.jpg
                                  </button>
                                )}
                                {selectedKpi.code === 'KPI 15' && (
                                  <button 
                                    onClick={() => applyQuickEvidence("bang_diem_hoc_luc_smut_cpa.png", "Bảng điểm kết quả học kỳ học vụ đạt CPA 3.65/4.00 tiến tới không nợ tín chỉ, học lực Giỏi.")}
                                    className="p-2 text-left rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-brand-border/40 text-[10px] text-amber-300 font-semibold truncate flex items-center gap-1"
                                  >
                                    📄 Áp dụng tệp: bang_diem_hoc_luc_smut_cpa.png
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
