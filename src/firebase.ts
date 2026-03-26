import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaITXJ9SKtc4Yyo2hbNIouG5m2d-hrCRM",
  authDomain: "juo-company.firebaseapp.com",
  projectId: "juo-company",
  storageBucket: "juo-company.firebasestorage.app",
  messagingSenderId: "1063207314132",
  appId: "1:1063207314132:web:8fbaf2125e28d8fa175141",
  measurementId: "G-P2G6LQGGSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

// ---------------------
// Analytics Event Helpers
// ---------------------
export function logEvent(eventName: string, params?: Record<string, string | number>) {
  firebaseLogEvent(analytics, eventName, params);
}

// ---------------------
// Firestore Stats Helpers
// ---------------------
const STATS_COLLECTION = 'stats';
const RESULTS_DOC = 'meong-bti';

/** 유형별 카운트 + 전체 카운트를 1 증가시킵니다. 중복 방지 포함. */
export async function incrementResultCount(typeCode: string): Promise<void> {
  // 중복 방지: 이미 이 세션에서 카운트했으면 skip
  const sessionKey = `meong-bti-counted-${typeCode}`;
  if (sessionStorage.getItem(sessionKey)) return;

  const docRef = doc(db, STATS_COLLECTION, RESULTS_DOC);
  
  try {
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // 최초 실행 시 문서 초기화
      await setDoc(docRef, {
        EGA: 0, EGI: 0, EPI: 0, EPA: 0,
        CGA: 0, CGI: 0, CPA: 0, CPI: 0,
        total: 0,
      });
    }

    await updateDoc(docRef, {
      [typeCode]: increment(1),
      total: increment(1),
    });

    sessionStorage.setItem(sessionKey, 'true');
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

/** 전체 통계 데이터를 가져옵니다. */
export async function getResultStats(): Promise<Record<string, number> | null> {
  const docRef = doc(db, STATS_COLLECTION, RESULTS_DOC);
  
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Record<string, number>;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}
