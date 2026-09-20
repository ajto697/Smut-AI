import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Stars, 
  CheckCircle2, 
  X, 
  Compass, 
  Layers, 
  Cpu, 
  BarChart3, 
  HeartHandshake,
  Bot,
  Flame,
  ChevronRight
} from 'lucide-react';

interface AppIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  onStartTour?: () => void;
}

interface ChapterData {
  chapterIndex: string;
  tagline: string;
  titlePrimary: string;
  titleAccent: string;
  leadSummary: string;
  architectureSubtitle: string;
  features: Array<{
    title: string;
    desc: string;
    badge: string;
  }>;
  asymmetryAlign: 'left-heavy' | 'right-heavy';
  visualMetric: {
    kpi: string;
    label: string;
    meta: string;
  };
  visualCard: {
    badge: string;
    title: string;
    subtitle: string;
    previewCodeOrTags: string[];
    emoji: string;
    gradient: string;
    glow: string;
  };
}

const INTRO_CHAPTERS: ChapterData[] = [
  {
    chapterIndex: '01',
    tagline: 'Kỷ nguyên Học tập Kỹ thuật số · AI Native Portal',
    titlePrimary: 'Trợ Lý Cú AI',
    titleAccent: 'Scholar Owl 24/7',
    leadSummary:
      'Đột phá trong cách sinh viên tương tác với dữ liệu trường. Trợ lý Cú AI kết nối thời gian thực với kho quy chế, phòng ban cơ sở và lịch học vụ để cung cấp phản hồi thông minh tức thì.',
    architectureSubtitle: 'Hạ tầng xử lý ngôn ngữ thế hệ mới & Trực quan hóa dữ liệu',
    features: [
      {
        title: 'Tra cứu chuẩn xác Quy chế & Đào tạo',
        desc: 'Hỏi đáp tức thời về cách tính điểm, điều kiện học bổng, quy trình xin hoãn thi hoặc chuyển ngành.',
        badge: 'Học vụ 4.0'
      },
      {
        title: 'Định vị Bản đồ & Phòng ban CS1 - CS2',
        desc: 'Chỉ đường trực tiếp đến phòng Đào tạo, Công tác sinh viên, Thư viện và các giảng đường thực hành.',
        badge: 'Campus Map'
      },
      {
        title: 'Cố vấn cá nhân hóa theo tiến độ',
        desc: 'Đưa ra cảnh báo môn học tiên quyết, thời hạn đăng ký tín chỉ và lịch ôn thi trọng điểm.',
        badge: 'AI Advisor'
      }
    ],
    asymmetryAlign: 'left-heavy',
    visualMetric: {
      kpi: '99.8%',
      label: 'Độ chính xác quy chế',
      meta: 'Đồng bộ Firestore K25'
    },
    visualCard: {
      badge: 'CỐ VẤN THÔNG MINH K25',
      title: 'Hỏi đáp Cú Scholar AI',
      subtitle: 'Trực quan dữ liệu & trả lời tự nhiên bằng tiếng Việt',
      previewCodeOrTags: ['Phòng Đào tạo CS1', 'Học bổng Xuất sắc', 'Quy chế Tín chỉ 2026', 'Bảo mật AES-256'],
      emoji: '🦉',
      gradient: 'from-purple-600/30 via-indigo-600/20 to-cyan-500/15',
      glow: 'rgba(147, 51, 234, 0.35)'
    }
  },
  {
    chapterIndex: '02',
    tagline: 'Dự báo Học tập Chủ động · CGPA Target Engine',
    titlePrimary: 'Mô Phỏng GPA',
    titleAccent: 'Forecaster & Simulator',
    leadSummary:
      'Chủ động tương lai học thuật thay vì chờ đợi bảng điểm cuối kỳ. Bộ công cụ tính toán trọng số theo chuẩn tín chỉ, giả lập các kịch bản điểm số môn thi để đạt mục tiêu tốt nghiệp.',
    architectureSubtitle: 'Công cụ mô phỏng điểm tích lũy & dự báo rủi ro học vụ',
    features: [
      {
        title: 'Quy đổi 2 chiều Hệ 10 sang Hệ 4.0',
        desc: 'Chính xác theo thang điểm chuẩn Bộ GD&ĐT và quy chế đào tạo tín chỉ SMUT.',
        badge: 'Chuẩn Bộ GD&ĐT'
      },
      {
        title: 'Mô phỏng kịch bản điểm số đích',
        desc: 'Biết ngay bạn cần đạt bao nhiêu điểm môn Chuyên ngành để duy trì danh hiệu Giỏi / Xuất sắc.',
        badge: 'Simulator'
      },
      {
        title: 'Biểu đồ trực quan tiến trình GPA',
        desc: 'Theo dõi độ dốc tích lũy điểm qua từng kỳ học để nhận diện xu hướng học tập.',
        badge: 'Visual Trends'
      }
    ],
    asymmetryAlign: 'right-heavy',
    visualMetric: {
      kpi: '4.00',
      label: 'Mục tiêu GPA tối đa',
      meta: 'Quy đổi Hệ 4.0 & Hệ 10'
    },
    visualCard: {
      badge: 'GPA FORECASTER',
      title: 'Mô phỏng Điểm Tích lũy',
      subtitle: 'Tối ưu hóa chiến lược đăng ký tín chỉ và phân bổ thời gian',
      previewCodeOrTags: ['Học kỳ 2 · 2025-2026', 'Tín chỉ tích lũy: 102/120', 'Dự báo: 3.65 (Xuất sắc)', 'Phân tích môn gỡ điểm'],
      emoji: '📊',
      gradient: 'from-cyan-600/30 via-teal-600/20 to-emerald-500/15',
      glow: 'rgba(6, 182, 212, 0.35)'
    }
  },
  {
    chapterIndex: '03',
    tagline: 'Rèn luyện Toàn diện · Mental Wellness & Exam Ready',
    titlePrimary: 'Góc Thi Azota AI',
    titleAccent: '& Sức Khỏe Sinh Viên',
    leadSummary:
      'Thành công học tập bền vững gắn liền với sức khỏe tinh thần. Tận hưởng ngân hàng đề thi trắc nghiệm AI tức thì, nộp bài luận tự luận có Cú AI chấm chi tiết cùng chuỗi Daily Care tracker.',
    architectureSubtitle: 'Luyện đề trắc nghiệm tức thì & Chăm sóc tinh thần sinh viên',
    features: [
      {
        title: 'Thi thử trắc nghiệm có chấm điểm ngay',
        desc: 'Ngân hàng câu hỏi cập nhật liên tục với giải thích cặn kẽ từng đáp án đúng sai.',
        badge: 'Azota AI Quiz'
      },
      {
        title: 'Chấm luận tự động theo tiêu chí chi tiết',
        desc: 'Phân tích lập luận, cách trình bày và độ mạch lạc của bài tập lớn / tiểu luận.',
        badge: 'Essay Grader'
      },
      {
        title: 'Daily Care Tracker cân bằng cuộc sống',
        desc: 'Nhắc nhở uống nước, vận động nhẹ, ngủ đủ giấc và ghi lại nhật ký cảm xúc mỗi ngày.',
        badge: 'Mental Wellness'
      }
    ],
    asymmetryAlign: 'left-heavy',
    visualMetric: {
      kpi: '24/7',
      label: 'Đồng hành chăm sóc',
      meta: 'Vững tâm lý - Vững kiến thức'
    },
    visualCard: {
      badge: 'STUDY OWL & WELLNESS',
      title: 'Khảo thí AI & Tinh thần Vững vàng',
      subtitle: 'Giải tỏa áp lực thi cử và tối ưu hóa nhịp sinh học',
      previewCodeOrTags: ['Đề cương ôn thi Azota', 'Chấm luận theo Rubric', 'Nhắc nhở Hydrate & Rest', 'Check-in Cảm xúc K25'],
      emoji: '💖',
      gradient: 'from-emerald-600/30 via-teal-600/20 to-amber-500/15',
      glow: 'rgba(16, 185, 129, 0.35)'
    }
  }
];

