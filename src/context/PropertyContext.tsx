import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, getDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { PROPERTIES as initialData } from '../constants/properties';

export interface Property {
  id: string | number;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  parking: number;
  area: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  pdfUrl?: string;
  floorPlanUrl?: string;
  floorPlanUrls?: string[];
  tour360Url?: string;
  category: string;
  categorySlug: string;
  code?: string;
  status?: string;
  description?: string;
  broker?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  additionalInfo?: string;
  rooms?: number;
  motoParking?: number;
  hasGourmetBalcony?: boolean;
  elevators?: number;
  hasLavabo?: boolean;
  hasHeatedPool?: boolean;
  hasSauna?: boolean;
  listingType?: 'venda' | 'aluguel' | 'permuta' | 'lançamento';
  condoId?: string | number;
  condoFee?: string;
  iptu?: string;
  insurance?: string;
  floors?: number;
  units?: number;
  lateralUnits?: number;
  frontUnits?: number;
  backUnits?: number;
  penthouseUnits?: number;
  projectLogoUrl?: string;
  customButtons?: { label: string; url: string }[];
}

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
  removeProperty: (id: string | number) => Promise<void>;
  updateProperty: (id: string | number, property: Partial<Property>) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const seedProperties = async () => {
      if (!auth.currentUser) return;

      try {
        // Check if seeding has already been attempted/completed
        const configRef = doc(db, 'system_config', 'initial_seed');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists() && configSnap.data().initial_seed_completed) {
          return; // Already seeded, don't do it again
        }

        const snapshot = await getDocs(collection(db, 'properties'));
        if (snapshot.empty) {
          for (const property of initialData) {
            await setDoc(doc(db, 'properties', property.id.toString()), property);
          }
          // Mark seeding as completed
          try {
            await setDoc(configRef, { initial_seed_completed: true });
          } catch (e) {
            console.log("Could not mark seed as completed, but properties were seeded.");
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          console.log("Not authorized to seed properties. Skipping.");
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, 'properties');
      }
    };

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        seedProperties();
      }
    });

    const unsubscribe = onSnapshot(collection(db, 'properties'), (snapshot) => {
      console.log('Property Snapshot received. Count:', snapshot.size);
      const propertiesData: Property[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Property document data:', doc.id, data);
        propertiesData.push({ ...data, id: isNaN(Number(doc.id)) ? doc.id : Number(doc.id) } as any);
      });
      console.log('Processed properties:', propertiesData.length);
      setProperties(propertiesData.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : 0;
        const idB = typeof b.id === 'number' ? b.id : 0;
        return idB - idA;
      }));
    }, (error) => {
      console.error('Error fetching properties:', error);
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const addProperty = async (newProp: Omit<Property, 'id'>) => {
    try {
      await addDoc(collection(db, 'properties'), {
        ...newProp,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    }
  };

  const removeProperty = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, 'properties', id.toString()));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'properties');
    }
  };

  const updateProperty = async (id: string | number, updatedFields: Partial<Property>) => {
    try {
      await updateDoc(doc(db, 'properties', id.toString()), updatedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'properties');
    }
  };

  return (
    <PropertyContext.Provider value={{ properties, addProperty, removeProperty, updateProperty }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
