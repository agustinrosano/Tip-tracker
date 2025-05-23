import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { where } from "firebase/firestore";

export const fetchTipsFromFirestore = async () => {
  const user = JSON.parse(localStorage.getItem("user")); // o auth.currentUser
  const tipsRef = collection(db, `users/${user.uid}/tips`);
  const q = query(tipsRef, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addTipToFirestore = async ({ amount, comment, date }) => {

  try{
  const user = JSON.parse(localStorage.getItem("user"));
  const tipRef = collection(db, `users/${user.uid}/tips`);
  return await addDoc(tipRef, {
    amount,
    comment,
    date,
    createdAt: Timestamp.now(),
    userId: user.uid,
  });
}catch (error) {
    console.error("❌ Error al crear propina:", error);
    throw error;
  }

  
};

export const updateTipInFirestore = async (id, data) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("🔧 Actualizando propina:", id, data);
    console.log("👤 Usuario:", user?.uid);

    const docRef = doc(db, `users/${user.uid}/tips/${id}`);
    await updateDoc(docRef, data);

    console.log("✅ Propina actualizada con éxito");
  } catch (error) {
    console.error("❌ Error al actualizar propina:", error);
    throw error;
  }
};

export const deleteTipFromFirestore = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("🗑️ Eliminando propina:", id);
    console.log("👤 Usuario:", user?.uid);

    const docRef = doc(db, `users/${user.uid}/tips/${id}`);
    await deleteDoc(docRef);

    console.log("✅ Propina eliminada con éxito");
  } catch (error) {
    console.error("❌ Error al eliminar propina:", error);
    throw error;
  }
};