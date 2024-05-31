import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, arrayUnion, increment, updateDoc, getDoc } from 'firebase/firestore'; // Asegúrate de incluir getDoc aquí
import AdminView from '../components/AdminView';
import UserView from '../components/UserView';
import firebaseApp from '../firebase/credenciales';
import { getAuth, signOut } from 'firebase/auth';

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

function Home({ user }) {
  const [torneos, setTorneos] = useState([]);
  const [torneosRegistrados, setTorneosRegistrados] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // Hook useEffect para obtener torneos al cargar el componente por primera vez
  useEffect(() => {
     // Función asincrónica para obtener los torneos
    const fetchTorneos = async () => {
      try {
         // Obtener la colección de torneos desde Firestore
        const torneosCollection = collection(firestore, 'torneos');
        // Obtener los documentos de la colección
        const torneosSnapshot = await getDocs(torneosCollection);
         // Mapear los documentos a un formato legible y establecerlos en el estado local
        const torneosData = torneosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTorneos(torneosData);
      } catch (error) {
        console.error('Error al obtener los torneos:', error);
      }
    };
     // Llamar a la función para obtener los torneos
    fetchTorneos();
  }, []); // Ejecutar solo al montar el componente por primera vez
  useEffect(() => {
    // Hook useEffect para obtener los torneos registrados del usuario
    const fetchTorneosRegistrados = async () => {
      // Verificar si hay un usuario autenticado
      if (user) {
        const usuarioRef = doc(firestore, 'usuarios', user.uid);
        // Obtener el documento del usuario
        const usuarioDoc = await getDoc(usuarioRef);
        // Verificar si el documento del usuario existe
        if (usuarioDoc.exists()) {
          // Obtener los datos del documento del usuario
          const data = usuarioDoc.data();
          // Verificar si hay torneos registrados en los datos del usuario
          if (data && data.torneosRegistrados) {
             // Establecer los torneos registrados en el estado local
            setTorneosRegistrados(data.torneosRegistrados);
          }
        }
      }
    };
     // Llamar a la función para obtener los torneos registrados del usuario
    fetchTorneosRegistrados();
  }, [user]); // Ejecutar cuando cambia el usuario autenticado
  
  // Función para actualizar los torneos registrados en Firestore
  const updateTorneosRegistradosFirestore = async (torneosRegistrados) => {
    try {
      // Obtener la referencia al documento del usuario en Firestore
      const usuarioRef = doc(firestore, 'usuarios', user.uid);
      // Actualizar los torneos registrados del usuario con la nueva lista
      await updateDoc(usuarioRef, {
        torneosRegistrados: torneosRegistrados
      });
    } catch (error) {
      console.error('Error al actualizar torneos registrados en Firestore:', error);
    }
  };
  // Función para manejar el registro del usuario en un torneo
  const handleRegistroTorneo = async (torneoId) => {
    // Verificar si el usuario ya está registrado en el torneo
    if (torneosRegistrados.includes(torneoId)) {
      alert('¡Ya estás registrado en este torneo!');
      return;
    }
  
     // Actualizar localmente la lista de torneos registrados
    setTorneosRegistrados(prev => [...prev, torneoId]);
    // Actualizar en Firestore la lista de torneos registrados del usuario
    await updateTorneosRegistradosFirestore([...torneosRegistrados, torneoId]);
  
    // Incrementar el contador de participantes del torneo en Firestore
    const torneoRef = doc(firestore, 'torneos', torneoId);
    await updateDoc(torneoRef, {
      participantesRegistrados: increment(1)
    });
    // Agregar el torneo a la lista de torneos registrados del usuario en Firestore
    const usuarioRef = doc(firestore, 'usuarios', user.uid);
    await updateDoc(usuarioRef, {
      torneosRegistrados: arrayUnion(torneoId)
    });

     // Mostrar un mensaje de éxito al usuario
    alert('¡Te has registrado en el torneo exitosamente!');
     // Actualizar localmente la lista de torneos y su número de participantes
    setTorneosRegistrados(prev => [...prev, torneoId]);
    setTorneos(prevTorneos =>
      prevTorneos.map(torneo =>
        torneo.id === torneoId ? {...torneo, participantesRegistrados: torneo.participantesRegistrados + 1} : torneo
      )
    );
  };
  // Función para alternar la barra lateral entre abierta y cerrada
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='registrados'>
      <header>
        <button onClick={toggleSidebar}>Torneos Registrados</button>
      </header>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2>Torneos Registrados</h2>
      </div>
      {user.rol === 'admin' ? (
        <AdminView />
      ) : (
        <UserView
          torneosIniciales={torneos}
          torneosRegistrados={torneosRegistrados}
          onRegistroTorneo={handleRegistroTorneo}
        />
      )}
    </div>
  );
}

export default Home;