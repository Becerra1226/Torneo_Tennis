import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import AdminPanel from '../screens/AdminPanel';
import { getAuth, signOut } from 'firebase/auth';
import firebaseApp from '../firebase/credenciales';
import "../styles/Style.css";
import tenisImage from "../img/tenis.png";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function AdminView() {
  const [mostrarFormularioCrear, setMostrarFormularioCrear] = useState(false);
  const [editarTorneoId, setEditarTorneoId] = useState(null);
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formularioEdicion, setFormularioEdicion] = useState({
    nombre: '',
    fechaLimite: '',
    imagenURL: '',
    maxParticipantes: 0,
    participantesRegistrados: 0
  });

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const torneosCollection = collection(firestore, 'torneos');
        const torneosSnapshot = await getDocs(torneosCollection);
        const torneosData = torneosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTorneos(torneosData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los torneos:', error);
      }
    };

    fetchTorneos();
  }, []);

  const handleEditarTorneo = (id, torneo) => {
    setEditarTorneoId(id);
    setFormularioEdicion(torneo);
  };

  const handleGuardarEdicion = async () => {
    try {
      const torneoDoc = doc(firestore, 'torneos', editarTorneoId);
      await updateDoc(torneoDoc, formularioEdicion);
      const torneosActualizados = torneos.map(torneo => {
        if (torneo.id === editarTorneoId) {
          return { ...torneo, ...formularioEdicion };
        }
        return torneo;
      });
      setTorneos(torneosActualizados);
      setEditarTorneoId(null);
    } catch (error) {
      console.error('Error al editar el torneo:', error);
    }
  };

  const handleEliminarTorneo = async (id) => {
    try {
      const torneoDoc = doc(firestore, 'torneos', id);
      await deleteDoc(torneoDoc);
      const torneosFiltrados = torneos.filter(torneo => torneo.id !== id);
      setTorneos(torneosFiltrados);
    } catch (error) {
      console.error('Error al eliminar el torneo:', error);
    }
  };

  const handleFormularioEdicionChange = (e) => {
    const { name, value } = e.target;
    setFormularioEdicion(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="container">
      <div className="navbar">
        <div className="title-and-image">
          <h3>
            <span className="destacado">Tenis Masters</span>
            <img className="simbol" src={tenisImage} alt="Tenis" /> TORNEOS
            CREADOS
          </h3>
        </div>
        <button  onClick={() => setMostrarFormularioCrear(true)}>Crear Torneo</button>
        <button className="bye" onClick={() => signOut(auth)}>Cerrar sesión</button>
      </div>

      <div className="main-content">
        {mostrarFormularioCrear ? (
          <AdminPanel onVolver={() => setMostrarFormularioCrear(false)} />
        ) : (
          <div>
            <h3>TORNEOS CREADOS</h3>
            <div className="catalogo-torneos">
              {loading ? (
                <div>Cargando...</div>
              ) : (
                torneos.map(torneo => (
                  <div className="torneo-item" key={torneo.id}>
                    {editarTorneoId === torneo.id ? (
                      <div>
                        <input type="text" name="nombre" value={formularioEdicion.nombre} onChange={handleFormularioEdicionChange} />
                        <input type="date" name="fechaLimite" value={formularioEdicion.fechaLimite} onChange={handleFormularioEdicionChange} />
                        <input type="text" name="imagenURL" value={formularioEdicion.imagenURL} onChange={handleFormularioEdicionChange} />
                        <input type="number" name="maxParticipantes" value={formularioEdicion.maxParticipantes} onChange={handleFormularioEdicionChange} />
                        <input type="number" name="participantesRegistrados" value={formularioEdicion.participantesRegistrados} onChange={handleFormularioEdicionChange} />
                        <button className="boton" onClick={handleGuardarEdicion}>Guardar</button>
                      </div>
                    ) : (
                      <div>
                        <div><strong>Nombre:</strong> {torneo.nombre}</div>
                        <div><strong>Fecha límite de inscripción:</strong> {torneo.fechaLimite}</div>
                        <img src={torneo.imagenURL} alt="Imagen del torneo" />
                        <div><strong>Cantidad máxima de participantes:</strong> {torneo.maxParticipantes}</div>
                        <div><strong>Participantes registrados:</strong> {torneo.participantesRegistrados}</div>
                        <button className="boton" onClick={() => handleEditarTorneo(torneo.id, torneo)}>Editar</button>
                        <button className="boton" onClick={() => handleEliminarTorneo(torneo.id)}>Eliminar</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminView;