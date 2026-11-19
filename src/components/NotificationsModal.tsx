import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCheck, Clock, ShieldAlert, Sparkles, Inbox } from 'lucide-react';
import { Notification } from '../types';
import { markAsRead, seedNotifications } from '../services/notificationService';
import { showCyberToast } from '../services/toastService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  studentId: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  studentId
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      const unreadList = notifications.filter(n => !n.isRead);
      await Promise.all(unreadList.map(n => markAsRead(n.id)));
      showCyberToast({
        type: 'success',
        title: 'THÔNG BÁO // HOÀN TẤT',
        message: 'Đã đánh dấu tất cả thông báo là đã đọc.'
      });
    } catch {
      showCyberToast({
        type: 'error',
        title: 'THÔNG BÁO // LỖI',
        message: 'Không thể cập nhật trạng thái thông báo lúc này.'
      });
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedNotifications(studentId);
      showCyberToast({
        type: 'info',
        title: 'HỌC VỤ // ĐỒNG BỘ',
        message: 'Đã tạo các thông báo học vụ mẫu vào Firestore.'
      });
    } catch {
      // Ignored
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#070a10] border border-white/20 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="text-sm font-['JetBrains_Mono'] font-bold text-white tracking-widest uppercase">
                  DISPATCHES &amp; ALERTS
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã xử lý'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[9px] font-mono font-bold text-[#CCFF00] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <CheckCheck size={11} /> Đọc hết
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500">
                  <Inbox size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                    HỘP THƯ RỖNG // NO_DISPATCHES
                  </p>
                  <p className="text-[11px] text-slate-400 font-sans max-w-xs leading-relaxed">
                    Hiện tại bạn không có thông báo học vụ mới nào từ nhà trường.
                  </p>
                </div>
                <button
                  onClick={handleSeedDemo}
                  className="px-3 py-1.5 bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[10px] font-mono font-bold text-[#CCFF00] uppercase tracking-wider transition-all"
                >
                  Đồng bộ lại thông báo mẫu
                </button>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  className={`p-3.5 border transition-all cursor-pointer relative group ${
                    notif.isRead
                      ? 'bg-white/[0.01] border-white/5 hover:border-white/20 opacity-70'
                      : 'bg-[#CCFF00]/[0.03] border-[#CCFF00]/30 hover:border-[#CCFF00]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${
                        notif.type === 'deadline'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : notif.type === 'event'
                          ? 'bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30'
                          : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30'
                      }`}>
                        {notif.type}
                      </span>
                      <h4 className="text-xs font-bold font-['Space_Grotesk'] text-white">
                        {notif.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 shrink-0">
                      <Clock size={10} />
                      <span>{new Date(notif.timestamp).toLocaleDateString('vi-VN')}</span>
                      {!notif.isRead ? (
                        <span className="px-1.5 py-0.5 bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 text-[8px] font-bold uppercase tracking-wider ml-1">
                          CHƯA ĐỌC
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-white/5 text-slate-500 border border-white/10 text-[8px] font-bold uppercase tracking-wider ml-1">
                          ĐÃ ĐỌC
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed pl-1">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white/[0.01] border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>MSSV: {studentId}</span>
            <span>SECURE PROTOCOL // SCHOLAR_OWL</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
