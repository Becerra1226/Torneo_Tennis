// Importar React y los hooks useEffect y useState para gestionar el estado local del componente
import React, { useEffect, useState } from "react";
// Importar funciones necesarias de Firebase para la autenticación y Firestore
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// Importar las credenciales de Firebase
import firebaseApp from "./firebase/credenciales";
// Importar componentes de Home y Login
import Home from "./screens/Home";
import Login from "./screens/Login";

// Inicializar el servicio de autenticación de Firebase
const auth = getAuth(firebaseApp);
// Inicializar Firestore con las credenciales de Firebase
const firestore = getFirestore(firebaseApp);

// Definir el componente funcional App
function App() {
  // Estado local para almacenar la información del usuario
  const [usuario, setUsuario] = useState(null);
  // Estado local para controlar el estado de carga
  const [loading, setLoading] = useState(true);

  // Efecto para manejar el cambio de estado de autenticación del usuario
  useEffect(() => {
    // Función para suscribirse a los cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        // Obtener el rol del usuario
        const rol = await getRol(usuarioFirebase.uid);
        // Crear objeto de usuario con la información obtenida
        const userData = {
          uid: usuarioFirebase.uid,
          email: usuarioFirebase.email,
          rol: rol,
        };
        // Actualizar el estado del usuario
        setUsuario(userData);
      } else {
        // Si no hay usuario autenticado, establecer usuario a null
        setUsuario(null);
      }
      // Finalizar la carga
      setLoading(false);
    });

    // Devolver una función de limpieza para cancelar la suscripción
    return () => unsubscribe();
  }, []);

  // Función asincrónica para obtener el rol del usuario desde Firestore
  async function getRol(uid) {
    // Obtener referencia al documento de usuario en Firestore
    const docuRef = doc(firestore, `usuarios/${uid}`);
    // Obtener el documento de usuario
    const docuCifrada = await getDoc(docuRef);
    // Verificar si el documento existe
    if (!docuCifrada.exists()) {
      // Manejar el caso donde el documento no existe (no se ha configurado el rol)
      return null;
    }
    // Obtener y devolver el rol del usuario del documento
    const infoFinal = docuCifrada.data().rol;
    return infoFinal;
  }

  // Si aún se está cargando, mostrar un mensaje de carga
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Renderizar el componente Home si hay un usuario autenticado, de lo contrario, renderizar el componente Login
  return (
    <>
      {usuario ? <Home user={usuario} /> : <Login />}
    </>
  );
}

// Exportar el componente App para su uso en otros componentes
export default App;
