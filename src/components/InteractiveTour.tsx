import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, HelpCircle, GraduationCap, Compass } from 'lucide-react';

interface TourStep {
  selector: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface InteractiveTourProps {
  isActive: boolean;
  onClose: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '.nav-overview-btn',
    title: 'Bảng Điều Khiển Tổng Quan',
    content: 'Đây là trung tâm tóm tắt học lực của bạn. Cho phép theo dõi nhanh thứ hạng, điểm tích lũy và truy cập danh bạ hướng dẫn dịch vụ nhanh.',
    position: 'right',
  },
  {
    selector: '.academic-standing-card',
    title: 'Điểm Số & Xếp Hạng Gương Mẫu',
    content: 'Theo dõi điểm trung bình tích lũy CGPA (thang 4.0), số tín chỉ đã vượt qua và xếp hạng danh dự của bạn tại Cổng Học Tập Số.',
    position: 'bottom',
  },
  {
    selector: '.gpa-performance-chart',
    title: 'Biểu Đồ Xu Hướng GPA',
    content: 'Đường cong học lực trực quan qua từng học kỳ, giúp bạn đánh giá ngay tiến trình học tập đang đi lên hay cần thêm điểm bứt phá.',
    position: 'left',
  },
  {
    selector: '.calendar-widget-card',
    title: 'Lịch Trình Học Thuật Đã Đồng Bộ',
    content: 'Mọi mốc quan trọng: lịch thi cuối kỳ, đợt đóng học phí và đăng ký tín chỉ phục vụ học vụ đều hiển thị tại đây để bạn lưu tâm.',
    position: 'top',
  },
  {
    selector: '.study-owl-azota-section',
    title: 'Trợ Lý Cú Học Tập (Azota style)',
    content: 'Tìm kiếm kho đề luyện thi thử có đáp án chi tiết, hoặc thử nộp bài luận thảo để Cú AI chấm điểm nhận xét tức khắc tại tab này.',
    position: 'top',
  },
  {
    selector: '.nav-ai-chat-btn',
    title: 'Trò Chuyện Cùng AI Assistant',
    content: 'Nhấn vào đây bất cứ lúc nào để hỏi đáp thủ tục hành chính, tra cứu phòng ban, hoặc yêu cầu AI chỉ đường đến các cơ sở bản đồ nhé!',
    position: 'right',
  }
];

export const InteractiveTour: React.FC<InteractiveTourProps> = ({ isActive, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      const targetElement = document.querySelector(step.selector);

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Visual Highlight Overlay bounds
        setHighlightStyle({
          position: 'fixed',
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(2, 4, 8, 0.75), 0 0 20px rgba(147,51,234,0.4)',
          border: '2px solid var(--color-brand-purple)',
          zIndex: 90,
          pointerEvents: 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        });

        // Calculate Speech Bubble absolute position
        let bubbleTop = 0;
        let bubbleLeft = 0;

        const pad = 16;
        const bWidth = 320; // Estimated max width
        const bHeight = 180; // Estimated max height

        switch (step.position) {
          case 'bottom':
            bubbleTop = rect.bottom + pad;
            bubbleLeft = rect.left + rect.width / 2 - bWidth / 2;
            break;
          case 'top':
            bubbleTop = rect.top - bHeight - pad;
            bubbleLeft = rect.left + rect.width / 2 - bWidth / 2;
            break;
          case 'left':
            bubbleTop = rect.top + rect.height / 2 - bHeight / 2;
            bubbleLeft = rect.left - bWidth - pad;
            break;
          case 'right':
            bubbleTop = rect.top + rect.height / 2 - bHeight / 2;
            bubbleLeft = rect.right + pad;
            break;
          case 'center':
          default:
            bubbleTop = window.innerHeight / 2 - bHeight / 2;
            bubbleLeft = window.innerWidth / 2 - bWidth / 2;
            break;
        }

        // Keep inside viewport safety constraints
        const maxLeft = window.innerWidth - bWidth - 24;
        const maxTop = window.innerHeight - bHeight - 24;
        
        bubbleLeft = Math.max(24, Math.min(maxLeft, bubbleLeft));
        bubbleTop = Math.max(24, Math.min(maxTop, bubbleTop));

        setBubblePos({ top: bubbleTop, left: bubbleLeft });
      } else {
        // Fallback: center in the page
        setHighlightStyle({
          position: 'fixed',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 0,
          height: 0,
          boxShadow: '0 0 0 9999px rgba(2, 4, 8, 0.75)',
          zIndex: 90,
          pointerEvents: 'none',
        });

        setBubblePos({
          top: window.innerHeight / 2.5,
          left: window.innerWidth / 2 - 160,
        });
      }
    };

    // Update coordinates
    updatePosition();
    
    // Add event listeners
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const stepInfo = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep + 1 < TOUR_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {/* Visual Shadow cutout backdrop */}
      <div style={highlightStyle} />

      {/* Speech Chat Bubble */}
      <motion.div
        ref={bubbleRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        style={{
          position: 'fixed',
          top: bubblePos.top,
          left: bubblePos.left,
          zIndex: 100,
          width: '320px',
        }}
        className="bg-brand-card border border-brand-purple p-5 rounded-2xl shadow-[0_15px_30px_rgba(147,51,234,0.3)] font-sans"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-gray-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* Mascot bubble head */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl select-none animate-bounce">🦉</span>
          <div>
            <span className="text-[9px] uppercase font-bold text-brand-purple tracking-widest block leading-none">Cú hướng dẫn viên</span>
            <span className="text-xs font-bold text-white tracking-tight">{stepInfo.title}</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed mb-4 font-medium">
          {stepInfo.content}
        </p>

        {/* Step Actions details footer */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border h-8">
          <span className="text-[9px] font-mono font-bold text-gray-500">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-gray-400 rounded-lg hover:text-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={12} /> Trước
              </button>
            )}

            <button
              onClick={handleNext}
              className="p-1 px-3 bg-brand-purple text-white text-[10px] font-bold rounded-lg hover:bg-brand-purple/90 transition-colors flex items-center gap-1"
            >
              {currentStep + 1 === TOUR_STEPS.length ? 'Hoàn thành' : 'Kế tiếp'} <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
