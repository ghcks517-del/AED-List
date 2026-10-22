import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AedItem } from '../types/aed';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Retrying connection...');
    }
  }
}

const AED_COLLECTION = 'aeds';

/**
 * Real-time subscription to AEDs in Firestore
 */
export function subscribeToAeds(
  onData: (aeds: AedItem[]) => void,
  onError: (error: Error) => void
) {
  const colRef = collection(db, AED_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AedItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          ...(data as AedItem),
          id: docSnap.id,
        });
      });
      // Sort by management number
      items.sort((a, b) => a.managementNo.localeCompare(b.managementNo, undefined, { numeric: true }));
      onData(items);
    },
    (err) => {
      console.error('Firestore snapshot listener error:', err);
      handleFirestoreError(err, OperationType.LIST, AED_COLLECTION);
      onError(err);
    }
  );
}

/**
 * Upsert single AED to Firestore
 */
export async function saveAedToFirestore(aed: AedItem) {
  try {
    const docRef = doc(db, AED_COLLECTION, aed.id);
    await setDoc(docRef, aed, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${AED_COLLECTION}/${aed.id}`);
  }
}

/**
 * Delete single AED from Firestore
 */
export async function deleteAedFromFirestore(aedId: string) {
  try {
    const docRef = doc(db, AED_COLLECTION, aedId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${AED_COLLECTION}/${aedId}`);
  }
}

/**
 * Seed initial sample dataset if collection is empty
 */
export async function seedInitialAedsIfEmpty(initialData: AedItem[]) {
  try {
    const colRef = collection(db, AED_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const batch = writeBatch(db);
      initialData.forEach((item) => {
        const docRef = doc(db, AED_COLLECTION, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      console.log('Seeded initial AED data into Firestore successfully.');
    }
  } catch (err) {
    console.error('Error during initial seed check:', err);
  }
}
