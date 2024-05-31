import React, { useState } from "react";
import firebaseApp from "../firebase/credenciales";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
// Importar el componente Advertencias
import Advertencias from "../components/Advertencias";
// Inicializar la autenticación con Firebase
const auth = getAuth(firebaseApp);

// Definir el componente funcional Login
function Login() {
  // Inicializar Firestore con las credenciales de Firebase
  const firestore = getFirestore(firebaseApp);
  // Estado local para controlar si el usuario está registrando o iniciando sesión
  const [isRegistrando, setIsRegistrando] = useState(false);
  // Estado local para manejar las advertencias mostradas al usuario
  const [advertencias, setAdvertencias] = useState({
    rolIncorrecto: false,
    errorCredenciales: false,
    errorContraseña: false,
    camposIncompletos: false,
  });
  // Nuevo estado para el feedback
  const [feedback, setFeedback] = useState("");

  // Función asincrónica para registrar un nuevo usuario en Firebase Authentication y Firestore
  async function registrarUsuario(email, password, rol) {
    try {
      // Crear un nuevo usuario con correo electrónico y contraseña
      const infoUsuario = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Obtener la referencia al documento del usuario en Firestore y establecer sus datos
      const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
      await setDoc(docuRef, { correo: email, rol: rol });
    } catch (error) {
      console.error(error);
      // Manejar errores durante el registro
      setFeedback("Ocurrió un error al registrar el usuario.");
    }
  }

  // Función asincrónica para manejar el envío del formulario de inicio de sesión o registro
  async function submitHandler(e) {
    e.preventDefault();

    // Obtener los valores de los campos del formulario
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const rol = e.target.elements.rol ? e.target.elements.rol.value : null;

    // Verificar si todos los campos están completos
    if (!email || !password) {
      setFeedback("Por favor, complete todos los campos.");
      return;
    }

    // Verificar si se seleccionó un rol válido en el caso de registro
    if (rol && !["admin", "user"].includes(rol)) {
      setFeedback("Por favor, seleccione un rol válido.");
      return;
    }

    if (isRegistrando) {
      // Realizar el registro
      await registrarUsuario(email, password, rol);
    } else {
      // Realizar el inicio de sesión
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setFeedback("Inicio de sesión exitoso.");
      } catch (error) {
        console.error(error);
        // Manejar errores durante el inicio de sesión
        if (error.code === "auth/wrong-password") {
          setFeedback("La contraseña es incorrecta.");
        } else if (error.code === "auth/user-not-found") {
          setFeedback("El usuario no existe.");
        } else {
          setFeedback("Rectifica los datos, correo o contraseña.");
        }
      }
    }
  }
  return (
    <div className="prime">
      <h1>{isRegistrando ? <div className='texto-arriba'>
                <span className="destacado">Tenis Masters</span> 
                <br/>  Registrate en Tenis Masters <br/></div>: <div className='texto-arriba'>
                <span className="destacado">Tenis Masters</span> 
                
                <br/> Inicia sesion en Tenis Masters </div>}</h1>

      {feedback && <p>{feedback}</p>} {/* Mostrar feedback si está definido */}

      <Advertencias {...advertencias} />

      <form onSubmit={submitHandler}>
        <label className="email">
         <h2 className="texto">Correo electrónico:</h2> 
          <input type="email" id="email" />
        </label>

        <label className="password">
        <h2 className="texto">Contraseña:</h2>
          <input type="password" id="password" />
        </label>

        {isRegistrando && (
          <label className="rol">
            <h2 className="texto">Rol:</h2>
            <select id="rol"> 
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
          </label>
        )}

        <input className="boton-enviar"
          type="submit"
          value={isRegistrando ? "Registrar" : "Iniciar sesión"}
        />
      </form>

      <button className="boton" onClick={() => setIsRegistrando(!isRegistrando)}>
        {isRegistrando ? "Ya tengo una cuenta" : "Quiero registrarme"}
      </button>
    </div>
  );
}

export default Login;