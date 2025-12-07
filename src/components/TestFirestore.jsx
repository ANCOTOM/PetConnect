import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Ajusta según tu ruta

export default function TestFirestore() {
  useEffect(() => {
    const testFirestore = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        console.log(snapshot.docs.map(doc => doc.data()));
        console.log("✅ Firestore accesible");
      } catch (err) {
        console.error("❌ Error accediendo a Firestore:", err);
      }
    };

    testFirestore();
  }, []);

  return <div>Prueba Firestore (revisa la consola)</div>;
}