export const AppIntro: React.FC<AppIntroModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onStartTour
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  // Keyboard navigation: Left / Right / Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide]);

  if (!isOpen) return null;

  const currentChapter = INTRO_CHAPTERS[currentSlide];
  const isLast = currentSlide === INTRO_CHAPTERS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      localStorage.setItem('hasSeenIntro', 'true');
      localStorage.setItem('smut_onboarding_done', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleFinishAndTour = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    localStorage.setItem('smut_onboarding_done', 'true');
    onClose();
    if (onStartTour) {
      setTimeout(() => onStartTour(), 300);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    localStorage.setItem('smut_onboarding_done', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="app-intro-fullscreen"
        className="fixed inset-0 z-[140] flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none bg-slate-950/75 backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-chapter-title"
      >
        {/* Dynamic ambient gradient orbs reacting to slide color */}
        <motion.div
          key={`ambient-${currentSlide}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-40 mix-blend-screen"
          style={{ background: currentChapter.visualCard.glow }}
        />
        <motion.div
          key={`ambient-alt-${currentSlide}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="pointer-events-none absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-[180px] opacity-30 mix-blend-screen"
          style={{ background: currentChapter.visualCard.glow }}
        />

        {/* Subtle geometric grid backdrop */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* TOP BAR: Brand, Student Greetings & Direct Skip */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shadow-inner backdrop-blur-md">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-sm font-bold text-white tracking-tight uppercase">
                  Scholar Owl
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
                  K25 Onboarding
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {studentName ? `Chào mừng ${studentName}` : 'Chào mừng sinh viên K25'}
              </p>
            </div>
          </div>

          {/* Chapters progress badges */}
          <div className="hidden md:flex items-center gap-3">
            {INTRO_CHAPTERS.map((ch, idx) => {
              const isActive = currentSlide === idx;
              const isPassed = currentSlide > idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/10 border border-white/20 text-white shadow-lg' 
                      : isPassed
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-white/[0.02] border border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : isPassed ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="font-['Space_Grotesk'] font-bold text-[11px] tracking-wide">
                    Chương {ch.chapterIndex}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick exit */}
          <button
            id="btn-skip-intro"
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-all active:scale-95"
          >
            <span>Bỏ qua</span>
            <X size={14} />
          </button>
        </header>

        {/* MAIN BODY: Asymmetrical Content Layout */}
        <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 sm:py-10 flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                currentChapter.asymmetryAlign === 'right-heavy' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* PRIMARY CONTENT COLUMN (Asymmetrical 7 cols or 5 cols) */}
              <div className={`${
                currentChapter.asymmetryAlign === 'right-heavy' 
                  ? 'lg:col-span-6 lg:order-2 space-y-6' 
                  : 'lg:col-span-7 space-y-6'
              }`}>
                {/* Chapter metadata indicator */}
                <div className="flex items-center gap-3">
                  <span className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-black text-white/20 tracking-tighter select-none">
                    {currentChapter.chapterIndex}
                  </span>
                  <div className="h-6 w-px bg-white/15" />
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-cyan-300 text-xs font-semibold tracking-wide">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span>{currentChapter.tagline}</span>
                  </div>
                </div>

                {/* Main Large Display Headline (Space Grotesk) */}
                <div className="space-y-2">
                  <h2 
                    id="intro-chapter-title"
                    className="font-['Space_Grotesk'] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]"
                  >
                    {currentChapter.titlePrimary} <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-indigo-300 font-extrabold">
                      {currentChapter.titleAccent}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide uppercase font-mono pt-1">
                    {currentChapter.architectureSubtitle}
                  </p>
                </div>

                {/* Lead Summary Paragraph */}
                <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal max-w-2xl">
                  {currentChapter.leadSummary}
                </p>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {currentChapter.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-white/10 text-cyan-300 group-hover:bg-cyan-400/20 transition-colors">
                          {feat.badge}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-snug">
                          {feat.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASYMMETRIC VISUAL PREVIEW COLUMN (5 cols or 6 cols) */}
              <div className={`${
                currentChapter.asymmetryAlign === 'right-heavy' 
                  ? 'lg:col-span-6 lg:order-1' 
                  : 'lg:col-span-5'
              } flex justify-center`}>
                <div className="w-full max-w-md relative">
                  {/* Outer glow ring */}
                  <div 
                    className="absolute -inset-2 rounded-3xl opacity-50 blur-xl transition-all duration-700 pointer-events-none"
                    style={{ background: currentChapter.visualCard.glow }}
                  />

                  {/* Asymmetric Glass Card */}
                  <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col gap-6">
                    {/* Top ambient card stripe */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                        {currentChapter.visualCard.badge}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>

                    {/* Central Hero Emoji & Visual Graphic */}
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shrink-0 select-none relative group">
                        <div className="absolute inset-0 bg-white/10 rounded-2xl blur group-hover:blur-md transition-all" />
                        <span className="relative z-10">{currentChapter.visualCard.emoji}</span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h3 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white tracking-tight leading-tight truncate">
                          {currentChapter.visualCard.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-snug">
                          {currentChapter.visualCard.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Interactive tags / preview chips */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                        <span>Hệ thống Module</span>
                        <span className="text-emerald-400">Đã kích hoạt</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentChapter.visualCard.previewCodeOrTags.map((tag, tIdx) => (
                          <span 
                            key={tIdx}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-white/10 text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom metric badge */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <p className="font-['Space_Grotesk'] text-2xl font-black text-white tracking-tight">
                          {currentChapter.visualMetric.kpi}
                        </p>
                        <p className="text-[10px] uppercase font-mono text-slate-400">
                          {currentChapter.visualMetric.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                          <CheckCircle2 size={13} />
                          {currentChapter.visualMetric.meta}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* BOTTOM NAVIGATION CONTROLS */}
        <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-6 sm:pb-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          {/* Progress Indicators & Step numbers */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {INTRO_CHAPTERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx 
                      ? 'w-10 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Đi tới chương ${idx + 1}`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-semibold text-slate-400">
              0{currentSlide + 1} / 0{INTRO_CHAPTERS.length}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Quay lại</span>
              </button>
            )}

            {isLast && (
              <button
                type="button"
                onClick={handleFinishAndTour}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Compass size={14} />
                <span>Tour Cú nhỏ</span>
              </button>
            )}

            <button
              type="button"
              id="btn-next-chapter"
              onClick={handleNext}
              className={`px-6 py-2.5 rounded-xl font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
                isLast
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 shadow-purple-600/30'
              }`}
            >
              {isLast ? (
                <>
                  <span>Bắt đầu khám phá</span>
                  <ShieldCheck size={16} />
                </>
              ) : (
                <>
                  <span>Tiếp tục</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
};
