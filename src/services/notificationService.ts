import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, Timestamp, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const COLLECTION_NAME = 'notifications';

export const subscribeToNotifications = (studentId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    callback(notifications);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
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

export const seedNotifications = async (studentId: string) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      const demoNotifs = [
        {
          studentId,
          title: "Hạn đăng ký bảo lưu",
          message: "Lưu ý ngày 15/05 là hạn chót nộp đơn bảo lưu học kỳ này.",
          type: "deadline",
          isRead: false,
          timestamp: Timestamp.now().toMillis()
        },
        {
          studentId,
          title: "Cập nhật hệ thống",
          message: "Hệ thống SMUT Assistant vừa tích hợp tính năng quản lý hồ sơ.",
          type: "system",
          isRead: true,
          timestamp: Timestamp.now().toMillis() - 86400000
        },
        {
          studentId,
          title: "Sự kiện: Workshop AI",
          message: "Đăng ký tham gia buổi chia sẻ về Gemini AI tại Hội trường A.",
          type: "event",
          isRead: false,
          timestamp: Timestamp.now().toMillis() - 172800000
        }
      ];

      for (const notif of demoNotifs) {
        await addDoc(collection(db, COLLECTION_NAME), notif);
      }
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, COLLECTION_NAME);
  }
};
