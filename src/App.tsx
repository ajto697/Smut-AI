import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, MapPin, ClipboardList, FileText, CreditCard, School, Info, User, 
  ChevronRight, LogOut, ShieldCheck, Database, LayoutDashboard, UserCircle, 
  Save, X, Phone, Mail, BookOpen, Calendar, Bell, Clock, CheckCheck, 
  AlertCircle, Stars, QrCode, Search, MessageSquare, Library, BookText, 
  Settings, HelpCircle, Plus, GraduationCap, Rocket, Globe, Book, TrendingUp,
  ExternalLink, Download, Camera, Sun, Moon, Calculator, Sparkles,
  History, Trash2, CheckCircle2, RefreshCw, Sliders, Award, BookMarked, FileCheck2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Message, Student, Notification, CalendarEvent } from './types';
import { getChatResponse, generateLoginGreeting, generateDashboardGreeting, checkAiHealth, AiHealthStatus } from './services/geminiService';
import { SMUT_DATA } from './constants';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { verifyStudent, updateStudentProfile, seedDemoData, testConnection, getStudentProfile } from './services/studentService';
import { subscribeToNotifications, markAsRead, seedNotifications } from './services/notificationService';
import { subscribeToCalendarEvents, seedCalendarEvents } from './services/calendarService';
import { 
  loginWithMssv, 
  loginWithEmail, 
  registerStudent, 
  quickDemoLogin, 
  logoutUser, 
  onAuthChange 
} from './services/authService';
import { saveChatMessageToFirestore, subscribeToStudentChat } from './services/chatService';

// Import New Features
import { GpaCalculatorModal } from './components/GpaCalculatorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CyberToastContainer } from './components/CyberToast';
import { showCyberToast } from './services/toastService';
import { StudyOwlAzota } from './components/StudyOwlAzota';
import { AppIntro } from './components/AppIntro';
import { AppOutro } from './components/AppOutro';
import { InteractiveTour } from './components/InteractiveTour';
import { DailyCareTracker } from './components/DailyCareTracker';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { Compass } from 'lucide-react';
import { SpatialOwl3D } from './components/SpatialOwl3D';
import { SpatialFloatingInput } from './components/SpatialFloatingInput';
import { SpatialSharpButton } from './components/SpatialSharpButton';

// --- Components ---

const highlightVietnameseTerms = (text: string) => {
  if (!text) return "";
  let formatted = text;
  
  // Custom keyword highlighting to add visual splash
  formatted = formatted.replace(
    /(lịch học vụ|lịch trình học vụ|lịch học)/gi, 
    '<span class="text-brand-purple font-extrabold">$1</span>'
  );
  formatted = formatted.replace(
    /(màu tím)/gi, 
    '<span class="text-brand-purple font-extrabold">$1</span>'
  );
  formatted = formatted.replace(
    /(điểm rèn luyện|rèn luyện tốt|rèn luyện)/gi, 
    '<span class="text-brand-emerald font-extrabold">$1</span>'
  );
  formatted = formatted.replace(
    /(GPA|viên điểm số|vũ trụ điểm số|điểm số|học bổng)/gi, 
    '<span class="text-brand-cyan font-extrabold">$1</span>'
  );
  formatted = formatted.replace(
    /(MSSV|OTP)/g, 
    '<span class="text-amber-400 font-extrabold">$1</span>'
  );

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

const Logo = ({ size = 32, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="owlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CCFF00" />
        <stop offset="100%" stopColor="#00FFFF" />
      </linearGradient>
      <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00FFFF" />
        <stop offset="100%" stopColor="#CCFF00" />
      </linearGradient>
      <radialGradient id="owlGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Background soft glow */}
    <circle cx="50" cy="50" r="35" fill="url(#owlGlow)" opacity="0.15" />
    
    {/* Body Shape - Shield styled owl body */}
    <path 
      d="M50 15 C33 15, 23 22, 20 35 C18 45, 22 55, 28 65 C38 80, 50 85, 50 85 C50 85, 62 80, 72 65 C78 55, 82 45, 80 35 C77 22, 67 15, 50 15 Z" 
      fill="url(#owlGradient)" 
      fillOpacity="0.18"
      stroke="url(#owlGradient)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    
    {/* Owl ears/horns */}
    <path 
      d="M24 28 L14 15 L32 21 M76 28 L86 15 L68 21" 
      stroke="url(#owlGradient)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Glowing Academic Owl Eyes */}
    <circle cx="36" cy="42" r="11" stroke="url(#eyeGradient)" strokeWidth="2.5" fill="#090b11" />
    <circle cx="36" cy="42" r="5" fill="var(--color-brand-cyan)" className="animate-pulse" />
    <circle cx="34" cy="40" r="1.5" fill="white" />

    <circle cx="64" cy="42" r="11" stroke="url(#eyeGradient)" strokeWidth="2.5" fill="#090b11" />
    <circle cx="64" cy="42" r="5" fill="var(--color-brand-cyan)" className="animate-pulse" />
    <circle cx="62" cy="40" r="1.5" fill="white" />
    
    {/* Cute Golden Beak */}
    <path 
      d="M50 46 L45 54 L55 54 Z" 
      fill="#ffb800" 
      stroke="#ffb800" 
      strokeWidth="1" 
      strokeLinejoin="round" 
    />
    
    {/* Wise Eyebrows (Micro Details) */}
    <path d="M26 29 C30 27, 38 29, 42 32 M74 29 C70 27, 62 29, 58 32" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Wing Feather Accents */}
    <path d="M19 46 C12 53, 14 62, 19 69" stroke="var(--color-brand-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M81 46 C88 53, 86 62, 81 69" stroke="var(--color-brand-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    
    {/* Smart Micro-controller Chestplate & AI Nodes */}
    <path d="M50 63 L45 70 L55 70 Z" fill="var(--color-brand-emerald)" fillOpacity="0.8" />
    <line x1="50" y1="55" x2="50" y2="63" stroke="var(--color-brand-emerald)" strokeWidth="1.5" strokeDasharray="2 1" />
  </svg>
);

const LoginFlyingOwl = () => {
  const [message, setMessage] = useState("Đang kết nối vũ trụ học thuật... 🦉🌌");
  const [clickCount, setClickCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchGreeting = async () => {
    setIsGenerating(true);
    try {
      const response = await generateLoginGreeting();
      setMessage(response);
    } catch (e) {
      setMessage("Hú hú! 🦉 Nhập ngay MSSV và OTP để cùng mình khám phá vũ trụ điểm số nhé!");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchGreeting();
  }, []);

  const handleMascotClick = () => {
    if (isGenerating) return;
    setClickCount(prev => prev + 1);
    setMessage("Cú đang bay tìm câu chúc mới... 🔮");
    fetchGreeting();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      {/* Flight path animation container */}
      <motion.div
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ left: "20%", top: "35%" }}
        animate={{
          x: [0, 80, -40, 100, 0],
          y: [0, -90, 80, -20, 0],
          rotate: [0, 8, -6, 12, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div 
          onClick={handleMascotClick}
          animate={{ 
            rotate: clickCount * 360,
            y: [0, -6, 0]
          }}
          transition={{ 
            rotate: { type: "spring", stiffness: 120, damping: 12 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative flex flex-col items-center group select-none"
        >
          {/* Speech bubble */}
          <div className="absolute bottom-full mb-3 bg-slate-900/95 border border-brand-emerald/30 px-3.5 py-2 rounded-2xl text-[11px] font-sans text-gray-200 shadow-xl max-w-[200px] text-center backdrop-blur-md flex flex-col items-center select-none">
            <span className="font-bold text-brand-emerald flex items-center gap-1">Cú Trợ Lý 🦉</span>
            <span className="mt-0.5 leading-relaxed font-medium">{message}</span>
            <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-brand-emerald/30 absolute top-full left-1/2 -translate-x-1/2 -translate-y-[6.1px] rotate-45" />
          </div>

          {/* Flying Owl Mascot */}
          <div className="relative">
            {/* Glowing Aura Ring */}
            <div className="absolute -inset-4 bg-brand-emerald/10 blur-xl rounded-full group-hover:bg-brand-purple/20 transition-all duration-500 animate-pulse" />
            
            <svg 
              width="68" 
              height="68" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_15px_rgba(52,211,153,0.35)] hover:scale-105 active:scale-95 transition-transform"
            >
              <defs>
                <linearGradient id="mascotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-brand-emerald)" />
                  <stop offset="50%" stopColor="var(--color-brand-purple)" />
                  <stop offset="100%" stopColor="var(--color-brand-cyan)" />
                </linearGradient>
                <linearGradient id="mascotEyes" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-brand-cyan)" />
                  <stop offset="100%" stopColor="var(--color-brand-emerald)" />
                </linearGradient>
              </defs>
              
              {/* Outer Cyber Wings details for flying look */}
              <path 
                d="M14 45 C4 35, 8 65, 23 55" 
                stroke="var(--color-brand-cyan)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                className="origin-right animate-bounce"
                style={{ animationDuration: '0.8s' }}
              />
              <path 
                d="M86 45 C96 35, 92 65, 77 55" 
                stroke="var(--color-brand-cyan)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                className="origin-left animate-bounce"
                style={{ animationDuration: '0.8s', animationDelay: '0.1s' }}
              />

              {/* Body */}
              <circle cx="50" cy="50" r="28" fill="#0b0f19" stroke="url(#mascotGrad)" strokeWidth="3" />
              
              {/* Tufts/Ears */}
              <path d="M28 27 L18 16 L38 25 M72 27 L82 16 L62 25" stroke="url(#mascotGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Glowing smart eyes */}
              <circle cx="38" cy="45" r="9" stroke="url(#mascotEyes)" strokeWidth="2.5" fill="#020617" />
              <circle cx="38" cy="45" r="3.5" fill="var(--color-brand-cyan)" />
              <circle cx="36" cy="43" r="1.2" fill="white" />

              <circle cx="62" cy="45" r="9" stroke="url(#mascotEyes)" strokeWidth="2.5" fill="#020617" />
              <circle cx="62" cy="45" r="3.5" fill="var(--color-brand-cyan)" />
              <circle cx="60" cy="43" r="1.2" fill="white" />
              
              {/* Golden beak */}
              <path d="M50 49 L45 57 L55 57 Z" fill="#ffb800" stroke="#ffb800" strokeWidth="1" strokeLinejoin="round" />

              {/* Smart chest pattern or scarf */}
              <path d="M35 68 C35 73, 65 73, 65 68" stroke="var(--color-brand-purple)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="62" r="2" fill="var(--color-brand-emerald)" />
            </svg>
          </div>

          <div className="mt-1 bg-brand-emerald/15 hover:bg-brand-emerald/20 text-[9px] text-brand-emerald font-bold px-2 py-0.5 rounded border border-brand-emerald/25 font-mono tracking-wider">
            CHẠM TỚ 🦉
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const DiamondDot = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <polygon 
      points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`}
      fill="#CCFF00" 
      stroke="#000000" 
      strokeWidth={1}
      className="filter drop-shadow-[0_0_6px_#CCFF00]"
    />
  );
};

const NavButton = ({ num, icon: Icon, label, active, onClick, badge, className = "" }: any) => (
  <button 
    onClick={onClick}
    className={`group nav-item w-full ${active ? 'nav-item-active' : 'nav-item-inactive'} ${className}`}
  >
    <div className="flex items-center gap-2.5">
      {num && (
        <span className={`text-[10px] font-mono font-bold transition-colors duration-150 ${active ? 'text-[#00FFFF]' : 'text-slate-600 group-hover:text-[#00FFFF]'}`}>
          {num}
        </span>
      )}
      <Icon size={15} className={`transition-colors duration-150 ${active ? 'text-[#CCFF00]' : 'text-slate-400 group-hover:text-[#CCFF00]'}`} />
      <span className={`font-mono text-xs font-bold tracking-wider transition-colors duration-150 ${active ? 'text-[#CCFF00]' : 'text-slate-300 group-hover:text-white'}`}>{label}</span>
    </div>
    {typeof badge === 'number' && badge > 0 && (
      <span className="bg-[#CCFF00] text-black text-[9px] px-1.5 py-0.5 rounded-none font-mono font-bold shadow-[0_0_8px_rgba(204,255,0,0.4)]">
        {badge}
      </span>
    )}
  </button>
);

const ProfileItem = ({ icon: Icon, label, value, isEditing, onChange, name, link, error, campusId }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <Icon size={12} />
        {label}
      </div>
      {!isEditing && link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-brand-cyan uppercase hover:underline flex items-center gap-1 group">
          Open Maps <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      )}
    </div>
    {isEditing ? (
      <div className="space-y-1">
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`saas-input w-full text-xs ${error ? 'border-red-500/50' : ''}`}
        />
        {error && <p className="text-[9px] text-red-500 font-bold uppercase">{error}</p>}
      </div>
    ) : (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white tracking-tight">{value}</p>
        {campusId && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="w-full h-28 rounded-xl border border-brand-border overflow-hidden relative group cursor-pointer shadow-lg"
            onClick={() => window.open(link, '_blank')}
          >
            <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110`} style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+9333ea(${campusId === 'cs1' ? '106.698,10.773' : '106.719,10.729'})/${campusId === 'cs1' ? '106.698,10.773' : '106.719,10.729'},14/300x150@2x?access_token=pk.eyJ1IjoiZGV2LW1hZ2ljIiwiYSI6ImNscjZqbjRrajBmamIyanBlM3F3NmJ3ZGMifQ')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Live Location Campus</span>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-1 px-2 bg-brand-purple/90 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase">Interactive</div>
            </div>
          </motion.div>
        )}
      </div>
    )}
  </div>
);

