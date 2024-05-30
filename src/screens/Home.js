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

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const torneosCollection = collection(firestore, 'torneos');
        const torneosSnapshot = await getDocs(torneosCollection);
        const torneosData = torneosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTorneos(torneosData);
      } catch (error) {
        console.error('Error al obtener los torneos:', error);
      }
    };

    fetchTorneos();
  }, []);
  useEffect(() => {
    const fetchTorneosRegistrados = async () => {
      if (user) {
        const usuarioRef = doc(firestore, 'usuarios', user.uid);
        const usuarioDoc = await getDoc(usuarioRef);
        if (usuarioDoc.exists()) {
          const data = usuarioDoc.data();
          if (data && data.torneosRegistrados) {
            setTorneosRegistrados(data.torneosRegistrados);
          }
        }
      }
    };
  
    fetchTorneosRegistrados();
  }, [user]);
  
  // Función para actualizar los torneos registrados en Firestore
  const updateTorneosRegistradosFirestore = async (torneosRegistrados) => {
    try {
      const usuarioRef = doc(firestore, 'usuarios', user.uid);
      await updateDoc(usuarioRef, {
        torneosRegistrados: torneosRegistrados
      });
    } catch (error) {
      console.error('Error al actualizar torneos registrados en Firestore:', error);
    }
  };
  
  const handleRegistroTorneo = async (torneoId) => {
    if (torneosRegistrados.includes(torneoId)) {
      alert('¡Ya estás registrado en este torneo!');
      return;
    }
  
    // Actualizar localmente
    setTorneosRegistrados(prev => [...prev, torneoId]);
    // Actualizar en Firestore
    await updateTorneosRegistradosFirestore([...torneosRegistrados, torneoId]);
  
  
    const torneoRef = doc(firestore, 'torneos', torneoId);
    await updateDoc(torneoRef, {
      participantesRegistrados: increment(1)
    });
  
    const usuarioRef = doc(firestore, 'usuarios', user.uid);
    await updateDoc(usuarioRef, {
      torneosRegistrados: arrayUnion(torneoId)
    });
  
    alert('¡Te has registrado en el torneo exitosamente!');
  
    setTorneosRegistrados(prev => [...prev, torneoId]);
    setTorneos(prevTorneos =>
      prevTorneos.map(torneo =>
        torneo.id === torneoId ? {...torneo, participantesRegistrados: torneo.participantesRegistrados + 1} : torneo
      )
    );
  };

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