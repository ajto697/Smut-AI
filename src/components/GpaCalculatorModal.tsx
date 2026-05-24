import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Calculator, ArrowUpRight, Award, HelpCircle } from 'lucide-react';
import { HypotheticalCourse } from '../types';
import { SMUT_DATA } from '../constants';

interface GpaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCgpa?: number;
  currentCredits?: number;
}

const GRADE_SCALE = [
  { letter: 'A (Xuất sắc)', value: 4.0, color: 'text-brand-cyan' },
  { letter: 'B+ (Tốt)', value: 3.5, color: 'text-brand-purple' },
  { letter: 'B (Khá tốt)', value: 3.0, color: 'text-brand-purple' },
  { letter: 'C+ (Khá)', value: 2.5, color: 'text-emerald-400' },
  { letter: 'C (Trung bình khá)', value: 2.0, color: 'text-emerald-400' },
  { letter: 'D+ (Trung bình)', value: 1.5, color: 'text-yellow-400' },
  { letter: 'D (Yếu)', value: 1.0, color: 'text-yellow-400' },
  { letter: 'F (Kém - Trượt)', value: 0.0, color: 'text-red-500' },
];

export const GpaCalculatorModal: React.FC<GpaCalculatorModalProps> = ({
  isOpen,
  onClose,
  currentCgpa = 3.56,
  currentCredits = 42,
}) => {
  // Pre-populate with typical academic courses
  const [courses, setCourses] = useState<HypotheticalCourse[]>([
    { id: '1', name: 'Software Architecture', credits: 3, grade: 3.5 },
    { id: '2', name: 'Human Computer Interaction', credits: 3, grade: 4.0 },
    { id: '3', name: 'Advanced Databases', credits: 4, grade: 3.0 },
  ]);

  const [newName, setNewName] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newGrade, setNewGrade] = useState(4.0);

  const [baselineCgpa, setBaselineCgpa] = useState(currentCgpa);
  const [baselineCredits, setBaselineCredits] = useState(currentCredits);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const course: HypotheticalCourse = {
      id: Date.now().toString(),
      name: newName.trim(),
      credits: Number(newCredits),
      grade: Number(newGrade),
    };

    setCourses(prev => [...prev, course]);
    setNewName('');
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCourseGrade = (id: string, gradeValue: number) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, grade: gradeValue } : c));
  };

  // Calculations
  const totalSemCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalSemGradePoints = courses.reduce((sum, c) => sum + (c.credits * c.grade), 0);
  const projectedSemGpa = totalSemCredits > 0 ? (totalSemGradePoints / totalSemCredits) : 0;

  const totalProjectedCredits = baselineCredits + totalSemCredits;
  const originalEarnedPoints = baselineCgpa * baselineCredits;
  const projectedCgpa = totalProjectedCredits > 0
    ? ((originalEarnedPoints + totalSemGradePoints) / totalProjectedCredits)
    : 0;

  const cgpaDelta = projectedCgpa - baselineCgpa;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Glow backdrop filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-brand-bg border border-brand-border rounded-2xl overflow-hidden shadow-2xl relative z-10 font-sans flex flex-col md:flex-row h-[90vh] md:h-[650px]"
        >
          {/* Left panel: Inputs, simulations */}
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-brand-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">GPA Simulator</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Dự phóng kết quả học tập</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors block md:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {/* Baseline Configuration Form */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-brand-border mb-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Thông số tích lũy hiện tại</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">CGPA Baseline</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={baselineCgpa}
                    onChange={(e) => setBaselineCgpa(Math.min(4, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="saas-input w-full py-1.5 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Số Tín Chỉ Đã Tích Lũy</label>
                  <input
                    type="number"
                    min="0"
                    value={baselineCredits}
                    onChange={(e) => setBaselineCredits(Math.max(0, parseInt(e.target.value) || 0))}
                    className="saas-input w-full py-1.5 px-3 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Course Simulator Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Môn Học Dự Kiến Kỳ Này</h4>
                <span className="text-[9px] font-mono text-brand-cyan font-bold">{courses.length} môn • {totalSemCredits} tín chỉ</span>
              </div>

              {/* Course list */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                {courses.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-brand-border rounded-xl">
                    <p className="text-xs text-gray-600">Không có môn học mô phỏng nào. Hãy thêm ở dưới!</p>
                  </div>
                ) : (
                  courses.map(course => (
                    <motion.div
                      layout
                      key={course.id}
                      className="p-3 rounded-xl bg-white/[0.01] border border-brand-border/60 flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-3 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{course.name}</p>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">{course.credits} Tín chỉ</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <select
                          value={course.grade}
                          onChange={(e) => handleUpdateCourseGrade(course.id, parseFloat(e.target.value))}
                          className="bg-brand-card text-xs font-semibold text-white border border-brand-border rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-purple"
                        >
                          {GRADE_SCALE.map(g => (
                            <option key={g.letter} value={g.value}>
                              {g.letter.split(' ')[0]} ({g.value})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add Course Form */}
              <form onSubmit={handleAddCourse} className="p-4 rounded-xl border border-brand-border bg-white/[0.01] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Tên môn học (Ví dụ: Trại Hè Khoa Học)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="saas-input w-full py-1.5 px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Số tín chỉ</label>
                    <select
                      value={newCredits}
                      onChange={(e) => setNewCredits(parseInt(e.target.value))}
                      className="bg-brand-card text-xs text-white border border-brand-border rounded-lg px-2 py-1.5 w-full focus:outline-none focus:border-brand-purple"
                    >
                      <option value={1}>1 tín chỉ</option>
                      <option value={2}>2 tín chỉ</option>
                      <option value={3}>3 tín chỉ</option>
                      <option value={4}>4 tín chỉ</option>
                      <option value={5}>5 tín chỉ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-gray-500 uppercase mb-1">Điểm số ước tính</label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(parseFloat(e.target.value))}
                      className="bg-brand-card text-xs text-white border border-brand-border rounded-lg px-2 py-1.5 w-full focus:outline-none focus:border-brand-purple"
                    >
                      {GRADE_SCALE.map(g => (
                        <option key={g.letter} value={g.value}>
                          Điểm {g.letter}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-brand-purple text-xs font-bold text-white rounded-lg hover:bg-brand-purple/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(147,51,234,0.25)] border border-white/10"
                >
                  <Plus size={14} /> Thêm môn học simulation
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Live impact analytics */}
          <div className="w-full md:w-[320px] bg-brand-card p-6 flex flex-col justify-between">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors hidden md:block"
            >
              <X size={18} />
            </button>

            <div>
              <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.25em] mb-4 flex items-center gap-1.5">
                <Award size={14} /> Analytics Forecast
              </p>

              {/* Projected Semester GPA */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-brand-border mb-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Projected Semester GPA</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{projectedSemGpa.toFixed(2)}</span>
                  <span className="text-xs font-mono text-gray-500">/ 4.00</span>
                </div>
                {/* Rating statement Vietnamese */}
                <p className="text-[10px] text-gray-400 mt-2">
                  {projectedSemGpa >= 3.6 ? '🎉 Học lực xuất sắc! Phấn đấu học bổng nào.' :
                   projectedSemGpa >= 3.2 ? '🔥 Học lực giỏi, giữ vững phong độ nhé!' :
                   projectedSemGpa >= 2.5 ? '👍 Khá vững vàng. Cố nâng lên giỏi!' :
                   projectedSemGpa > 0 ? '📚 Đạt mức kỳ vọng. Hãy nỗ lực thêm!' : 'Nhập môn học để dự báo.'}
                </p>
              </div>

              {/* Cumulative GPA Update */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-brand-border relative overflow-hidden">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Tác Động Lên CGPA Tích Lũy</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-brand-cyan tracking-tight">{projectedCgpa.toFixed(2)}</span>
                  <span className="text-xs font-mono text-gray-500">/ 4.0</span>
                </div>

                {/* CGPA delta display */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    cgpaDelta > 0 ? 'bg-brand-emerald/10 text-brand-emerald' :
                    cgpaDelta < 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-500'
                  }`}>
                    {cgpaDelta > 0 ? `+${cgpaDelta.toFixed(3)} Tang ↑` :
                     cgpaDelta < 0 ? `${cgpaDelta.toFixed(3)} Giảm ↓` : 'Không đổi'}
                  </span>
                  <p className="text-[10px] text-gray-500 font-mono">from {baselineCgpa.toFixed(2)}</p>
                </div>

                {/* Projected Progress Bar on total scale */}
                <div className="mt-4 pt-4 border-t border-brand-border/60">
                  <div className="flex justify-between items-center text-[8px] text-gray-500 font-bold uppercase mb-1">
                    <span>Tổng Tín Chỉ Sau Học Kỳ</span>
                    <span>{totalProjectedCredits} credits</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-brand-purple"
                      style={{ width: `${(baselineCredits / 120) * 100}%` }}
                      title="Tín chỉ đã tích lũy"
                    />
                    <div
                      className="h-full bg-brand-cyan animate-pulse"
                      style={{ width: `${(totalSemCredits / 120) * 100}%` }}
                      title="Tín chỉ mô phỏng mới"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-gray-500 mt-1 font-mono">
                    <span>Baseline: {baselineCredits}</span>
                    <span>Target: 120</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Tip */}
            <div className="p-3 bg-brand-purple/5 border border-brand-purple/15 rounded-xl text-[10px] leading-relaxed text-gray-400 flex items-start gap-2">
              <HelpCircle size={14} className="text-brand-purple shrink-0 mt-0.5" />
              <span>
                Simulate your future exams or assessments to calculate target score needed for your scholarship requirement!
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
