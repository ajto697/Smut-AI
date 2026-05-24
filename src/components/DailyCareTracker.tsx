import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Brain, CupSoda, Zap, Check, ChevronRight, MessageSquare, Compass, SunDim } from 'lucide-react';

const DUAL_CARE_QUESTIONS = [
  {
    id: 'q1',
    text: 'Chào bạn! Hôm nay học tập có mệt mỏi quá không? Bạn đã uống đủ nước chưa? 💧',
    options: [
      { text: 'Chưa, tớ mải ôn bài quá', reaction: 'Bù nước ngay đi nhé! Thiếu nước làm giảm trí nhớ và khả năng suy luận logic đấy. Đứng dậy lấy một ly nước ấm nào!' },
      { text: 'Tớ vừa uống xong một cốc lợn!', reaction: 'Tuyệt xuất sắc! Tiếp tục giữ phong độ này nha.' },
      { text: 'Tớ thèm trà sữa hơn 😭', reaction: 'Một ly trà sữa giải tỏa căng thẳng rất tốt, nhưng đừng uống muộn quá để bảo vệ giấc ngủ nhé!' }
    ]
  },
  {
    id: 'q2',
    text: 'Đợt ôn tập thi cử đang cận kề. Tớ thấy đêm qua bạn thức khá khuya? Có cần gợi ý mẹo phân chia thời gian? ⏰',
    options: [
      { text: 'Tớ đang bị quá tải...', reaction: 'Đừng lo lắng! Hãy áp dụng phương pháp Pomodoro: học 25 phút, nghỉ 5 phút. Tớ sẽ giúp bạn dọn bớt nhiệm vụ.' },
      { text: 'Vẫn chống chịu tốt!', reaction: 'Đáng khen ngợi! Cứ duy trì nhưng nhớ đi ngủ trước 11h30 tối để não bộ liên kết kiến thức tốt nhất.' },
      { text: 'Tớ cần một câu nói tạo động lực!', reaction: '“Mọi nỗ lực nhỏ bé hôm nay giống như từng hạt sỏi, tích tụ lâu ngày sẽ dựng nên tòa lâu đài rực rỡ.” Cố lên, tớ tin bạn!' }
    ]
  },
  {
    id: 'q3',
    text: 'Hôm nay bạn cảm thấy tinh thần thế nào? Hay cùng tớ làm một bài tập hít thở 1 phút nhé? 🧘‍♀️',
    options: [
      { text: 'Tớ đồng ý, khá stress', reaction: 'Tuyệt vời. Hít sâu vào bằng mũi trong 4 giây... giữ hơi 4 giây... thở nhẹ ra bằng miệng 4 giây. Bạn thấy lồng ngực nhẹ bớt chưa?' },
      { text: 'Tớ đang thấy tràn đầy năng lượng!', reaction: 'Thật rực rỡ! Hãy tận dụng năng lượng tích cực này để giải quyết các môn bài tập khó nhất học kỳ.' }
    ]
  }
];

export const DailyCareTracker: React.FC = () => {
  const [questionIdx, setQuestionIdx] = useState(() => {
    // Select different daily question based on calendar day
    return new Date().getDate() % DUAL_CARE_QUESTIONS.length;
  });

  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState(() => {
    const saved = localStorage.getItem('care_streak_count');
    return saved ? parseInt(saved) : 3; // Default 3 days
  });
  const [showWellnessTips, setShowWellnessTips] = useState(false);

  const activeQuestion = DUAL_CARE_QUESTIONS[questionIdx];

  const handleOptionClick = (idx: number) => {
    if (selectedResponse !== null) return;
    setSelectedResponse(idx);
    
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    localStorage.setItem('care_streak_count', newStreak.toString());
  };

  return (
    <div className="saas-card p-6 bg-brand-card border-white/5 relative overflow-hidden group font-sans">
      {/* Glow aura */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Heart size={16} className="fill-pink-400/20 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">Cú Nhỏ Chăm Sóc</h4>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mt-1">Daily Caretaker Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] font-mono font-bold">
            🔥 Chuỗi: {streakCount} ngày chăm sóc bản thân
          </div>
        </div>

        {/* Dynamic question text */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-white leading-relaxed">
            🦉 {activeQuestion.text}
          </p>

          <AnimatePresence mode="wait">
            {selectedResponse === null ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-1.5 pt-1"
              >
                {activeQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    className="p-3 bg-white/[0.01] hover:bg-brand-purple/5 border border-brand-border hover:border-brand-purple/35 text-left text-xs text-gray-400 hover:text-white rounded-xl transition-all flex items-center justify-between group"
                  >
                    <span>{opt.text}</span>
                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-xl bg-pink-500/[0.02] border border-pink-500/15 space-y-2.5"
              >
                <div className="flex items-center gap-1.5 text-[9px] text-pink-400 font-bold uppercase tracking-wider">
                  <Check size={12} /> Cú Phối Hợp Trả Lời:
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic italic-gentle">
                  "{activeQuestion.options[selectedResponse].reaction}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-[9px] text-gray-500">
                  <span>Bạn đã check-in sức khỏe thành công!</span>
                  <button
                    onClick={() => {
                      setSelectedResponse(null);
                      setQuestionIdx((questionIdx + 1) % DUAL_CARE_QUESTIONS.length);
                    }}
                    className="text-brand-cyan hover:underline hover:text-white transition-colors"
                  >
                    Đổi câu hỏi khác →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Small health indicators checklist */}
        <div className="pt-2 border-t border-brand-border/40 grid grid-cols-3 gap-2">
          <button 
            onClick={() => setShowWellnessTips(!showWellnessTips)}
            className="p-2 bg-white/[0.01] border border-brand-border text-[9px] text-gray-500 hover:text-white rounded-lg flex flex-col items-center gap-1 hover:border-brand-purple/20 transition-all col-span-3 text-center uppercase font-bold tracking-widest mt-1"
          >
            {showWellnessTips ? 'Thu Gọn Mẹo Chăm Sóc' : 'Bấm Xem Mẹo Chăm Sóc Cho Trí Não 🧠'}
          </button>
        </div>

        {/* Wellness Advice sliding panel */}
        <AnimatePresence>
          {showWellnessTips && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2.5 overflow-hidden text-[10px] text-gray-400 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-brand-border font-sans"
            >
              <div className="flex items-center gap-1.5 text-brand-purple font-bold uppercase tracking-wide">
                <Brain size={12} /> Khoa Học Giáo Dục &amp; Trí Nhớ:
              </div>
              <p>
                <strong>Quy luật giấc ngủ (90 phút):</strong> Muốn tỉnh táo dậy không mệt mỏi, hãy ngủ tròn chu kỳ 1.5 tiếng (ví dụ: ngủ 6 tiếng hoặc 7.5 tiếng).
              </p>
              <p>
                <strong>Active Recall (Ghi nhớ chủ động):</strong> Sau khi đọc một chương sách, hãy gấp lại ngay và cố tự viết ra sơ đồ tư duy hoặc giải nhanh 3 câu hỏi đố thay vì ngồi đọc lẩm bẩm. Hiệu quả ghi nhớ gấp 2 lần!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
