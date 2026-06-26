import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ─── AUTH ─────────────────────────────────────────────
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ─── TASKS ────────────────────────────────────────────
export const createTask = async (userId, taskData) => {
  try {
    const ref = await addDoc(collection(db, "tasks"), {
      ...taskData,
      userId,
      completed: false,
      riskScore: 0,
      riskLevel: "low",
      subtasks: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};
export const subscribeToUserTasks = (userId, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      deadline: doc.data().deadline ? new Date(doc.data().deadline) : null,
    }));
    callback(tasks);
  });
};

export const updateTask = async (taskId, updates) => {
  try {
    await updateDoc(doc(db, "tasks", taskId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// ─── ALERTS LOG ───────────────────────────────────────
export const logCrisisAlert = async (userId, alertData) => {
  try {
    await addDoc(collection(db, "alerts"), {
      userId,
      ...alertData,
      createdAt: serverTimestamp(),
      acknowledged: false,
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
export const getUserAlerts = (userId, callback) => {
  const q = query(
    collection(db, "alerts"),
    where("userId", "==", userId),
    where("acknowledged", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    }));
    callback(alerts);
  });
};

export const acknowledgeAlert = async (alertId) => {
  try {
    await updateDoc(doc(db, "alerts", alertId), { acknowledged: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
// ─── AI CACHE FUNCTIONS ────────────────────────────────
// ═══════════════════════════════════════════════
// ─── AI CACHE FUNCTIONS (FIXED + TTL) ─────────
// ═══════════════════════════════════════════════

const CACHE_TTL_MINUTES = 30; // Cache valid for 30 minutes (saves Gemini quota)

export const saveAICache = async (userId, cacheData) => {
  try {
    // Use setDoc with merge - creates if not exists, updates if exists
    // userId as document ID = ONE document per user (no duplicates)
    await setDoc(
      doc(db, "aiCache", userId),
      {
        userId,
        ...cacheData,
        updatedAt: serverTimestamp(),
        cachedAt: Date.now(), // For TTL calculation
      },
      { merge: true } // CRITICAL: merge instead of overwrite
    );
    console.log("✅ AI cache saved successfully");
    return { error: null };
  } catch (error) {
    console.error("❌ Cache save failed:", error.message);
    return { error: error.message };
  }
};

export const getAICache = async (userId) => {
  try {
    // Direct document fetch by userId (faster than query)
    const docRef = doc(db, "aiCache", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("📭 No cache found for user");
      return { data: null };
    }

    const data = docSnap.data();

    // Check TTL - is cache still fresh?
    const cacheAge = Date.now() - (data.cachedAt || 0);
    const cacheAgeMinutes = Math.floor(cacheAge / 60000);
    const isStale = cacheAgeMinutes > CACHE_TTL_MINUTES;

    if (isStale) {
      console.log(`⏰ Cache is stale (${cacheAgeMinutes} min old). Will refresh.`);
      return { data: null, stale: true };
    }

    console.log(`✅ Fresh cache loaded (${cacheAgeMinutes} min old)`);
    return {
      data: {
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      },
      stale: false,
    };
  } catch (error) {
    console.error("❌ Cache load failed:", error.message);
    return { data: null, error: error.message };
  }
};

// Clear cache manually (useful for "Force Refresh" button)
export const clearAICache = async (userId) => {
  try {
    await deleteDoc(doc(db, "aiCache", userId));
    console.log("🗑️ Cache cleared");
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};