import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Shield, Rocket, Sparkles, Navigation, CheckCircle } from 'lucide-react';

interface AppIntroProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTRO_SLIDES = [
  {
    title: 'Trợ Lý Học Tập Cú AI 🦉',
    description: 'Chào mừng bạn đến với Cổng Học Tập Số! Tớ là Cú thông minh – người bạn đồng hành 24/7 giúp bạn làm thủ tục, tra cứu phòng học, xem học phí và giải đáp mọi thắc mắc hành chính.',
    icon: '🚀',
    accentColor: 'from-brand-purple to-indigo-500',
  },
  {
    title: 'GPA Simulator & Forecaster 📈',
    description: 'Chủ động kiểm soát tương lai bằng công cụ dự phóng điểm số. Nhập các môn học kỳ này và điểm mong ước để xem ngay sự thay đổi của điểm trung bình tích lũy (CGPA) toàn khóa.',
    icon: '📊',
    accentColor: 'from-brand-cyan to-blue-500',
  },
  {
    title: 'Góc Học Tập Azota & AI Caregiver 💖',
    description: 'Rèn luyện và củng cố kiến thức thông qua kho đề thi thử đố vui trắc nghiệm, gửi bài luận nộp cho Cú AI chấm điểm lập tức, và nhận những câu hỏi quan tâm chăm sóc sức khỏe mỗi ngày.',
    icon: '🦉',
    accentColor: 'from-brand-emerald to-teal-500',
  }
];

export const AppIntro: React.FC<AppIntroProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSlide + 1 < INTRO_SLIDES.length) {
      setCurrentSlide(prev => prev + 1);
    } else {
      localStorage.setItem('smut_onboarding_done', 'true');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Deep blur backdrop for high premium impact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Outer subtle orbital glows of SMUT style */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="w-full max-w-lg bg-brand-card/60 border border-brand-border rounded-3xl p-8 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center font-sans backdrop-blur-md"
        >
          {/* Decorative Top Accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-emerald" />

          {/* Skip buttons */}
          {currentSlide < INTRO_SLIDES.length - 1 && (
            <button
              onClick={() => {
                localStorage.setItem('smut_onboarding_done', 'true');
                onClose();
              }}
              className="absolute top-5 right-6 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest"
            >
              Skip
            </button>
          )}

          {/* Animated Slide Elements */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 py-6"
            >
              {/* Massive Floating 3D Emoji Avatar with Ambient Aura */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center text-5xl mb-6">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${INTRO_SLIDES[currentSlide].accentColor} opacity-25 blur-2xl animate-pulse`} />
                <span className="relative z-10">{INTRO_SLIDES[currentSlide].icon}</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight px-2">
                  {INTRO_SLIDES[currentSlide].title}
                </h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed max-w-sm mx-auto font-medium">
                  {INTRO_SLIDES[currentSlide].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Indicators */}
          <div className="flex gap-1.5 justify-center mb-8">
            {INTRO_SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-brand-cyan' : 'w-1.5 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Control Button Actions */}
          <button
            onClick={handleNext}
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 transition-all ${
              currentSlide === INTRO_SLIDES.length - 1
                ? 'bg-brand-emerald text-white shadow-[0_8px_25px_rgba(16,185,129,0.3)]'
                : 'bg-brand-purple text-white shadow-[0_8px_25px_rgba(147,51,234,0.25)]'
            }`}
          >
            {currentSlide === INTRO_SLIDES.length - 1 ? (
              <>
                Bắt đầu trải nghiệm ngay <CheckCircle size={14} />
              </>
            ) : (
              <>
                Kế tiếp <ArrowRight size={14} />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