const QuickPrompt = ({ text, onClick }: any) => (
  <button 
    onClick={onClick}
    className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-none text-xs font-mono font-medium text-slate-300 hover:text-[#CCFF00] hover:border-[#CCFF00]/50 hover:bg-white/[0.07] transition-all flex items-center gap-2"
  >
    <Stars size={12} className="text-[#CCFF00]" />
    {text}
  </button>
);

const formatChatHtml = (text: string) => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-white/10 text-[#CCFF00] font-mono text-[11px]">$1</code>')
    .replace(/\n/g, '<br/>');
};

const MessageBubble: React.FC<{ message: Message; studentName: string }> = ({ message, studentName }) => {
  const isBot = message.role === 'assistant';
  
  // Extract map tag if present
  const mapTagMatch = message.content.match(/\[MAP:(cs[12])\]/);
  const campusId = mapTagMatch ? mapTagMatch[1] : null;
  const cleanContent = message.content.replace(/\[MAP:cs[12]\]/g, '').trim();
  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} mb-6 group`}
    >
      <div className={`flex items-center gap-2 mb-1.5 ${isBot ? '' : 'flex-row-reverse'}`}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={`w-6 h-6 rounded-none flex items-center justify-center transition-all ${
            isBot 
              ? 'bg-black text-[#00FFFF] border border-[#00FFFF]/60 shadow-[0_0_8px_rgba(0,255,255,0.3)]' 
              : 'bg-black border border-[#CCFF00]/60 text-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.2)]'
          }`}
        >
           {isBot ? <Logo size={14} /> : <span className="text-[10px] font-mono font-bold">{studentName.charAt(0) || 'B'}</span>}
        </motion.div>
        <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400">
          {isBot ? 'NEURAL ASSISTANT' : 'USER TERMINAL'}
        </span>
      </div>

      {/* Data Packet */}
      <div className={`max-w-[88%] p-4 text-xs font-['Plus_Jakarta_Sans'] leading-relaxed relative rounded-none transition-all duration-200 ${
        isBot 
          ? 'bg-black border-l-2 border-[#00FFFF] border-t-0 border-r-0 border-b-0 text-slate-200 shadow-[0_0_25px_rgba(0,0,0,0.9)]' 
          : 'bg-transparent border-r-2 border-[#CCFF00] border-t-0 border-l-0 border-b-0 text-white text-right'
      }`}>
        {/* Top-left system tag for AI Data Packet */}
        {isBot && (
          <div className="text-[9px] font-mono font-bold text-[#00FFFF] mb-2 tracking-widest flex items-center gap-1.5 opacity-90 select-none">
            <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-none shadow-[0_0_6px_#00FFFF]" />
            <span>[SYSTEM_MSG: {timeFormatted}]</span>
          </div>
        )}

        {!isBot && (
          <div className="text-[9px] font-mono font-bold text-[#CCFF00] mb-2 tracking-widest flex items-center justify-end gap-1.5 opacity-90 select-none">
            <span>[DATA_TX: {timeFormatted}]</span>
            <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-none shadow-[0_0_6px_#CCFF00]" />
          </div>
        )}

        <div 
          className={`relative z-10 ${isBot ? 'text-left' : 'text-right'}`}
          dangerouslySetInnerHTML={{ __html: formatChatHtml(cleanContent) }} 
        />

        {isBot && campusId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 w-full h-32 rounded-none border border-[#00FFFF]/40 overflow-hidden relative group cursor-pointer shadow-xl"
            onClick={() => window.open(campusId === 'cs1' ? SMUT_DATA.campuses[0].maps : SMUT_DATA.campuses[1].maps, '_blank')}
          >
            <div className={`absolute inset-0 bg-cover bg-center`} style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+00ffff(${campusId === 'cs1' ? '106.698,10.773' : '106.719,10.729'})/${campusId === 'cs1' ? '106.698,10.773' : '106.719,10.729'},15/400x200@2x?access_token=pk.eyJ1IjoiZGV2LW1hZ2ljIiwiYSI6ImNscjZqbjRrajBmamIyanBlM3F3NmJ3ZGMifQ')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 text-left">
              <p className="text-[10px] font-mono font-bold text-[#CCFF00] uppercase tracking-widest">{campusId === 'cs1' ? SMUT_DATA.campuses[0].name : SMUT_DATA.campuses[1].name}</p>
              <p className="text-[9px] font-mono text-slate-300 mt-0.5">{campusId === 'cs1' ? SMUT_DATA.campuses[0].address : SMUT_DATA.campuses[1].address}</p>
            </div>
            <div className="absolute top-2 right-2 p-1 bg-black/80 border border-[#00FFFF]/50 rounded-none text-[#00FFFF]">
               <MapPin size={12} />
            </div>
          </motion.div>
        )}

        <div className={`mt-3 text-[9px] font-mono flex items-center gap-1.5 ${isBot ? 'text-slate-500' : 'text-slate-500 justify-end'}`}>
          <Clock size={9} className={isBot ? 'text-[#00FFFF]' : 'text-[#CCFF00]'} />
          <span>{timeFormatted}</span>
          <span className="text-slate-600">//</span>
          <span className={`uppercase tracking-widest ${isBot ? 'text-[#00FFFF]/70' : 'text-[#CCFF00]/70'}`}>
            {isBot ? 'VERIFIED_FEED' : 'PACKET_ENCRYPTED'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

interface HudPreferences {
  deadlineAlerts: boolean;
  eventAlerts: boolean;
  toastAlerts: boolean;
  hudScanlines: boolean;
}

const DEFAULT_PREFERENCES: HudPreferences = {
  deadlineAlerts: true,
  eventAlerts: true,
  toastAlerts: true,
  hudScanlines: true
};

const REGISTRATION_CATALOG = [
  { code: 'COMP301', name: 'Trí tuệ Nhân tạo & Máy học Ứng dụng', credits: 3, schedule: 'Thứ 2 (Tiết 1-3) · P.C302', slots: '48/60', status: 'Mở đăng ký' },
  { code: 'EDUC204', name: 'Thiết kế Học liệu Số & Mô phỏng Tương tác', credits: 3, schedule: 'Thứ 4 (Tiết 4-6) · P.E501', slots: '52/60', status: 'Mở đăng ký' },
  { code: 'MATH218', name: 'Xác suất Thống kê & Phân tích Dữ liệu', credits: 3, schedule: 'Thứ 6 (Tiết 1-3) · P.A201', slots: '39/60', status: 'Mở đăng ký' },
  { code: 'SOFT310', name: 'Kiến trúc Phần mềm & Điện toán Đám mây', credits: 3, schedule: 'Thứ 5 (Tiết 7-9) · P.C404', slots: '60/60', status: 'Chờ mở thêm' }
];

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<'overview' | 'chat' | 'academic' | 'study-owl' | 'settings'>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGpaModalOpen, setIsGpaModalOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isOutroOpen, setIsOutroOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [loginStep, setLoginStep] = useState<'login' | 'mfa'>('login');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarFilter, setCalendarFilter] = useState<'upcoming' | 'full'>('upcoming');
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);
  const [activeQuickModal, setActiveQuickModal] = useState<'registration' | 'transcript' | 'certificates' | null>(null);
  const [selectedRegCodes, setSelectedRegCodes] = useState<string[]>(['COMP301', 'EDUC204']);

  const [aiHealth, setAiHealth] = useState<AiHealthStatus | null>(null);
  const [isCheckingAi, setIsCheckingAi] = useState(false);
  const [preferences, setPreferences] = useState<HudPreferences>(() => {
    try {
      const saved = localStorage.getItem('scholar_owl_prefs');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Typewriter effect for command placeholder
  const TYPEWRITER_PHRASES = [
    "NHẬP LỆNH HOẶC CÂU HỎI HỌC VỤ...",
    "TRA CỨU LỊCH THI HỌC KỲ VÀ PHÒNG THI...",
    "DỰ BÁO TIẾN ĐỘ TÍN CHỈ VÀ GPA MỤC TIÊU...",
    "ĐỊNH VỊ PHÒNG HỌC CƠ SỞ 1 VÀ CƠ SỞ 2..."
  ];
  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex % TYPEWRITER_PHRASES.length];
    let timer: any;

    if (!isDeleting && charIndex <= currentPhrase.length) {
      timer = setTimeout(() => {
        setPlaceholderText(currentPhrase.slice(0, charIndex));
        setCharIndex(c => c + 1);
      }, 50);
    } else if (!isDeleting && charIndex > currentPhrase.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setPlaceholderText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
      }, 25);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex(p => p + 1);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  const [dashboardGreeting, setDashboardGreeting] = useState('');
  const [isGeneratingDashboardGreeting, setIsGeneratingDashboardGreeting] = useState(false);

  const fetchDashboardMascotGreeting = async (selectedStudent: Student | null = student) => {
    if (!selectedStudent) return;
    setIsGeneratingDashboardGreeting(true);
    try {
      const role = selectedStudent.mssv === "25010001" 
        ? "Lớp trưởng lớp Sư phạm Toán học K25, bảo bối đắc lực quản lý 61 thành viên"
        : "Cán sự học vụ tài năng, đang theo sát 52 thành viên học tập";
        
      const greeting = await generateDashboardGreeting(selectedStudent.name, selectedStudent.major, role);
      setDashboardGreeting(greeting);
    } catch (e) {
      setDashboardGreeting(`Chào ngày mới, ${selectedStudent.name.split(' ')[0]}! 🦉 Hãy chuẩn bị thật tốt bằng cách xem thêm lịch học vụ màu Tím và theo dõi rèn luyện nhé!`);
    } finally {
      setIsGeneratingDashboardGreeting(false);
    }
  };

  useEffect(() => {
    if (student && !dashboardGreeting) {
      fetchDashboardMascotGreeting(student);
    }
  }, [student]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  const [mssvInput, setMssvInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [mssvError, setMssvError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Firebase Auth & Cloud Firestore state
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authTab, setAuthTab] = useState<'mssv' | 'email' | 'register'>('mssv');
  const [emailInput, setEmailInput] = useState('');
  const [regName, setRegName] = useState('');
  const [regMssv, setRegMssv] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regMajor, setRegMajor] = useState('Sư phạm Toán học');

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => `session_${Date.now()}`);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [firestoreArchive, setFirestoreArchive] = useState<Message[]>([]);
  const hasHydratedFirestoreChatRef = useRef(false);
  const skipNextFirestoreAutoLoadRef = useRef(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const refreshAiHealth = async () => {
    setIsCheckingAi(true);
    try {
      const status = await checkAiHealth();
      setAiHealth(status);
    } finally {
      setIsCheckingAi(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('scholar_owl_prefs', JSON.stringify(preferences));
    } catch {
      // Ignore storage quota errors
    }
  }, [preferences]);

  useEffect(() => {
    testConnection().catch(() => {});
    seedCalendarEvents().catch(() => {});
    seedDemoData().catch(() => {});
    refreshAiHealth();
    
    const unsubscribeCalendar = subscribeToCalendarEvents(setCalendarEvents);

    // Auto-restore session if saved in sessionStorage
    const savedMssv = sessionStorage.getItem('scholar_owl_session_mssv');
    if (savedMssv) {
      getStudentProfile(savedMssv).then((s) => {
        if (s) {
          setStudent(s);
          setIsLoggedIn(true);
          seedNotifications(s.mssv).catch(() => {});
          showCyberToast({
            type: 'info',
            title: 'PHIÊN HỌC VỤ // KHÔI PHỤC',
            message: `Chào mừng ${s.name} trở lại Neural Terminal.`
          });
        }
      }).catch(() => {});
    }

    return () => unsubscribeCalendar();
  }, []);

  // Load saved chat sessions per student from localStorage
  useEffect(() => {
    if (!student) {
      setChatSessions([]);
      hasHydratedFirestoreChatRef.current = false;
      skipNextFirestoreAutoLoadRef.current = false;
      return;
    }
    try {
      const raw = localStorage.getItem(`scholar_owl_chat_sessions_${student.mssv}`);
      const parsed: ChatSession[] = raw ? JSON.parse(raw) : [];
      setChatSessions(Array.isArray(parsed) ? parsed : []);
    } catch {
      setChatSessions([]);
    }
    hasHydratedFirestoreChatRef.current = false;
    skipNextFirestoreAutoLoadRef.current = false;
  }, [student?.mssv]);

  // Persist current chat session whenever it has user turns
  useEffect(() => {
    if (!student) return;
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg) return;

    const title = firstUserMsg.content.trim().slice(0, 60) + (firstUserMsg.content.trim().length > 60 ? '…' : '');
    const updatedSession: ChatSession = {
      id: activeSessionId,
      title,
      updatedAt: messages[messages.length - 1]?.timestamp || Date.now(),
      messages
    };

    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== activeSessionId);
      const next = [updatedSession, ...filtered].slice(0, 25);
      try {
        localStorage.setItem(`scholar_owl_chat_sessions_${student.mssv}`, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [messages, activeSessionId, student?.mssv]);

  useEffect(() => {
    if (student) {
      const unsubscribeNotifs = subscribeToNotifications(student.mssv, (notifs) => {
        setNotifications(notifs);
      });
      const unsubscribeChat = subscribeToStudentChat(student.mssv, (dbMessages) => {
        setFirestoreArchive(dbMessages || []);
        if (
          dbMessages &&
          dbMessages.length > 0 &&
          !hasHydratedFirestoreChatRef.current &&
          !skipNextFirestoreAutoLoadRef.current
        ) {
          hasHydratedFirestoreChatRef.current = true;
          setMessages(dbMessages);
        }
      });
      return () => {
        unsubscribeNotifs();
        unsubscribeChat();
      };
    }
  }, [student]);

  const dedupedCalendarEvents = useMemo(() => {
    const seen = new Map<string, CalendarEvent>();
    for (const evt of calendarEvents) {
      const key = `${(evt.title || '').trim().toLowerCase()}__${evt.date}`;
      if (!seen.has(key)) {
        seen.set(key, evt);
      }
    }
    return Array.from(seen.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [calendarEvents]);

  const displayedCalendarEvents = useMemo(() => {
    if (calendarFilter === 'full') return dedupedCalendarEvents;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcoming = dedupedCalendarEvents.filter(evt => new Date(evt.date).getTime() >= now.getTime());
    return (upcoming.length > 0 ? upcoming : dedupedCalendarEvents).slice(0, 4);
  }, [dedupedCalendarEvents, calendarFilter]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isLoggedIn) {
      const isConsentGiven = localStorage.getItem('smut_privacy_consent');
      if (!isConsentGiven) {
        setIsPrivacyOpen(true);
      } else {
        const hasSeen = localStorage.getItem('hasSeenIntro') === 'true' || localStorage.getItem('smut_onboarding_done') === 'true';
        if (!hasSeen) {
          setIsIntroOpen(true);
        }
      }
    }
  }, [isLoggedIn]);


  const validateMSSV = (mssv: string) => {
    return /^\d{8}$/.test(mssv);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mssv') {
      if (value && !/^\d*$/.test(value)) return;
      if (value.length > 8) return;
    }
    setEditedStudent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveProfile = async () => {
    if (!editedStudent || !student) return;
    
    if (!validateMSSV(editedStudent.mssv)) {
      setMssvError('MSSV must be 8 digits');
      return;
    }
    setMssvError('');

    try {
      await updateStudentProfile(student.mssv, {
        mssv: editedStudent.mssv,
        email: editedStudent.email,
        phone: editedStudent.phone
      });
      setStudent(editedStudent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleExportCSV = () => {
    if (!student) return;
    
    const headers = ['Field', 'Value'];
    const data = [
      ['Name', student.name],
      ['MSSV', student.mssv],
      ['Major', student.major],
      ['Email', student.email],
      ['Phone', student.phone],
      ['Campus', SMUT_DATA.campuses[0].name]
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student_profile_${student.mssv}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    // Check file size (limit to 500KB for Firestore base64 storage)
    if (file.size > 500 * 1024) {
      alert('File too large. Please select an image smaller than 500KB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateStudentProfile(student.mssv, { photoURL: base64String });
        setStudent(prev => prev ? { ...prev, photoURL: base64String } : null);
      } catch (error) {
        console.error('Error updating photo:', error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    
    const chatContent = messages.map(m => {
      const timestamp = new Date(m.timestamp).toLocaleString();
      const role = m.role === 'user' ? (student?.name || 'User') : 'AI Assistant';
      return `[${timestamp}] ${role}:\n${m.content}\n\n`;
    }).join('-'.repeat(30) + '\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chat_history_${student?.mssv || 'export'}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMssvLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMSSV(mssvInput)) {
      setLoginError('MSSV phải gồm đúng 8 chữ số (ví dụ: 25010001)');
      return;
    }
    setLoginError('');
    setIsAuthenticating(true);
    try {
      const res = await loginWithMssv(mssvInput, passInput);
      if (res.student) {
        setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString());
        setEditedStudent(res.student);
        setLoginStep('mfa');
      } else {
        setLoginError(res.error || 'Mã sinh viên hoặc mật khẩu không chính xác');
      }
    } catch (error) {
      setLoginError('Lỗi kết nối cơ sở dữ liệu');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@')) {
      setLoginError('Vui lòng nhập định dạng email hợp lệ');
      return;
    }
    setLoginError('');
    setIsAuthenticating(true);
    try {
      const res = await loginWithEmail(emailInput, passInput);
      if (res.student) {
        setStudent(res.student);
        setIsLoggedIn(true);
        sessionStorage.setItem('scholar_owl_session_mssv', res.student.mssv);
        seedNotifications(res.student.mssv).catch(() => {});
        showCyberToast({
          type: 'success',
          title: 'FIREBASE AUTH // THÀNH CÔNG',
          message: `Chào mừng ${res.student.name} gia nhập Neural Terminal.`
        });
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Xin chào ${res.student.name}! Mình là Trợ lý Cú Học Tập trường Đại học. Rất vui được đồng hành cùng bạn! 🦉`,
          timestamp: Date.now()
        }]);
      } else {
        setLoginError(res.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setLoginError('Lỗi xác thực Firebase Auth');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMSSV(regMssv)) {
      setLoginError('MSSV đăng ký phải đúng 8 chữ số');
      return;
    }
    if (!regName.trim()) {
      setLoginError('Vui lòng nhập Họ và tên');
      return;
    }
    if (!regEmail.includes('@')) {
      setLoginError('Email không hợp lệ');
      return;
    }
    if (regPass.length < 6) {
      setLoginError('Mật khẩu cần tối thiểu 6 ký tự');
      return;
    }
    setLoginError('');
    setIsAuthenticating(true);
    try {
      const res = await registerStudent({
        mssv: regMssv,
        name: regName.trim(),
        email: regEmail.trim(),
        major: regMajor,
        class: 'K25'
      }, regPass);

      if (res.student) {
        setStudent(res.student);
        setIsLoggedIn(true);
        sessionStorage.setItem('scholar_owl_session_mssv', res.student.mssv);
        seedNotifications(res.student.mssv).catch(() => {});
        showCyberToast({
          type: 'success',
          title: 'TÀI KHOẢN // KHỞI TẠO XONG',
          message: `Đã cấp quyền Firebase Auth cho sinh viên ${res.student.name}.`
        });
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Chào mừng bạn mới ${res.student.name} đã gia nhập cổng Scholar Owl! Tài khoản đã được cấp quyền Firebase Auth & Firestore. 🦉`,
          timestamp: Date.now()
        }]);
      } else {
        setLoginError(res.error || 'Đăng ký tài khoản không thành công');
      }
    } catch (err) {
      setLoginError('Lỗi đăng ký tài khoản');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickDemo = async (demoMssv: string) => {
    setIsAuthenticating(true);
    setLoginError('');
    try {
      await seedDemoData();
      const res = await quickDemoLogin(demoMssv);
      if (res.student) {
        setStudent(res.student);
        setIsLoggedIn(true);
        sessionStorage.setItem('scholar_owl_session_mssv', res.student.mssv);
        seedNotifications(res.student.mssv).catch(() => {});
        showCyberToast({
          type: 'success',
          title: 'XÁC THỰC DEMO // THÀNH CÔNG',
          message: `Đã đăng nhập tài khoản mẫu [MSSV: ${res.student.mssv} - ${res.student.name}].`
        });
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Xin chào ${res.student.name}! Mình là Trợ lý Cú Học Tập (Scholar Owl). Rất vui được đồng hành cùng bạn! 🦉`,
          timestamp: Date.now()
        }]);
      } else {
        setLoginError('Không thể nạp dữ liệu demo');
      }
    } catch (e) {
      setLoginError('Lỗi khởi tạo tài khoản');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp && editedStudent) {
      setStudent(editedStudent);
      setIsLoggedIn(true);
      sessionStorage.setItem('scholar_owl_session_mssv', editedStudent.mssv);
      seedNotifications(editedStudent.mssv).catch(() => {});
      showCyberToast({
        type: 'success',
        title: 'MFA VERIFIED // HOÀN TẤT',
        message: `Xác thực 2 lớp thành công cho ${editedStudent.name}.`
      });
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Xin chào ${editedStudent.name}! Mình là Trợ lý Cú AI của Trường Đại học. Rất vui được hỗ trợ bạn hôm nay! 🦉`,
        timestamp: Date.now()
      }]);
    } else {
      setLoginError('Mã xác thực OTP không chính xác');
    }
  };

  const handleNewChatSession = () => {
    skipNextFirestoreAutoLoadRef.current = true;
    const newId = `session_${Date.now()}`;
    setActiveSessionId(newId);
    setMessages([]);
    showCyberToast({
      type: 'info',
      title: 'NEURAL TERMINAL // PHIÊN MỚI',
      message: 'Đã khởi tạo phiên trò chuyện mới. Bạn có thể xem lại các phiên cũ trong HISTORY.'
    });
  };

  const handleLoadChatSession = (session: ChatSession) => {
    skipNextFirestoreAutoLoadRef.current = true;
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
    setView('chat');
  };

  const handleDeleteChatSession = (sessionId: string) => {
    if (!student) return;
    setChatSessions(prev => {
      const next = prev.filter(s => s.id !== sessionId);
      try {
        localStorage.setItem(`scholar_owl_chat_sessions_${student.mssv}`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleDownloadOfficialCalendar = () => {
    const lines = [
      'LỊCH HỌC VỤ CHÍNH THỨC // SCHOLAR OWL PORTAL (2025 - 2026)',
      `Sinh viên: ${student?.name || 'N/A'} (${student?.mssv || 'N/A'})`,
      `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
      '='.repeat(60),
      ...dedupedCalendarEvents.map((ev, idx) => {
        const d = new Date(ev.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${idx + 1}. [${d}] ${ev.title.toUpperCase()} (${ev.type} / ${ev.priority})\n   Mô tả: ${ev.description || 'Không có ghi chú'}`;
      })
    ].join('\n\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic_calendar_${student?.mssv || 'portal'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showCyberToast({
      type: 'success',
      title: 'LỊCH HỌC VỤ // ĐÃ XUẤT',
      message: `Đã tải xuống ${dedupedCalendarEvents.length} mốc sự kiện học vụ chính thức.`
    });
  };

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    if (student) {
      saveChatMessageToFirestore(student.mssv, 'user', messageText).catch(() => {});
    }

    try {
      const response = await getChatResponse(nextMessages, student?.name);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      if (student) {
        saveChatMessageToFirestore(student.mssv, 'assistant', response).catch(() => {});
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "Có lỗi khi xử lý yêu cầu. Bạn hãy thử lại sau giây lát nhé.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('scholar_owl_session_mssv');
    showCyberToast({
      type: 'info',
      title: 'HỆ THỐNG // ĐĂNG XUẤT',
      message: 'Đã đóng phiên làm việc an toàn.'
    });
    await logoutUser();
    setIsLoggedIn(false);
    setStudent(null);
    setNotifications([]);
    setMessages([]);
    setFirestoreArchive([]);
    setDashboardGreeting('');
    setView('overview');
    setSelectedCalendarEvent(null);
    setActiveQuickModal(null);
    setIsHistoryOpen(false);
    setLoginStep('login');
    setOtp('');
  };

  if (!isLoggedIn) {
    return (
      <div 
        id="spatial-login-screen"
        className="min-h-screen bg-gradient-to-b from-[#06080d] via-[#090d15] to-[#030407] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden select-none"
        style={{ perspective: 1400 }}
      >
        {/* Spatial Deep Depth Ambient Glow Orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-950/20 blur-[180px] pointer-events-none rounded-none" />
        <div className="absolute -bottom-40 right-0 w-[600px] h-[600px] bg-[#CCFF00]/5 blur-[220px] pointer-events-none rounded-none" />

        {/* 60 / 40 Asymmetric Spatial Computing Grid */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
          
          {/* LEFT 60% (7 cols on lg screens): Giant Mascot Owl & Negative Space */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center text-left py-4 lg:py-12">
            {/* Academic Division Header */}
            <div className="mb-6 flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#CCFF00] rounded-none shadow-[0_0_12px_#CCFF00] animate-pulse" />
              <span className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-[0.28em] text-[#CCFF00] font-bold">
                SPATIAL ACADEMIC ECOSYSTEM
              </span>
            </div>

            {/* Giant Spatial Owl 3D & Glowing Speech Bubble */}
            <SpatialOwl3D />

            {/* Subtle Spatial System Info Tag */}
            <div className="mt-8 flex items-center gap-4 text-xs font-['JetBrains_Mono'] font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none animate-pulse" />
                <span>AES-256 Auth</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-none" />
                <span>Cloud Firestore Active</span>
              </div>
            </div>
          </div>

          {/* RIGHT 40% (5 cols on lg screens): Left-Aligned Spatial Form Glass Slab */}
          <div className="lg:col-span-5 w-full flex justify-end">
            <motion.div 
              initial={{ opacity: 0, x: 28, scale: 0.98 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }} 
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-[#080b12]/92 backdrop-blur-3xl p-6 sm:p-9 rounded-none border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_15px_35px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.12)_inset] relative text-left"
            >
              {/* Header Identity - Left Aligned */}
              <div className="mb-7 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-[#CCFF00] rounded-none shadow-[0_0_10px_#CCFF00]" />
                  <span className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                    Khóa K25 · Cán Bộ &amp; Sinh Viên
                  </span>
                </div>
                <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold text-white tracking-[-0.02em] leading-tight">
                  Scholar Owl System
                </h1>
                <p className="text-xs text-slate-400 mt-1.5 font-['Plus_Jakarta_Sans'] font-medium">
                  Truy cập bảng điều khiển học vụ và trợ lý AI thông minh
                </p>
              </div>

              {/* Tabs with Animated Running Underline (Neon Lime #CCFF00) */}
              {loginStep === 'login' && (
                <div className="relative border-b border-white/15 mb-6">
                  {/* Tab Navigation Buttons */}
                  <div className="grid grid-cols-3">
                    <button
                      type="button"
                      onClick={() => { setAuthTab('mssv'); setLoginError(''); }}
                      className={`pb-3 pt-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-colors duration-200 text-center ${
                        authTab === 'mssv' ? 'text-[#CCFF00]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MSSV
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthTab('email'); setLoginError(''); }}
                      className={`pb-3 pt-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-colors duration-200 text-center ${
                        authTab === 'email' ? 'text-[#CCFF00]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthTab('register'); setLoginError(''); }}
                      className={`pb-3 pt-1 text-[11px] font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-colors duration-200 text-center ${
                        authTab === 'register' ? 'text-[#CCFF00]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Đăng Ký
                    </button>
                  </div>

                  {/* Animated Running Underline */}
                  <div 
                    className="absolute -bottom-[1px] h-[2px] bg-[#CCFF00] shadow-[0_0_12px_#CCFF00,0_0_4px_#CCFF00] transition-all duration-300 ease-out"
                    style={{
                      width: '33.333%',
                      left: authTab === 'mssv' ? '0%' : authTab === 'email' ? '33.333%' : '66.666%',
                    }}
                  />
                </div>
              )}

              {/* Forms */}
              {loginStep === 'mfa' ? (
                <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-none text-left">
                    <p className="text-[10px] text-[#CCFF00] font-mono font-bold uppercase tracking-widest mb-1">
                      Mã Xác Thực 2 Bước (MFA)
                    </p>
                    <p className="text-3xl font-mono font-bold text-white tracking-[0.25em]">{generatedOtp}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Phiên xác thực bảo mật chuẩn AES</p>
                  </div>

                  <SpatialFloatingInput
                    id="spatial-otp"
                    label="Nhập mã OTP 6 số"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="------"
                    className="font-mono text-xl tracking-[0.3em]"
                    autoFocus
                  />

                  {loginError && <p className="text-red-400 text-xs font-semibold">{loginError}</p>}

                  <SpatialSharpButton type="submit" loading={isAuthenticating}>
                    Xác Nhận &amp; Vào Hệ Thống
                  </SpatialSharpButton>

                  <button 
                    type="button" 
                    onClick={() => { setLoginStep('login'); setLoginError(''); }} 
                    className="w-full text-[10px] font-mono text-slate-500 font-bold uppercase hover:text-[#CCFF00] text-left tracking-wider transition-colors pt-1"
                  >
                    ← Quay lại bước trước
                  </button>
                </form>
              ) : authTab === 'mssv' ? (
                <form onSubmit={handleMssvLogin} className="space-y-4 text-left">
                  <SpatialFloatingInput
                    id="spatial-mssv"
                    label="Mã Số Sinh Viên (MSSV)"
                    type="text"
                    value={mssvInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !/^\d*$/.test(val)) return;
                      if (val.length > 8) return;
                      setMssvInput(val);
                    }}
                    placeholder="Ví dụ: 25010001"
                    error={loginError.includes('MSSV')}
                  />

                  <SpatialFloatingInput
                    id="spatial-pass"
                    label="Mật Khẩu"
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="••••••••"
                  />

                  {loginError && <p className="text-red-400 text-xs font-semibold">{loginError}</p>}

                  <div className="pt-2">
                    <SpatialSharpButton type="submit" loading={isAuthenticating}>
                      Đăng Nhập Với MSSV
                    </SpatialSharpButton>
                  </div>
                </form>
              ) : authTab === 'email' ? (
                <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                  <SpatialFloatingInput
                    id="spatial-email"
                    label="Email Sinh Viên / Cán Bộ"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@vnu.edu.vn"
                  />

                  <SpatialFloatingInput
                    id="spatial-email-pass"
                    label="Mật Khẩu"
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="••••••••"
                  />

                  {loginError && <p className="text-red-400 text-xs font-semibold">{loginError}</p>}

                  <div className="pt-2">
                    <SpatialSharpButton type="submit" loading={isAuthenticating}>
                      Đăng Nhập Email
                    </SpatialSharpButton>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3 text-left">
                  <div className="grid grid-cols-2 gap-3">
                    <SpatialFloatingInput
                      id="spatial-reg-name"
                      label="Họ và Tên"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                    <SpatialFloatingInput
                      id="spatial-reg-mssv"
                      label="MSSV (8 số)"
                      type="text"
                      maxLength={8}
                      value={regMssv}
                      onChange={(e) => setRegMssv(e.target.value.replace(/\D/g, ''))}
                      placeholder="25010099"
                    />
                  </div>

                  <SpatialFloatingInput
                    id="spatial-reg-email"
                    label="Email Sinh Viên"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@vnu.edu.vn"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <SpatialFloatingInput
                      id="spatial-reg-major"
                      label="Chuyên Ngành"
                      type="text"
                      value={regMajor}
                      onChange={(e) => setRegMajor(e.target.value)}
                      placeholder="Sư phạm Toán"
                    />
                    <SpatialFloatingInput
                      id="spatial-reg-pass"
                      label="Mật Khẩu (≥6 ký tự)"
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  {loginError && <p className="text-red-400 text-xs font-semibold">{loginError}</p>}

                  <div className="pt-2">
                    <SpatialSharpButton type="submit" loading={isAuthenticating}>
                      Tạo Tài Khoản &amp; Khởi Động
                    </SpatialSharpButton>
                  </div>
                </form>
              )}

              {/* Quick Demo Access Bar */}
              {loginStep === 'login' && (
                <div className="mt-7 pt-5 border-t border-white/10 space-y-2.5 text-left">
                  <p className="text-[10px] text-slate-500 font-['JetBrains_Mono'] font-mono font-bold uppercase tracking-widest text-left">
                    Truy Cập Nhanh 1-Click Demo
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button 
                      type="button"
                      onClick={() => handleQuickDemo('25010001')}
                      disabled={isAuthenticating}
                      className="p-3 bg-transparent rounded-none border border-dashed border-white/20 hover:border-[#CCFF00] hover:translate-x-1 text-left transition-all duration-200 group flex items-center gap-3 cursor-pointer"
                    >
                      <span className="text-xl select-none transition-transform duration-200 group-hover:scale-110">🦉</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-[#CCFF00] truncate font-['Space_Grotesk']">Bùi Mai Anh</p>
                        <p className="text-[10px] text-slate-400 font-mono">25010001 · Lớp trưởng</p>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleQuickDemo('25010002')}
                      disabled={isAuthenticating}
                      className="p-3 bg-transparent rounded-none border border-dashed border-white/20 hover:border-[#CCFF00] hover:translate-x-1 text-left transition-all duration-200 group flex items-center gap-3 cursor-pointer"
                    >
                      <span className="text-xl select-none transition-transform duration-200 group-hover:scale-110">🦉</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-[#CCFF00] truncate font-['Space_Grotesk']">Hoàng Diệu Anh</p>
                        <p className="text-[10px] text-slate-400 font-mono">25010002 · Cán sự K25</p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button 
                      type="button" 
                      onClick={seedDemoData} 
                      className="text-[9px] font-mono text-slate-500 font-semibold hover:text-[#CCFF00] transition-colors uppercase tracking-wider"
                    >
                      Reset Dữ Liệu Seeds
                    </button>
                    <span className="text-[9px] font-mono text-slate-600">Spatial V2.5</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Full-screen Intro Overlay preview over Login background if triggered */}
        <AppIntro 
          isOpen={isIntroOpen} 
          onClose={() => setIsIntroOpen(false)} 
          studentName={student?.name}
          onStartTour={() => setIsTourActive(true)}
        />

        <CyberToastContainer />
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-[#030509] text-gray-300 overflow-hidden font-sans hud-shell ${!preferences.hudScanlines ? 'hud-no-scanlines' : ''}`}>
      {/* Sidebar Navigation - Transparent HUD Sidebar with Subtle Right Border */}
      <aside className="w-64 bg-transparent border-r border-white/10 flex flex-col shrink-0 select-none">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Logo size={28} />
            <div className="flex flex-col">
              <span className="text-sm font-['Space_Grotesk'] font-extrabold text-white tracking-wider uppercase">Scholar Owl</span>
              <span className="text-[9px] font-mono tracking-widest text-[#CCFF00]">HUD V2.5 // ONLINE</span>
            </div>
          </div>
          
          <div className="space-y-1">
             <NavButton num="01" icon={LayoutDashboard} label="OVERVIEW" active={view === 'overview'} onClick={() => setView('overview')} className="nav-overview-btn" />
             <NavButton num="02" icon={MessageSquare} label="AI SUPPORT" active={view === 'chat'} onClick={() => setView('chat')} className="nav-ai-chat-btn" />
             <NavButton num="03" icon={Stars} label="CÚ HỌC TẬP AZOTA" active={view === 'study-owl'} onClick={() => setView('study-owl')} className="study-owl-btn" />
             <NavButton num="04" icon={GraduationCap} label="DỰ BÁO GPA" active={view === 'academic'} onClick={() => setView('academic')} className="academic-gpa-btn" />
             <NavButton num="05" icon={Bell} label="UPDATES" badge={unreadNotificationsCount} onClick={() => setIsNotificationsOpen(true)} />
             <NavButton num="06" icon={Settings} label="SETTINGS" active={view === 'settings'} onClick={() => setView('settings')} />
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/10 space-y-3">
          <div className="p-3 bg-white/[0.02] border border-white/10 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 text-[#CCFF00]">
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">HUD Mode</p>
                <p className="text-[10px] font-mono font-bold text-white uppercase">{theme}</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-9 h-4 bg-black/60 rounded-none relative flex items-center px-0.5 transition-all border border-white/20"
            >
              <motion.div 
                animate={{ x: theme === 'dark' ? 18 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-2.5 h-2.5 bg-[#CCFF00] rounded-none shadow-[0_0_8px_#CCFF00]"
              />
            </button>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-none bg-[#CCFF00] animate-pulse shrink-0 shadow-[0_0_6px_#CCFF00]" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono font-bold text-[#CCFF00] uppercase tracking-wider">Firestore &amp; Auth</p>
              <p className="text-[9px] font-mono text-slate-400 truncate">
                {firebaseUser ? (firebaseUser.email || `UID: ${firebaseUser.uid.slice(0, 8)}...`) : `MSSV: ${student?.mssv || 'Online'}`}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOutroOpen(true)} 
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 hover:bg-white/[0.03] transition-colors border border-transparent hover:border-red-400/30"
          >
            <LogOut size={13} />
            Đăng Xuất (Sign Out)
          </button>
        </div>
      </aside>

      {/* Main Content Area with Sci-Fi Grid Background */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#030509] hud-grid-background relative">
        {view === 'chat' ? (
          <>
            <AnimatePresence>
          {!isOnline && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20 py-2 text-center relative z-[60]"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={10} />
                  Offline Mode - Some features may be offline
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="h-14 px-8 border-b border-white/10 flex items-center justify-between bg-[#070a10]/90 backdrop-blur-md z-10">
               <div className="flex items-center gap-3 flex-1">
                 <div className={`w-2 h-2 rounded-none animate-pulse ${aiHealth && !aiHealth.available ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]'}`} />
                 <span className="text-xs font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">NEURAL TERMINAL // AI SUPPORT</span>
                 <div className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-none uppercase tracking-widest border ${
                   aiHealth && !aiHealth.available
                     ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                     : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30'
                 }`}>
                   {aiHealth && !aiHealth.available ? 'AI OFFLINE // CẦN GEMINI_API_KEY' : 'ACTIVE STREAM // GEMINI'}
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportChat}
                    disabled={messages.length === 0}
                    className="saas-button-secondary py-1 px-3 text-[10px] flex items-center gap-2 disabled:opacity-40"
                  >
                    <FileText size={11} className="text-[#00FFFF]" /> EXPORT LOG
                  </button>
                  <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="saas-button-secondary py-1 px-3 text-[10px] flex items-center gap-1.5"
                  >
                    <History size={11} className="text-[#CCFF00]" />
                    HISTORY {chatSessions.length > 0 ? `(${chatSessions.length})` : ''}
                  </button>
                  <button onClick={handleNewChatSession} className="saas-button-primary py-1 px-3 text-[10px]">+ NEW SESSION</button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar scroll-smooth crt-terminal-scanlines relative">
               {/* CRT Vignette Overlay to focus attention to the center */}
               <div className="crt-vignette-overlay" />

               <div className="max-w-3xl mx-auto relative z-10">
                 {aiHealth && !aiHealth.available && (
                   <div className="mb-6 p-3.5 bg-amber-500/10 border border-amber-500/40 flex items-start justify-between gap-3 text-xs font-mono">
                     <div className="flex items-start gap-2.5 text-amber-300">
                       <AlertCircle size={16} className="shrink-0 mt-0.5" />
                       <div>
                         <p className="font-bold uppercase tracking-wider">Dịch vụ Gemini AI chưa sẵn sàng</p>
                         <p className="text-[11px] text-amber-200/80 mt-0.5 font-sans">
                           {aiHealth.reason || 'Máy chủ chưa được cấu hình biến môi trường GEMINI_API_KEY.'}
                         </p>
                       </div>
                     </div>
                     <button
                       onClick={refreshAiHealth}
                       disabled={isCheckingAi}
                       className="px-2.5 py-1 border border-amber-400/50 text-amber-300 hover:bg-amber-400/10 text-[10px] uppercase shrink-0"
                     >
                       {isCheckingAi ? 'Đang kiểm...' : 'Kiểm tra lại'}
                     </button>
                   </div>
                 )}

                 {messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-black border border-[#CCFF00]/60 rounded-none flex items-center justify-center text-[#CCFF00] mb-6 mx-auto shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                          <Logo size={32} />
                        </div>
                        <h2 className="text-2xl font-extrabold font-['Space_Grotesk'] text-white mb-2 tracking-tight uppercase">Neural Terminal Online</h2>
                        <p className="text-xs font-mono text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">Hệ thống kết nối dữ liệu học vụ &amp; Cú Owl AI. Nhập câu hỏi hoặc chọn gợi ý nhanh bên dưới.</p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                          <QuickPrompt text="Lịch thi & Bảo lưu" onClick={() => handleSend("Cho mình hỏi thủ tục bảo lưu và lịch thi học kỳ tới?")} />
                          <QuickPrompt text="Phân tích & Dự báo GPA" onClick={() => handleSend("Phân tích điểm GPA hiện tại và gợi ý cách nâng điểm học kỳ tới")} />
                          <QuickPrompt text="Đường đến Cơ sở 1" onClick={() => handleSend("Chỉ đường đến Cơ sở 1 và Phòng Đào tạo ở đâu?")} />
                          <QuickPrompt text="Học phí & Tài chính" onClick={() => handleSend("Liên hệ Phòng Tài chính và thủ tục đóng học phí như thế nào?")} />
                        </div>
                      </div>
                   </div>
                 ) : (
                   <>
                     {messages.map(m => (
                       <MessageBubble key={m.id} message={m} studentName={student?.name || 'S'} />
                     ))}
                     
                     {/* AI Typing State Indicator */}
                     {isLoading ? (
                       <motion.div 
                         initial={{ opacity: 0, y: 6 }} 
                         animate={{ opacity: 1, y: 0 }} 
                         className="p-3 bg-black border-l-2 border-[#CCFF00] rounded-none w-fit font-mono text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(204,255,0,0.2)] mb-4"
                       >
                         <span className="text-[10px] font-bold text-[#00FFFF] tracking-widest font-mono">[NEURAL_CORE]</span>
                         <span className="text-[#CCFF00] font-bold tracking-widest font-mono">[PROCESSING...]</span>
                         <span className="inline-block w-2.5 h-4 bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
                       </motion.div>
                     ) : (
                       <motion.div 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         className="py-1 px-3 bg-black/60 border border-white/10 rounded-none w-fit font-mono text-[10px] flex items-center gap-2 mb-4 text-slate-400"
                       >
                         <span className="w-1.5 h-1.5 bg-[#00FFFF] shadow-[0_0_6px_#00FFFF] animate-pulse" />
                         <span className="text-[#00FFFF] font-bold tracking-widest font-mono">[SYSTEM_READY]</span>
                         <span className="text-slate-500 font-mono">// STANDBY FOR QUERY</span>
                       </motion.div>
                     )}
                     
                     <div ref={chatEndRef} />
                   </>
                 )}
               </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#070a10]/85 backdrop-blur-md relative z-30">
               <div className="max-w-3xl mx-auto relative group">
                  <div className={`relative flex items-center bg-black/90 border transition-all duration-200 ${
                    isInputFocused 
                      ? 'border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.25)]' 
                      : 'border-[#CCFF00]/40 hover:border-[#CCFF00]/70'
                  }`}>
                     {/* Blinking prompt cursor at the beginning of the line */}
                     <div className="pl-4 pr-1.5 flex items-center gap-1.5 select-none font-mono">
                       <span className="text-xs font-bold text-[#00FFFF] font-mono">&gt;</span>
                       {isInputFocused && (
                         <span className="w-1.5 h-3.5 bg-[#CCFF00] animate-pulse shadow-[0_0_6px_#CCFF00]" />
                       )}
                     </div>

                     <input 
                       type="text" 
                       value={input}
                       onFocus={() => setIsInputFocused(true)}
                       onBlur={() => setIsInputFocused(false)}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                       placeholder={placeholderText || "ENTER COMMAND OR QUERY..."} 
                       className="w-full py-3.5 pl-1 pr-16 text-xs font-mono bg-transparent text-white placeholder:text-slate-500 rounded-none outline-none caret-[#CCFF00]"
                     />

                     {/* Enlarged Send button */}
                     <button 
                       onClick={() => handleSend()}
                       disabled={!input.trim() || isLoading}
                       className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black border-2 border-[#CCFF00] hover:bg-[#CCFF00] text-[#CCFF00] hover:text-black rounded-none transition-all duration-200 hover:shadow-[0_0_20px_#CCFF00] active:scale-95 disabled:opacity-20 disabled:pointer-events-none group/send"
                       title="Transmit Neural Command"
                     >
                       {/* Enlarged neon arrowhead triangle */}
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover/send:translate-x-0.5">
                         <polygon points="5,3 19,12 5,21 8,12" />
                       </svg>
                     </button>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-1 mt-3">
                 <p className="text-[10px] font-mono text-slate-400 text-center max-w-xl">
                   🦉 SMUT Neural Co-pilot: Tra cứu và phân tích học vụ thông minh. Đối chiếu cổng thông tin chính thức ĐH Sư phạm.
                 </p>
                 <button 
                   onClick={() => setIsPrivacyOpen(true)}
                   className="text-[9px] font-mono text-[#00FFFF] hover:underline uppercase tracking-wider"
                 >
                   Chính sách bảo mật dữ liệu học viên (Nghị định 13/2023/NĐ-CP)
                 </button>
               </div>
               <p className="text-[9px] font-mono text-center text-slate-600 mt-2 font-bold uppercase tracking-[0.2em]">SMUT NEURAL ENGINE • V3.4.0 HUD</p>
            </div>
          </>
        ) : view === 'study-owl' ? (
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar study-owl-azota-section">
            <div className="max-w-5xl mx-auto space-y-8">
              <div>
                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-2">Học tập đỉnh cao 🦉</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">Trợ Lý Cú Học Tập (Azota)</h2>
              </div>
              <StudyOwlAzota studentName={student?.name} studentId={student?.mssv} />
            </div>
          </div>
        ) : view === 'academic' ? (
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.3em] mb-2">Giám sát học trình và mục tiêu</p>
                  <h2 className="text-4xl font-extrabold text-white tracking-tighter">GPA Forester &amp; Planner</h2>
                </div>
                <button
                  onClick={() => setIsGpaModalOpen(true)}
                  className="saas-button-primary text-xs py-2 px-4 shadow-[0_4px_15px_rgba(6,182,212,0.3)] bg-brand-cyan hover:bg-brand-cyan/85 text-black font-bold flex items-center gap-1.5"
                >
                  <Calculator size={13} /> Khởi động Máy tính GPA
                </button>
              </div>

              {/* Render dynamic inline card */}
              <div className="saas-card p-8 bg-brand-card border-brand-border rounded-2xl flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />
                <div className="space-y-4 max-w-lg relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan border border-brand-cyan/20">
                    <GraduationCap size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Khu Vực Tính Điểm GPA &amp; Dự Phóng</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Công cụ mô phỏng điểm số giúp bạn lập kế hoạch cụ thể cho từng bài tập, câu hỏi, kỳ thi sắp tới. Bạn có thể dự báo số điểm trung bình học kỳ và tác động trực tiếp tích lũy (CGPA) để rinh học bổng loại Xuất Sắc hoặc cải thiện điểm kém.
                  </p>
                  <button
                    onClick={() => setIsGpaModalOpen(true)}
                    className="text-xs font-bold text-brand-cyan flex items-center gap-1 hover:underline group"
                  >
                    Bắt đầu điều chỉnh tham số <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                <div className="w-48 h-48 opacity-10 pointer-events-none select-none bg-center bg-no-repeat bg-contain shrink-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop')` }} />
              </div>
            </div>
          </div>
        ) : view === 'settings' ? (
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-none shadow-[0_0_8px_#00FFFF]" />
                    <p className="text-[10px] font-mono font-bold text-[#00FFFF] uppercase tracking-[0.25em]">SYSTEM CONFIG // HUD V2.5</p>
                  </div>
                  <h2 className="text-4xl font-extrabold font-['Space_Grotesk'] text-white tracking-tight">Cài Đặt Hệ Thống</h2>
                </div>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setPreferences(DEFAULT_PREFERENCES);
                    showCyberToast({
                      type: 'info',
                      title: 'CÀI ĐẶT // KHÔI PHỤC',
                      message: 'Đã đặt lại cấu hình giao diện và thông báo về mặc định.'
                    });
                  }}
                  className="saas-button-secondary py-2 px-4 text-xs flex items-center gap-2"
                >
                  <RefreshCw size={13} /> Khôi phục mặc định
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Theme & Visual HUD */}
                <div className="saas-card p-6 space-y-5">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-9 h-9 bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                      <Sliders size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">Giao Diện &amp; Chủ Đề</h3>
                      <p className="text-[10px] font-mono text-slate-400">Chế độ hiển thị &amp; hiệu ứng Neural HUD</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">Chế độ màu sắc (Theme)</p>
                        <p className="text-[10px] text-slate-400">Chọn Dark HUD (Mặc định) hoặc Light HUD tương phản cao</p>
                      </div>
                      <div className="flex border border-white/15">
                        <button
                          onClick={() => setTheme('dark')}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all ${
                            theme === 'dark' ? 'bg-[#CCFF00] text-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Moon size={12} /> Dark
                        </button>
                        <button
                          onClick={() => setTheme('light')}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all ${
                            theme === 'light' ? 'bg-[#CCFF00] text-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Sun size={12} /> Light
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10">
                      <div>
                        <p className="text-xs font-bold text-white">Hiệu ứng CRT Scanlines</p>
                        <p className="text-[10px] text-slate-400">Đường quét màn hình trong cửa sổ AI Support</p>
                      </div>
                      <button
                        onClick={() => setPreferences(p => ({ ...p, hudScanlines: !p.hudScanlines }))}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border transition-all ${
                          preferences.hudScanlines
                            ? 'bg-[#00FFFF]/15 text-[#00FFFF] border-[#00FFFF]/50'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {preferences.hudScanlines ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => setIsIntroOpen(true)}
                        className="saas-button-secondary py-1.5 px-3 text-[10px]"
                      >
                        Xem lại Intro 3 chương
                      </button>
                      <button
                        onClick={() => { setView('overview'); setIsTourActive(true); }}
                        className="saas-button-secondary py-1.5 px-3 text-[10px]"
                      >
                        Khởi chạy Tour HUD 6 bước
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Notifications & Alerts */}
                <div className="saas-card p-6 space-y-5">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-9 h-9 bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF]">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">Thông Báo &amp; Cảnh Báo</h3>
                      <p className="text-[10px] font-mono text-slate-400">Quản lý thông báo học vụ và nhắc nhở lịch thi</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'deadlineAlerts' as const, title: 'Cảnh báo hạn chót học vụ', desc: 'Thông báo trước các mốc đóng học phí, bảo lưu, đăng ký tín chỉ' },
                      { key: 'eventAlerts' as const, title: 'Thông báo hội thảo & sự kiện', desc: 'Nhận tin khi có Workshop AI hoặc hoạt động cấp khoa/trường' },
                      { key: 'toastAlerts' as const, title: 'Hiển thị Cyber Toast HUD', desc: 'Hiển thị banner trạng thái nổi ở góc phải màn hình' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 gap-3">
                        <div>
                          <p className="text-xs font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setPreferences(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border shrink-0 transition-all ${
                            preferences[item.key]
                              ? 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/50'
                              : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                        >
                          {preferences[item.key] ? 'BẬT' : 'TẮT'}
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setIsNotificationsOpen(true)}
                      className="w-full saas-button-secondary py-2 text-[10px] flex items-center justify-center gap-2"
                    >
                      <Bell size={12} /> Mở hộp thư thông báo ({unreadNotificationsCount} chưa đọc)
                    </button>
                  </div>
                </div>

                {/* 3. Account Information */}
                <div className="saas-card p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                        <UserCircle size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">Thông Tin Tài Khoản</h3>
                        <p className="text-[10px] font-mono text-slate-400">Hồ sơ sinh viên đồng bộ Firestore</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="text-[10px] font-mono font-bold text-[#00FFFF] hover:underline flex items-center gap-1 uppercase"
                    >
                      <Download size={12} /> Xuất CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/[0.02] border border-white/10">
                      <p className="text-[9px] font-mono text-slate-400 uppercase">Họ và tên</p>
                      <p className="font-bold text-white mt-0.5">{student?.name}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/10">
                      <p className="text-[9px] font-mono text-slate-400 uppercase">MSSV</p>
                      <p className="font-mono font-bold text-[#CCFF00] mt-0.5">{student?.mssv}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/10">
                      <p className="text-[9px] font-mono text-slate-400 uppercase">Ngành học</p>
                      <p className="font-bold text-white mt-0.5">{student?.major || 'Sư phạm Toán học'}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/10">
                      <p className="text-[9px] font-mono text-slate-400 uppercase">GPA / Tín chỉ</p>
                      <p className="font-mono font-bold text-[#00FFFF] mt-0.5">{(student?.gpa ?? 3.56).toFixed(2)} · {student?.credits ?? 42} TC</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Cập nhật liên hệ nhanh</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        value={(editedStudent?.email ?? student?.email) || ''}
                        onChange={(e) => setEditedStudent({ ...(editedStudent || student!), email: e.target.value })}
                        placeholder="Email sinh viên"
                        className="saas-input text-xs py-2"
                      />
                      <input
                        type="text"
                        value={(editedStudent?.phone ?? student?.phone) || ''}
                        onChange={(e) => setEditedStudent({ ...(editedStudent || student!), phone: e.target.value })}
                        placeholder="Số điện thoại"
                        className="saas-input text-xs py-2"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={async () => {
                          const target = editedStudent || student;
                          if (!target) return;
                          await updateStudentProfile(target.mssv, { email: target.email, phone: target.phone });
                          setStudent(target);
                          showCyberToast({
                            type: 'success',
                            title: 'HỒ SƠ // ĐÃ LƯU',
                            message: 'Đã cập nhật email & số điện thoại lên Firestore.'
                          });
                        }}
                        className="saas-button-primary py-1.5 px-4 text-[10px] flex items-center gap-1.5"
                      >
                        <Save size={12} /> Lưu thông tin liên hệ
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. System & AI Backend Health */}
                <div className="saas-card p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF]">
                        <Database size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">Kết Nối AI &amp; Bảo Mật</h3>
                        <p className="text-[10px] font-mono text-slate-400">Trạng thái máy chủ Gemini API &amp; Firebase</p>
                      </div>
                    </div>
                    <button
                      onClick={refreshAiHealth}
                      disabled={isCheckingAi}
                      className="text-[10px] font-mono font-bold text-[#CCFF00] hover:underline flex items-center gap-1 uppercase"
                    >
                      <RefreshCw size={11} className={isCheckingAi ? 'animate-spin' : ''} /> Kiểm tra
                    </button>
                  </div>

                  <div className={`p-4 border ${aiHealth?.available ? 'bg-[#CCFF00]/5 border-[#CCFF00]/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold uppercase text-white">Cú Owl AI Engine (Gemini)</span>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${aiHealth?.available ? 'bg-[#CCFF00] text-black' : 'bg-amber-500/20 text-amber-300'}`}>
                        {aiHealth === null ? 'CHECKING' : aiHealth.available ? 'ONLINE' : 'CHƯA KÍCH HOẠT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {aiHealth?.available
                        ? 'Máy chủ API đã sẵn sàng phục vụ Trợ lý Cú AI, tạo đề Azota và chấm điểm tự luận.'
                        : aiHealth?.reason || 'Biến môi trường GEMINI_API_KEY chưa được thiết lập trên máy chủ Vercel / backend.'}
                    </p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Quyền riêng tư &amp; Nghị định 13/2023/NĐ-CP</p>
                      <p className="text-[10px] text-slate-400">Xem chính sách bảo vệ dữ liệu sinh viên</p>
                    </div>
                    <button
                      onClick={() => setIsPrivacyOpen(true)}
                      className="saas-button-secondary py-1.5 px-3 text-[10px]"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Dashboard Header */}
              <AnimatePresence>
                {!isOnline && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Sync Suspended</p>
                      <p className="text-[10px] text-red-400">Your connection is unstable. Real-time updates are currently paused.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-end justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-none shadow-[0_0_8px_#CCFF00]" />
                    <p className="text-[10px] font-mono font-bold text-[#CCFF00] uppercase tracking-[0.25em]">AUTHENTICATED // STUDENT PORTAL</p>
                  </div>
                  <h2 className="text-4xl font-extrabold font-['Space_Grotesk'] text-white tracking-tight">{student?.name.split(' ')[0]}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsIntroOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-white/[0.04] border border-dashed border-white/20 hover:border-[#CCFF00] rounded-none text-xs font-mono font-bold text-slate-300 hover:text-[#CCFF00] transition-all"
                    title="Xem lại hướng dẫn giới thiệu hệ thống"
                  >
                    <HelpCircle size={13} className="text-[#00FFFF]" />
                    <span>HƯỚNG DẪN HỆ THỐNG</span>
                  </button>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">SEMESTER STATUS</p>
                    <p className="text-xs font-mono font-bold text-[#00FFFF] uppercase">HK2 · 2025-2026</p>
                  </div>
                </div>
              </div>

              {/* SMUT AI Flying Owl Mascot - HUD Sci-Fi Card */}
              <div className="p-5 bg-black border border-[#CCFF00]/40 rounded-none relative overflow-hidden flex flex-col md:flex-row items-center gap-5 shadow-[0_0_25px_rgba(204,255,0,0.06)]">
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="shrink-0 p-3 bg-white/[0.03] border border-[#00FFFF]/50 rounded-none relative shadow-lg flex items-center justify-center text-3xl cursor-pointer group hover:border-[#CCFF00] transition-colors"
                  onClick={() => fetchDashboardMascotGreeting(student)}
                >
                  <span className="select-none">🦉</span>
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-[#CCFF00] opacity-75"></span>
                    <span className="relative inline-flex rounded-none h-2 w-2 bg-[#CCFF00]"></span>
                  </span>
                </motion.div>

                <div className="space-y-1.5 flex-1 relative z-10 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-mono tracking-widest font-bold text-[#CCFF00] uppercase">SCHOLAR OWL · LIVE CO-PILOT</span>
                    <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase bg-[#00FFFF]/10 border border-[#00FFFF]/40 text-[#00FFFF] rounded-none">AI ACTIVE 🌟</span>
                  </div>
                  
                  {isGeneratingDashboardGreeting ? (
                    <p className="text-xs font-mono text-slate-400 italic">Cú Co-pilot đang đồng bộ thông tin... 🦉</p>
                  ) : (
                    <div className="p-3 bg-white/[0.02] backdrop-blur-md border border-[#00FFFF]/30 rounded-none text-xs font-['Plus_Jakarta_Sans'] font-medium text-slate-200 leading-relaxed">
                      "{highlightVietnameseTerms(dashboardGreeting)}"
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => fetchDashboardMascotGreeting(student)}
                    disabled={isGeneratingDashboardGreeting}
                    className="p-2.5 bg-transparent border border-white/20 hover:border-[#CCFF00] hover:text-[#CCFF00] rounded-none text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-1.5"
                    title="Nói câu nữa đi Cú"
                  >
                    <Stars size={13} className="text-[#CCFF00]" />
                    <span className="md:hidden">Nói câu nữa</span>
                  </button>
                </div>
              </div>

              {/* Handholding Owl Tutorial Activation Card */}
              <div className="flex flex-col md:flex-row items-center justify-between bg-black/50 border border-white/10 rounded-none p-4 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">🦉</span>
                  <div>
                    <span className="text-xs font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider block">Kích hoạt chế độ Tour trải nghiệm không gian học vụ?</span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Cú học thuật sẽ đưa bạn qua các phân khu chức năng trọng yếu.</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsIntroOpen(true)}
                    className="px-3 py-1.5 border border-white/15 rounded-none text-[9px] font-mono font-bold text-slate-300 hover:text-[#CCFF00] hover:border-[#CCFF00] transition-colors uppercase flex items-center gap-1"
                    title="Xem lại hướng dẫn giới thiệu hệ thống"
                  >
                    <HelpCircle size={11} className="text-[#00FFFF]" />
                    Xem Intro
                  </button>
                  <button
                    onClick={() => setIsOutroOpen(true)}
                    className="px-3 py-1.5 border border-white/15 rounded-none text-[9px] font-mono font-bold text-slate-400 hover:text-red-400 hover:border-red-400 transition-colors uppercase"
                  >
                    Xem Outro
                  </button>
                  <button
                    onClick={() => setIsTourActive(true)}
                    className="px-3 py-1.5 bg-[#CCFF00] text-black text-[9px] font-['Space_Grotesk'] font-bold rounded-none hover:bg-white transition-all uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Compass size={11} /> Bắt đầu Tour HUD
                  </button>
                </div>
              </div>

              {/* Grid 1: Main Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 saas-card p-6 bg-[#070a10] border border-white/10 relative overflow-hidden group academic-standing-card">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-none shadow-[0_0_8px_#CCFF00]" />
                        ACADEMIC STANDING
                      </h3>
                      <span className="px-2 py-0.5 bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] font-mono font-bold rounded-none uppercase border border-[#CCFF00]/30">DISTINCTION</span>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-[10px] font-['JetBrains_Mono'] font-bold text-slate-400 uppercase tracking-widest mb-1">CURRENT GPA</p>
                        <p className="text-4xl font-extrabold font-['Space_Grotesk'] text-[#CCFF00] tracking-tight">{student?.gpa !== undefined ? student.gpa.toFixed(2) : '3.56'}</p>
                        <p className="text-[9px] font-mono text-[#00FFFF] mt-1 font-bold">+0.12 ↑ Tăng trưởng</p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-[10px] font-['JetBrains_Mono'] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL CREDITS</p>
                        <p className="text-4xl font-extrabold font-['Space_Grotesk'] text-[#CCFF00] tracking-tight">{student?.credits ?? 42}</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">LEVEL 2 · ĐẠT</p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-[10px] font-['JetBrains_Mono'] font-bold text-slate-400 uppercase tracking-widest mb-1">COHORT RANK</p>
                        <p className="text-4xl font-extrabold font-['Space_Grotesk'] text-[#CCFF00] tracking-tight">#12</p>
                        <p className="text-[9px] font-mono text-[#00FFFF] mt-1 uppercase">TOP 5% KHÓA K25</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="saas-card p-6 bg-[#070a10] border border-white/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-none shadow-[0_0_8px_#00FFFF]" />
                      QUICK ACTIONS
                    </h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setActiveQuickModal('registration')}
                        className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-none border border-white/10 hover:border-[#CCFF00] text-xs font-['Space_Grotesk'] font-bold text-white hover:text-[#CCFF00] transition-all text-left px-3 flex items-center justify-between group"
                      >
                        Đăng ký môn học <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => setActiveQuickModal('transcript')}
                        className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-none border border-white/10 hover:border-[#CCFF00] text-xs font-['Space_Grotesk'] font-bold text-white hover:text-[#CCFF00] transition-all text-left px-3 flex items-center justify-between group"
                      >
                        Tra cứu bảng điểm <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => setActiveQuickModal('certificates')}
                        className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-none border border-white/10 hover:border-[#CCFF00] text-xs font-['Space_Grotesk'] font-bold text-white hover:text-[#CCFF00] transition-all text-left px-3 flex items-center justify-between group"
                      >
                        Chứng chỉ học tập <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Sync Timestamp: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Academic Calendar (Single Deduplicated Block) */}
              <div className="saas-card bg-[#070a10] border border-white/10 overflow-hidden calendar-widget-card">
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-none bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF]">
                       <Calendar size={18} />
                     </div>
                     <div>
                       <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em]">ACADEMIC CALENDAR</h3>
                       <p className="text-[10px] font-mono text-slate-400">Important Deadlines &amp; Milestone Events ({displayedCalendarEvents.length})</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setCalendarFilter('upcoming')}
                       className={`px-2 py-1 border rounded-none text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
                         calendarFilter === 'upcoming'
                           ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                           : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                       }`}
                     >
                       Upcoming
                     </button>
                     <button 
                       onClick={() => setCalendarFilter('full')}
                       className={`px-2 py-1 border rounded-none text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
                         calendarFilter === 'full'
                           ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                           : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                       }`}
                     >
                       Full Year
                     </button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {displayedCalendarEvents.length === 0 ? (
                    <div className="col-span-4 py-20 text-center">
                      <p className="text-xs font-mono text-slate-500">Syncing academic schedule...</p>
                    </div>
                  ) : (
                    displayedCalendarEvents.map((event) => (
                      <div key={event.id} className="p-5 hover:bg-white/[0.02] transition-colors relative group overflow-hidden">
                        <div className="mb-3">
                           <span className={`text-[8px] font-mono font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-none border ${
                             event.type === 'exam' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                             event.type === 'registration' ? 'bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30' :
                             event.type === 'holiday' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30' :
                             'bg-white/10 text-white border-white/20'
                           }`}>
                             {event.type}
                           </span>
                        </div>
                        
                        <div className="space-y-2">
                           <h4 className="text-xs font-bold font-['Space_Grotesk'] text-white leading-snug h-8 line-clamp-2">{event.title}</h4>
                           <div className="flex items-center gap-2 text-slate-400">
                             <Calendar size={10} className="text-[#00FFFF]" />
                             <span className="text-[10px] font-mono">{new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                           </div>
                           <p className="text-[10px] text-slate-400 font-sans line-clamp-2 leading-relaxed h-10">{event.description}</p>
                        </div>

                        <div className="mt-4">
                           <button 
                             onClick={() => setSelectedCalendarEvent(event)}
                             className="text-[9px] font-mono font-bold text-[#CCFF00] uppercase flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                           >
                             View Details <ChevronRight size={10} />
                           </button>
                        </div>
                        
                        {event.priority === 'high' && (
                          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-none bg-red-400 shadow-[0_0_6px_red]" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 bg-white/[0.01] border-t border-white/10 text-center">
                   <button 
                     onClick={handleDownloadOfficialCalendar}
                     className="text-[9px] font-mono font-bold text-slate-400 uppercase hover:text-[#CCFF00] transition-colors tracking-widest cursor-pointer"
                   >
                     Download Official Calendar (TXT/PDF)
                   </button>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
                 <div className="saas-card p-6 bg-[#070a10] border border-white/10">
                   <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                     <span>CAMPUS DISPATCHES</span>
                     <button onClick={() => setIsNotificationsOpen(true)} className="text-[9px] font-mono font-bold text-[#00FFFF] lowercase hover:underline">view all</button>
                   </h3>
                   <div className="space-y-4">
                      <div className="flex gap-4 group cursor-pointer border-b border-white/10 pb-4 last:border-0 last:pb-0">
                        <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-none flex-shrink-0 flex items-center justify-center font-mono font-bold text-slate-400 group-hover:border-[#CCFF00] group-hover:text-[#CCFF00] transition-all">05</div>
                        <div>
                          <h4 className="text-xs font-bold font-['Space_Grotesk'] text-white group-hover:text-[#CCFF00] transition-colors mb-1">New Library Operating Hours for Finals Week</h4>
                          <p className="text-[10px] text-slate-400 font-sans">Starting next Monday, Main Library will be open 24/7 with enhanced security.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 group cursor-pointer border-b border-white/10 pb-4 last:border-0 last:pb-0">
                        <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-none flex-shrink-0 flex items-center justify-center font-mono font-bold text-slate-400 group-hover:border-[#CCFF00] group-hover:text-[#CCFF00] transition-all">03</div>
                        <div>
                          <h4 className="text-xs font-bold font-['Space_Grotesk'] text-white group-hover:text-[#CCFF00] transition-colors mb-1">Voluntary Health Checkup Campaign</h4>
                          <p className="text-[10px] text-slate-400 font-sans">Free screening for all students at Building A1 Health Center.</p>
                        </div>
                      </div>
                   </div>
                 </div>

                 <div className="saas-card p-6 bg-[#070a10] border border-white/10">
                    <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-none shadow-[0_0_8px_#CCFF00]" />
                      UPCOMING TIMETABLE
                    </h3>
                    <div className="space-y-3">
                       <div className="p-3 bg-white/[0.02] border border-white/10 rounded-none flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-7 h-7 rounded-none bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 flex items-center justify-center"><Clock size={14} /></div>
                             <div>
                               <p className="text-xs font-bold font-['Space_Grotesk'] text-white">Software Architecture</p>
                               <p className="text-[9px] font-mono text-slate-400">Building C · Room 302</p>
                             </div>
                          </div>
                          <p className="text-[10px] font-mono font-bold text-[#CCFF00]">08:00 AM</p>
                       </div>
                       <div className="p-3 bg-white/[0.02] border border-white/10 rounded-none flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-7 h-7 rounded-none bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 flex items-center justify-center"><Clock size={14} /></div>
                             <div>
                               <p className="text-xs font-bold font-['Space_Grotesk'] text-white">Human Computer Interaction</p>
                               <p className="text-[9px] font-mono text-slate-400">Building E · Room 501</p>
                             </div>
                          </div>
                          <p className="text-[10px] font-mono font-bold text-[#00FFFF]">01:30 PM</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Student Profile Panel - HUD Flat Sci-Fi Panel */}
      <aside className="w-[380px] bg-transparent border-l border-white/10 flex flex-col overflow-y-auto no-scrollbar shrink-0 select-none">
         <div className="p-6 space-y-6">
            {/* Header / Avatar Section with Hexagon HUD Styling */}
            <div className="relative p-6 border border-white/10 bg-[#070a10] rounded-none">
               <div className="relative z-10 flex flex-col items-center text-center">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  
                  {/* Hexagon Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="hexagon-wrapper cursor-pointer mb-2.5 group"
                    title="Click to calibrate biometric photo"
                  >
                    <div className="hexagon-outer">
                      <div className="hexagon-inner">
                        {student?.photoURL ? (
                          <img 
                            src={student.photoURL} 
                            alt={student.name} 
                            className="w-full h-full object-cover relative z-10" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center text-[#CCFF00] font-mono font-bold text-3xl relative z-10 glitch-text-wrapper select-none">
                            <span className="glitch-text" data-text={student?.name?.charAt(0) || 'B'}>
                              {student?.name?.charAt(0) || 'B'}
                            </span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <Camera size={18} className="text-[#CCFF00]" />
                        </div>
                        
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                            <div className="w-5 h-5 border-2 border-[#CCFF00] border-t-transparent rounded-none animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Biometric locked status text */}
                  <div className="mb-2">
                    <span className="text-[9px] font-mono font-bold text-[#00FFFF] uppercase tracking-widest px-2 py-0.5 bg-[#00FFFF]/10 border border-[#00FFFF]/30">
                      ID: {student?.mssv || '25010001'} // BIOMETRIC_LOCKED
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold font-['Space_Grotesk'] text-white mb-1 tracking-tight">{student?.name}</h3>
                  <div className="flex items-center gap-2 justify-center">
                    {!isOnline ? (
                      <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-none">
                        <span className="w-1.5 h-1.5 rounded-none bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">OFFLINE</span>
                      </div>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-none bg-[#CCFF00] animate-pulse shadow-[0_0_6px_#CCFF00]" />
                    )}
                    <span className="text-[10px] font-mono font-bold text-[#00FFFF] uppercase tracking-widest">
                      {isEditing ? editedStudent?.mssv : student?.mssv}
                    </span>
                  </div>
               </div>
            </div>

            {/* Main Stats Card with strictly font-mono sub-labels */}
            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 bg-[#070a10] border border-white/10 rounded-none">
                  <div className="flex items-center gap-2 text-[#00FFFF] mb-1">
                    <TrendingUp size={13} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider">CURRENT GPA</span>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-white">{student?.gpa !== undefined ? student.gpa.toFixed(2) : '3.56'}</div>
               </div>
               <div className="p-4 bg-[#070a10] border border-white/10 rounded-none">
                  <div className="flex items-center gap-2 text-[#CCFF00] mb-1">
                    <CheckCheck size={13} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider">CREDITS</span>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-white">{student?.credits ?? 42}/120</div>
               </div>
            </div>

            {/* Oscilloscope / Radar GPA Performance Visual */}
            <div className="space-y-3 gpa-performance-chart">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-none shadow-[0_0_6px_#CCFF00] animate-ping" />
                  OSCILLOSCOPE // GPA RADAR
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00FFFF]">
                  <span>+0.25 vs PREV</span>
                </div>
              </div>
              <div className="h-44 bg-[#070a10] border border-white/10 rounded-none p-3 flex flex-col justify-between relative overflow-hidden">
                 {/* Radar / Oscilloscope concentric circles & grid */}
                 <div 
                   className="absolute inset-0 pointer-events-none opacity-35"
                   style={{
                     backgroundImage: `
                       radial-gradient(circle at center, transparent 28%, rgba(0, 255, 255, 0.15) 29%, transparent 30%),
                       radial-gradient(circle at center, transparent 58%, rgba(0, 255, 255, 0.12) 59%, transparent 60%),
                       linear-gradient(to right, rgba(0, 255, 255, 0.08) 1px, transparent 1px),
                       linear-gradient(to bottom, rgba(0, 255, 255, 0.08) 1px, transparent 1px)
                     `,
                     backgroundSize: '100% 100%, 100% 100%, 16px 16px, 16px 16px'
                   }}
                 />
                 
                 {/* Oscilloscope sweep beam */}
                 <div className="oscilloscope-beam" />

                 <div className="absolute top-1 left-2 text-[8px] font-mono text-[#00FFFF]/70 tracking-widest pointer-events-none select-none flex items-center gap-1">
                   <span>SIG_CH1: WAVE_GPA</span>
                   <span className="text-slate-600">//</span>
                   <span className="text-[#CCFF00]">3.45 NORM</span>
                 </div>

                 <div className="w-full h-32 pt-2">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={SMUT_DATA.gpaHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="2 2" vertical={true} horizontal={true} stroke="rgba(0,255,255,0.14)" />
                         <XAxis 
                           dataKey="semester" 
                           stroke="rgba(0, 255, 255, 0.3)" 
                           tick={{ fill: 'rgba(0, 255, 255, 0.6)', fontSize: 8, fontFamily: 'monospace' }} 
                           axisLine={{ stroke: 'rgba(0, 255, 255, 0.3)' }}
                           tickLine={{ stroke: 'rgba(0, 255, 255, 0.3)' }}
                         />
                         <YAxis 
                           domain={[3.0, 3.6]} 
                           stroke="rgba(0, 255, 255, 0.3)" 
                           tick={{ fill: 'rgba(0, 255, 255, 0.6)', fontSize: 8, fontFamily: 'monospace' }} 
                           axisLine={{ stroke: 'rgba(0, 255, 255, 0.3)' }}
                           tickLine={{ stroke: 'rgba(0, 255, 255, 0.3)' }}
                           width={24}
                         />
                         <Tooltip 
                           contentStyle={{ 
                             backgroundColor: '#070a10', 
                             border: '1px solid rgba(0,255,255,0.4)', 
                             borderRadius: '0px',
                             color: '#ffffff',
                             fontSize: '10px',
                             fontFamily: 'monospace',
                             fontWeight: 'bold'
                           }}
                           itemStyle={{ color: '#CCFF00' }}
                           labelStyle={{ display: 'none' }}
                         />
                         <Line 
                           type="monotone" 
                           dataKey="gpa" 
                           stroke="#CCFF00" 
                           strokeWidth={2} 
                           dot={<DiamondDot />} 
                           activeDot={{ r: 6, fill: '#00FFFF' }} 
                         />
                      </LineChart>
                   </ResponsiveContainer>
                 </div>

                 {/* Text running at bottom */}
                 <div className="flex items-center justify-between pt-1 border-t border-white/5 relative z-10">
                   <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">SIG_MODE: OSC-RADAR</span>
                   <span className="text-[9px] font-mono font-bold text-[#CCFF00] tracking-widest animate-pulse">SYS_TICK: 2026.Q1</span>
                 </div>
              </div>
            </div>

            {/* Profile Fields List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                 <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">METADATA DOSSIER</h4>
                  <div className="flex items-center gap-3">
                    {!isEditing && (
                      <button 
                        onClick={handleExportCSV}
                        className="text-[9px] font-mono font-bold text-[#00FFFF] hover:underline flex items-center gap-1 uppercase"
                      >
                        <Download size={10} /> Export CSV
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (isEditing) {
                          setShowSaveConfirm(true);
                        } else {
                          setEditedStudent(student);
                          setIsEditing(true);
                        }
                      }} 
                      className="text-[9px] font-mono font-bold text-[#CCFF00] hover:underline uppercase"
                    >
                      {isEditing ? '[Save Changes]' : '[Edit Profile]'}
                    </button>
                  </div>
              </div>
              <div className="space-y-3 px-1">
                 <ProfileItem icon={BookOpen} label="Major" value={student?.major} />
                 <ProfileItem 
                    icon={QrCode} 
                    label="Student ID (MSSV)" 
                    value={isEditing ? editedStudent?.mssv : student?.mssv} 
                    isEditing={isEditing} 
                    name="mssv"
                    onChange={handleProfileChange}
                    error={mssvError}
                 />
                 <ProfileItem 
                    icon={Mail} 
                    label="Academic Email" 
                    value={isEditing ? editedStudent?.email : student?.email} 
                    isEditing={isEditing} 
                    name="email"
                    onChange={handleProfileChange}
                 />
                 <ProfileItem 
                    icon={Phone} 
                    label="Emergency Phone" 
                    value={isEditing ? editedStudent?.phone : student?.phone} 
                    isEditing={isEditing} 
                    name="phone"
                    onChange={handleProfileChange}
                 />
                 <ProfileItem 
                    icon={MapPin} 
                    label="Current Campus" 
                    value={SMUT_DATA.campuses[0].name + " - " + SMUT_DATA.campuses[0].address} 
                    link={SMUT_DATA.campuses[0].maps} 
                    campusId="cs1"
                 />
              </div>
            </div>

            {/* Digital Pass / QR */}
            <div className="pt-4 border-t border-white/10">
               <div className="p-5 bg-[#070a10] border border-white/10 rounded-none flex flex-col items-center">
                  <div className="p-3 bg-white rounded-none mb-3 shadow-xl">
                    <QRCodeSVG 
                      value={`STUDENT_IDENTITY_${student?.mssv}`}
                      size={90}
                      level="H"
                    />
                  </div>
                  <p className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">DIGITAL STUDENT PASS</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">VALID: 2024 - 2028 // VERIFIED</p>
               </div>
            </div>
         </div>
      </aside>

      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm saas-card bg-[#070a10] p-6 shadow-2xl relative z-10 border border-white/20 rounded-none"
            >
              <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-none flex items-center justify-center text-[#CCFF00] mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-white mb-2 uppercase tracking-wide">Xác nhận cập nhật hồ sơ</h3>
              <p className="text-xs font-['Plus_Jakarta_Sans'] text-slate-400 leading-relaxed mb-6">
                Bạn có chắc chắn muốn lưu các thay đổi này? Thông tin liên lạc mới sẽ được đồng bộ hoá ngay lập tức với cơ sở dữ liệu học vụ.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 saas-button-secondary py-2 text-xs"
                >
                  HỦY BỎ
                </button>
                <button 
                  onClick={() => {
                    handleSaveProfile();
                    setShowSaveConfirm(false);
                  }}
                  className="flex-1 saas-button-primary py-2 text-xs"
                >
                  LƯU THAY ĐỔI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat History Modal (Bug 7) */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#070a10] border border-white/20 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <History size={16} className="text-[#CCFF00]" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">LỊCH SỬ TRÒ CHUYỆN CÚ OWL AI</h3>
                    <p className="text-[10px] font-mono text-slate-400">Các phiên tư vấn học vụ đã lưu theo MSSV {student?.mssv}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white border border-white/10"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {chatSessions.length === 0 && firestoreArchive.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <MessageSquare size={24} className="mx-auto text-slate-600" />
                    <p className="text-xs font-mono text-slate-400 uppercase">Chưa có phiên hội thoại nào được lưu</p>
                    <p className="text-[11px] text-slate-500">Hãy đặt câu hỏi cho Cú Owl AI; hệ thống sẽ tự động lưu lịch sử tại đây.</p>
                  </div>
                ) : (
                  <>
                    {chatSessions.map(session => {
                      const isCurrent = session.id === activeSessionId;
                      return (
                        <div
                          key={session.id}
                          className={`p-3.5 border transition-all flex items-start justify-between gap-3 ${
                            isCurrent ? 'bg-[#CCFF00]/5 border-[#CCFF00]/40' : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                          }`}
                        >
                          <button
                            onClick={() => handleLoadChatSession(session)}
                            className="flex-1 text-left min-w-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-white truncate">{session.title}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-[#CCFF00] text-black uppercase">ĐANG MỞ</span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-400">
                              {new Date(session.updatedAt).toLocaleString('vi-VN')} · {session.messages.length} tin nhắn
                            </p>
                          </button>
                          <button
                            onClick={() => handleDeleteChatSession(session.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-colors"
                            title="Xóa phiên này"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}

                    {firestoreArchive.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <button
                          onClick={() => {
                            skipNextFirestoreAutoLoadRef.current = true;
                            setActiveSessionId(`cloud_${Date.now()}`);
                            setMessages(firestoreArchive);
                            setIsHistoryOpen(false);
                          }}
                          className="w-full p-3 bg-[#00FFFF]/5 hover:bg-[#00FFFF]/10 border border-[#00FFFF]/30 text-left flex items-center justify-between transition-all"
                        >
                          <div>
                            <p className="text-xs font-mono font-bold text-[#00FFFF] uppercase">Nhật ký đồng bộ Cloud Firestore</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{firestoreArchive.length} tin nhắn lưu trên đám mây</p>
                          </div>
                          <ChevronRight size={14} className="text-[#00FFFF]" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-3 border-t border-white/10 bg-white/[0.01] flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsHistoryOpen(false);
                    handleNewChatSession();
                  }}
                  className="saas-button-primary py-1.5 px-3 text-[10px]"
                >
                  + Tạo phiên chat mới
                </button>
                <button onClick={() => setIsHistoryOpen(false)} className="saas-button-secondary py-1.5 px-3 text-[10px]">
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Event Details Modal (Bug 4) */}
      <AnimatePresence>
        {selectedCalendarEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#070a10] border border-[#00FFFF]/40 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#00FFFF]" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">CHI TIẾT SỰ KIỆN HỌC VỤ</span>
                </div>
                <button
                  onClick={() => setSelectedCalendarEvent(null)}
                  className="p-1.5 text-slate-400 hover:text-white border border-white/10"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border ${
                    selectedCalendarEvent.type === 'exam' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    selectedCalendarEvent.type === 'registration' ? 'bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30' :
                    selectedCalendarEvent.type === 'holiday' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30' :
                    'bg-white/10 text-white border-white/20'
                  }`}>
                    {selectedCalendarEvent.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Mức ưu tiên: <strong className={selectedCalendarEvent.priority === 'high' ? 'text-red-400' : 'text-[#CCFF00]'}>{selectedCalendarEvent.priority}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">{selectedCalendarEvent.title}</h3>

                <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Thời gian:</span>
                  <span className="text-[#00FFFF] font-bold">
                    {new Date(selectedCalendarEvent.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCalendarEvent.description || 'Thông báo lịch trình chính thức từ Phòng Đào tạo.'}
                </p>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      const ev = selectedCalendarEvent;
                      setSelectedCalendarEvent(null);
                      setView('chat');
                      handleSend(`Hãy tư vấn chi tiết và nhắc nhở chuẩn bị cho sự kiện "${ev.title}" vào ngày ${new Date(ev.date).toLocaleDateString('vi-VN')}.`);
                    }}
                    className="flex-1 saas-button-primary py-2 text-[10px] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={12} /> Hỏi Cú Owl AI về sự kiện này
                  </button>
                  <button
                    onClick={() => setSelectedCalendarEvent(null)}
                    className="saas-button-secondary py-2 px-4 text-[10px]"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overview Quick Actions Modal (Bug 3) */}
      <AnimatePresence>
        {activeQuickModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#070a10] border border-white/20 w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  {activeQuickModal === 'registration' && <BookMarked size={16} className="text-[#CCFF00]" />}
                  {activeQuickModal === 'transcript' && <GraduationCap size={16} className="text-[#00FFFF]" />}
                  {activeQuickModal === 'certificates' && <Award size={16} className="text-[#CCFF00]" />}
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                    {activeQuickModal === 'registration' && 'ĐĂNG KÝ MÔN HỌC // HK1 2026-2027'}
                    {activeQuickModal === 'transcript' && 'TRA CỨU BẢNG ĐIỂM TÍCH LŨY'}
                    {activeQuickModal === 'certificates' && 'CHỨNG CHỈ & XÁC NHẬN HỌC TẬP'}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveQuickModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white border border-white/10"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {activeQuickModal === 'registration' && (
                  <>
                    <div className="p-3 bg-[#00FFFF]/5 border border-[#00FFFF]/30 text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-[#00FFFF]">Cổng xem trước kế hoạch đăng ký (Coming Soon):</strong> Cổng đăng ký tín chỉ chính thức mở từ <span className="font-mono text-white">01/07/2026</span>. Bạn có thể chọn trước học phần dự kiến bên dưới.
                    </div>
                    <div className="space-y-2">
                      {REGISTRATION_CATALOG.map(course => {
                        const checked = selectedRegCodes.includes(course.code);
                        return (
                          <div
                            key={course.code}
                            onClick={() => setSelectedRegCodes(prev => prev.includes(course.code) ? prev.filter(c => c !== course.code) : [...prev, course.code])}
                            className={`p-3 border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              checked ? 'bg-[#CCFF00]/10 border-[#CCFF00]/50' : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-[#00FFFF]">{course.code}</span>
                                <span className="text-xs font-bold text-white">{course.name}</span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 mt-1">{course.schedule} · Sĩ số: {course.slots}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono font-bold text-[#CCFF00] block">{course.credits} TC</span>
                              <span className="text-[9px] font-mono text-slate-400">{checked ? 'ĐÃ CHỌN' : course.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
                      <span className="text-slate-400">Tổng tín chỉ dự kiến:</span>
                      <span className="text-[#CCFF00] font-bold">
                        {REGISTRATION_CATALOG.filter(c => selectedRegCodes.includes(c.code)).reduce((s, c) => s + c.credits, 0)} Tín chỉ
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        showCyberToast({
                          type: 'success',
                          title: 'KẾ HOẠCH TÍN CHỈ // ĐÃ LƯU NHÁP',
                          message: `Đã lưu danh sách dự kiến (${selectedRegCodes.length} học phần). Cổng nộp chính thức mở ngày 01/07/2026.`
                        });
                        setActiveQuickModal(null);
                      }}
                      className="w-full saas-button-primary py-2.5 text-xs"
                    >
                      Lưu kế hoạch đăng ký nháp
                    </button>
                  </>
                )}

                {activeQuickModal === 'transcript' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white/[0.02] border border-white/10">
                        <p className="text-[9px] font-mono text-slate-400 uppercase">CGPA Hiện tại</p>
                        <p className="text-2xl font-mono font-extrabold text-[#CCFF00] mt-1">{(student?.gpa ?? 3.56).toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/10">
                        <p className="text-[9px] font-mono text-slate-400 uppercase">Tín chỉ tích lũy</p>
                        <p className="text-2xl font-mono font-extrabold text-white mt-1">{student?.credits ?? 42}</p>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/10">
                        <p className="text-[9px] font-mono text-slate-400 uppercase">Xếp loại</p>
                        <p className="text-sm font-mono font-bold text-[#00FFFF] mt-2">GIỎI / DISTINCTION</p>
                      </div>
                    </div>

                    <div className="border border-white/10 divide-y divide-white/10">
                      <div className="px-3 py-2 bg-white/[0.03] grid grid-cols-3 text-[10px] font-mono font-bold text-slate-400 uppercase">
                        <span>Học kỳ</span>
                        <span className="text-center">GPA Học kỳ</span>
                        <span className="text-right">Trạng thái</span>
                      </div>
                      {SMUT_DATA.gpaHistory.map(row => (
                        <div key={row.semester} className="px-3 py-2.5 grid grid-cols-3 text-xs items-center">
                          <span className="font-mono text-white">{row.semester}</span>
                          <span className="font-mono font-bold text-[#CCFF00] text-center">{row.gpa.toFixed(2)}</span>
                          <span className="text-[10px] font-mono text-[#00FFFF] text-right">HOÀN THÀNH</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveQuickModal(null);
                          setIsGpaModalOpen(true);
                        }}
                        className="flex-1 saas-button-primary py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <Calculator size={13} /> Mở Máy tính Dự báo GPA
                      </button>
                      <button
                        onClick={() => setActiveQuickModal(null)}
                        className="saas-button-secondary py-2 px-4 text-xs"
                      >
                        Đóng
                      </button>
                    </div>
                  </>
                )}

                {activeQuickModal === 'certificates' && (
                  <>
                    <div className="p-4 bg-[#CCFF00]/5 border border-[#CCFF00]/30 flex items-start gap-3">
                      <FileCheck2 size={20} className="text-[#CCFF00] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Thẻ Sinh Viên Số (Digital Pass)</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Hiệu lực xác thực: <span className="font-mono text-[#CCFF00]">2024 - 2028 // VERIFIED</span> · MSSV {student?.mssv}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Hồ sơ Minh chứng KPI Sinh viên (18 tiêu chí)</p>
                          <p className="text-[10px] text-slate-400">Điểm ước tính hiện tại: 55 / 100 điểm rèn luyện &amp; học thuật</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveQuickModal(null);
                            setView('study-owl');
                          }}
                          className="saas-button-primary py-1.5 px-3 text-[10px] shrink-0"
                        >
                          Mở Cổng KPI
                        </button>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Giấy xác nhận sinh viên &amp; Chứng chỉ ký số PDF</p>
                          <p className="text-[10px] text-amber-300/90">Sắp ra mắt (Coming Soon) · Liên hệ Phòng CTSV P.102 Nhà A1 khi cần bản cứng</p>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-white/5 border border-white/15 text-slate-400 uppercase shrink-0">
                          COMING SOON
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Interactive Overlay Features */}
      <GpaCalculatorModal 
        isOpen={isGpaModalOpen} 
        onClose={() => setIsGpaModalOpen(false)} 
        currentCgpa={student?.gpa ?? 3.56}
        currentCredits={student?.credits ?? 42}
      />
      
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        studentId={student?.mssv || '25010001'}
      />

      <AppIntro 
        isOpen={isIntroOpen} 
        onClose={() => setIsIntroOpen(false)} 
        studentName={student?.name}
        onStartTour={() => setIsTourActive(true)}
      />

      <AppOutro
        isOpen={isOutroOpen}
        onClose={() => setIsOutroOpen(false)}
        onConfirmLogout={handleLogout}
        studentName={student?.name}
        studentMssv={student?.mssv}
        major={student?.major}
      />

      <InteractiveTour 
        isActive={isTourActive} 
        onClose={() => setIsTourActive(false)} 
      />

      <PrivacyNoticeModal
        isOpen={isPrivacyOpen}
        onAccept={() => {
          localStorage.setItem('smut_privacy_consent', 'true');
          setIsPrivacyOpen(false);
          const hasSeen = localStorage.getItem('hasSeenIntro') === 'true' || localStorage.getItem('smut_onboarding_done') === 'true';
          if (!hasSeen) {
            setIsIntroOpen(true);
          }
        }}
        onClose={() => setIsPrivacyOpen(false)}
        canDismiss={false}
      />

      <CyberToastContainer />
    </div>
  );
}
