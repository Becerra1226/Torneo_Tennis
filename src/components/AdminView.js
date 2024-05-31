import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import AdminPanel from '../screens/AdminPanel';
import { getAuth, signOut } from 'firebase/auth';
import firebaseApp from '../firebase/credenciales';
import "../styles/Style.css";
import tenisImage from "../img/tenis.png";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// El componente AdminView que contiene la lógica y la interfaz para administrar los torneos
function AdminView() {
  // Estados para controlar el estado del formulario y los torneos
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

  // Efecto para cargar los torneos al montar el componente
  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        // Obtener la colección de torneos desde Firestore
        const torneosCollection = collection(firestore, 'torneos');
        const torneosSnapshot = await getDocs(torneosCollection);
        // Mapear los documentos a un formato deseado y establecerlos en el estado
        const torneosData = torneosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTorneos(torneosData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los torneos:', error);
      }
    };

    fetchTorneos();
  }, []);

  // Función para manejar la edición de un torneo
  const handleEditarTorneo = (id, torneo) => {
    setEditarTorneoId(id);
    setFormularioEdicion(torneo);
  };

  // Función para guardar los cambios editados en un torneo
  const handleGuardarEdicion = async () => {
    try {
      const torneoDoc = doc(firestore, 'torneos', editarTorneoId);
      await updateDoc(torneoDoc, formularioEdicion);
      // Actualizar la lista de torneos con los cambios guardados
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

  // Función para eliminar un torneo
  const handleEliminarTorneo = async (id) => {
    try {
      const torneoDoc = doc(firestore, 'torneos', id);
      await deleteDoc(torneoDoc);
      // Filtrar los torneos para eliminar el torneo correspondiente y actualizar la lista
      const torneosFiltrados = torneos.filter(torneo => torneo.id !== id);
      setTorneos(torneosFiltrados);
    } catch (error) {
      console.error('Error al eliminar el torneo:', error);
    }
  };

  // Función para manejar los cambios en el formulario de edición
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