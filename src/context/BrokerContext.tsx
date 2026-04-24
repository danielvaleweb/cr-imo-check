import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, getDoc, addDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface Broker {
  id: string | number;
  name: string;
  role: string;
  photo: string;
  phone: string;
  email: string;
  bio: string;
  creci?: string;
  instagram?: string;
}

interface BrokerContextType {
  brokers: Broker[];
  addBroker: (broker: Omit<Broker, 'id'>) => void;
  removeBroker: (id: string | number) => void;
  updateBroker: (id: string | number, broker: Partial<Broker>) => void;
}

const BrokerContext = createContext<BrokerContextType | undefined>(undefined);

export const INITIAL_BROKERS: Broker[] = [
  {
    id: 1,
    name: 'Simone Fagundes',
    role: 'Corretora Sênior',
    photo: 'https://i.imgur.com/2vUJ9Au.png',
    phone: '(32) 99999-9999',
    email: 'simone@crimoveis.com.br',
    bio: 'Especialista em imóveis de alto padrão com mais de 10 anos de experiência.',
    creci: '12.345-F',
    instagram: 'simone_corretora'
  },
  {
    id: 2,
    name: 'Daniel Vale',
    role: 'CEO Diretor criativo',
    photo: 'https://i.imgur.com/5l1CO1t.png',
    phone: '(32) 98888-8888',
    email: 'danielvaleweb@gmail.com',
    bio: 'Fundador da CR Imóveis, focado em inovação e atendimento personalizado.',
    creci: '54.321-F',
    instagram: 'daniel_crimoveis'
  }
];

export function BrokerProvider({ children }: { children: React.ReactNode }) {
  const [brokers, setBrokers] = useState<Broker[]>(INITIAL_BROKERS);

  useEffect(() => {
    const seedBrokers = async () => {
      // Only attempt to seed if we have an authenticated user who might be an admin
      if (!auth.currentUser) return;
      
      try {
        // Check if seeding has already been attempted/completed
        const configRef = doc(db, 'system_config', 'initial_seed_brokers');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists() && configSnap.data().initial_seed_completed) {
          return; // Already seeded, don't do it again
        }

        const snapshot = await getDocs(collection(db, 'brokers'));
        if (snapshot.empty) {
          for (const broker of INITIAL_BROKERS) {
            await setDoc(doc(db, 'brokers', broker.id.toString()), broker);
          }
          // Mark seeding as completed
          try {
            await setDoc(configRef, { initial_seed_completed: true });
          } catch (e) {
            console.log("Could not mark broker seed as completed.");
          }
        }
      } catch (error) {
        // If it's a permission error, we just ignore it for seeding
        if (error instanceof Error && error.message.includes('permission')) {
          console.log("Not authorized to seed brokers. Skipping.");
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, 'brokers');
      }
    };

    // Listen for auth state changes to trigger seeding
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        seedBrokers();
      }
    });

    const unsubscribe = onSnapshot(collection(db, 'brokers'), (snapshot) => {
      if (snapshot.empty) {
        setBrokers(INITIAL_BROKERS);
        return;
      }
      const brokersData: Broker[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Clean roles to avoid duplicates and normalize specific formats
        const cleanRole = (roleStr: string) => {
          if (!roleStr) return '';
          // Fix specific legacy format and deduplicate
          const fixedStr = roleStr.replace(/CEO \(Diretor Executivo\)/g, 'CEO Diretor Executivo');
          const rolesList = fixedStr.split(', ').map(r => r.trim());
          return Array.from(new Set(rolesList.filter(Boolean))).join(', ');
        };

        brokersData.push({ 
          ...data, 
          role: cleanRole(data.role),
          id: isNaN(Number(doc.id)) ? doc.id : Number(doc.id) 
        } as any);
      });
      setBrokers(brokersData.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : 0;
        const idB = typeof b.id === 'number' ? b.id : 0;
        return idA - idB;
      }));
    }, (error) => {
      if (error.message?.includes('Quota exceeded')) {
        console.warn('Firestore Quota exceeded for brokers. Falling back to initial data.');
        setBrokers(INITIAL_BROKERS);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'brokers');
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const addBroker = async (newBroker: Omit<Broker, 'id'>) => {
    try {
      // Check if broker already exists by email to prevent duplicates
      if (newBroker.email) {
        const brokersRef = collection(db, 'brokers');
        const q = query(brokersRef, where('email', '==', newBroker.email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          console.log('Broker with this email already exists, skipping creation.');
          return;
        }
      }

      await addDoc(collection(db, 'brokers'), {
        ...newBroker,
        email: newBroker.email?.toLowerCase(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.warn('Broker already exists (collision in addDoc or rule restriction).');
        return;
      }
      handleFirestoreError(error, OperationType.CREATE, 'brokers');
    }
  };

  const removeBroker = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, 'brokers', id.toString()));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'brokers');
    }
  };

  const updateBroker = async (id: string | number, updatedFields: Partial<Broker>) => {
    try {
      await updateDoc(doc(db, 'brokers', id.toString()), updatedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'brokers');
    }
  };

  return (
    <BrokerContext.Provider value={{ brokers, addBroker, removeBroker, updateBroker }}>
      {children}
    </BrokerContext.Provider>
  );
}

export function useBrokers() {
  const context = useContext(BrokerContext);
  if (context === undefined) {
    throw new Error('useBrokers must be used within a BrokerProvider');
  }
  return context;
}
