export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Student {
  mssv: string;
  name: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  major?: string;
  class?: string;
  academicStatus?: string;
  birthDate?: string;
}

export interface Notification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'deadline' | 'event' | 'system';
  isRead: boolean;
  timestamp: number;
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  maps: string;
  buildings: {
    name: string;
    floors: {
      level: string;
      rooms: {
        number: string;
        func: string;
      }[];
    }[];
  }[];
}

export interface ServiceProcedure {
  procedure: string;
  dept: string;
  room: string;
  building: string;
  campus: string;
  staff: string;
  phone: string;
  email: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'exam' | 'registration' | 'holiday' | 'event';
  priority: 'high' | 'medium' | 'low';
}

export interface HypotheticalCourse {
  id: string;
  name: string;
  credits: number;
  grade: number; // 0.0 - 4.0 scale
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSubject {
  id: string;
  name: string;
  icon: string;
  questions: QuizQuestion[];
}

export interface DailyCareState {
  hasCheckedIn: boolean;
  mood: string;
  checkInTime: number;
  interactionCount: number;
}

export interface DocumentAnalysisResult {
  summary: string;
  keywords: {
    term: string;
    definition: string;
    example: string;
    importance: 'Cốt lõi' | 'Quan trọng' | 'Mở rộng';
  }[];
}

