import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, MapPin, ClipboardList, FileText, CreditCard, School, Info, User, 
  ChevronRight, LogOut, ShieldCheck, Database, LayoutDashboard, UserCircle, 
  Save, X, Phone, Mail, BookOpen, Calendar, Bell, Clock, CheckCheck, 
  AlertCircle, Stars, QrCode, Search, MessageSquare, Library, BookText, 
  Settings, HelpCircle, Plus, GraduationCap, Rocket, Globe, Book, TrendingUp,
  ExternalLink, Download, Camera, Sun, Moon, Calculator
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Message, Student, Notification, CalendarEvent } from './types';
import { getChatResponse } from './services/geminiService';
import { SMUT_DATA } from './constants';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { verifyStudent, updateStudentProfile, seedDemoData, testConnection } from './services/studentService';
import { subscribeToNotifications, markAsRead, seedNotifications } from './services/notificationService';
import { subscribeToCalendarEvents, seedCalendarEvents } from './services/calendarService';

// Import New Features
import { GpaCalculatorModal } from './components/GpaCalculatorModal';
import { StudyOwlAzota } from './components/StudyOwlAzota';
import { AppIntro } from './components/AppIntro';
import { InteractiveTour } from './components/InteractiveTour';
import { DailyCareTracker } from './components/DailyCareTracker';
import { Compass } from 'lucide-react';

