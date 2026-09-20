import { doc, getDoc, setDoc, Timestamp, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { Student } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

export async function testConnection() {
  const path = 'test/connection';
  try {
    // Try to get document from server to test connectivity
    await getDocFromServer(doc(db, path));
  } catch (error) {
    // If it's a "not found" error, it counts as a success (reached backend)
    // If it's a timeout or network error, it's a real failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Failed to get document because the client is offline') || 
        errorMessage.includes('Backend didn\'t respond')) {
      console.error("Please check your Firebase configuration: " + errorMessage);
    }
  }
}

export async function getStudentProfile(mssv: string): Promise<Student | null> {
  const path = 'students';
  try {
    const studentDoc = doc(db, path, mssv);
    const snapshot = await getDoc(studentDoc);
    if (!snapshot.exists()) {
      if (mssv === '25010001' || mssv === '25010002') {
        await seedDemoData();
        const retrySnap = await getDoc(studentDoc);
        if (retrySnap.exists()) {
          const data = retrySnap.data();
          return {
            mssv: data.mssv,
            name: data.name,
            photoURL: data.photoURL,
            email: data.email,
            phone: data.phone,
            major: data.major,
            class: data.class,
            academicStatus: data.academicStatus || 'Đang học',
            birthDate: data.birthDate,
            gpa: typeof data.gpa === 'number' ? data.gpa : (data.mssv === '25010001' ? 3.82 : 3.56),
            credits: typeof data.credits === 'number' ? data.credits : (data.mssv === '25010001' ? 62 : 42)
          };
        }
      }
      return null;
    }
    const data = snapshot.data();
    return {
      mssv: data.mssv,
      name: data.name,
      photoURL: data.photoURL,
      email: data.email,
      phone: data.phone,
      major: data.major,
      class: data.class,
      academicStatus: data.academicStatus || 'Đang học',
      birthDate: data.birthDate,
      gpa: typeof data.gpa === 'number' ? data.gpa : (data.mssv === '25010001' ? 3.82 : 3.56),
      credits: typeof data.credits === 'number' ? data.credits : (data.mssv === '25010001' ? 62 : 42)
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path + '/' + mssv);
    return null;
  }
}

export async function verifyStudent(mssv: string, pass: string): Promise<Student | null> {
  const path = 'students';
  try {
    const studentDoc = doc(db, path, mssv);
    const snapshot = await getDoc(studentDoc);
    
    if (!snapshot.exists()) {
      if (mssv === '25010001' || mssv === '25010002') {
        try {
          await seedDemoData();
          const retrySnap = await getDoc(studentDoc);
          if (retrySnap.exists()) {
            const data = retrySnap.data();
            if (data.password === pass) {
              return {
                mssv: data.mssv,
                name: data.name,
                photoURL: data.photoURL,
                email: data.email,
                phone: data.phone,
                major: data.major,
                class: data.class,
                academicStatus: data.academicStatus || 'Đang học',
                birthDate: data.birthDate,
                gpa: typeof data.gpa === 'number' ? data.gpa : (data.mssv === '25010001' ? 3.82 : 3.56),
                credits: typeof data.credits === 'number' ? data.credits : (data.mssv === '25010001' ? 62 : 42)
              };
            }
          }
        } catch {
          // Continue
        }
      }
      return null;
    }
    
    const data = snapshot.data();
    if (data.password !== pass) return null;

    return {
      mssv: data.mssv,
      name: data.name,
      photoURL: data.photoURL,
      email: data.email,
      phone: data.phone,
      major: data.major,
      class: data.class,
      academicStatus: data.academicStatus || 'Đang học',
      birthDate: data.birthDate,
      gpa: typeof data.gpa === 'number' ? data.gpa : (data.mssv === '25010001' ? 3.82 : 3.56),
      credits: typeof data.credits === 'number' ? data.credits : (data.mssv === '25010001' ? 62 : 42)
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path + '/' + mssv);
    return null;
  }
}

export async function updateStudentProfile(mssv: string, updates: Partial<Student>): Promise<void> {
  const path = 'students';
  try {
    const studentDoc = doc(db, path, mssv);
    await setDoc(studentDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path + '/' + mssv);
  }
}

// Initial data population for demo students
export async function seedDemoData() {
  const demoStudents = [
    { 
      mssv: "25010001", 
      name: "BÙI MAI ANH", 
      password: "10151018", 
      email: "25010001@vnu.edu.vn",
      phone: "0914797180",
      major: "Sư phạm Toán học",
      class: "2025-2029",
      academicStatus: "Đang học",
      birthDate: "2007/02/09",
      gpa: 3.82,
      credits: 62
    },
    { 
      mssv: "25010002", 
      name: "HOÀNG DIỆU ANH", 
      password: "897abb5a", 
      email: "25010002@vnu.edu.vn",
      phone: "0967118662",
      major: "Sư phạm Toán học",
      class: "2025-2029",
      academicStatus: "Đang học",
      birthDate: "2007/12/28",
      gpa: 3.56,
      credits: 42
    }
  ];

  for (const s of demoStudents) {
    try {
      await setDoc(doc(db, 'students', s.mssv), {
        ...s,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (e) {
      console.error("Seeding error:", e);
    }
  }
}
