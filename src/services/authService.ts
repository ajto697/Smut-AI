import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Student } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';
import { seedDemoData } from './studentService';

export interface AuthResponse {
  user: FirebaseUser | null;
  student: Student | null;
  error?: string;
}

// Convert Firestore document to Student object
export function documentToStudent(data: any): Student {
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

/**
 * Sign in using MSSV and Student Password/PIN.
 * Verifies credentials in Firestore and establishes Firebase Auth session if available.
 */
export async function loginWithMssv(mssv: string, pass: string): Promise<AuthResponse> {
  const studentDocRef = doc(db, 'students', mssv);
  let snapshot;

  try {
    snapshot = await getDoc(studentDocRef);
  } catch (fsErr) {
    handleFirestoreError(fsErr, OperationType.GET, `students/${mssv}`);
    return { user: null, student: null, error: 'Không thể kết nối cơ sở dữ liệu học vụ.' };
  }

  // If student document doesn't exist yet (e.g. demo account before seed completes)
  if (!snapshot.exists()) {
    if (mssv === '25010001' || mssv === '25010002') {
      try {
        await seedDemoData();
        snapshot = await getDoc(studentDocRef);
      } catch (seedErr) {
        console.warn('Seeding fallback error:', seedErr);
      }
    }
  }

  if (!snapshot.exists()) {
    return { user: null, student: null, error: 'Mã số sinh viên không tồn tại trong hệ thống.' };
  }

  const data = snapshot.data();
  if (data.password !== pass) {
    return { user: null, student: null, error: 'Mật khẩu hoặc mã PIN không chính xác.' };
  }

  const student = documentToStudent(data);
  const authEmail = student.email && student.email.includes('@') 
    ? student.email 
    : `${mssv}@scholar-owl.edu.vn`;

  // Gracefully attempt Firebase Auth session (catch all auth provider restrictions)
  let user: FirebaseUser | null = null;
  try {
    const userCred = await signInWithEmailAndPassword(auth, authEmail, pass);
    user = userCred.user;
  } catch (authErr: any) {
    // If user is not yet created in Auth, try auto-registering or fallback anonymously
    if (authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/invalid-credential') {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, authEmail, pass);
        user = userCred.user;
      } catch (createErr: any) {
        // If creation is restricted (e.g. auth/admin-restricted-operation), try anonymous
        try {
          const anonCred = await signInAnonymously(auth);
          user = anonCred.user;
        } catch {
          // Anonymous or email auth restricted on this GCP project; safe to proceed with student session
          console.info('Firebase Auth is restricted by admin; continuing with Firestore verified session.');
        }
      }
    } else {
      try {
        const anonCred = await signInAnonymously(auth);
        user = anonCred.user;
      } catch {
        console.info('Firebase Auth session optional; continuing with verified student identity.');
      }
    }
  }

  // Update UID link and timestamp in Firestore if Firebase Auth user exists
  if (user) {
    try {
      await setDoc(studentDocRef, { uid: user.uid, lastLogin: Timestamp.now() }, { merge: true });
    } catch (e) {
      console.warn('Could not update student UID in Firestore:', e);
    }
  }

  return { user, student };
}

/**
 * Sign in with standard Email and Password.
 */
export async function loginWithEmail(email: string, pass: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  let user: FirebaseUser | null = null;

  // Try Firebase Auth first
  try {
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    user = cred.user;
  } catch (authErr: any) {
    console.warn('Firebase Auth email sign-in notice:', authErr?.code || authErr?.message);
  }

  // Search for student associated with this email
  const mssvMatch = normalizedEmail.split('@')[0];
  let studentDoc;
  try {
    studentDoc = await getDoc(doc(db, 'students', mssvMatch));
  } catch (err) {
    // Continue
  }

  if (studentDoc && studentDoc.exists()) {
    const data = studentDoc.data();
    if (data.password === pass || user) {
      return { user, student: documentToStudent(data) };
    }
    return { user: null, student: null, error: 'Mật khẩu không chính xác.' };
  }

  // Fallback demo students check if demo email
  if (normalizedEmail.includes('25010001')) {
    return loginWithMssv('25010001', pass);
  } else if (normalizedEmail.includes('25010002')) {
    return loginWithMssv('25010002', pass);
  }

  if (user) {
    // If authenticated via Firebase Auth but no student profile yet, create standard profile
    const defaultStudent: Student = {
      mssv: mssvMatch.length === 8 ? mssvMatch : `SV${Math.floor(100000 + Math.random() * 900000)}`,
      name: user.displayName || normalizedEmail.split('@')[0].toUpperCase(),
      email: normalizedEmail,
      major: 'Công nghệ Thông tin',
      class: 'K25',
      academicStatus: 'Đang học',
    };

    try {
      await setDoc(doc(db, 'students', defaultStudent.mssv), {
        ...defaultStudent,
        uid: user.uid,
        password: pass,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch {
      // Ignored
    }

    return { user, student: defaultStudent };
  }

  return { user: null, student: null, error: 'Email hoặc mật khẩu không chính xác.' };
}

/**
 * Register a new student account with Firebase Auth and Firestore.
 */
export async function registerStudent(
  newStudentData: Omit<Student, 'photoURL'>, 
  password: string
): Promise<AuthResponse> {
  const emailToUse = newStudentData.email || `${newStudentData.mssv}@scholar-owl.edu.vn`;
  let user: FirebaseUser | null = null;

  try {
    const cred = await createUserWithEmailAndPassword(auth, emailToUse, password);
    user = cred.user;
  } catch (authErr: any) {
    console.warn('Firebase Auth user creation note:', authErr?.code || authErr?.message);
    if (authErr?.code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, emailToUse, password);
        user = cred.user;
      } catch {
        // Ignored
      }
    }
  }

  const studentRecord: Student = {
    ...newStudentData,
    academicStatus: newStudentData.academicStatus || 'Đang học'
  };

  // Save profile to Firestore
  try {
    await setDoc(doc(db, 'students', newStudentData.mssv), {
      ...studentRecord,
      uid: user ? user.uid : null,
      password: password,
      updatedAt: Timestamp.now()
    });
  } catch (fsErr) {
    handleFirestoreError(fsErr, OperationType.CREATE, `students/${newStudentData.mssv}`);
    return { user: null, student: null, error: 'Không thể tạo hồ sơ trên Firestore.' };
  }

  return { user, student: studentRecord };
}

/**
 * 1-Click Fast Demo Login for pre-seeded student accounts.
 */
export async function quickDemoLogin(mssv: string = '25010001'): Promise<AuthResponse> {
  const pass = mssv === '25010001' ? '10151018' : '897abb5a';
  try {
    await seedDemoData();
  } catch (e) {
    console.warn('Auto seed check:', e);
  }
  return loginWithMssv(mssv, pass);
}

/**
 * Sign out current user from Firebase Auth.
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out notice:', e);
  }
}

/**
 * Observe Firebase Auth state.
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
