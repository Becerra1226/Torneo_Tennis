// Importar React y el hook useState para gestionar el estado local del componente
import React, { useState } from 'react';
// Importar funciones necesarias de Firestore para interactuar con la base de datos
import { getFirestore, collection, addDoc } from 'firebase/firestore';
// Importar las credenciales de Firebase
import firebaseApp from '../firebase/credenciales';

// Inicializar Firestore con las credenciales de Firebase
const firestore = getFirestore(firebaseApp);

// Definir el componente funcional AdminPanel que permite crear un nuevo torneo
function AdminPanel({ onVolver }) {
  // Estado local para almacenar los datos del nuevo torneo
  const [nuevoTorneo, setNuevoTorneo] = useState({
    nombre: '',
    fechaLimite: '',
    imagenURL: '',
    maxParticipantes: 0,
    participantesRegistrados: 0
  });

  // Función para manejar la creación de un nuevo torneo
  const handleCrearTorneo = async (event) => {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario
    try {
      // Agregar un nuevo documento a la colección 'torneos' en Firestore con los datos del nuevo torneo
      const docRef = await addDoc(collection(firestore, 'torneos'), nuevoTorneo);
      console.log("Torneo creado con ID: ", docRef.id);
      // Limpiar el formulario después de la creación exitosa
      setNuevoTorneo({
        nombre: '',
        fechaLimite: '',
        imagenURL: '',
        maxParticipantes: 0,
        participantesRegistrados: 0
      });
    } catch (error) {
      console.error("Error al crear el torneo: ", error);
    }
  };
  return (
    <div className='crear-torneo'>
      <form onSubmit={handleCrearTorneo}>
      <h3>CREAR TORNEO</h3>
        <label>
          Nombre:
          <input type="text" value={nuevoTorneo.nombre} onChange={(e) => setNuevoTorneo({ ...nuevoTorneo, nombre: e.target.value })} />
        </label>
        <label>
          Fecha límite de inscripción:
          <input type="date" value={nuevoTorneo.fechaLimite} onChange={(e) => setNuevoTorneo({ ...nuevoTorneo, fechaLimite: e.target.value })} />
        </label>
        <label>
          URL de la imagen:
          <input type="text" value={nuevoTorneo.imagenURL} onChange={(e) => setNuevoTorneo({ ...nuevoTorneo, imagenURL: e.target.value })} />
        </label>
        <label>
          Cantidad máxima de participantes:
          <input type="number" value={nuevoTorneo.maxParticipantes} onChange={(e) => setNuevoTorneo({ ...nuevoTorneo, maxParticipantes: parseInt(e.target.value) })} />
        </label>
        <label>
          Participantes registrados:
          <input type="number" value={nuevoTorneo.participantesRegistrados} onChange={(e) => setNuevoTorneo({ ...nuevoTorneo, participantesRegistrados: parseInt(e.target.value) })} />
        </label>
        <button className="boton" type="submit">Crear Torneo</button>
        <button className="boton" onClick={onVolver}>Volver</button>
      </form>
      
    </div>
  );
}

export default AdminPanel;