import { collection, onSnapshot, query, orderBy, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { CalendarEvent } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const COLLECTION_NAME = 'calendarEvents';

export const DEFAULT_CALENDAR_EVENTS: Array<Omit<CalendarEvent, 'id'> & { id: string }> = [
  {
    id: "evt_2026_05_25_ai_edu",
    title: "Hội thảo AI Education",
    description: "Hội thảo về tương lai của AI trong giáo dục tại Hội trường A, Cơ sở 1.",
    date: "2026-05-25",
    type: "event",
    priority: "low"
  },
  {
    id: "evt_2026_06_15_final_hk2",
    title: "Kỳ thi Cuối kỳ HK2",
    description: "Bắt đầu tập trung thi cử kết thúc học phần HK2 năm học 2025-2026 tại các cơ sở.",
    date: "2026-06-15",
    type: "exam",
    priority: "high"
  },
  {
    id: "evt_2026_07_01_reg_hk1",
    title: "Đăng ký học phần HK1 26-27",
    description: "Mở cổng đăng ký tín chỉ trực tuyến cho toàn bộ sinh viên các khóa.",
    date: "2026-07-01",
    type: "registration",
    priority: "high"
  },
  {
    id: "evt_2026_09_02_quoc_khanh",
    title: "Lễ Quốc khánh",
    description: "Nghỉ lễ toàn quốc theo quy định hiện hành.",
    date: "2026-09-02",
    type: "holiday",
    priority: "medium"
  }
];

function deduplicateCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  const seen = new Map<string, CalendarEvent>();
  for (const evt of events) {
    const normalizedTitle = (evt.title || '').trim().toLowerCase();
    const key = `${normalizedTitle}__${evt.date}`;
    if (!seen.has(key)) {
      seen.set(key, evt);
    }
  }
  return Array.from(seen.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export const subscribeToCalendarEvents = (callback: (events: CalendarEvent[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const rawEvents: CalendarEvent[] = [];
      snapshot.forEach((docSnap) => {
        rawEvents.push({ id: docSnap.id, ...docSnap.data() } as CalendarEvent);
      });
      callback(deduplicateCalendarEvents(rawEvents));
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      callback(DEFAULT_CALENDAR_EVENTS);
    }
  );
};

let isSeedingCalendar = false;

export const seedCalendarEvents = async () => {
  if (isSeedingCalendar) return;
  isSeedingCalendar = true;
  const eventsRef = collection(db, COLLECTION_NAME);
  try {
    const snapshot = await getDocs(eventsRef);
    const existingKeys = new Set<string>();
    snapshot.forEach((d) => {
      const data = d.data();
      const key = `${(data.title || '').trim().toLowerCase()}__${data.date}`;
      existingKeys.add(key);
    });

    const missingEvents = DEFAULT_CALENDAR_EVENTS.filter((evt) => {
      const key = `${evt.title.trim().toLowerCase()}__${evt.date}`;
      return !existingKeys.has(key);
    });

    if (missingEvents.length > 0) {
      const batch = writeBatch(db);
      missingEvents.forEach((event) => {
        const { id, ...payload } = event;
        const docRef = doc(db, COLLECTION_NAME, id);
        batch.set(docRef, payload, { merge: true });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  } finally {
    isSeedingCalendar = false;
  }
};