// --- Components ---

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
        <stop offset="0%" stopColor="var(--color-brand-purple)" />
        <stop offset="50%" stopColor="var(--color-brand-blue)" />
        <stop offset="100%" stopColor="var(--color-brand-cyan)" />
      </linearGradient>
      <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="var(--color-brand-cyan)" />
        <stop offset="100%" stopColor="var(--color-brand-emerald)" />
      </linearGradient>
      <radialGradient id="owlGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--color-brand-emerald)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--color-brand-emerald)" stopOpacity="0" />
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
  const [message, setMessage] = useState("Hi! Tớ là Cú SMUT AI đây! 🦉");
  const [clickCount, setClickCount] = useState(0);

  const messages = [
    "Hi! Tớ là Cú SMUT AI đây! 🦉",
    "Mách nhỏ: Đăng nhập bằng MSSV 25010001 để trải nghiệm lập tức nha!",
    "Bấm vào tớ thử đi, tớ hứa sẽ có món quà bất ngờ đó! ✨",
    "Cú học tập Azota & tính năng sinh đề thi đỉnh cao tự động đang chờ bạn!",
    "Hôm nay bạn học tập thế nào rồi? Trực tuyến hay offline? 🧠",
  ];

  const handleMascotClick = () => {
    setClickCount(prev => prev + 1);
    const nextMsgIdx = (clickCount + 1) % messages.length;
    setMessage(messages[nextMsgIdx]);
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

const NavButton = ({ icon: Icon, label, active, onClick, badge, className = "" }: any) => (
  <button 
    onClick={onClick}
    className={`nav-item w-full ${active ? 'nav-item-active' : 'nav-item-inactive'} ${className}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-brand-purple' : ''} />
      <span className="font-semibold">{label}</span>
    </div>
    {badge && (
      <span className="bg-brand-purple text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
    className="px-3 py-2 bg-white/[0.03] border border-brand-border rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
  >
    <Stars size={12} className="text-brand-purple" />
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} mb-6 group`}
    >
      <div className={`flex items-center gap-2 mb-2 ${isBot ? '' : 'flex-row-reverse'}`}>
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isBot ? 'bg-brand-purple/20 text-brand-purple shadow-[0_0_15px_rgba(147,51,234,0.15)] border border-brand-purple/10' : 'bg-brand-card border border-brand-border text-brand-text-primary'
          }`}
        >
           {isBot ? <Logo size={16} /> : <span className="text-[10px] font-bold">{studentName.charAt(0)}</span>}
        </motion.div>
        <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity">
          {isBot ? 'Neural Assistant' : 'Authorized User'}
        </span>
      </div>
      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative transition-all duration-300 ${
        isBot 
          ? 'bg-brand-card/40 backdrop-blur-md border border-brand-border text-brand-text-secondary hover:border-brand-purple/30 shadow-sm' 
          : 'bg-gradient-to-br from-brand-purple to-brand-purple/80 text-white shadow-[0_8px_20px_rgba(147,51,234,0.15)] border border-white/10'
      }`}>
        {isBot && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-purple/3 to-transparent rounded-2xl pointer-events-none" />
        )}
        <div 
          className="relative z-10"
          dangerouslySetInnerHTML={{ __html: cleanContent.replace(/\n/g, '<br/>') }} 
        />

        {isBot && campusId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 w-full h-32 rounded-xl border border-brand-border overflow-hidden relative group cursor-pointer shadow-xl"
            onClick={() => window.open(campusId === 'cs1' ? SMUT_DATA.campuses[0].maps : SMUT_DATA.campuses[1].maps, '_blank')}
          >
            <div className={`absolute inset-0 bg-cover bg-center`} style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+9333ea(${campusId === 'cs1' ? '106.698,10.773' : '106.719,10.729'})/${campusId === 'cs1' ? '106.698,10.773' : '106.719,10.729'},15/400x200@2x?access_token=pk.eyJ1IjoiZGV2LW1hZ2ljIiwiYSI6ImNscjZqbjRrajBmamIyanBlM3F3NmJ3ZGMifQ')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">{campusId === 'cs1' ? SMUT_DATA.campuses[0].name : SMUT_DATA.campuses[1].name}</p>
              <p className="text-[9px] text-gray-300 mt-0.5">{campusId === 'cs1' ? SMUT_DATA.campuses[0].address : SMUT_DATA.campuses[1].address}</p>
            </div>
            <div className="absolute top-3 right-3 p-1.5 bg-brand-purple/80 backdrop-blur-md rounded-lg text-white shadow-lg">
               <MapPin size={12} />
            </div>
          </motion.div>
        )}

        <div className={`mt-3 text-[9px] ${isBot ? 'text-brand-text-muted' : 'text-white/60'} font-mono flex items-center gap-1.5`}>
          <Clock size={8} />
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {!isBot && <div className="w-1 h-1 rounded-full bg-white/40" />}
          {!isBot && <span className="uppercase">Encrypted</span>}
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
  
  const [loginStep, setLoginStep] = useState<'login' | 'mfa'>('login');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
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
    
    const unsubscribeCalendar = subscribeToCalendarEvents(setCalendarEvents);
    return () => unsubscribeCalendar();
  }, []);

  useEffect(() => {
    if (student) {
      const unsubscribeNotifs = subscribeToNotifications(student.mssv, (notifs) => {
        setNotifications(notifs);
      });
      return () => unsubscribeNotifs();
    }
  }, [student]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isLoggedIn) {
      const isDone = localStorage.getItem('smut_onboarding_done');
      if (!isDone) {
        setIsIntroOpen(true);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMSSV(mssvInput)) {
      setLoginError('MSSV must be 8 digits');
      return;
    }
    setLoginError('');
    setIsAuthenticating(true);
    try {
      const verifiedStudent = await verifyStudent(mssvInput, passInput);
      if (verifiedStudent) {
        setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString());
        setEditedStudent(verifiedStudent);
        setLoginStep('mfa');
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (error) {
      setLoginError('System error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp && editedStudent) {
      setStudent(editedStudent);
      setIsLoggedIn(true);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hi ${editedStudent.name}! I'm your University AI Assistant. How can I help you today?`,
        timestamp: Date.now()
      }]);
    } else {
      setLoginError('Invalid OTP');
    }
  };

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatResponse([...messages, userMsg], student?.name);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: response, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: "Error processing request.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
        {/* Cinematic Space Background */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2666&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) grayscale(0.2)'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,4,8,0.8)_100%)] z-0" />
        
        {/* Interactive Floating Owl Mascot saying Hi! */}
        <LoginFlyingOwl />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md saas-card bg-brand-bg/90 backdrop-blur-xl p-8 shadow-2xl relative z-10 border-white/10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-brand-purple/5 rounded-3xl flex items-center justify-center mb-6 border border-brand-purple/10 relative">
              <div className="absolute inset-0 bg-brand-cyan/5 blur-2xl rounded-full" />
              <Logo size={48} />
            </div>
            <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">SMUT Assistant</h1>
            <p className="text-xs text-brand-text-secondary font-bold uppercase tracking-[0.2em] mt-1">Universal Education Dashboard</p>
          </div>

          <form onSubmit={loginStep === 'login' ? handleLogin : handleVerifyOtp} className="space-y-4">
            {loginStep === 'login' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Student Email / ID</label>
                  <input 
                    type="text" 
                    value={mssvInput} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !/^\d*$/.test(val)) return;
                      if (val.length > 8) return;
                      setMssvInput(val);
                    }} 
                    placeholder="e.g. 25010001" 
                    className={`saas-input w-full ${loginError.includes('MSSV') ? 'border-red-500/50' : ''}`} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Password</label>
                  <input type="password" value={passInput} onChange={(e) => setPassInput(e.target.value)} placeholder="••••••••" className="saas-input w-full" />
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-brand-purple/5 border border-brand-purple/10 rounded-xl text-center">
                  <p className="text-[10px] text-brand-purple font-bold uppercase tracking-widest mb-1">MFA Verification</p>
                  <p className="text-3xl font-mono font-bold text-white tracking-[0.2em]">{generatedOtp}</p>
                </div>
                <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="saas-input w-full text-center text-xl font-mono tracking-widest" />
                <button onClick={() => setLoginStep('login')} className="w-full text-[10px] text-gray-500 font-bold uppercase hover:text-white">Go back</button>
              </div>
            )}
            
            {loginError && <p className="text-red-500 text-[10px] font-bold text-center uppercase">{loginError}</p>}
            
            <button type="submit" disabled={isAuthenticating} className="saas-button-primary w-full h-12 flex items-center justify-center">
              {isAuthenticating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (loginStep === 'login' ? 'Continue' : 'Verify')}
            </button>
            
            <div className="text-center">
              <button type="button" onClick={seedDemoData} className="text-[10px] text-gray-600 font-bold uppercase hover:text-brand-purple transition-colors">Initialize Demo System</button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-bg text-gray-300 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-brand-border flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Logo size={28} />
            <span className="text-sm font-bold text-white tracking-tighter uppercase">SMUT AI</span>
          </div>
          
          <div className="space-y-1">
             <NavButton icon={LayoutDashboard} label="Overview" active={view === 'overview'} onClick={() => setView('overview')} className="nav-overview-btn" />
             <NavButton icon={MessageSquare} label="AI Support" active={view === 'chat'} onClick={() => setView('chat')} className="nav-ai-chat-btn" />
             <NavButton icon={Stars} label="Cú Học Tập Azota" active={view === 'study-owl'} onClick={() => setView('study-owl')} className="study-owl-btn" />
             <NavButton icon={GraduationCap} label="Dự Báo GPA" active={view === 'academic'} onClick={() => setView('academic')} className="academic-gpa-btn" />
             <NavButton icon={Bell} label="Updates" badge={notifications.filter(n => !n.isRead).length} onClick={() => {}} />
             <NavButton icon={Settings} label="Settings" />
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-brand-border space-y-4">
          <div className="p-4 saas-card bg-[var(--brand-bg-white-ops)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Theme</p>
                <p className="text-[9px] font-bold text-white uppercase">{theme}</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-10 h-5 bg-white/5 rounded-full relative flex items-center px-1 transition-all border border-brand-border"
            >
              <motion.div 
                animate={{ x: theme === 'dark' ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-3 h-3 bg-brand-purple rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]"
              />
            </button>
          </div>

          <div className="p-4 saas-card bg-white/[0.02]">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Student Storage</p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="w-2/3 h-full bg-brand-cyan" />
            </div>
            <p className="text-[9px] text-gray-500 mt-2">6.2 GB of 10 GB used</p>
          </div>
          
          <button onClick={() => signOut(auth).then(() => setIsLoggedIn(false))} className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors px-2">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-brand-bg relative">
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

        <header className="h-16 px-8 border-b border-brand-border flex items-center justify-between bg-brand-bg/80 backdrop-blur-md z-10">
               <div className="flex items-center gap-4 flex-1">
                 <MessageSquare size={16} className="text-brand-purple" />
                 <span className="text-sm font-bold text-white">AI Support Agent</span>
                 <div className="px-2 py-0.5 bg-brand-emerald/10 text-brand-emerald text-[9px] font-bold rounded uppercase tracking-widest border border-brand-emerald/20">Live</div>
               </div>
               
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExportChat}
                    disabled={messages.length === 0}
                    className="saas-button-secondary py-1.5 text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    <FileText size={12} /> Export Chat
                  </button>
                  <button className="saas-button-secondary py-1.5 text-xs">History</button>
                  <button className="saas-button-primary py-1.5 text-xs">New Chat</button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar scroll-smooth">
               <div className="max-w-3xl mx-auto">
                 {messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                         <div 
                            className="w-full h-full bg-center bg-no-repeat bg-contain"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop")' }}
                         />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple mb-8 mx-auto border border-brand-purple/20 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                          <Logo size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">System Online. How can I help?</h2>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mb-12 leading-relaxed">I have access to your academic records, course databases, and university resources. Ask me anything.</p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                          <QuickPrompt text="Next Exam" onClick={() => handleSend("When is my next exam?")} />
                          <QuickPrompt text="GPA Forecast" onClick={() => handleSend("Analyze my GPA and forecast next semester")} />
                          <QuickPrompt text="Library Access" onClick={() => handleSend("How can I access digital library resources?")} />
                          <QuickPrompt text="Tuition Review" onClick={() => handleSend("Check my tuition payment status")} />
                        </div>
                      </div>
                   </div>
                 ) : (
                   <>
                     {messages.map(m => (
                       <MessageBubble key={m.id} message={m} studentName={student?.name || 'S'} />
                     ))}
                     {isLoading && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-3 bg-brand-card rounded-lg w-fit border border-brand-border">
                         <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce" />
                         <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:0.2s]" />
                         <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:0.4s]" />
                       </motion.div>
                     )}
                     <div ref={chatEndRef} />
                   </>
                 )}
               </div>
            </div>

            <div className="p-8">
               <div className="max-w-3xl mx-auto relative group">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message AI assistant..." 
                    className="saas-input w-full py-4 pr-12 text-sm bg-brand-card border-brand-border group-hover:border-white/10"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-all disabled:opacity-30"
                  >
                    <Send size={18} />
                  </button>
               </div>
               <p className="text-[9px] text-center text-gray-700 mt-4 font-bold uppercase tracking-[0.2em]">UED Intelligence System • v3.4.0</p>
            </div>
          </>
        ) : view === 'study-owl' ? (
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar study-owl-azota-section">
            <div className="max-w-5xl mx-auto space-y-8">
              <div>
                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-2">Học tập đỉnh cao tại SMUT 🦉</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">Trợ Lý Cú Học Tập (Azota)</h2>
              </div>
              <StudyOwlAzota studentName={student?.name} />
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
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-2">Welcome Back,</p>
                  <h2 className="text-4xl font-bold text-brand-text-primary tracking-tighter">{student?.name.split(' ')[0]}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Semester</p>
                  <p className="text-sm font-bold text-brand-text-primary uppercase">Học kỳ 2 · 2025-2026</p>
                </div>
              </div>

              {/* Handholding Owl Tutorial Activation Card */}
              <div className="flex flex-col md:flex-row items-center justify-between bg-white/[0.01] border border-brand-border/40 rounded-2xl p-4 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-bounce">🦉</span>
                  <div>
                    <span className="text-xs font-bold text-white block">Bạn có muốn tớ hướng dẫn cầm tay chỉ việc sử dụng ứng dụng?</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Tớ là Cú học thuật, nhấp vào nút dưới đây tớ sẽ giới thiệu các khu vực chức năng chính!</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsIntroOpen(true)}
                    className="p-1 px-3 border border-brand-border rounded-lg text-[9px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors uppercase"
                  >
                    Xem lại Intro
                  </button>
                  <button
                    onClick={() => setIsTourActive(true)}
                    className="p-1.5 px-3.5 bg-brand-purple text-white text-[9px] font-bold rounded-lg hover:bg-brand-purple/95 transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/5"
                  >
                    <Compass size={11} /> Tour hướng dẫn Cú nhỏ
                  </button>
                </div>
              </div>

              {/* Grid 1: Main Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 saas-card p-6 bg-brand-card border-white/5 relative overflow-hidden group academic-standing-card">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Stars size={14} className="text-brand-purple" />
                        Academic Standing
                      </h3>
                      <span className="px-2 py-1 bg-brand-purple/10 text-brand-purple text-[9px] font-bold rounded uppercase border border-brand-purple/20">Distinction</span>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CGPA</p>
                        <p className="text-3xl font-bold text-brand-text-primary">3.56</p>
                        <p className="text-[9px] text-brand-emerald mt-1 font-bold">+0.12 ↑</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Credits</p>
                        <p className="text-3xl font-bold text-white">42</p>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase">Level 2</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Rank</p>
                        <p className="text-3xl font-bold text-white">#12</p>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase">Top 5%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="saas-card p-6 bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all text-left px-3 flex items-center justify-between group">
                        Registration <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all text-left px-3 flex items-center justify-between group">
                        Transcript <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all text-left px-3 flex items-center justify-between group">
                        Certificates <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[9px] text-gray-400 font-medium">Last Login: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Academic Calendar (Major Feature) */}
              <div className="saas-card bg-brand-card border-white/5 overflow-hidden calendar-widget-card">
                <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/[0.01]">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                       <Calendar size={20} />
                     </div>
                     <div>
                       <h3 className="text-sm font-bold text-white uppercase tracking-widest">Academic Calendar</h3>
                       <p className="text-[10px] text-gray-500 font-medium">Important Semester Deadlines & Events</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button className="saas-button-secondary py-1 text-[9px] uppercase tracking-wider font-bold">Upcoming</button>
                     <button className="saas-button-secondary py-1 text-[9px] uppercase tracking-wider font-bold opacity-50">Full Year</button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-brand-border">
                  {calendarEvents.length === 0 ? (
                    <div className="col-span-4 py-20 text-center">
                      <p className="text-sm text-gray-600">Syncing academic schedule...</p>
                    </div>
                  ) : (
                    calendarEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4).map((event) => (
                      <div key={event.id} className="p-6 hover:bg-white/[0.02] transition-colors relative group overflow-hidden">
                        <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`}>
                          {event.type === 'exam' ? <AlertCircle size={64} /> : event.type === 'registration' ? <Plus size={64} /> : <Clock size={64} />}
                        </div>
                        
                        <div className="mb-4">
                           <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${
                             event.type === 'exam' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                             event.type === 'registration' ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' :
                             event.type === 'holiday' ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                             'bg-brand-purple/10 text-brand-purple border-brand-purple/20'
                           }`}>
                             {event.type}
                           </span>
                        </div>
                        
                        <div className="space-y-3">
                           <h4 className="text-xs font-bold text-white leading-snug h-8 line-clamp-2">{event.title}</h4>
                           <div className="flex items-center gap-2 text-gray-500">
                             <Calendar size={10} />
                             <span className="text-[10px] font-mono">{new Date(event.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                           </div>
                           <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed h-10">{event.description}</p>
                        </div>

                        <div className="mt-6">
                           <button className="text-[9px] font-bold text-brand-purple uppercase flex items-center gap-1 hover:gap-2 transition-all">
                             View Details <ChevronRight size={10} />
                           </button>
                        </div>
                        
                        {event.priority === 'high' && (
                          <div className="absolute top-6 right-6 w-1 h-1 rounded-full bg-red-400 animate-ping" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 bg-white/[0.01] border-t border-brand-border text-center">
                   <button className="text-[10px] font-bold text-gray-500 uppercase hover:text-white transition-colors tracking-widest">
                     Download Official Calendar (PDF)
                   </button>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                 <div className="saas-card p-6 bg-brand-card border-white/5">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                     Recent Campus News
                     <button className="text-[10px] font-bold text-brand-cyan lowercase hover:underline">view all</button>
                   </h3>
                   <div className="space-y-6">
                      <div className="flex gap-4 group cursor-pointer border-b border-brand-border pb-4 last:border-0 last:pb-0">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-gray-500 group-hover:bg-brand-purple/20 group-hover:text-brand-purple transition-all">05</div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition-colors mb-1">New Library Operating Hours for Finals Week</h4>
                          <p className="text-[10px] text-gray-500">Starting next Monday, Main Library will be open 24/7 with enhanced security.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 group cursor-pointer border-b border-brand-border pb-4 last:border-0 last:pb-0">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-gray-500 group-hover:bg-brand-purple/20 group-hover:text-brand-purple transition-all">03</div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition-colors mb-1">Voluntary Health Checkup Campaign</h4>
                          <p className="text-[10px] text-gray-500">Free screening for all students at Building A1 Health Center.</p>
                        </div>
                      </div>
                   </div>
                 </div>

                 <div className="saas-card p-6 bg-brand-card border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Upcoming Schedule</h3>
                    <div className="space-y-4">
                       <div className="p-3 bg-white/[0.02] border border-brand-border rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Clock size={16} /></div>
                             <div>
                               <p className="text-xs font-bold text-white">Software Architecture</p>
                               <p className="text-[9px] text-gray-500">Building C · Room 302</p>
                             </div>
                          </div>
                          <p className="text-[10px] font-mono text-gray-400">08:00 AM</p>
                       </div>
                       <div className="p-3 bg-white/[0.02] border border-brand-border rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center"><Clock size={16} /></div>
                             <div>
                               <p className="text-xs font-bold text-white">Human Computer Interaction</p>
                               <p className="text-[9px] text-gray-500">Building E · Room 501</p>
                             </div>
                          </div>
                          <p className="text-[10px] font-mono text-gray-400">01:30 PM</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Student Profile Panel */}
      <aside className="w-[400px] border-l border-brand-border flex flex-col overflow-y-auto no-scrollbar shrink-0">
         <div className="p-8 space-y-8">
            {/* Header / Avatar Section with Futuristic Background */}
            <div className="relative p-6 rounded-2xl overflow-hidden saas-card border-none bg-transparent">
               <div 
                  className="absolute inset-0 z-0 opacity-30"
                  style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/80 to-transparent z-0" />
               <div className="relative z-10 flex flex-col items-center text-center">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-brand-card border-4 border-brand-bg flex items-center justify-center p-1.5 shadow-2xl mb-4 relative group cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-xl group-hover:bg-brand-purple/40 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all" />
                    
                    {student?.photoURL ? (
                      <img 
                        src={student.photoURL} 
                        alt={student.name} 
                        className="w-full h-full object-cover rounded-full relative z-10" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple font-bold text-4xl border border-brand-purple/20 relative z-10">
                        {student?.name?.charAt(0)}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Camera size={24} className="text-white" />
                    </div>
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                        <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{student?.name}</h3>
                  <div className="flex items-center gap-2 justify-center">
                    {!isOnline ? (
                      <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Offline</span>
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                    )}
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                      {isEditing ? editedStudent?.mssv : student?.mssv}
                    </span>
                  </div>
               </div>
            </div>

            {/* Main Stats Card */}
            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 saas-card bg-white/[0.01]">
                  <div className="flex items-center gap-2 text-brand-cyan mb-2">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase">Current GPA</span>
                  </div>
                  <div className="text-2xl font-bold text-white">3.45</div>
               </div>
               <div className="p-4 saas-card bg-white/[0.01]">
                  <div className="flex items-center gap-2 text-brand-purple mb-2">
                    <CheckCheck size={14} />
                    <span className="text-[10px] font-bold uppercase">Credits</span>
                  </div>
                  <div className="text-2xl font-bold text-white">102/120</div>
               </div>
            </div>

            {/* Line Chart Visual */}
            <div className="space-y-4 gpa-performance-chart">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">GPA Performance</h4>
                <div className="flex items-center gap-4 text-[10px] font-semibold text-brand-emerald">
                  <span>+0.25 vs Last Term</span>
                </div>
              </div>
              <div className="h-48 saas-card bg-white/[0.01] p-4 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SMUT_DATA.gpaHistory}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                       <XAxis dataKey="semester" hide />
                       <YAxis hide domain={[3.0, 3.6]} />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: 'var(--brand-card)', 
                           border: '1px solid var(--brand-border)', 
                           borderRadius: '8px',
                           color: 'var(--brand-text-primary)',
                           fontSize: '11px',
                           fontWeight: 'bold'
                         }}
                         itemStyle={{ color: 'var(--brand-cyan)' }}
                         labelStyle={{ display: 'none' }}
                       />
                       <Line type="monotone" dataKey="gpa" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>

            {/* Profile Fields List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Personal Info</h4>
                  <div className="flex items-center gap-3">
                    {!isEditing && (
                      <button 
                        onClick={handleExportCSV}
                        className="text-[10px] font-bold text-brand-cyan hover:underline flex items-center gap-1"
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
                      className="text-[10px] font-bold text-brand-purple hover:underline"
                    >
                      {isEditing ? 'Save Changes' : 'Edit'}
                    </button>
                  </div>
              </div>
              <div className="space-y-4 px-1">
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

            <div className="pt-4 border-t border-brand-border">
               <CalendarWidget events={calendarEvents} />
            </div>

            {/* Digital Pass / QR */}
            <div className="pt-4 border-t border-brand-border">
               <div className="p-6 saas-card bg-gradient-to-br from-brand-purple/10 to-transparent flex flex-col items-center">
                  <div className="p-3 bg-white rounded-xl mb-4 shadow-xl">
                    <QRCodeSVG 
                      value={`STUDENT_IDENTITY_${student?.mssv}`}
                      size={100}
                      level="H"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Digital Student Card</p>
                  <p className="text-[9px] text-gray-500 mt-1">Valid 2024-2028</p>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm saas-card bg-brand-card p-6 shadow-2xl relative z-10 border-white/10"
            >
              <div className="w-12 h-12 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Confirm Profile Updates</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Are you sure you want to apply these changes? Your updated contact information will be synced with the university databases.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 saas-button-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleSaveProfile();
                    setShowSaveConfirm(false);
                  }}
                  className="flex-1 saas-button-primary py-2 text-xs"
                >
                  Apply Changes
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
      />
      
      <AppIntro 
        isOpen={isIntroOpen} 
        onClose={() => setIsIntroOpen(false)} 
      />

      <InteractiveTour 
        isActive={isTourActive} 
        onClose={() => setIsTourActive(false)} 
      />
    </div>
  );
}
