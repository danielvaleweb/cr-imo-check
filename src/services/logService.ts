import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface SystemLog {
  id?: string;
  type: 'lead' | 'property' | 'broker' | 'agenda' | 'proposal' | 'system' | 'condo' | 'user' | 'finance';
  action: string;
  details: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  createdAt: any;
}

export const addLog = async (
  type: SystemLog['type'],
  action: string,
  details: string,
  customUser?: { id: string; name: string; email: string }
) => {
  try {
    const user = customUser || (auth.currentUser ? {
      id: auth.currentUser.uid,
      name: auth.currentUser.displayName || 'Usuário',
      email: auth.currentUser.email || ''
    } : null);

    const logData: Omit<SystemLog, 'id'> = {
      type,
      action,
      details,
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Visitante',
      userEmail: user?.email || 'N/A',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'system_logs'), logData);
  } catch (error) {
    console.error('Error adding log:', error);
  }
};
