import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { SMUT_KPI_Item } from '../components/StudyOwlAzota';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const KPI_COLLECTION = 'kpiEvidence';
const QUIZ_COLLECTION = 'quizResults';

/**
 * Subscribe to real-time updates for a student's training KPIs from Firestore.
 * If the student has no recorded KPIs in Firestore yet, automatically seed the initial set.
 */
export function subscribeToStudentKpis(
  studentId: string, 
  initialKpis: SMUT_KPI_Item[],
  callback: (kpis: SMUT_KPI_Item[]) => void
) {
  const q = query(
    collection(db, KPI_COLLECTION),
    where('studentId', '==', studentId)
  );

  return onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      // Seed default initial KPIs for this student into Firestore
      try {
        for (const kpi of initialKpis) {
          const docId = `${studentId}_${kpi.id}`;
          await setDoc(doc(db, KPI_COLLECTION, docId), {
            ...kpi,
            studentId,
            kpiId: kpi.id,
            updatedAt: Date.now()
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Auto-seed KPIs error:', err);
      }
      callback(initialKpis);
      return;
    }

    // Map docs into SMUT_KPI_Item array
    const loadedKpis: SMUT_KPI_Item[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      loadedKpis.push({
        id: data.kpiId || data.id,
        code: data.code,
        points: data.points,
        category: data.category,
        description: data.description,
        suggestedEvidence: data.suggestedEvidence,
        status: data.status,
        evidenceFile: data.evidenceFile,
        evidenceText: data.evidenceText,
        evidenceImage: data.evidenceImage,
        comment: data.comment
      });
    });

    // Sort by code / index matching the standard 18 KPIs order
    loadedKpis.sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.code.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    callback(loadedKpis);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, KPI_COLLECTION);
  });
}

/**
 * Persist or update an individual KPI's evidence and verification status into Firestore.
 */
export async function updateKpiInFirestore(
  studentId: string, 
  kpi: SMUT_KPI_Item
): Promise<void> {
  const docId = `${studentId}_${kpi.id}`;
  try {
    await setDoc(doc(db, KPI_COLLECTION, docId), {
      ...kpi,
      studentId,
      kpiId: kpi.id,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${KPI_COLLECTION}/${docId}`);
  }
}

/**
 * Save practice quiz score to Firestore.
 */
export async function saveQuizResultToFirestore(
  studentId: string,
  result: {
    subjectName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
  }
): Promise<void> {
  try {
    await addDoc(collection(db, QUIZ_COLLECTION), {
      studentId,
      subjectName: result.subjectName,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      timestamp: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, QUIZ_COLLECTION);
  }
}
