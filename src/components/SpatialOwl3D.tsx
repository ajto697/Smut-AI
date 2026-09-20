import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { generateLoginGreeting } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

export const SpatialOwl3D: React.FC = () => {
  const [message, setMessage] = useState("Đang đồng bộ không gian học thuật... 🦉");
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt motion values for 3D spatial rotation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for Apple Vision Pro fluid spatial movement
  const springConfig = { damping: 22, stiffness: 120, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D rotations based on normalized pointer coordinates
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [16, -16]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const translateZ = useTransform(smoothY, [-0.5, 0.5], [15, 45]);

  // Eye pupil parallax movement
  const pupilX = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const pupilY = useTransform(smoothY, [-0.5, 0.5], [-5, 5]);

  // Global mouse move listener across viewport
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = e.clientX / innerWidth - 0.5;
      const yNorm = e.clientY / innerHeight - 0.5;
      mouseX.set(xNorm);
      mouseY.set(yNorm);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [mouseX, mouseY]);

  const fetchGreeting = async () => {
    setIsGenerating(true);
    try {
      const response = await generateLoginGreeting();
      setMessage(response);
    } catch {
      setMessage("Hú hú! 🦉 Chào mừng sinh viên K25. Nhập MSSV để kích hoạt trợ lý học vụ!");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchGreeting();
  }, []);

  const handleMascotClick = () => {
    if (isGenerating) return;
    setMessage("Cú đang tìm câu chúc mới... 🦉✨");
    fetchGreeting();
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-start select-none w-full max-w-lg"
      style={{ perspective: 1400 }}
    >
      {/* High-tech Glassmorphism Speech Bubble with 1px Cyan Glow border (#00FFFF) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-6 w-full max-w-md relative z-20"
      >
        <div 
          className="relative px-5 py-4 bg-slate-950/60 backdrop-blur-2xl rounded-none border border-[#00FFFF]/70 shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(0,255,255,0.22),0_1px_1px_rgba(255,255,255,0.15)_inset] text-slate-100"
        >
          {/* Subtle top indicator bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00FFFF] shadow-[0_0_8px_#00FFFF] animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FFFF] font-bold">
                Scholar Owl · Live Advisor
              </span>
            </div>
            <Sparkles size={12} className="text-[#00FFFF]" />
          </div>

          <p className="text-xs sm:text-sm font-['Plus_Jakarta_Sans'] font-medium leading-relaxed text-slate-200">
            {message}
          </p>

          {/* Sharp Beak with matching glowing border */}
          <div className="absolute top-full left-12 -translate-y-1.5 w-3 h-3 bg-slate-950 border-r border-b border-[#00FFFF]/70 rotate-45 shadow-[3px_3px_10px_rgba(0,255,255,0.2)]" />
        </div>
      </motion.div>

      {/* Floating Mascot Owl (Gentle 2-3px levitation animation) floating directly on dark canvas (No box) */}
      <motion.div
        animate={{
          y: [-3, 3, -3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Giant 3D Owl Container with spatial mouse tilt */}
        <motion.div
          onClick={handleMascotClick}
          style={{
            rotateX,
            rotateY,
            z: translateZ,
            transformStyle: 'preserve-3d'
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          className="relative cursor-pointer group flex flex-col items-start"
        >
          {/* Soft deep spatial shadow floating underneath */}
          <div className="absolute -bottom-10 left-6 w-56 h-10 bg-black/90 blur-3xl rounded-none group-hover:scale-115 transition-all duration-300 pointer-events-none" />

          {/* Floating Owl Graphic (Directly on canvas, no background box / container border) */}
          <div 
            className="relative flex items-center justify-center p-2 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Geometric 3D Vector Owl Mascot SVG - Floating with transparent background */}
            <svg 
              width="210" 
              height="210" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="select-none transition-transform duration-300 group-hover:scale-105"
            >
              {/* Owl Body Plate floating cleanly */}
              <polygon points="20,22 80,22 76,82 24,82" fill="#0b0f19" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
              
              {/* Subtle tech grid lines across body */}
              <line x1="20" y1="22" x2="80" y2="22" stroke="#00FFFF" strokeWidth="1.2" strokeOpacity="0.8" />
              <line x1="22" y1="52" x2="78" y2="52" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              
              {/* Tufts (Ears) with sharp geometry */}
              <polygon points="20,22 8,2 36,22" fill="#182030" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <polygon points="80,22 92,2 64,22" fill="#182030" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

              {/* Wing facets */}
              <polygon points="6,38 20,26 20,78 6,66" fill="#111624" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <polygon points="94,38 80,26 80,78 94,66" fill="#111624" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

              {/* Left Eye Socket */}
              <rect x="25" y="32" width="22" height="22" rx="0" fill="#04060a" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
              {/* Right Eye Socket */}
              <rect x="53" y="32" width="22" height="22" rx="0" fill="#04060a" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />

              {/* Interactive pupils tracking mouse in real-time */}
              <g>
                <circle cx="36" cy="43" r="6" fill="#ffffff" />
                <motion.circle 
                  cx="36" 
                  cy="43" 
                  r="3.5" 
                  fill="#00FFFF" 
                  style={{ x: pupilX, y: pupilY }}
                />
                <circle cx="34" cy="41" r="1.5" fill="#ffffff" />
              </g>

              <g>
                <circle cx="64" cy="43" r="6" fill="#ffffff" />
                <motion.circle 
                  cx="64" 
                  cy="43" 
                  r="3.5" 
                  fill="#00FFFF" 
                  style={{ x: pupilX, y: pupilY }}
                />
                <circle cx="62" cy="41" r="1.5" fill="#ffffff" />
              </g>

              {/* Beak */}
              <polygon points="50,47 41,60 59,60" fill="#f59e0b" />

              {/* Chest geometric sensor badge with Neon Accent */}
              <polygon points="50,68 60,78 50,88 40,78" fill="#161e2e" stroke="#CCFF00" strokeWidth="1.2" />
              <circle cx="50" cy="78" r="2.5" fill="#CCFF00" />
            </svg>
          </div>

          {/* Sharp spatial interaction chip floating beneath */}
          <div 
            className="mt-3 px-3 py-1 bg-white/[0.03] border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#CCFF00] group-hover:border-[#CCFF00]/50 rounded-none shadow-[0_6px_20px_rgba(0,0,0,0.7)] transition-all"
          >
            CHẠM ĐỂ CHÚC 🦉
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
