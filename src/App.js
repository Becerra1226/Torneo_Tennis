import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseApp from "./firebase/credenciales";
import Home from "./screens/Home";
import Login from "./screens/Login";

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

function App() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        const rol = await getRol(usuarioFirebase.uid);
        const userData = {
          uid: usuarioFirebase.uid,
          email: usuarioFirebase.email,
          rol: rol,
        };
        setUsuario(userData);
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function getRol(uid) {
    const docuRef = doc(firestore, `usuarios/${uid}`);
    const docuCifrada = await getDoc(docuRef);
    if (!docuCifrada.exists()) {
      // Manejar el caso donde el documento no existe
      return null;
    }
    const infoFinal = docuCifrada.data().rol;
    return infoFinal;
  }


  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      {usuario ? <Home user={usuario} /> : <Login />}
    </>
  );
}

export default App;