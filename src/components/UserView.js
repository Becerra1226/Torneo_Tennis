import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import firebaseApp from "../firebase/credenciales";
import "../styles/Style.css";
import tenisImage from "../img/tenis.png";

const auth = getAuth(firebaseApp);

function UserView({ torneosIniciales = [], torneosRegistrados = [], onRegistroTorneo }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [registrados, setRegistrados] = useState(torneosRegistrados);
  const [torneos, setTorneos] = useState(torneosIniciales);

  useEffect(() => {
    setTorneos(torneosIniciales);
  }, [torneosIniciales]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleRegistroTorneo = (torneoId) => {
       onRegistroTorneo(torneoId);
    setRegistrados((prevRegistrados) => [...prevRegistrados, torneoId]);
  };

  return (
    <div className="container">
      <div className="navbar">
        <div className="title-and-image">
          <h3>
            <span className="destacado">Tenis Masters</span>
            <img className="simbol" src={tenisImage} alt="Tenis" /> TORNEOS
            DISPONIBLES
          </h3>
        </div>
        <button id="toggleButton" onClick={toggleSidebar}>Torneos Registrados</button>
        <button className="bye" onClick={() => signOut(auth)}>Cerrar sesión</button>
      </div>
      <div className="content">
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <h2>
            Torneos Registrados{" "}
            <button className="boton" onClick={closeSidebar}>
              cerrar
            </button>
          </h2>
          <div className="catalogo-torneos-2">
            {registrados.map((torneoId) => (
              <div className="torneo-item-2" key={torneoId}>
                <div>
                  <strong>Nombre: </strong>
                  {torneos.find((torneo) => torneo.id === torneoId)?.nombre}
                </div>
                <div>
                  <img
                    src={
                      torneos.find((torneo) => torneo.id === torneoId)?.imagenURL
                    }
                    alt="Imagen del torneo"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <strong>Participantes registrados: </strong>
                  {torneos.find((torneo) => torneo.id === torneoId)?.participantesRegistrados}
                </div>
              </div>
            ))}
          </div>
        </div>
        <h3>TORNEOS DISPONIBLES</h3>
        <div className="catalogo-torneos">
          {torneos.map((torneo) => (
            <div
              className={`torneo-item ${
                registrados.includes(torneo.id) ? "registrado" : ""
              }`}
              key={torneo.id}
            >
              <div>
                <strong>Nombre:</strong> {torneo.nombre}
              </div>
              <div>
                <strong>Fecha límite de inscripción:</strong>{" "}
                {torneo.fechaLimite}
              </div>
              <div>
                <img src={torneo.imagenURL} alt="Imagen del torneo" />
              </div>
              <div>
                <strong>Cantidad máxima de participantes:</strong>{" "}
                {torneo.maxParticipantes}
              </div>
              <div>
                <strong>Participantes registrados:</strong>{" "}
                {torneo.participantesRegistrados}
              </div>
              {registrados.includes(torneo.id) ? (
                <div>¡Ya estás registrado en este torneo!</div>
              ) : (
                <button
                  className="boton"
                  onClick={() => handleRegistroTorneo(torneo.id)}
                >
                  Registrarse
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserView;