import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage, subscribeToToasts, dismissCyberToast } from '../services/toastService';

export const CyberToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          
          const borderColor = isError 
            ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
            : isSuccess 
            ? 'border-[#CCFF00]/60 shadow-[0_0_15px_rgba(204,255,0,0.25)]' 
            : isWarning 
            ? 'border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)]' 
            : 'border-[#00FFFF]/60 shadow-[0_0_15px_rgba(0,255,255,0.25)]';

          const textColor = isError 
            ? 'text-red-400' 
            : isSuccess 
            ? 'text-[#CCFF00]' 
            : isWarning 
            ? 'text-amber-300' 
            : 'text-[#00FFFF]';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto bg-[#070a10] border ${borderColor} p-3.5 backdrop-blur-md relative overflow-hidden`}
            >
              {/* Corner Sci-Fi Bracket */}
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white/20" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white/20" />

              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${textColor}`}>
                  {isError && <AlertCircle size={16} />}
                  {isSuccess && <CheckCircle2 size={16} />}
                  {isWarning && <AlertTriangle size={16} />}
                  {!isError && !isSuccess && !isWarning && <Info size={16} />}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${textColor}`}>
                      {toast.title}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => dismissCyberToast(toast.id)}
                  className="shrink-0 text-slate-500 hover:text-white transition-colors p-1"
                  title="Đóng thông báo"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
