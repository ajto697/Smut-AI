import { collection, addDoc, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Message } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const CHATS_COLLECTION = 'chats';

/**
 * Save chat message to Firestore.
 */
export async function saveChatMessageToFirestore(
  studentId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
      studentId,
      userId: studentId,
      role,
      content,
      timestamp: Date.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CHATS_COLLECTION);
    return '';
  }
}

/**
 * Subscribe to student's chat history from Firestore.
 */
export function subscribeToStudentChat(
  studentId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'asc'),
    limit(50)
  );

  let fallbackUnsub: (() => void) | null = null;

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role as 'user' | 'assistant',
        content: data.content,
        timestamp: data.timestamp || Date.now()
      };
    });
    callback(messages);
  }, (error) => {
    console.warn('Chat index fallback query triggered:', error.message);
    // Fallback query without orderBy, sort on client
    const fallbackQ = query(
      collection(db, CHATS_COLLECTION),
      where('studentId', '==', studentId),
      limit(50)
    );
    fallbackUnsub = onSnapshot(fallbackQ, (fallbackSnap) => {
      const messages: Message[] = fallbackSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role as 'user' | 'assistant',
          content: data.content,
          timestamp: data.timestamp || Date.now()
        };
      });
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    }, (fallbackErr) => {
      console.error('Chat fallback query error:', fallbackErr);
    });
  });

  return () => {
    unsubscribe();
    if (fallbackUnsub) fallbackUnsub();
  };
}
