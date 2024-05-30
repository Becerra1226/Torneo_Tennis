import React, { useState } from "react";
import firebaseApp from "../firebase/credenciales";
import "../styles/Style.css";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Advertencias from "../components/Advertencias";

const auth = getAuth(firebaseApp);

function Login() {
  const firestore = getFirestore(firebaseApp);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [advertencias, setAdvertencias] = useState({ rolIncorrecto: false, errorCredenciales: false, errorContraseña: false, camposIncompletos: false });
  const [feedback, setFeedback] = useState(""); // Nuevo estado para el feedback

  async function registrarUsuario(email, password, rol) {
    const infoUsuario = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log(infoUsuario.user.uid);
    const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
    setDoc(docuRef, { correo: email, rol: rol });
  }

  async function submitHandler(e) {
    e.preventDefault();

    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const rol = e.target.elements.rol ? e.target.elements.rol.value : null;

    if (!email || !password) { // Verifica si todos los campos están completos
      setFeedback("Por favor, complete todos los campos.");
      return;
    }

    if (rol && !["admin", "user"].includes(rol)) {
      setFeedback("Por favor, seleccione un rol válido.");
      return;
    }

    if (isRegistrando) {
      // registrar
      try {
        await registrarUsuario(email, password, rol);
        setFeedback("Usuario registrado exitosamente.");
      } catch (error) {
        console.error(error);
        setFeedback("Ocurrió un error al registrar el usuario.");
      }
    } else {
      // login
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setFeedback("Inicio de sesión exitoso.");
      } catch (error) {
        console.error(error);
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