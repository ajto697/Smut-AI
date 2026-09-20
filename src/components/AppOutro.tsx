import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, HeartHandshake, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface AppOutroProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  studentName?: string;
  studentMssv?: string;
  major?: string;
}

const MOTIVATIONAL_QUOTES = [
  "Mỗi giờ nỗ lực hôm nay là một bước vững chắc cho ước mơ ngày mai. Cú chúc bạn luôn tràn đầy nhiệt huyết! 🦉🌟",
  "Học tập là hành trình khám phá không ngừng. Nghỉ ngơi thật tốt để đón chào những bài học thú vị tiếp theo nhé! ☕✨",
  "Điểm số phản ánh sự kiên trì của bạn, nhưng chính đam mê mới đưa bạn đi xa nhất. Hẹn sớm gặp lại bạn! 🚀🎯",
  "Đừng quên thư giãn đôi mắt và nạp đủ năng lượng cho học kỳ nhé. Trợ lý Cú luôn sẵn sàng khi bạn trở lại! 💙🦉"
];

export const AppOutro: React.FC<AppOutroProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  studentName,
  studentMssv,
  major
}) => {
  const [quote, setQuote] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSigningOut(false);
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote(randomQuote);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    // Short grace delay for gentle farewell transition animation
    setTimeout(async () => {
      await onConfirmLogout();
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
        {/* Soft cosmic backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#030712]/85 backdrop-blur-xl"
        />

        {/* Ambient Warm Purple/Cyan Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-10 w-full max-w-md bg-[#0c1122]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-center flex flex-col items-center"
        >
          {/* Top accent glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-t-3xl" />

          {/* Farewell Flying Owl Mascot */}
          <div className="relative my-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-white/15 flex items-center justify-center text-4xl shadow-xl">
              <motion.span
                animate={{
                  y: [0, -6, 0],
                  rotate: [0, 4, -4, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="select-none inline-block"
              >
                🦉
              </motion.span>
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs text-amber-300">
              ✨
            </span>
          </div>

          {/* Heading */}
          <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mt-2">
            Scholar Owl Outro &bull; Tạm Biệt Bạn
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            Hẹn Sớm Gặp Lại Nhé!
          </h3>

          {/* User badge */}
          {studentName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">{studentName}</span>
              {studentMssv && <span className="font-mono text-gray-400">({studentMssv})</span>}
            </div>
          )}

          {/* Inspirational Quote Card */}
          <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 leading-relaxed italic relative mb-6">
            <Sparkles size={14} className="text-purple-400 absolute top-3 left-3 opacity-60" />
            <p className="px-4 text-center font-medium">"{quote}"</p>
          </div>

          {/* Security & Sync Confirmation */}
          <div className="w-full flex items-center justify-center gap-2 text-[11px] text-gray-400 mb-6">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Dữ liệu học tập &amp; lịch sử trò chuyện đã được đồng bộ an toàn</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSigningOut}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> Ở lại học tiếp
            </button>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-95 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSigningOut ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut size={14} /> Đăng Xuất An Toàn
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
