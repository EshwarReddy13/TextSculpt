import { ref, set, onValue, off } from "firebase/database";
import { db } from "./config";

export function listenToDocument(docId: string, callback: (data: any) => void) {
  const docRef = ref(db, `documents/${docId}`);
  onValue(docRef, (snapshot) => callback(snapshot.val()));
  return () => off(docRef);
}

export function saveDocument(docId: string, data: any) {
  return set(ref(db, `documents/${docId}`), data);
}