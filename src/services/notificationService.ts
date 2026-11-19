import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  Timestamp,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const COLLECTION_NAME = 'notifications';

function deduplicateNotifications(items: Notification[]): Notification[] {
  const seen = new Map<string, Notification>();
  for (const item of items) {
    const key = `${(item.title || '').trim().toLowerCase()}__${(item.message || '').trim().toLowerCase()}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, item);
    } else if (item.timestamp > existing.timestamp) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export const subscribeToNotifications = (
  studentId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc')
  );

  let fallbackUnsub: (() => void) | null = null;

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Notification[];
      callback(deduplicateNotifications(notifications));
    },
    (error) => {
      console.warn('Notifications index fallback query triggered:', error.message);
      const fallbackQ = query(
        collection(db, COLLECTION_NAME),
        where('studentId', '==', studentId)
      );
      fallbackUnsub = onSnapshot(
        fallbackQ,
        (fallbackSnap) => {
          const notifications = fallbackSnap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as Notification[];
          callback(deduplicateNotifications(notifications));
        },
        (fallbackErr) => {
          handleFirestoreError(fallbackErr, OperationType.GET, COLLECTION_NAME);
        }
      );
    }
  );

  return () => {
    unsubscribe();
    if (fallbackUnsub) fallbackUnsub();
  };
};

export const markAsRead = async (notificationId: string) => {
  const path = COLLECTION_NAME + '/' + notificationId;
  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

const seedingInFlight = new Set<string>();

export const seedNotifications = async (studentId: string) => {
  if (!studentId || seedingInFlight.has(studentId)) return;
  seedingInFlight.add(studentId);
  try {
    const q = query(collection(db, COLLECTION_NAME), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const nowMs = Timestamp.now().toMillis();
      const demoNotifs = [
        {
          id: `${studentId}_notif_1`,
          studentId,
          title: 'Hạn đăng ký bảo lưu',
          message: 'Lưu ý ngày 15/05 là hạn chót nộp đơn bảo lưu học kỳ này.',
          type: 'deadline',
          isRead: false,
          timestamp: nowMs
        },
        {
          id: `${studentId}_notif_2`,
          studentId,
          title: 'Cập nhật hệ thống',
          message: 'Hệ thống SMUT Assistant vừa tích hợp tính năng quản lý hồ sơ.',
          type: 'system',
          isRead: true,
          timestamp: nowMs - 86400000
        },
        {
          id: `${studentId}_notif_3`,
          studentId,
          title: 'Sự kiện: Workshop AI',
          message: 'Đăng ký tham gia buổi chia sẻ về Gemini AI tại Hội trường A.',
          type: 'event',
          isRead: false,
          timestamp: nowMs - 172800000
        }
      ];

      for (const notif of demoNotifs) {
        const { id, ...payload } = notif;
        await setDoc(doc(db, COLLECTION_NAME, id), payload, { merge: true });
      }
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, COLLECTION_NAME);
  } finally {
    seedingInFlight.delete(studentId);
  }
};
