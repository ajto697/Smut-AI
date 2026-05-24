import { collection, onSnapshot, query, orderBy, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { CalendarEvent } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const COLLECTION_NAME = 'calendarEvents';

export const subscribeToCalendarEvents = (callback: (events: CalendarEvent[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const events: CalendarEvent[] = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as CalendarEvent);
    });
    callback(events);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const seedCalendarEvents = async () => {
  const eventsRef = collection(db, COLLECTION_NAME);
  try {
    const snapshot = await getDocs(eventsRef);
    
    if (snapshot.empty) {
      const batch = writeBatch(db);
      const demoEvents = [
        {
          title: "Kỳ thi Cuối kỳ HK2",
          description: "Bắt đầu tập trung thi cử tại các cơ sở.",
          date: "2026-06-15",
          type: "exam",
          priority: "high"
        },
        {
          title: "Đăng ký học phần HK1 26-27",
          description: "Mở cổng đăng ký trực tuyến.",
          date: "2026-07-01",
          type: "registration",
          priority: "high"
        },
        {
          title: "Lễ Quốc khánh",
          description: "Nghỉ lễ toàn quốc.",
          date: "2026-09-02",
          type: "holiday",
          priority: "medium"
        },
        {
          title: "Hội thảo AI Education",
          description: "Hội thảo về tương lai của AI trong giáo dục.",
          date: "2026-05-25",
          type: "event",
          priority: "low"
        }
      ];

      demoEvents.forEach(event => {
        const newDocRef = doc(eventsRef);
        batch.set(newDocRef, event);
      });

      await batch.commit();
      console.log('Demo calendar events seeded successfully');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
};
