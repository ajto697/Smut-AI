import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, MapPin, ClipboardList, FileText, CreditCard, School, Info, User, 
  ChevronRight, LogOut, ShieldCheck, Database, LayoutDashboard, UserCircle, 
  Save, X, Phone, Mail, BookOpen, Calendar, Bell, Clock, CheckCheck, 
  AlertCircle, Stars, QrCode, Search, MessageSquare, Library, BookText, 
  Settings, HelpCircle, Plus, GraduationCap, Rocket, Globe, Book, TrendingUp,
  ExternalLink, Download, Camera, Sun, Moon, Calculator, Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Message, Student, Notification, CalendarEvent } from './types';
import { getChatResponse, generateLoginGreeting, generateDashboardGreeting } from './services/geminiService';
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
    {badge && (
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

const CalendarWidget = ({ events }: { events: CalendarEvent[] }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
       <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Academic Calendar</h4>
       <Calendar size={14} className="text-brand-purple" />
    </div>
    <div className="space-y-3">
       {events.length === 0 ? (
         <div className="p-4 saas-card bg-white/[0.01] text-center">
           <p className="text-[10px] text-gray-600">No upcoming events</p>
         </div>
       ) : (
         events.slice(0, 4).map(event => (
           <div key={event.id} className="p-3 saas-card bg-white/[0.01] border-l-2 hover:bg-white/[0.03] transition-colors" style={{ borderLeftColor: event.type === 'exam' ? 'var(--color-brand-purple)' : event.type === 'registration' ? 'var(--color-brand-cyan)' : 'var(--color-brand-emerald)' }}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-white uppercase truncate pr-2">{event.title}</span>
                <span className="text-[9px] font-mono text-gray-500 shrink-0">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-1">{event.description}</p>
           </div>
         ))
       )}
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: Message; studentName: string }> = ({ message, studentName }) => {
  const isBot = message.role === 'assistant';
  
  // Extract map tag if present
  const mapTagMatch = message.content.match(/\[MAP:(cs[12])\]/);
  const campusId = mapTagMatch ? mapTagMatch[1] : null;
  const cleanContent = message.content.replace(/\[MAP:cs[12]\]/g, '');
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
          dangerouslySetInnerHTML={{ __html: cleanContent.replace(/\n/g, '<br/>') }} 
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

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<'overview' | 'chat' | 'academic' | 'study-owl'>('overview');
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    testConnection().catch(() => {});
    seedCalendarEvents().catch(() => {});
    seedDemoData().catch(() => {});
    
    const unsubscribeCalendar = subscribeToCalendarEvents(setCalendarEvents);

    // Auto-restore session if saved in sessionStorage
    const savedMssv = sessionStorage.getItem('scholar_owl_session_mssv');
    if (savedMssv) {
      getStudentProfile(savedMssv).then((s) => {
        if (s) {
          setStudent(s);
          setIsLoggedIn(true);
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

  useEffect(() => {
    if (student) {
      const unsubscribeNotifs = subscribeToNotifications(student.mssv, (notifs) => {
        setNotifications(notifs);
      });
      const unsubscribeChat = subscribeToStudentChat(student.mssv, (dbMessages) => {
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages);
        }
      });
      return () => {
        unsubscribeNotifs();
        unsubscribeChat();
      };
    }
  }, [student]);

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

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (student) {
      saveChatMessageToFirestore(student.mssv, 'user', messageText).catch(() => {});
    }

    try {
      const response = await getChatResponse([...messages, userMsg], student?.name);
      const botMsg: Message = { id: (Date.now()+1).toString(), role: 'assistant', content: response, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      if (student) {
        saveChatMessageToFirestore(student.mssv, 'assistant', response).catch(() => {});
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: "Có lỗi khi xử lý yêu cầu. Bạn hãy thử lại sau giây lát nhé.", timestamp: Date.now() }]);
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
    <div className="flex h-screen bg-[#030509] text-gray-300 overflow-hidden font-sans">
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
             <NavButton num="05" icon={Bell} label="UPDATES" badge={notifications.filter(n => !n.isRead).length} onClick={() => setIsNotificationsOpen(true)} />
             <NavButton num="06" icon={Settings} label="SETTINGS" />
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
                 <div className="w-2 h-2 bg-[#00FFFF] rounded-none shadow-[0_0_8px_#00FFFF] animate-pulse" />
                 <span className="text-xs font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">NEURAL TERMINAL // AI SUPPORT</span>
                 <div className="px-2 py-0.5 bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] font-mono font-bold rounded-none uppercase tracking-widest border border-[#CCFF00]/30">ACTIVE STREAM</div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportChat}
                    disabled={messages.length === 0}
                    className="saas-button-secondary py-1 px-3 text-[10px] flex items-center gap-2 disabled:opacity-40"
                  >
                    <FileText size={11} className="text-[#00FFFF]" /> EXPORT LOG
                  </button>
                  <button className="saas-button-secondary py-1 px-3 text-[10px]">HISTORY</button>
                  <button onClick={() => setMessages([])} className="saas-button-primary py-1 px-3 text-[10px]">+ NEW SESSION</button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar scroll-smooth crt-terminal-scanlines relative">
               {/* CRT Vignette Overlay to focus attention to the center */}
               <div className="crt-vignette-overlay" />

               <div className="max-w-3xl mx-auto relative z-10">
                 {messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-black border border-[#CCFF00]/60 rounded-none flex items-center justify-center text-[#CCFF00] mb-6 mx-auto shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                          <Logo size={32} />
                        </div>
                        <h2 className="text-2xl font-extrabold font-['Space_Grotesk'] text-white mb-2 tracking-tight uppercase">Neural Terminal Online</h2>
                        <p className="text-xs font-mono text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">System connected to SMUT academic datastream. Input query or select a preconfigured vector below.</p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                          <QuickPrompt text="Next Exam Schedule" onClick={() => handleSend("When is my next exam?")} />
                          <QuickPrompt text="GPA Forecast Model" onClick={() => handleSend("Analyze my GPA and forecast next semester")} />
                          <QuickPrompt text="Digital Library Auth" onClick={() => handleSend("How can I access digital library resources?")} />
                          <QuickPrompt text="Tuition Review Status" onClick={() => handleSend("Check my tuition payment status")} />
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
                      <button className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-none border border-white/10 hover:border-[#CCFF00] text-xs font-['Space_Grotesk'] font-bold text-white hover:text-[#CCFF00] transition-all text-left px-3 flex items-center justify-between group">
                        Đăng ký môn học <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-none border border-white/10 hover:border-[#CCFF00] text-xs font-['Space_Grotesk'] font-bold text-white hover:text-[#CCFF00] transition-all text-left px-3 flex items-center justify-between group">
                        Tra cứu bảng điểm <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] rounded-none border border-white/10 hover:border-[#CCFF00] text-xs font-['Space_Grotesk'] font-bold text-white hover:text-[#CCFF00] transition-all text-left px-3 flex items-center justify-between group">
                        Chứng chỉ học tập <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Sync Timestamp: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Academic Calendar (Major Feature) */}
              <div className="saas-card bg-[#070a10] border border-white/10 overflow-hidden calendar-widget-card">
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-none bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF]">
                       <Calendar size={18} />
                     </div>
                     <div>
                       <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em]">ACADEMIC CALENDAR</h3>
                       <p className="text-[10px] font-mono text-slate-400">Important Deadlines &amp; Milestone Events</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button className="px-2 py-1 bg-white/[0.03] border border-white/10 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider text-white hover:border-[#CCFF00] hover:text-[#CCFF00]">Upcoming</button>
                     <button className="px-2 py-1 bg-white/[0.03] border border-white/10 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-white">Full Year</button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {calendarEvents.length === 0 ? (
                    <div className="col-span-4 py-20 text-center">
                      <p className="text-xs font-mono text-slate-500">Syncing academic schedule...</p>
                    </div>
                  ) : (
                    calendarEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4).map((event) => (
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
                           <button className="text-[9px] font-mono font-bold text-[#CCFF00] uppercase flex items-center gap-1 hover:gap-2 transition-all">
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
                   <button className="text-[9px] font-mono font-bold text-slate-400 uppercase hover:text-[#CCFF00] transition-colors tracking-widest">
                     Download Official Calendar (PDF)
                   </button>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
                 <div className="saas-card p-6 bg-[#070a10] border border-white/10">
                   <h3 className="text-xs font-['JetBrains_Mono'] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                     <span>CAMPUS DISPATCHES</span>
                     <button className="text-[9px] font-mono font-bold text-[#00FFFF] lowercase hover:underline">view all</button>
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

            <div className="pt-4 border-t border-white/10">
               <CalendarWidget events={calendarEvents} />
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
