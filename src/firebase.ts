import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from "firebase/firestore";

/* =========================================================================
   ¡ATENCIÓN! CONFIGURACIÓN DE FIREBASE 
   =========================================================================
   Para que esta app funcione correctamente con tu propia base de datos, 
   debes crear un proyecto en la consola de Firebase (https://console.firebase.google.com/)
   y reemplazar los valores del objeto `firebaseConfig` a continuación.

   ¿Qué valores debes reemplazar?
   - apiKey: Tu clave de API pública (ej. "AIzaSyB-xxxxxxxxxxxxxxx")
   - authDomain: El dominio de autenticación (ej. "tu-proyecto.firebaseapp.com")
   - projectId: El ID de tu proyecto (ej. "tu-proyecto")
   - storageBucket: El bucket de almacenamiento (ej. "tu-proyecto.appspot.com")
   - messagingSenderId: ID del remitente (ej. "123456789012")
   - appId: El ID de tu aplicación (ej. "1:123456789012:web:xxxxxxxxxxxxxx")
   
   ¡Importante!
   1. Asegúrate de habilitar "Authentication" en Firebase y activar los 
      proveedores: Google, Correo/Contraseña, y Anónimo (Invitado).
   2. Habilita "Firestore Database" y asegúrate de que las reglas de 
      seguridad permitan a los usuarios leer y escribir sus propias tareas.
========================================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBqvCsgBvTjhbR7hKm-HcMj8957eg4oPUs",
  authDomain: "focus-flow-5691e.firebaseapp.com",
  projectId: "focus-flow-5691e",
  storageBucket: "focus-flow-5691e.firebasestorage.app",
  messagingSenderId: "685925248204",
  appId: "1:685925248204:web:874888bd0231be869aa669"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore
export const db = getFirestore(app);
