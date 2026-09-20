import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, FileText, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({
  isOpen,
  onAccept,
  onClose,
  canDismiss = false
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canDismiss && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canDismiss, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="privacy-notice-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 id="privacy-modal-title" className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Chính Sách Bảo Vệ Dữ Liệu Cá Nhân
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tuân thủ Nghị định 13/2023/NĐ-CP & Quy chế Đào tạo SMUT
                </p>
              </div>
            </div>
            {canDismiss && onClose && (
              <button
                onClick={onClose}
                aria-label="Đóng thông báo bảo mật"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed custom-scrollbar">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/40 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Hệ sinh thái Scholar Owl cam kết bảo mật tuyệt đối thông tin sinh viên, phục vụ duy nhất mục đích hỗ trợ học vụ số và theo dõi tiến độ đào tạo cá nhân.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-brand-purple" />
                1. Dữ liệu được thu thập & Xử lý
              </h4>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                <li>Thông tin định danh: Mã số sinh viên (MSSV), họ và tên, ngành học, lớp hành chính.</li>
                <li>Dữ liệu học vụ: Lịch sử điểm số GPA, tiến độ tích lũy tín chỉ, học phần đã đăng ký.</li>
                <li>Minh chứng rèn luyện: Ảnh/tài liệu tham gia hoạt động đoàn hội và chứng chỉ ngoại khóa.</li>
                <li>Lịch sử hội thoại: Các câu hỏi và giải đáp giữa sinh viên cùng Trợ lý Cú Scholar Owl.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                2. Mục đích sử dụng & Thời hạn lưu trữ
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dữ liệu được lưu trữ an toàn trên Google Cloud Firestore trong suốt quá trình học tập tại trường. Dữ liệu chỉ được truy cập bởi sinh viên sở hữu tài khoản và Ban cố vấn học tập được ủy quyền.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                3. Tuyên bố miễn trừ trách nhiệm AI (AI Disclaimer)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                Trợ lý Cú Scholar Owl sử dụng mô hình trí tuệ nhân tạo Gemini để hỗ trợ giải đáp nhanh. Các câu trả lời mang tính chất hướng dẫn tham khảo. Đối với các quyết định học vụ chính thức (học phí, xét tốt nghiệp, kỷ luật), sinh viên vui lòng đối chiếu văn bản quy định của Phòng Đào tạo SMUT.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
                4. Quyền của sinh viên
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Theo Nghị định 13/2023/NĐ-CP, bạn có toàn quyền: xem, yêu cầu hiệu chỉnh, yêu cầu trích xuất hoặc đề nghị xóa vĩnh viễn dữ liệu hội thoại và minh chứng cá nhân bất kỳ lúc nào tại mục Cài đặt tài khoản.
              </p>
            </div>
          </div>

          {/* Footer & Consent Action */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex flex-col gap-3">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-consent-privacy"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-brand-purple rounded border-slate-300 dark:border-slate-600 focus:ring-brand-purple"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Tôi đã đọc, hiểu rõ và đồng ý với các điều khoản bảo vệ dữ liệu cá nhân cùng tuyên bố miễn trừ trách nhiệm AI của hệ thống.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                id="btn-confirm-privacy-consent"
                disabled={!hasAgreed}
                onClick={onAccept}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-purple hover:bg-brand-purple-hover disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận & Tiếp tục
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
