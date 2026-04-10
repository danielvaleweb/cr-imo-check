import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, getDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface Condo {
  id: string | number;
  name: string;
  bio: string;
  images: string[];
  location?: string;
  portariaType?: 'Remota' | '24h' | 'Não possui';
  gasSupply?: 'encanado' | 'botijão';
  leisure?: string[];
  verticalConveniencies?: string[];
  horizontalConveniencies?: string[];
  image360Url?: string;
  logoUrl?: string;
}

interface CondoContextType {
  condos: Condo[];
  addCondo: (condo: Omit<Condo, 'id'>) => Promise<Condo>;
  updateCondo: (id: string | number, condo: Partial<Condo>) => void;
  removeCondo: (id: string | number) => void;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

const INITIAL_CONDOS: Condo[] = [
  {
    id: 1,
    name: 'Condomínio Quinta do Lago',
    bio: 'Um refúgio de luxo em meio à natureza, com segurança 24h e infraestrutura completa de lazer.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Itaipava, Petrópolis'
  },
  {
    id: 2,
    name: 'Granja Brasil',
    bio: 'O mais completo resort residencial da região, unindo conforto, sofisticação e uma localização privilegiada.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Itaipava, Petrópolis'
  },
  {
    id: 3,
    name: 'Alphaville 2',
    bio: 'O Alphaville 2 oferece uma experiência única de moradia, combinando segurança de ponta, lazer completo e contato direto com a natureza.',
    images: [
      'https://i.imgur.com/Gp90UvK.png',
      'https://i.imgur.com/pe07Ikg.png',
      'https://i.imgur.com/W10YtDm.png'
    ],
    location: 'Juiz de Fora - MG',
    image360Url: 'https://i.imgur.com/Gp90UvK.png',
    logoUrl: 'https://i.imgur.com/tn6v6kz.png'
  }
];

export function CondoProvider({ children }: { children: React.ReactNode }) {
  const [condos, setCondos] = useState<Condo[]>([]);

  useEffect(() => {
    const seedCondos = async () => {
      if (!auth.currentUser) return;

      try {
        // Check if seeding has already been attempted/completed
        const configRef = doc(db, 'system_config', 'initial_seed_condos');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists() && configSnap.data().initial_seed_completed) {
          return; // Already seeded, don't do it again
        }

        const snapshot = await getDocs(collection(db, 'condos'));
        if (snapshot.empty) {
          for (const condo of INITIAL_CONDOS) {
            await setDoc(doc(db, 'condos', condo.id.toString()), condo);
          }
          // Mark seeding as completed
          try {
            await setDoc(configRef, { initial_seed_completed: true });
          } catch (e) {
            console.log("Could not mark condo seed as completed.");
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          console.log("Not authorized to seed condos. Skipping.");
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, 'condos');
      }
    };

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        seedCondos();
      }
    });

    const unsubscribe = onSnapshot(collection(db, 'condos'), (snapshot) => {
      console.log('Condo Snapshot received. Count:', snapshot.size);
      const condosData: Condo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        condosData.push({ ...data, id: isNaN(Number(doc.id)) ? doc.id : Number(doc.id) } as any);
      });
      setCondos(condosData.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : 0;
        const idB = typeof b.id === 'number' ? b.id : 0;
        return idA - idB;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'condos');
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const addCondo = async (newCondo: Omit<Condo, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'condos'), {
        ...newCondo,
        createdAt: new Date().toISOString()
      });
      const condoWithId = { ...newCondo, id: docRef.id };
      return condoWithId as any;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'condos');
      throw error;
    }
  };

  const updateCondo = async (id: string | number, updatedFields: Partial<Condo>) => {
    try {
      await updateDoc(doc(db, 'condos', id.toString()), updatedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'condos');
    }
  };

  const removeCondo = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, 'condos', id.toString()));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'condos');
    }
  };

  return (
    <CondoContext.Provider value={{ condos, addCondo, updateCondo, removeCondo }}>
      {children}
    </CondoContext.Provider>
  );
}

export function useCondos() {
  const context = useContext(CondoContext);
  if (context === undefined) {
    throw new Error('useCondos must be used within a CondoProvider');
  }
  return context;
}
