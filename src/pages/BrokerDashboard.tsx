import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { formatPhone } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { useBrokers } from '../context/BrokerContext';
import { useCondos } from '../context/CondoContext';
import { ROLE_GROUPS } from '../constants/roles';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  addDoc,
  getDocs,
  where,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { addLog } from '../services/logService';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Home, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
  GripVertical,
  X,
  ShieldCheck,
  FileText,
  Save,
  Trash2,
  Edit,
  Check,
  ExternalLink,
  MessageCircle,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  User,
  Phone,
  Info,
  Mail,
  Image as ImageIcon,
  Video,
  Trash,
  Play,
  Rocket,
  Map as MapIcon,
  Link,
  Instagram,
  ArrowLeft,
  Lock,
  LogIn,
  KeyRound,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Removendo dados simulados para usar dados reais do banco
const COLORS = ['#617964', '#374001', '#B8860B', '#D2B48C'];

const LEISURE_OPTIONS = [
  'Campo de futebol', 'Churrasqueira', 'Espaço Fitness', 'Espaço Gourmet', 
  'Espaço Kid’s', 'Piscina fria', 'Piscina infantil', 'Pista de caminhada', 
  'Playground', 'Praça temática', 'Quadra de Tênis', 'Quadra de beach tênis', 
  'Quadra poliesportiva', 'Salão de Festas'
];

const VERTICAL_CONVENIENCES = [
  'Fácil acesso a transporte público', 'Mercado de conveniências interno', 
  'Perto de vias de acesso', 'Sistema de câmeras'
];

const HORIZONTAL_CONVENIENCES = [
  'Ronda motorizada', 'Transporte interno para moradores'
];

import { AgendaTab } from '../components/AgendaTab';

export default function BrokerDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, addProperty, removeProperty, updateProperty } = useProperties();
  const { brokers, addBroker, removeBroker, updateBroker } = useBrokers();
  const { condos, addCondo, updateCondo, removeCondo } = useCondos();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [proposals, setProposals] = useState<any[]>([]);

  const dashboardStats = useMemo(() => {
    const totalProperties = properties.length;
    
    // Calculate total value (parsing "R$ 1.234.567" format)
    const totalValue = properties.reduce((acc, prop) => {
      const numericValue = parseInt(prop.price.replace(/\D/g, '')) || 0;
      return acc + numericValue;
    }, 0);

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 1,
      notation: 'compact'
    }).format(totalValue);

    // Group by category for the Pie Chart
    const categoryCounts: Record<string, number> = {};
    properties.forEach(prop => {
      const cat = prop.category.split(', ')[0] || 'Outros';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const pieData = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / (totalProperties || 1)) * 100)
    })).sort((a, b) => b.value - a.value).slice(0, 4);

    // Generate sales data for the chart based on proposals
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIdx]);
    }

    const chartData = last6Months.map(month => {
      const monthProposals = proposals.filter(p => {
        const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return months[date.getMonth()] === month;
      });
      return {
        name: month,
        leads: monthProposals.length,
        sales: monthProposals.filter(p => p.status === 'accepted').length * 1000 // Multiplier for visual effect in chart
      };
    });

    return {
      totalProperties,
      totalValue: formattedValue,
      pieData,
      chartData
    };
  }, [properties, proposals]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | number | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedChatBroker, setSelectedChatBroker] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const chatScrollRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'pending' | 'rejected' | 'approved' | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    creci: '',
    confirmPassword: ''
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agendaEvents, setAgendaEvents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'agenda_events'), orderBy('horario', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgendaEvents(data);
    }, (error) => {
      console.warn("Agenda read error in Dashboard:", error);
    });
    return () => unsubscribe();
  }, []);

  const todaysTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return agendaEvents.filter(event => event.data === today);
  }, [agendaEvents]);

  const handleToggleTask = async (id: string, currentDone: boolean) => {
    try {
      await updateDoc(doc(db, 'agenda_events', id), {
        done: !currentDone,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [usersToApprove, setUsersToApprove] = useState<any[]>([]);
  const userDropdownRef = React.useRef<HTMLDivElement>(null);

  const [sidebarItems, setSidebarItems] = useState([
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'properties', label: 'Todos Imóveis', icon: Home },
    { id: 'proposals', label: 'Propostas', icon: FileText },
    { id: 'condos', label: 'Condomínios', icon: ShieldCheck },
    { id: 'brokers', label: 'Corretores', icon: Users },
    { id: 'leads', label: 'Captações', icon: Users },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: TrendingUp },
    { id: 'users_approval', label: 'Aprovar login', icon: Users, adminOnly: true },
  ]);

  const [hasLoadedOrder, setHasLoadedOrder] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem('sidebar_order');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        setSidebarItems(prev => {
          const orderedItems = [...prev].sort((a, b) => {
            const idxA = orderIds.indexOf(a.id);
            const idxB = orderIds.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
          return orderedItems;
        });
      } catch (e) {
        console.error("Failed to parse sidebar order", e);
      }
    }
    setHasLoadedOrder(true);
  }, []);

  useEffect(() => {
    if (hasLoadedOrder) {
      localStorage.setItem('sidebar_order', JSON.stringify(sidebarItems.map(i => i.id)));
    }
  }, [sidebarItems, hasLoadedOrder]);

  const visibleSidebarItems = useMemo(() => {
    return sidebarItems.filter(item => {
      if (!item.adminOnly) return true;
      const isExplicitAdmin = auth.currentUser?.email?.toLowerCase() === 'danielvaleweb@gmail.com' || auth.currentUser?.uid === 'xgp4kEuc66UbGXIMcBVAa4fykus2';
      return isAdmin || isExplicitAdmin;
    });
  }, [sidebarItems, isAdmin]);

  const handleReorder = (newOrder: any[]) => {
    // Create a new master list that preserves the order of non-visible items 
    // but updates the order of visible ones based on the new drag result.
    const newSidebarItems = [...sidebarItems];
    
    // We want the new master list to have the items in 'newOrder' placed at the indices 
    // where visible items were previously located.
    let visibleIdx = 0;
    const itemsToSet = sidebarItems.map(item => {
      if (visibleSidebarItems.find(v => v.id === item.id)) {
        return newOrder[visibleIdx++];
      }
      return item;
    });

    setSidebarItems(itemsToSet);
  };

  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'system_logs'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSystemLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isMessagesOpen && selectedChatBroker && auth.currentUser) {
      const myId = auth.currentUser.uid;
      const otherId = selectedChatBroker.id.toString();
      
      const q = query(
        collection(db, 'mensagens'),
        where('room', 'in', [
          `${myId}_${otherId}`,
          `${otherId}_${myId}`
        ]),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 100);
      });
      return () => unsubscribe();
    }
  }, [isMessagesOpen, selectedChatBroker]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !selectedChatBroker || !auth.currentUser) return;

    try {
      const text = newMessageText;
      const myId = auth.currentUser.uid;
      const otherId = selectedChatBroker.id.toString();
      
      setNewMessageText('');
      await addDoc(collection(db, 'mensagens'), {
        from: myId,
        to: otherId,
        room: `${myId}_${otherId}`,
        text,
        createdAt: serverTimestamp(),
        senderName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuário'
      });
      
      await addDoc(collection(db, 'notificacoes'), {
        userId: otherId,
        title: 'Nova Mensagem',
        message: `${auth.currentUser.displayName || 'Alguém'} enviou uma mensagem para você.`,
        type: 'message',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Search Logic moved here
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const queryStr = searchQuery.toLowerCase();
    const results = [
      ...properties.filter(p => p.title.toLowerCase().includes(queryStr) || p.location.toLowerCase().includes(queryStr)).map(p => ({ ...p, type: 'Imóvel' })),
      ...leads.filter(l => l.name?.toLowerCase().includes(queryStr) || l.email?.toLowerCase().includes(queryStr)).map(l => ({ ...l, type: 'Lead', title: l.name })),
      ...brokers.filter(b => b.name?.toLowerCase().includes(queryStr)).map(b => ({ ...b, type: 'Corretor', title: b.name }))
    ].slice(0, 5);
    setSearchResults(results);
  }, [searchQuery, properties, leads, brokers]);

  // Tasks of the day
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'agenda_events'),
      where('type', '==', 'tarefa'),
      where('data', '==', todayStr)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0];
      setTodayTasks(data.filter((t: any) => 
        t.envolveQuem?.includes(userName)
      ));
    });
    return () => unsubscribe();
  }, []);

  // Notifications filtering
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'notificacoes'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFilteredNotifications(data.filter((n: any) => 
        n.type === 'tarefa' || n.type === 'commitment' || n.type === 'lead' || n.type === 'system'
      ));
    }, (error) => {
      console.warn("Notifications read error:", error);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const [customOptions, setCustomOptions] = useState<{
    leisure: { id: string; label: string }[];
    verticalConveniencies: { id: string; label: string }[];
    horizontalConveniencies: { id: string; label: string }[];
  }>({
    leisure: [],
    verticalConveniencies: [],
    horizontalConveniencies: [],
  });

  useEffect(() => {
    if (isLoading || !isAdmin) return;

    const q = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const proposalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProposals(proposalsData);
    }, (error) => {
      // Graceful error for admin during pathing/syncing
      if (error.message.includes('permission')) {
        console.warn('Proposals permission sync in progress...');
      } else {
        handleFirestoreError(error, OperationType.LIST, 'proposals');
      }
    });
    return () => unsubscribe();
  }, [isLoading, isAdmin]);

  useEffect(() => {
    if (isLoading || !isAdmin) return;
    
    const leadsCollection = collection(db, 'property_leads');
    const q = query(leadsCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
    }, (error) => {
      // Graceful handling for admin leads sync
      if (error.message.includes('permission')) {
        console.warn('Leads permission sync in progress (Admin):', error);
      } else {
        console.error('Error fetching leads snapshot:', error);
        handleFirestoreError(error, OperationType.LIST, 'property_leads');
      }
    });

    return () => unsubscribe();
  }, [isLoading, isAdmin]);

  useEffect(() => {
    const currentEmail = auth.currentUser?.email?.toLowerCase();
    const currentUid = auth.currentUser?.uid;
    const isExplicitAdmin = currentEmail === 'danielvaleweb@gmail.com' || currentUid === 'xgp4kEuc66UbGXIMcBVAa4fykus2';

    // Se não for admin (pelo estado ou explicitamente), não ouvimos os usuários
    if (!isAdmin && !isExplicitAdmin) {
      console.log('Dashboard Sync: User is not admin, skipping users listener.', { isAdmin, isExplicitAdmin, email: currentEmail });
      return;
    }

    const usersCollection = collection(db, 'users');
    console.log('Dashboard: Starting users sync for admin...', { 
      databaseId: db.app.options.projectId,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    });

    let unsubscribe: () => void;
    
    try {
      unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        console.log(`Dashboard: Sync received ${snapshot.docs.length} users.`);
        
        const adminEmail = 'danielvaleweb@gmail.com';
        const usersData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter((u: any) => {
            const userEmail = u.email?.toLowerCase();
            const userUid = u.id;
            return userEmail !== adminEmail && userUid !== 'xgp4kEuc66UbGXIMcBVAa4fykus2';
          })
          .sort((a: any, b: any) => {
            const getTime = (val: any) => {
              if (!val) return 0;
              if (typeof val === 'string') return new Date(val).getTime();
              if (val.toDate) return val.toDate().getTime();
              if (val.seconds) return val.seconds * 1000;
              return 0;
            };
            return getTime(b.createdAt) - getTime(a.createdAt);
          });
        
        setUsersToApprove(usersData);
      }, (error) => {
        if (error.message.includes('permission')) {
          console.warn('Dashboard Sync: Acesso negado pelo Firebase devido a regras restritas congeladas. Os usuários devem ser aprovados no Console.');
        } else {
          console.error('Dashboard Sync Error Callback:', error);
        }
      });
    } catch (err) {
      console.error('Dashboard Snapshot setup error:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdmin, auth.currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const unsubscribe = onSnapshot(collection(db, 'condo_options'), (snapshot) => {
      const options = {
        leisure: [] as { id: string; label: string }[],
        verticalConveniencies: [] as { id: string; label: string }[],
        horizontalConveniencies: [] as { id: string; label: string }[],
      };
      snapshot.forEach(doc => {
        const data = doc.data();
        const option = { id: doc.id, label: data.label };
        if (data.type === 'leisure') options.leisure.push(option);
        if (data.type === 'verticalConveniencies') options.verticalConveniencies.push(option);
        if (data.type === 'horizontalConveniencies') options.horizontalConveniencies.push(option);
      });
      setCustomOptions(options);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'condo_options');
    });
    return () => unsubscribe();
  }, [isLoading]);

  useEffect(() => {
    console.log('Dashboard: Auth listener starting...');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Dashboard: Auth state changed:', currentUser?.email);
      setUser(currentUser);
      
      if (!currentUser) {
        setIsAdmin(false);
        setAuthStatus(null);
        setIsLoading(false);
      } else {
        const adminEmail = 'danielvaleweb@gmail.com';
        const isDaniel = currentUser.email?.toLowerCase() === adminEmail.toLowerCase();
        const isUidAdmin = currentUser.uid === 'xgp4kEuc66UbGXIMcBVAa4fykus2';
        
        if (isDaniel || isUidAdmin) {
          setIsAdmin(true);
          setAuthStatus('approved');
          setIsLoading(false);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAuthStatus(userData.status);
            if (userData.role === 'admin') setIsAdmin(true);
          } else {
            if (!isDaniel && !isUidAdmin) {
              await signOut(auth);
              setAuthStatus(null);
              setLoginError('Este e-mail não está cadastrado como corretor. Por favor, use a opção de se associar.');
            }
          }
        } catch (error) {
          console.error("Dashboard auth check error:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Broker Management
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditingBroker, setIsEditingBroker] = useState(false);
  const [editingBrokerId, setEditingBrokerId] = useState<string | number | null>(null);

  const [newBrokerData, setNewBrokerData] = useState({
    name: '',
    role: '',
    photo: '',
    phone: '',
    email: '',
    bio: '',
    creci: '',
    instagram: ''
  });

  const currentBroker = useMemo(() => {
    if (!user) return null;
    return brokers.find(b => b.email?.toLowerCase() === user.email?.toLowerCase());
  }, [brokers, user]);

  const handleEditBroker = (broker: any) => {
    setNewBrokerData({ ...broker });
    setEditingBrokerId(broker.id);
    setIsEditingBroker(true);
    setIsBrokerModalOpen(true);
  };

  const handleSaveBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingBroker && editingBrokerId !== null) {
        await updateBroker(editingBrokerId, newBrokerData);
        await addLog('broker', 'Editou corretor', `Corretor: ${newBrokerData.name}`);
      } else {
        await addBroker(newBrokerData);
        await addLog('broker', 'Cadastrou corretor', `Corretor: ${newBrokerData.name}`);
      }
      setIsBrokerModalOpen(false);
      setIsEditingBroker(false);
      setEditingBrokerId(null);
      setNewBrokerData({ name: '', role: '', photo: '', phone: '', email: '', bio: '', creci: '', instagram: '' });
    } catch (error: any) {
      console.error("Error saving broker:", error);
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleDeleteBroker = (id: string | number) => {
    setBrokerToDelete(id);
  };

  const confirmDeleteBroker = async () => {
    if (brokerToDelete !== null) {
      try {
        const broker = brokers.find(b => b.id === brokerToDelete);
        await removeBroker(brokerToDelete);
        await addLog('broker', 'Excluiu corretor', `Corretor: ${broker?.name || brokerToDelete}`);
        setBrokerToDelete(null);
      } catch (error) {
        console.error('Error deleting broker:', error);
      }
    }
  };
  const [propertyToDelete, setPropertyToDelete] = useState<string | number | null>(null);
  const [condoToDelete, setCondoToDelete] = useState<string | number | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [usersToClearStatus, setUsersToClearStatus] = useState<'pending' | 'rejected' | null>(null);
  const [brokerToDelete, setBrokerToDelete] = useState<string | number | null>(null);
  const [newPropertyData, setNewPropertyData] = useState({
    title: '',
    location: '',
    price: '',
    beds: 0,
    baths: 0,
    parking: 0,
    area: '',
    description: '',
    broker: 'Daniel CEO',
    category: `${CATEGORIES[0].label1} ${CATEGORIES[0].label2}`,
    categorySlug: CATEGORIES[0].slug,
    ownerName: '',
    ownerPhone: '',
    ownerAddress: '',
    additionalInfo: '',
    image: 'https://i.imgur.com/pe07Ikg.png',
    images: [''],
    videoUrl: '',
    pdfUrl: '',
    floorPlanUrl: '',
    floorPlanUrls: [''],
    tour360Url: '',
    status: 'Ativo',
    rooms: 0,
    motoParking: 0,
    hasGourmetBalcony: false,
    elevators: 0,
    hasLavabo: false,
    hasHeatedPool: false,
    hasSauna: false,
    code: '',
    listingType: 'venda' as 'venda' | 'aluguel' | 'permuta' | 'lançamento',
    condoId: 0 as string | number,
    condoFee: '',
    iptu: '',
    insurance: '',
    floors: 0,
    units: 0,
    lateralUnits: 0,
    frontUnits: 0,
    backUnits: 0,
    penthouseUnits: 0,
    projectLogoUrl: '',
    customButtons: [] as { label: string; url: string }[]
  });

  const [isCondoModalOpen, setIsCondoModalOpen] = useState(false);
  const [isEditingCondo, setIsEditingCondo] = useState(false);
  const [editingCondoId, setEditingCondoId] = useState<string | number | null>(null);
  const [newCondoData, setNewCondoData] = useState({
    name: '',
    location: '',
    portariaType: 'Não possui' as 'Remota' | '24h' | 'Não possui',
    gasSupply: 'botijão' as 'encanado' | 'botijão',
    leisure: [] as string[],
    verticalConveniencies: [] as string[],
    horizontalConveniencies: [] as string[],
    bio: '',
    image360Url: '',
    logoUrl: '',
    images: ['']
  });

  const generateUniqueCode = () => {
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    
    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Check if code already exists
      const exists = properties.some(p => p.code === code);
      if (!exists) isUnique = true;
    }
    return code;
  };

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return '';
    const amount = parseInt(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handlePriceChange = (value: string, type?: 'venda' | 'aluguel' | 'permuta' | 'lançamento') => {
    const currentType = type || newPropertyData.listingType;
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      setNewPropertyData({ ...newPropertyData, price: '', listingType: currentType });
      return;
    }
    const amount = parseInt(cleanValue) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    const suffix = currentType === 'aluguel' ? ' / mês' : (currentType === 'permuta' ? ' (Permuta)' : '');
    setNewPropertyData({ 
      ...newPropertyData, 
      price: `${formatted}${suffix}`,
      listingType: currentType
    });
  };

  const handleAreaChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setNewPropertyData({
      ...newPropertyData,
      area: cleanValue ? `${cleanValue}m²` : ''
    });
  };

  const handleAddImageField = () => {
    if (newPropertyData.images.length < 20) {
      setNewPropertyData({
        ...newPropertyData,
        images: [...newPropertyData.images, '']
      });
    }
  };

  const handleRemoveImageField = (index: number) => {
    const updatedImages = newPropertyData.images.filter((_, i) => i !== index);
    setNewPropertyData({
      ...newPropertyData,
      images: updatedImages.length > 0 ? updatedImages : ['']
    });
  };

  const handleAddFloorPlanField = () => {
    if ((newPropertyData.floorPlanUrls || []).length < 10) {
      setNewPropertyData({
        ...newPropertyData,
        floorPlanUrls: [...(newPropertyData.floorPlanUrls || []), '']
      });
    }
  };

  const handleRemoveFloorPlanField = (index: number) => {
    const updated = (newPropertyData.floorPlanUrls || []).filter((_, i) => i !== index);
    setNewPropertyData({
      ...newPropertyData,
      floorPlanUrls: updated.length > 0 ? updated : ['']
    });
  };

  const handleFloorPlanChange = (index: number, value: string) => {
    const updated = [...(newPropertyData.floorPlanUrls || [])];
    updated[index] = value;
    setNewPropertyData({
      ...newPropertyData,
      floorPlanUrls: updated,
      floorPlanUrl: updated[0] // Keep legacy field in sync
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...newPropertyData.images];
    updatedImages[index] = value;
    setNewPropertyData({
      ...newPropertyData,
      images: updatedImages
    });
  };

  // Custom Buttons for Property
  const [customButtonLabel, setCustomButtonLabel] = useState('');
  const [customButtonUrl, setCustomButtonUrl] = useState('');

  const handleAddCustomButton = () => {
    if (customButtonLabel && customButtonUrl) {
      setNewPropertyData({
        ...newPropertyData,
        customButtons: [...(newPropertyData.customButtons || []), { label: customButtonLabel, url: customButtonUrl }]
      });
      setCustomButtonLabel('');
      setCustomButtonUrl('');
    }
  };

  const handleRemoveCustomButton = (index: number) => {
    const updated = (newPropertyData.customButtons || []).filter((_, i) => i !== index);
    setNewPropertyData({ ...newPropertyData, customButtons: updated });
  };

  // Custom Items for Condo
  const [customLeisure, setCustomLeisure] = useState('');
  const [customVertical, setCustomVertical] = useState('');
  const [customHorizontal, setCustomHorizontal] = useState('');

  useEffect(() => {
    if (user) {
      console.log('BrokerDashboard: Auth State', {
        uid: user.uid,
        email: user.email,
        isAdmin: isAdmin,
        isLoading: isLoading
      });
    }
  }, [user, isAdmin, isLoading]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>;
  }

  const handleAddCustomCondoItem = async (type: 'leisure' | 'verticalConveniencies' | 'horizontalConveniencies', value: string) => {
    if (value) {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      // Check if it already exists in defaults or custom
      const isDefault = (type === 'leisure' ? LEISURE_OPTIONS : 
                        type === 'verticalConveniencies' ? VERTICAL_CONVENIENCES : 
                        HORIZONTAL_CONVENIENCES).includes(trimmedValue);
      const isCustom = customOptions[type].some(opt => opt.label === trimmedValue);

      if (!isDefault && !isCustom) {
        try {
          await addDoc(collection(db, 'condo_options'), {
            type,
            label: trimmedValue,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'condo_options');
        }
      }

      // Still add to current condo data if not already there
      if (!newCondoData[type].includes(trimmedValue)) {
        setNewCondoData({
          ...newCondoData,
          [type]: [...newCondoData[type], trimmedValue]
        });
      }
      
      if (type === 'leisure') setCustomLeisure('');
      if (type === 'verticalConveniencies') setCustomVertical('');
      if (type === 'horizontalConveniencies') setCustomHorizontal('');
    }
  };

  const handleDeleteCustomOption = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'condo_options', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `condo_options/${id}`);
    }
  };

  const handleDeleteProperty = (id: string | number) => {
    setPropertyToDelete(id);
  };

  const confirmDelete = async () => {
    if (propertyToDelete !== null) {
      const prop = properties.find(p => p.id === propertyToDelete);
      await removeProperty(propertyToDelete);
      await addLog('property', 'Excluiu imóvel', `Imóvel: ${prop?.title || propertyToDelete} (Cód: ${prop?.code})`);
      setPropertyToDelete(null);
    }
  };

  const handleAddProperty = () => {
    setIsEditing(false);
    setEditingPropertyId(null);
    setCurrentStep(1);
    setNewPropertyData({
      title: '',
      location: '',
      price: '',
      beds: 0,
      baths: 0,
      parking: 0,
      area: '',
      description: '',
      broker: 'Daniel Vale',
      category: `${CATEGORIES[0].label1} ${CATEGORIES[0].label2}`,
      categorySlug: CATEGORIES[0].slug,
      ownerName: '',
      ownerPhone: '',
      ownerAddress: '',
      additionalInfo: '',
      image: 'https://i.imgur.com/pe07Ikg.png',
      images: [''],
      videoUrl: '',
      pdfUrl: '',
      floorPlanUrl: '',
      floorPlanUrls: [''],
      tour360Url: '',
      status: 'Ativo',
      rooms: 0,
      motoParking: 0,
      hasGourmetBalcony: false,
      elevators: 0,
      hasLavabo: false,
      hasHeatedPool: false,
      hasSauna: false,
      code: generateUniqueCode(),
      listingType: 'venda',
      condoId: 0,
      condoFee: '',
      iptu: '',
      insurance: '',
      floors: 0,
      units: 0,
      lateralUnits: 0,
      frontUnits: 0,
      backUnits: 0,
      penthouseUnits: 0,
      projectLogoUrl: '',
      customButtons: []
    });
    setIsAddModalOpen(true);
  };

  const handleEditProperty = (property: any) => {
    setIsEditing(true);
    setEditingPropertyId(property.id);
    setCurrentStep(1);
    setNewPropertyData({
      title: property.title,
      location: property.location,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      parking: property.parking,
      area: property.area,
      description: property.description || '',
      broker: property.broker || 'Daniel Vale',
      category: property.category,
      categorySlug: property.categorySlug,
      ownerName: property.ownerName || '',
      ownerPhone: property.ownerPhone || '',
      ownerAddress: property.ownerAddress || '',
      additionalInfo: property.additionalInfo || '',
      image: property.image,
      images: property.images || [property.image],
      videoUrl: property.videoUrl || '',
      pdfUrl: property.pdfUrl || '',
      floorPlanUrl: property.floorPlanUrl || '',
      floorPlanUrls: property.floorPlanUrls || (property.floorPlanUrl ? [property.floorPlanUrl] : ['']),
      tour360Url: property.tour360Url || '',
      status: property.status || 'Ativo',
      rooms: property.rooms || 0,
      motoParking: property.motoParking || 0,
      hasGourmetBalcony: property.hasGourmetBalcony || false,
      elevators: property.elevators || 0,
      hasLavabo: property.hasLavabo || false,
      hasHeatedPool: property.hasHeatedPool || false,
      hasSauna: property.hasSauna || false,
      code: property.code || generateUniqueCode(),
      listingType: property.listingType || 'venda',
      condoId: property.condoId || 0,
      condoFee: property.condoFee || '',
      iptu: property.iptu || '',
      insurance: property.insurance || '',
      floors: property.floors || 0,
      units: property.units || 0,
      lateralUnits: property.lateralUnits || 0,
      frontUnits: property.frontUnits || 0,
      backUnits: property.backUnits || 0,
      penthouseUnits: property.penthouseUnits || 0,
      projectLogoUrl: property.projectLogoUrl || '',
      customButtons: property.customButtons || []
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission on the final step
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    try {
      let finalCondoId = newPropertyData.condoId;

      // Ensure the main 'image' field matches the first image in the 'images' array if provided
      const propertyToSave = {
        ...newPropertyData,
        condoId: finalCondoId,
        image: newPropertyData.images.length > 0 && newPropertyData.images[0] !== '' 
          ? newPropertyData.images[0] 
          : (newPropertyData.image && !newPropertyData.image.includes('pe07Ikg.png') ? newPropertyData.image : (newPropertyData.images[0] || 'https://i.imgur.com/pe07Ikg.png'))
      };

      // Final fallback for image
      if (!propertyToSave.image || propertyToSave.image.includes('pe07Ikg.png')) {
        if (newPropertyData.images.length > 0 && newPropertyData.images[0] !== '') {
          propertyToSave.image = newPropertyData.images[0];
        }
      }

      if (isEditing && editingPropertyId !== null) {
        await updateProperty(editingPropertyId, propertyToSave);
        await addLog('property', 'Editou imóvel', `Imóvel: ${propertyToSave.title} (Cód: ${propertyToSave.code})`);
      } else {
        await addProperty(propertyToSave);
        await addLog('property', 'Cadastrou imóvel', `Imóvel: ${propertyToSave.title} (Cód: ${propertyToSave.code})`);
      }

      setIsAddModalOpen(false);
      setIsEditing(false);
      setEditingPropertyId(null);
      setCurrentStep(1);
      // Reset form
      setNewPropertyData({
        title: '',
        location: '',
        price: '',
        beds: 0,
        baths: 0,
        parking: 0,
        area: '',
        description: '',
        broker: 'Daniel Vale',
        category: `${CATEGORIES[0].label1} ${CATEGORIES[0].label2}`,
        categorySlug: CATEGORIES[0].slug,
        ownerName: '',
        ownerPhone: '',
        ownerAddress: '',
        additionalInfo: '',
        image: 'https://i.imgur.com/pe07Ikg.png',
        images: [''],
        videoUrl: '',
        pdfUrl: '',
        floorPlanUrl: '',
        floorPlanUrls: [''],
        tour360Url: '',
        status: 'Ativo',
        rooms: 0,
        motoParking: 0,
        hasGourmetBalcony: false,
        elevators: 0,
        hasLavabo: false,
        hasHeatedPool: false,
        hasSauna: false,
        code: generateUniqueCode(),
        listingType: 'venda' as 'venda' | 'aluguel' | 'permuta' | 'lançamento',
        condoId: 0,
        condoFee: '',
        iptu: '',
        insurance: '',
        floors: 0,
        units: 0,
        lateralUnits: 0,
        frontUnits: 0,
        backUnits: 0,
        penthouseUnits: 0,
        projectLogoUrl: '',
        customButtons: []
      });
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
      alert("Erro ao salvar o imóvel. Verifique suas permissões.");
    }
  };

  const handleSaveCondo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const condoData = {
        ...newCondoData,
        images: newCondoData.images.filter(img => img !== '')
      };

      if (isEditingCondo && editingCondoId !== null) {
        await updateCondo(editingCondoId, condoData);
        await addLog('condo', 'Editou condomínio', `Condomínio: ${condoData.name}`);
      } else {
        await addCondo(condoData);
        await addLog('condo', 'Cadastrou condomínio', `Condomínio: ${condoData.name}`);
      }

      setIsCondoModalOpen(false);
      setIsEditingCondo(false);
      setEditingCondoId(null);
      setNewCondoData({
        name: '',
        location: '',
        portariaType: 'Não possui',
        gasSupply: 'botijão',
        leisure: [],
        verticalConveniencies: [],
        horizontalConveniencies: [],
        bio: '',
        image360Url: '',
        logoUrl: '',
        images: ['']
      });
    } catch (error) {
      console.error("Erro ao salvar condomínio:", error);
      alert("Erro ao salvar o condomínio.");
    }
  };

  const handleEditCondo = (condo: any) => {
    setIsEditingCondo(true);
    setEditingCondoId(condo.id);
    setNewCondoData({
      name: condo.name,
      location: condo.location || '',
      portariaType: condo.portariaType || 'Não possui',
      gasSupply: condo.gasSupply || 'botijão',
      leisure: condo.leisure || [],
      verticalConveniencies: condo.verticalConveniencies || [],
      horizontalConveniencies: condo.horizontalConveniencies || [],
      bio: condo.bio || '',
      image360Url: condo.image360Url || '',
      logoUrl: condo.logoUrl || '',
      images: condo.images && condo.images.length > 0 ? condo.images : ['']
    });
    setIsCondoModalOpen(true);
  };

  const handleDeleteCondo = (id: string | number) => {
    setCondoToDelete(id);
  };

  const confirmDeleteCondo = async () => {
    if (condoToDelete !== null) {
      try {
        const condo = condos.find(c => c.id === condoToDelete);
        await removeCondo(condoToDelete);
        await addLog('condo', 'Excluiu condomínio', `Condomínio: ${condo?.name || condoToDelete}`);
        setCondoToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir condomínio:", error);
        alert("Erro ao excluir o condomínio. Verifique suas permissões.");
      }
    }
  };

  const confirmDeleteLead = async () => {
    if (leadToDelete !== null) {
      try {
        const lead = leads.find(l => l.id === leadToDelete);
        await deleteDoc(doc(db, 'property_leads', leadToDelete));
        await addLog('lead', 'Excluiu captação', `Proprietário: ${lead?.ownerName}, Imóvel: ${lead?.propertyType}`);
      } catch (error) {
        console.error('Error deleting lead:', error);
        handleFirestoreError(error, OperationType.DELETE, `property_leads/${leadToDelete}`);
      }
      setLeadToDelete(null);
    }
  };

  const confirmDeleteProposal = async () => {
    if (proposalToDelete !== null) {
      try {
        const proposal = proposals.find(p => p.id === proposalToDelete);
        await deleteDoc(doc(db, 'proposals', proposalToDelete));
        await addLog('proposal', 'Excluiu proposta', `Cliente: ${proposal?.userName}, Imóvel: ${proposal?.propertyName}`);
        setProposalToDelete(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `proposals/${proposalToDelete}`);
      }
    }
  };

  const handleCondoImageChange = (index: number, value: string) => {
    const updatedImages = [...newCondoData.images];
    updatedImages[index] = value;
    setNewCondoData({
      ...newCondoData,
      images: updatedImages
    });
  };

  const handleAddCondoImage = () => {
    setNewCondoData({
      ...newCondoData,
      images: [...newCondoData.images, '']
    });
  };

  const handleRemoveCondoImage = (index: number) => {
    const updatedImages = newCondoData.images.filter((_, i) => i !== index);
    setNewCondoData({
      ...newCondoData,
      images: updatedImages.length > 0 ? updatedImages : ['']
    });
  };

  const handleUpdateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const userRef = doc(db, 'users', userId);
      const userToUpd = usersToApprove.find(u => u.id === userId);
      await updateDoc(userRef, { 
        status,
        updatedAt: serverTimestamp()
      });
      await addLog('user', status === 'approved' ? 'Aprovou acesso' : 'Rejeitou acesso', `Usuário: ${userToUpd?.name || userToUpd?.email}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete !== null) {
      try {
        const userToDel = usersToApprove.find(u => u.id === userToDelete);
        await deleteDoc(doc(db, 'users', userToDelete));
        await addLog('user', 'Excluiu solicitação', `Usuário: ${userToDel?.name || userToDel?.email}`);
        setUserToDelete(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${userToDelete}`);
      }
    }
  };

  const confirmClearUsers = async () => {
    if (usersToClearStatus !== null) {
      try {
        const batch = writeBatch(db);
        const usersToDelete = usersToApprove.filter(u => u.status === usersToClearStatus);
        
        usersToDelete.forEach(u => {
          batch.delete(doc(db, 'users', u.id));
        });

        await batch.commit();
        await addLog('user', 'Limpou lista de usuários', `Status: ${usersToClearStatus}, Qtd: ${usersToDelete.length}`);
        setUsersToClearStatus(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/batch-clear-${usersToClearStatus}`);
      }
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      const proposalRef = doc(db, 'proposals', proposalId);
      const proposal = proposals.find(p => p.id === proposalId);
      await updateDoc(proposalRef, { 
        status,
        updatedAt: serverTimestamp()
      });
      await addLog('proposal', status === 'accepted' ? 'Aceitou proposta' : 'Recusou proposta', `Cliente: ${proposal?.userName}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `proposals/${proposalId}`);
    }
  };

  const renderProposalCard = (proposal: any) => (
    <div 
      key={proposal.id}
      className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
            proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
            proposal.status === 'rejected' ? 'bg-red-50 text-red-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-black text-gray-900">{proposal.userName}</h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                {proposal.paymentMethod}
              </span>
              <span className="px-3 py-1 bg-[#617964]/10 text-[#617964] text-[10px] font-black rounded-full uppercase tracking-wider">
                {proposal.proposalValue}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
              <Home className="w-4 h-4" /> {proposal.propertyName}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                <Mail className="w-3 h-3" /> {proposal.userEmail}
              </span>
              <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" /> {proposal.userPhone}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="text-right sm:mr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data do Envio</p>
            <p className="text-sm font-black text-gray-900">
              {proposal.createdAt?.toDate ? proposal.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {(!proposal.status || proposal.status === 'pending') && (
              <>
                <button
                  onClick={() => handleUpdateProposalStatus(proposal.id, 'accepted')}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" /> Aceitar
                </button>
                <button
                  onClick={() => handleUpdateProposalStatus(proposal.id, 'rejected')}
                  className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                >
                  <X className="w-4 h-4" /> Recusar
                </button>
              </>
            )}
            {proposal.status === 'rejected' && (
               <button
                  onClick={() => handleUpdateProposalStatus(proposal.id, 'accepted')}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-xs font-black uppercase tracking-wider"
                >
                  Aprovar Agora
                </button>
            )}
            {proposal.status === 'accepted' && (
               <button
                  onClick={() => handleUpdateProposalStatus(proposal.id, 'rejected')}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all text-xs font-black uppercase tracking-wider"
                >
                  Recusar Agora
                </button>
            )}
            <button 
              onClick={() => setProposalToDelete(proposal.id)}
              className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
              title="Excluir Proposta"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {proposal.observations && (
        <div className="mt-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Observações do Cliente
          </p>
          <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
            "{proposal.observations}"
          </p>
        </div>
      )}
    </div>
  );

  const handleLogout = async () => {
    try {
      const userName = auth.currentUser?.displayName || auth.currentUser?.email;
      await addLog('system', 'Fez logout', `Usuário: ${userName}`);
      await signOut(auth);
      setAuthStatus(null);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleDashboardEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;
      
      // Admin entra direto
      const adminEmail = 'danielvaleweb@gmail.com';
      if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        setIsAdmin(true);
        setAuthStatus('approved');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        setLoginError('Este e-mail não está cadastrado como corretor. Por favor, use a opção de se associar.');
        return;
      }

      const status = userDoc.data().status;
      if (status === 'rejected') {
        await signOut(auth);
        setLoginError('Seu acesso foi recusado. Entre em contato com o suporte.');
        return;
      }
      
      setAuthStatus(status);
    } catch (err: any) {
      console.error("Dashboard Login Error:", err);
      const errorCode = err.code || err.message;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setLoginError('E-mail ou senha incorretos. Verifique seus dados.');
      } else if (errorCode === 'auth/too-many-requests') {
        setLoginError('Muitas tentativas sem sucesso. Tente novamente mais tarde.');
      } else {
        setLoginError('Erro ao tentar fazer login. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDashboardRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword !== registerData.confirmPassword) {
      setLoginError('As senhas não coincidem.');
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
      
      await updateProfile(userCredential.user, {
        displayName: registerData.name.trim()
      });

      const userEmail = loginEmail.toLowerCase();
      const registrationData = {
        name: registerData.name.trim(),
        phone: registerData.phone.trim(),
        creci: registerData.creci.trim(),
        email: userEmail,
        status: 'pending',
        role: 'corretor',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), registrationData);
      setAuthStatus('pending');
    } catch (err: any) {
      console.error("Dashboard Register Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setLoginError('Este e-mail já está em uso.');
      } else {
        setLoginError('Ocorreu um erro ao tentar cadastrar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDashboardGoogleLogin = async () => {
    setIsSubmitting(true);
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Admin entra direto
      const adminEmail = 'danielvaleweb@gmail.com';
      if (user.email?.toLowerCase() === adminEmail.toLowerCase() || user.uid === 'xgp4kEuc66UbGXIMcBVAa4fykus2') {
        setIsAdmin(true);
        setAuthStatus('approved');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        setLoginError('Este e-mail Google não está cadastrado. Por favor, preencha os dados abaixo para se associar.');
        setRegisterData(prev => ({ ...prev, name: user.displayName || '' }));
        setLoginEmail(user.email || '');
        setIsRegisterMode(true);
        return;
      }

      const status = userDoc.data().status;
      if (status === 'rejected') {
        await signOut(auth);
        setLoginError('Seu acesso foi recusado por um administrador.');
        return;
      }
      
      setAuthStatus(status);
    } catch (err: any) {
      console.error("Dashboard Google Login Error:", err);
      setLoginError('Falha na autenticação com Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="p-10 pt-12 text-center bg-gray-50/50 border-b border-gray-100 relative">
             <button 
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 p-2 text-gray-400 hover:text-[#617964] transition-colors"
                title="Voltar ao site"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            <div className="w-20 h-20 bg-[#617964] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#617964]/20">
              {isRegisterMode ? <UserPlus className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2 font-display">
              {isRegisterMode ? 'Seja um Parceiro' : 'Painel do Corretor'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {isRegisterMode ? 'Preencha os dados para solicitar seu acesso.' : 'Acesse sua conta para gerenciar seus imóveis.'}
            </p>
          </div>

          <form onSubmit={isRegisterMode ? handleDashboardRegister : handleDashboardEmailLogin} className="p-10 space-y-6">
            {loginError && (
              <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-xs font-bold text-red-600">{loginError}</p>
              </div>
            )}

            <div className="space-y-4">
              {isRegisterMode && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        required
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="tel"
                          required
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CRECI</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          required
                          value={registerData.creci}
                          onChange={(e) => setRegisterData({...registerData, creci: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                          placeholder="00.000"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#617964] text-white rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting ? (isRegisterMode ? 'Enviando...' : 'Entrando...') : (isRegisterMode ? 'Solicitar Acesso' : 'Entrar no Painel')}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>

            {!isRegisterMode && (
              <>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ou continue com</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleDashboardGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
                  Google Login
                </button>
              </>
            )}
            
            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setLoginError(null);
                }}
                className="text-xs font-black text-[#617964] uppercase tracking-widest hover:underline px-4 py-2"
              >
                {isRegisterMode ? 'Já tenho uma conta? Entrar' : 'Não tem conta? Me associar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  if (user && authStatus === 'pending') {
    return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Aguardando Aprovação</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Seu cadastro foi recebido com sucesso! Nossa equipe administrativa está revisando seus dados e em breve você terá acesso ao painel.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
          >
            Sair e Voltar ao Site
          </button>
        </motion.div>
      </div>
    );
  }

  if (user && authStatus === 'rejected') {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Infelizmente sua solicitação de acesso foi recusada. Entre em contato com a administração para mais detalhes.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
          >
            Sair
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Messages Dropdown */}
      <AnimatePresence>
        {isMessagesOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-20 right-4 lg:right-8 w-80 lg:w-96 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden z-[110] flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {selectedChatBroker ? (
              <>
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedChatBroker(null)}
                    className="p-2 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex items-center gap-3">
                    <img src={selectedChatBroker.photo || "https://i.imgur.com/5l1CO1t.png"} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-sm font-black text-gray-900">{selectedChatBroker.name}</h3>
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Online</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]"
                >
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 p-8 text-center">
                      <MessageSquare className="w-8 h-8 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">Comece uma conversa</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.from === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          msg.from === auth.currentUser?.uid 
                            ? 'bg-[#617964] text-white rounded-tr-none shadow-lg shadow-[#617964]/10' 
                            : msg.type === 'system'
                              ? 'bg-amber-50 text-amber-800 border border-amber-100 italic rounded-tl-none text-xs'
                              : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                          <p className={`text-[8px] mt-1 opacity-50 font-bold uppercase ${msg.from === auth.currentUser?.uid ? 'text-white' : 'text-gray-500'}`}>
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Agora'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-gray-100 bg-gray-50"
                >
                  <div className="relative">
                    <input 
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Sua mensagem..."
                      className="w-full bg-white border-none rounded-xl py-3 pl-4 pr-12 text-xs font-medium focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all shadow-sm"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#617964] text-white rounded-lg hover:bg-[#374001] transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-black text-gray-900">Mensagens Equipe</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Conecte-se com seus parceiros</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {brokers.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <User className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhum membro cadastrado.</p>
                    </div>
                  ) : (
                    brokers.filter(b => b.id.toString() !== auth.currentUser?.uid).map((broker) => (
                      <button
                        key={broker.id}
                        onClick={() => setSelectedChatBroker(broker)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-[#617964]/5 rounded-2xl transition-all group"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                            <img src={broker.photo || "https://i.imgur.com/5l1CO1t.png"} alt={broker.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">{broker.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{broker.role || 'Corretor'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#25D366] group-hover:text-white transition-all">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button className="w-full py-3 bg-[#617964] text-white rounded-xl text-xs font-black shadow-lg shadow-[#617964]/20">
                    Ver Todas Conversas
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings / Permissions Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Configurações & Painel</h2>
                  <p className="text-sm text-gray-500 font-medium">Gestão de acessos e permissões da equipe</p>
                </div>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all hover:shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {/* Permissões por Cargo */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-[#617964] uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Permissões por Cargo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['ADMIN', 'CORRETOR MASTER', 'CORRETOR'].map((cargo) => (
                      <div key={cargo} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{cargo}</span>
                          <span className="text-[10px] px-2 py-1 bg-[#617964]/10 text-[#617964] rounded-lg font-bold uppercase">Ativo</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: 'Pode Criar Imóveis', enabled: true },
                            { label: 'Pode Editar Imóveis', enabled: cargo !== 'CORRETOR' },
                            { label: 'Pode Deletar Imóveis', enabled: cargo === 'ADMIN' },
                            { label: 'Pode Aprovar Logins', enabled: cargo === 'ADMIN' },
                          ].map((perm, i) => (
                            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-200/50">
                              <span className="font-bold text-gray-600">{perm.label}</span>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${perm.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login Approvals Settings */}
                <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Aprovação de Login</h3>
                      <p className="text-xs text-gray-500 font-medium">Quem pode validar novas contas</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-6 bg-[#617964] rounded-full relative p-1 cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#617964] hover:shadow-lg transition-all text-left">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                           <Users className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-900">Somente ADMIN</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Recomendado</p>
                        </div>
                     </button>
                     <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#617964] hover:shadow-lg transition-all text-left opacity-60">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                           <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-900">ADMIN + MASTER</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Flexível</p>
                        </div>
                     </button>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
                <button className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">
                  Restaurar Padrão
                </button>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1 py-4 bg-[#617964] text-white rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <div className="flex flex-col gap-6 mb-10">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#617964] transition-colors text-xs font-bold uppercase tracking-widest w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Site
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#617964] rounded-xl flex items-center justify-center shadow-lg shadow-[#617964]/20">
                  <Home className="text-white w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-[#1A1A1A]">CR <span className="text-[#617964]">DASH</span></span>
                  <span className="text-[10px] font-black text-[#617964] uppercase tracking-widest">{isAdmin ? 'Administrador' : 'Corretor'}</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <nav>
            <Reorder.Group axis="y" values={visibleSidebarItems} onReorder={handleReorder} className="space-y-1">
              {visibleSidebarItems.map((item) => {
                const badgeCount = item.id === 'users_approval' ? usersToApprove.filter(u => u.status === 'pending').length : 0;
                return (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        activeTab === item.id 
                          ? 'bg-[#617964]/10 text-[#617964]' 
                          : (badgeCount > 0)
                            ? 'bg-blue-50/50 text-blue-600 hover:bg-blue-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <item.icon className={`w-5 h-5 ${badgeCount > 0 && activeTab !== item.id ? 'text-blue-500' : ''}`} />
                        {item.label}
                      </div>
                      <div className="flex items-center gap-2">
                        {badgeCount > 0 && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            activeTab === item.id ? 'bg-[#617964] text-white' : 'bg-blue-600 text-white animate-bounce'
                          }`}>
                            {badgeCount}
                          </span>
                        )}
                        <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
                      </div>
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </nav>
        </div>
      </aside>

      {/* Add Property Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-[#617964] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {isEditing ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-black">{isEditing ? 'Editar Imóvel' : 'Incluir Novo Imóvel'}</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProperty} className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8 px-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <React.Fragment key={s}>
                      <div 
                        className={`flex flex-col items-center gap-2 ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditing && setCurrentStep(s)}
                      >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                currentStep === s 
                                  ? 'bg-[#617964] text-white shadow-lg shadow-[#617964]/30 scale-110' 
                                  : currentStep > s 
                                    ? 'bg-[#617964]/20 text-[#617964]' 
                                    : 'bg-white border border-gray-200 text-gray-400'
                              }`}>
                          {currentStep > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${
                          currentStep === s ? 'text-[#617964]' : 'text-gray-400'
                        }`}>
                          {s === 1 ? 'Básico' : s === 2 ? 'Características' : s === 3 ? 'Mídia' : s === 4 ? 'Categoria' : 'Interno'}
                        </span>
                      </div>
                      {s < 5 && (
                        <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                          currentStep > s ? 'bg-[#617964]' : 'bg-white border border-gray-200'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h4 className="text-sm font-black text-[#617964] uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4" /> Informações Básicas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipo de Negócio</label>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => handlePriceChange(newPropertyData.price, 'venda')}
                              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                                newPropertyData.listingType === 'venda'
                                  ? 'bg-[#617964]/10 border-[#617964] text-[#617964]'
                                  : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              Venda
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePriceChange(newPropertyData.price, 'aluguel')}
                              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                                newPropertyData.listingType === 'aluguel'
                                  ? 'bg-[#617964]/10 border-[#617964] text-[#617964]'
                                  : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              Aluguel
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePriceChange(newPropertyData.price, 'permuta')}
                              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                                newPropertyData.listingType === 'permuta'
                                  ? 'bg-[#617964]/10 border-[#617964] text-[#617964]'
                                  : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              Permuta
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePriceChange(newPropertyData.price, 'lançamento')}
                              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                                newPropertyData.listingType === 'lançamento'
                                  ? 'bg-[#617964]/10 border-[#617964] text-[#617964]'
                                  : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              Lançamento
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome do Imóvel</label>
                          <input 
                            required
                            type="text" 
                            value={newPropertyData.title}
                            onChange={(e) => setNewPropertyData({...newPropertyData, title: e.target.value})}
                            placeholder="Ex: Mansão Luxury"
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>

                        {newPropertyData.listingType === 'lançamento' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Logo do Empreendimento (URL)</label>
                            <input 
                              type="text" 
                              value={newPropertyData.projectLogoUrl}
                              onChange={(e) => setNewPropertyData({...newPropertyData, projectLogoUrl: e.target.value})}
                              placeholder="https://exemplo.com/logo.png"
                              className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                            {newPropertyData.listingType === 'aluguel' ? 'Valor do Aluguel' : 'Valor de Venda'}
                          </label>
                          <input 
                            required
                            type="text" 
                            value={newPropertyData.price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            placeholder={newPropertyData.listingType === 'aluguel' ? "Ex: R$ 4.500,00 / mês" : "Ex: R$ 3.500.000,00"}
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>

                        {/* New Pricing Fields based on Listing Type */}
                        {newPropertyData.listingType === 'venda' ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Condomínio</label>
                              <input 
                                type="text" 
                                value={newPropertyData.condoFee}
                                onChange={(e) => setNewPropertyData({...newPropertyData, condoFee: formatCurrency(e.target.value)})}
                                placeholder="Ex: R$ 1.200,00"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Valor Anual (IPTU)</label>
                              <input 
                                type="text" 
                                value={newPropertyData.iptu}
                                onChange={(e) => setNewPropertyData({...newPropertyData, iptu: formatCurrency(e.target.value)})}
                                placeholder="Ex: R$ 5.000,00"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                          </>
                        ) : newPropertyData.listingType === 'aluguel' ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">IPTU (Mensal)</label>
                              <input 
                                type="text" 
                                value={newPropertyData.iptu}
                                onChange={(e) => setNewPropertyData({...newPropertyData, iptu: formatCurrency(e.target.value)})}
                                placeholder="Ex: R$ 450,00"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Seguro Incêndio (Mensal)</label>
                              <input 
                                type="text" 
                                value={newPropertyData.insurance}
                                onChange={(e) => setNewPropertyData({...newPropertyData, insurance: formatCurrency(e.target.value)})}
                                placeholder="Ex: R$ 80,00"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Condomínio</label>
                              <input 
                                type="text" 
                                value={newPropertyData.condoFee}
                                onChange={(e) => setNewPropertyData({...newPropertyData, condoFee: formatCurrency(e.target.value)})}
                                placeholder="Ex: R$ 1.200,00"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Qtd. de Andares</label>
                              <input 
                                type="number" 
                                value={newPropertyData.floors}
                                onChange={(e) => setNewPropertyData({...newPropertyData, floors: parseInt(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Qtd. de Unidades</label>
                              <input 
                                type="number" 
                                value={newPropertyData.units}
                                onChange={(e) => setNewPropertyData({...newPropertyData, units: parseInt(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Aptos. Frente</label>
                              <input 
                                type="number" 
                                value={newPropertyData.frontUnits}
                                onChange={(e) => setNewPropertyData({...newPropertyData, frontUnits: parseInt(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Aptos. Fundos</label>
                              <input 
                                type="number" 
                                value={newPropertyData.backUnits}
                                onChange={(e) => setNewPropertyData({...newPropertyData, backUnits: parseInt(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Aptos. Lateral</label>
                              <input 
                                type="number" 
                                value={newPropertyData.lateralUnits}
                                onChange={(e) => setNewPropertyData({...newPropertyData, lateralUnits: parseInt(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Aptos. Cobertura</label>
                              <input 
                                type="number" 
                                value={newPropertyData.penthouseUnits}
                                onChange={(e) => setNewPropertyData({...newPropertyData, penthouseUnits: parseInt(e.target.value) || 0})}
                                placeholder="0"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                          </>
                        )}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Código do Imóvel (Automático)</label>
                          <div className="relative">
                            <input 
                              readOnly
                              type="text" 
                              value={newPropertyData.code}
                              className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold text-[#617964] outline-none cursor-not-allowed"
                            />
                            <button 
                              type="button"
                              onClick={() => setNewPropertyData({...newPropertyData, code: generateUniqueCode()})}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-[#617964]"
                              title="Gerar novo código"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Condomínio</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select 
                              value={newPropertyData.condoId}
                              onChange={(e) => {
                                const val = e.target.value;
                                const numericVal = Number(val);
                                const finalVal = isNaN(numericVal) || val === "" ? val : numericVal;
                                setNewPropertyData({...newPropertyData, condoId: finalVal});
                              }}
                              className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all appearance-none"
                            >
                              <option value={0}>Nenhum Condomínio</option>
                              {condos.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            







                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Endereço (Bairro, Cidade, Estado)</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              required
                              type="text" 
                              value={newPropertyData.location}
                              onChange={(e) => setNewPropertyData({...newPropertyData, location: e.target.value})}
                              placeholder="Ex: AlphaVille, Juiz de Fora - MG"
                              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h4 className="text-sm font-black text-[#617964] uppercase tracking-widest flex items-center gap-2">
                        <Maximize className="w-4 h-4" /> Características
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Bed className="w-3 h-3" /> Suítes</label>
                          <input 
                            type="number" 
                            value={newPropertyData.beds}
                            onChange={(e) => setNewPropertyData({...newPropertyData, beds: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Car className="w-3 h-3" /> Vagas</label>
                          <input 
                            type="number" 
                            value={newPropertyData.parking}
                            onChange={(e) => setNewPropertyData({...newPropertyData, parking: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Bath className="w-3 h-3" /> Banheiros</label>
                          <input 
                            type="number" 
                            value={newPropertyData.baths}
                            onChange={(e) => setNewPropertyData({...newPropertyData, baths: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Maximize className="w-3 h-3" /> m²</label>
                          <input 
                            type="text" 
                            value={newPropertyData.area}
                            onChange={(e) => handleAreaChange(e.target.value)}
                            placeholder="Ex: 850m²"
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Bed className="w-3 h-3" /> Quartos</label>
                          <input 
                            type="number" 
                            value={newPropertyData.rooms}
                            onChange={(e) => setNewPropertyData({...newPropertyData, rooms: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Car className="w-3 h-3" /> Vaga p/ Moto</label>
                          <input 
                            type="number" 
                            value={newPropertyData.motoParking}
                            onChange={(e) => setNewPropertyData({...newPropertyData, motoParking: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Elevadores</label>
                          <input 
                            type="number" 
                            value={newPropertyData.elevators}
                            onChange={(e) => setNewPropertyData({...newPropertyData, elevators: parseInt(e.target.value) || 0})}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Feature Toggles */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Varanda Gourmet', key: 'hasGourmetBalcony' },
                          { label: 'Lavabo', key: 'hasLavabo' },
                          { label: 'Piscina Aquecida', key: 'hasHeatedPool' },
                          { label: 'Sauna', key: 'hasSauna' },
                        ].map((feature) => (
                          <button
                            key={feature.key}
                            type="button"
                            onClick={() => setNewPropertyData({
                              ...newPropertyData, 
                              [feature.key]: !newPropertyData[feature.key as keyof typeof newPropertyData]
                            })}
                            className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                              newPropertyData[feature.key as keyof typeof newPropertyData]
                                ? 'bg-[#617964]/10 border-[#617964] text-[#617964]'
                                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {feature.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h4 className="text-sm font-black text-[#617964] uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Mídia (Fotos, Vídeo e PDF)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Photos Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Galeria de Fotos (Máx. 20)</label>
                            {newPropertyData.images.length < 20 && (
                              <button
                                type="button"
                                onClick={handleAddImageField}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#617964]/10 text-[#617964] rounded-xl hover:bg-[#617964]/20 transition-all text-[10px] font-black uppercase tracking-wider"
                              >
                                <Plus className="w-3 h-3" />
                                Adicionar Foto
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                            {newPropertyData.images.map((img, index) => (
                              <div key={index} className="space-y-2 group">
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-[#617964]/20">
                                  {img ? (
                                    <img 
                                      src={img} 
                                      alt={`Preview ${index}`} 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://i.imgur.com/pe07Ikg.png';
                                      }}
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
                                      <ImageIcon className="w-6 h-6" />
                                      <span className="text-[8px] font-black uppercase tracking-tighter">Sem Imagem</span>
                                    </div>
                                  )}
                                  
                                  {newPropertyData.images.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImageField(index)}
                                      className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm z-10"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  
                                  <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] text-white font-black uppercase tracking-widest">
                                    #{index + 1}
                                  </div>
                                </div>
                                <div className="relative">
                                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                  <input 
                                    type="text" 
                                    value={img}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    placeholder="Link da imagem..."
                                    className="w-full bg-gray-50 border-none rounded-xl py-2 pl-8 pr-3 text-[10px] font-medium focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all placeholder:text-gray-300"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Video & Floor Plan Section */}
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Link do Vídeo (YouTube/Vimeo)</label>
                            <div className="relative">
                              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input 
                                type="text" 
                                value={newPropertyData.videoUrl}
                                onChange={(e) => setNewPropertyData({...newPropertyData, videoUrl: e.target.value})}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Plantas do Imóvel</label>
                              {newPropertyData.floorPlanUrls.length < 10 && (
                                <button
                                  type="button"
                                  onClick={handleAddFloorPlanField}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-[#617964]/10 text-[#617964] rounded-xl hover:bg-[#617964]/20 transition-all text-[10px] font-black uppercase tracking-wider"
                                >
                                  <Plus className="w-3 h-3" />
                                  Adicionar Planta
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                              {newPropertyData.floorPlanUrls.map((url, index) => (
                                <div key={index} className="space-y-2 group">
                                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-[#617964]/20">
                                    {url ? (
                                      <img 
                                        src={url} 
                                        alt={`Planta ${index}`} 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://i.imgur.com/pe07Ikg.png';
                                        }}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
                                        <MapIcon className="w-6 h-6" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">Sem Planta</span>
                                      </div>
                                    )}
                                    
                                    {newPropertyData.floorPlanUrls.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFloorPlanField(index)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm z-10"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                    <input 
                                      type="text" 
                                      value={url}
                                      onChange={(e) => handleFloorPlanChange(index, e.target.value)}
                                      placeholder="Link da planta..."
                                      className="w-full bg-gray-50 border-none rounded-xl py-2 pl-8 pr-3 text-[10px] font-medium focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Link do Tour 360º</label>
                            <div className="relative">
                              <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input 
                                type="text" 
                                value={newPropertyData.tour360Url}
                                onChange={(e) => setNewPropertyData({...newPropertyData, tour360Url: e.target.value})}
                                placeholder="Link do tour virtual (Matterport, Kuula, etc)"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="p-6 bg-[#1A1A1A]/5 rounded-[32px] border border-[#1A1A1A]/5">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-[#617964]/10 rounded-2xl">
                                <ImageIcon className="w-6 h-6 text-[#617964]" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Dica de Mídia</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                  Utilize links diretos de imagens (terminados em .jpg, .png). A primeira foto da galeria será usada como capa do imóvel.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Custom Buttons Section */}
                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
                              <Link className="w-3 h-3" /> Botões Personalizados (Links Externos)
                            </label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <input 
                                  type="text"
                                  value={customButtonLabel}
                                  onChange={(e) => setCustomButtonLabel(e.target.value)}
                                  placeholder="Nome do Botão (Ex: Tour Virtual)"
                                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                                />
                              </div>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={customButtonUrl}
                                  onChange={(e) => setCustomButtonUrl(e.target.value)}
                                  placeholder="URL do Link"
                                  className="flex-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                                />
                                <button 
                                  type="button"
                                  onClick={handleAddCustomButton}
                                  className="p-3 bg-[#617964] text-white rounded-2xl hover:bg-[#617964]/80 transition-all shadow-lg shadow-[#617964]/20"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {newPropertyData.customButtons && newPropertyData.customButtons.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newPropertyData.customButtons.map((btn, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-[#617964]/10 text-[#617964] px-4 py-2 rounded-full text-xs font-bold border border-[#617964]/20">
                                    <span>{btn.label}</span>
                                    <button 
                                      type="button"
                                      onClick={() => handleRemoveCustomButton(idx)}
                                      className="hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h4 className="text-sm font-black text-[#617964] uppercase tracking-widest">Categoria</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  const currentSlugs = newPropertyData.categorySlug ? newPropertyData.categorySlug.split(',') : [];
                                  const currentCategories = newPropertyData.category ? newPropertyData.category.split(', ') : [];
                                  
                                  if (currentSlugs.includes(cat.slug)) {
                                    setNewPropertyData({
                                      ...newPropertyData, 
                                      category: currentCategories.filter(c => c !== `${cat.label1} ${cat.label2}`).join(', '), 
                                      categorySlug: currentSlugs.filter(s => s !== cat.slug).join(',') 
                                    });
                                  } else {
                                    setNewPropertyData({
                                      ...newPropertyData, 
                                      category: [...currentCategories, `${cat.label1} ${cat.label2}`].join(', '), 
                                      categorySlug: [...currentSlugs, cat.slug].join(',') 
                                    });
                                  }
                                }}
                                className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                                  newPropertyData.categorySlug?.split(',').includes(cat.slug)
                                    ? 'border-[#617964] bg-[#617964]/5 text-[#617964]' 
                                    : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                                }`}
                              >
                                <cat.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{cat.label1} {cat.label2}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-sm font-black text-[#617964] uppercase tracking-widest">Corretor Responsável</h4>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Selecionar Corretor</label>
                            <select 
                              value={newPropertyData.broker}
                              onChange={(e) => setNewPropertyData({...newPropertyData, broker: e.target.value})}
                              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Selecione um corretor...</option>
                              {brokers.map((broker) => (
                                <option key={broker.id} value={broker.name}>
                                  {broker.name} - {broker.role}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sobre o Imóvel (Descrição)</label>
                            <textarea 
                              rows={4}
                              value={newPropertyData.description}
                              onChange={(e) => setNewPropertyData({...newPropertyData, description: e.target.value})}
                              placeholder="Descreva os detalhes do imóvel..."
                              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-8 bg-gray-50 rounded-[32px] space-y-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4" /> Informações Internas (Não aparecem no site)
                          </h4>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">Privado</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><User className="w-3 h-3" /> Nome do Proprietário</label>
                            <input 
                              type="text" 
                              value={newPropertyData.ownerName}
                              onChange={(e) => setNewPropertyData({...newPropertyData, ownerName: e.target.value})}
                              className="w-full bg-white border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</label>
                            <input 
                              type="text" 
                              value={newPropertyData.ownerPhone}
                              onChange={(e) => setNewPropertyData({...newPropertyData, ownerPhone: formatPhone(e.target.value)})}
                              className="w-full bg-white border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all shadow-sm"
                              placeholder="(32) 99999-9999"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Endereço Atual</label>
                            <input 
                              type="text" 
                              value={newPropertyData.ownerAddress}
                              onChange={(e) => setNewPropertyData({...newPropertyData, ownerAddress: e.target.value})}
                              className="w-full bg-white border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Informações Adicionais</label>
                          <textarea 
                            rows={3}
                            value={newPropertyData.additionalInfo}
                            onChange={(e) => setNewPropertyData({...newPropertyData, additionalInfo: e.target.value})}
                            placeholder="Notas internas sobre o proprietário ou negociação..."
                            className="w-full bg-white border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all resize-none shadow-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                  <div className="flex gap-3">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all"
                      >
                        Voltar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-8 py-4 text-gray-400 text-sm font-bold hover:text-gray-600 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    {currentStep < 5 ? (
                      <>
                        {isEditing && (
                          <button
                            type="submit"
                            className="px-8 py-4 bg-[#617964]/10 text-[#617964] rounded-2xl text-sm font-black hover:bg-[#617964]/20 transition-all flex items-center gap-2"
                          >
                            <Save className="w-5 h-5" /> Atualizar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentStep(prev => prev + 1);
                          }}
                          className="px-10 py-4 bg-[#617964] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                          Próximo Passo <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="submit"
                        className="px-10 py-4 bg-[#617964] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-105 transition-all flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" /> {isEditing ? 'Atualizar' : 'Finalizar Cadastro'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {propertyToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPropertyToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Imóvel?</h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação não pode ser desfeita. O imóvel será removido permanentemente do dashboard e do site.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPropertyToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Condo Delete Confirmation Modal */}
      <AnimatePresence>
        {condoToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCondoToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Condomínio?</h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação não pode ser desfeita. O condomínio será removido permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCondoToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCondo}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Delete Confirmation Modal */}
      <AnimatePresence>
        {leadToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLeadToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Captação?</h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação não pode ser desfeita. A captação será removida permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLeadToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteLead}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proposal Delete Confirmation Modal */}
      <AnimatePresence>
        {proposalToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProposalToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Proposta?</h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação não pode ser desfeita. A proposta será removida permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProposalToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteProposal}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Solicitação?</h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação não pode ser desfeita. A solicitação de acesso será removida permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Users Confirmation Modal */}
      <AnimatePresence>
        {usersToClearStatus !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUsersToClearStatus(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">
                Limpar Todas as {usersToClearStatus === 'pending' ? 'Solicitações' : 'Recusas'}?
              </h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação excluirá permanentemente todos os registros desta lista. Deseja continuar?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUsersToClearStatus(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmClearUsers}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Limpar Todos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broker Delete Confirmation Modal */}
      <AnimatePresence>
        {brokerToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBrokerToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Corretor?</h3>
              <p className="text-gray-500 text-center font-medium mb-8">
                Esta ação não pode ser desfeita. O corretor será removido permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBrokerToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteBroker}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Deseja realmente sair?</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">
                Sua sessão será encerrada e você voltará para a tela inicial.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Sim, Sair agora
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Condo Registration Modal */}
      <AnimatePresence>
        {isCondoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCondoModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {isEditingCondo ? 'Editar Condomínio' : 'Cadastrar Condomínio'}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    {isEditingCondo ? 'Atualize as informações do condomínio' : 'Preencha as informações do novo condomínio'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsCondoModalOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>

              <form onSubmit={handleSaveCondo} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome do Condomínio</label>
                      <input 
                        type="text" 
                        required
                        value={newCondoData.name}
                        onChange={(e) => setNewCondoData({...newCondoData, name: e.target.value})}
                        placeholder="Ex: Alphaville"
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Localização</label>
                      <input 
                        type="text" 
                        required
                        value={newCondoData.location}
                        onChange={(e) => setNewCondoData({...newCondoData, location: e.target.value})}
                        placeholder="Ex: Itaipava, Petrópolis"
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Portaria & Gas */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipo de Portaria</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Remota', '24h', 'Não possui'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewCondoData({...newCondoData, portariaType: type as any})}
                            className={`py-3 rounded-xl text-xs font-bold transition-all ${
                              newCondoData.portariaType === type 
                                ? 'bg-[#617964] text-white shadow-lg shadow-[#617964]/20' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Abastecimento de Gás</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['encanado', 'botijão'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewCondoData({...newCondoData, gasSupply: type as any})}
                            className={`py-3 rounded-xl text-xs font-bold transition-all capitalize ${
                              newCondoData.gasSupply === type 
                                ? 'bg-[#617964] text-white shadow-lg shadow-[#617964]/20' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leisure */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Lazer</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      ...LEISURE_OPTIONS.map(l => ({ label: l, isDefault: true })),
                      ...customOptions.leisure.map(o => ({ label: o.label, id: o.id, isDefault: false }))
                    ].map((option: { label: string; isDefault: boolean; id?: string }) => (
                      <div key={option.isDefault ? option.label : option.id} className="relative group">
                        <label 
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer h-full ${
                            newCondoData.leisure.includes(option.label)
                              ? 'border-[#617964] bg-[#617964]/5'
                              : 'border-gray-50 bg-gray-50 hover:border-gray-100'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={newCondoData.leisure.includes(option.label)}
                            onChange={() => {
                              const updated = newCondoData.leisure.includes(option.label)
                                ? newCondoData.leisure.filter(i => i !== option.label)
                                : [...newCondoData.leisure, option.label];
                              setNewCondoData({...newCondoData, leisure: updated});
                            }}
                          />
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                            newCondoData.leisure.includes(option.label)
                              ? 'bg-[#617964] border-[#617964]'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {newCondoData.leisure.includes(option.label) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className={`text-xs font-bold ${newCondoData.leisure.includes(option.label) ? 'text-[#617964]' : 'text-gray-500'}`}>
                            {option.label}
                          </span>
                        </label>
                        {!option.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteCustomOption(option.id!);
                            }}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Custom Leisure Input */}
                    <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <input 
                        type="text"
                        value={customLeisure}
                        onChange={(e) => setCustomLeisure(e.target.value)}
                        placeholder="Novo item..."
                        className="flex-1 bg-transparent border-none text-xs font-bold outline-none px-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCondoItem('leisure', customLeisure);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddCustomCondoItem('leisure', customLeisure)}
                        className="p-2 bg-[#617964] text-white rounded-xl hover:bg-[#617964]/80 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conveniences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Conveniências (Verticais)</label>
                    <div className="space-y-2">
                      {[
                        ...VERTICAL_CONVENIENCES.map(l => ({ label: l, isDefault: true })),
                        ...customOptions.verticalConveniencies.map(o => ({ label: o.label, id: o.id, isDefault: false }))
                      ].map((option: { label: string; isDefault: boolean; id?: string }) => (
                        <div key={option.isDefault ? option.label : option.id} className="relative group">
                          <label 
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                              newCondoData.verticalConveniencies.includes(option.label)
                                ? 'border-[#617964] bg-[#617964]/5'
                                : 'border-gray-50 bg-gray-50 hover:border-gray-100'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              className="hidden"
                              checked={newCondoData.verticalConveniencies.includes(option.label)}
                              onChange={() => {
                                const updated = newCondoData.verticalConveniencies.includes(option.label)
                                  ? newCondoData.verticalConveniencies.filter(i => i !== option.label)
                                  : [...newCondoData.verticalConveniencies, option.label];
                                setNewCondoData({...newCondoData, verticalConveniencies: updated});
                              }}
                            />
                            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                              newCondoData.verticalConveniencies.includes(option.label)
                                ? 'bg-[#617964] border-[#617964]'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {newCondoData.verticalConveniencies.includes(option.label) && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-[11px] font-bold ${newCondoData.verticalConveniencies.includes(option.label) ? 'text-[#617964]' : 'text-gray-500'}`}>
                              {option.label}
                            </span>
                          </label>
                          {!option.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteCustomOption(option.id!);
                              }}
                              className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {/* Custom Vertical Input */}
                      <div className="flex gap-2 p-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <input 
                          type="text"
                          value={customVertical}
                          onChange={(e) => setCustomVertical(e.target.value)}
                          placeholder="Novo item..."
                          className="flex-1 bg-transparent border-none text-xs font-bold outline-none px-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCondoItem('verticalConveniencies', customVertical);
                            }
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => handleAddCustomCondoItem('verticalConveniencies', customVertical)}
                          className="p-1.5 bg-[#617964] text-white rounded-lg hover:bg-[#617964]/80 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Conveniências (Horizontais)</label>
                    <div className="space-y-2">
                      {[
                        ...HORIZONTAL_CONVENIENCES.map(l => ({ label: l, isDefault: true })),
                        ...customOptions.horizontalConveniencies.map(o => ({ label: o.label, id: o.id, isDefault: false }))
                      ].map((option: { label: string; isDefault: boolean; id?: string }) => (
                        <div key={option.isDefault ? option.label : option.id} className="relative group">
                          <label 
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                              newCondoData.horizontalConveniencies.includes(option.label)
                                ? 'border-[#617964] bg-[#617964]/5'
                                : 'border-gray-50 bg-gray-50 hover:border-gray-100'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              className="hidden"
                              checked={newCondoData.horizontalConveniencies.includes(option.label)}
                              onChange={() => {
                                const updated = newCondoData.horizontalConveniencies.includes(option.label)
                                  ? newCondoData.horizontalConveniencies.filter(i => i !== option.label)
                                  : [...newCondoData.horizontalConveniencies, option.label];
                                setNewCondoData({...newCondoData, horizontalConveniencies: updated});
                              }}
                            />
                            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                              newCondoData.horizontalConveniencies.includes(option.label)
                                ? 'bg-[#617964] border-[#617964]'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {newCondoData.horizontalConveniencies.includes(option.label) && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-[11px] font-bold ${newCondoData.horizontalConveniencies.includes(option.label) ? 'text-[#617964]' : 'text-gray-500'}`}>
                              {option.label}
                            </span>
                          </label>
                          {!option.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteCustomOption(option.id!);
                              }}
                              className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {/* Custom Horizontal Input */}
                      <div className="flex gap-2 p-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <input 
                          type="text"
                          value={customHorizontal}
                          onChange={(e) => setCustomHorizontal(e.target.value)}
                          placeholder="Novo item..."
                          className="flex-1 bg-transparent border-none text-xs font-bold outline-none px-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCondoItem('horizontalConveniencies', customHorizontal);
                            }
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => handleAddCustomCondoItem('horizontalConveniencies', customHorizontal)}
                          className="p-1.5 bg-[#617964] text-white rounded-lg hover:bg-[#617964]/80 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mais detalhes (Biografia)</label>
                  <textarea 
                    value={newCondoData.bio}
                    onChange={(e) => setNewCondoData({...newCondoData, bio: e.target.value})}
                    placeholder="Descreva o condomínio..."
                    rows={4}
                    className="w-full bg-gray-50 border-none rounded-[32px] py-6 px-8 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* Media Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Link da Imagem 360º</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={newCondoData.image360Url}
                        onChange={(e) => setNewCondoData({...newCondoData, image360Url: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Link da Logo</label>
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={newCondoData.logoUrl}
                        onChange={(e) => setNewCondoData({...newCondoData, logoUrl: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-[#617964] uppercase tracking-wider ml-1">
                      Aviso: Resolução recomendada de 1290px x 280px
                    </p>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Galeria de Imagens</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newCondoData.images.map((img, index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                          {img ? (
                            <img 
                              src={img} 
                              alt={`Condo ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://i.imgur.com/pe07Ikg.png';
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-1">
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-[8px] font-black uppercase tracking-tighter">Sem Imagem</span>
                            </div>
                          )}
                          {newCondoData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = newCondoData.images.filter((_, i) => i !== index);
                                setNewCondoData({...newCondoData, images: updated});
                              }}
                              className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm z-10"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input 
                          type="text" 
                          value={img}
                          onChange={(e) => {
                            const updated = [...newCondoData.images];
                            updated[index] = e.target.value;
                            setNewCondoData({...newCondoData, images: updated});
                          }}
                          placeholder="Link da imagem..."
                          className="w-full bg-gray-50 border-none rounded-xl py-2 px-4 text-[10px] font-medium focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewCondoData({...newCondoData, images: [...newCondoData.images, '']})}
                      className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#617964] hover:text-[#617964] transition-all group bg-gray-50/50"
                    >
                      <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Foto</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white pb-2">
                  <button
                    type="button"
                    onClick={() => setIsCondoModalOpen(false)}
                    className="px-8 py-4 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-4 bg-[#617964] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#617964]/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" /> Finalizar Cadastro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar leads, imóveis ou corretores..."
                className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#617964]/20 outline-none transition-all"
              />
              
              {/* Search Results Recommendations */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-2"
                  >
                    {searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery('');
                          if (res.type === 'Imóvel') setActiveTab('inventory');
                          else if (res.type === 'Lead') setActiveTab('leads');
                          else if (res.type === 'Corretor') setActiveTab('team');
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${res.type === 'Imóvel' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {res.type === 'Imóvel' ? <Home className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{res.title}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black">{res.type}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            <button 
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              className={`p-2.5 rounded-xl transition-all relative ${isMessagesOpen ? 'bg-[#617964] text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {filteredNotifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="hidden sm:flex p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 relative" ref={userDropdownRef}>
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-2xl transition-all cursor-pointer"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-gray-900">{auth.currentUser?.displayName || 'Daniel Vale'}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {auth.currentUser?.email === 'danielvaleweb@gmail.com' ? 'CEO & DIRETOR CRIATIVO' : 'CORRETOR PARCEIRO'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-[#617964]/20 border-2 border-white">
                  <img 
                    src={auth.currentUser?.photoURL || "https://i.imgur.com/5l1CO1t.png"} 
                    alt={auth.currentUser?.displayName || "Daniel Vale"} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sessão atual</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{auth.currentUser?.email}</p>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTab('profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#617964] transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#617964]/10 group-hover:text-[#617964] transition-all">
                        <User className="w-4 h-4" />
                      </div>
                      Meu Perfil
                    </button>

                    <button 
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#617964] transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#617964]/10 group-hover:text-[#617964] transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      Voltar para o site
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Sair do sistema
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          
          {activeTab === 'overview' ? (
            <>
              {/* Welcome Section */}
              <div className="mb-8 lg:mb-10">
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Olá, Daniel Vale! 👋</h1>
                <p className="text-sm lg:text-base text-gray-500 font-medium">Aqui está o que está acontecendo com seus imóveis hoje.</p>
              </div>

              {/* Pending Users Alert */}
              {usersToApprove.filter(u => u.status === 'pending').length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-6 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Solicitações de Cadastro</h3>
                      <p className="text-xs text-blue-700 font-medium">Existem {usersToApprove.filter(u => u.status === 'pending').length} usuários aguardando aprovação para acessar o sistema.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('users_approval')}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    Ver Solicitações
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
                {[
                  { label: 'Volume em Carteira', value: dashboardStats.totalValue, icon: DollarSign, trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Propostas Recebidas', value: proposals.length.toString(), icon: FileText, trend: '+8%', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Imóveis em Pauta', value: dashboardStats.totalProperties.toString(), icon: Home, trend: '+5%', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Taxa de Conversão', value: '4.2%', icon: TrendingUp, trend: '+2%', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stat.trend}
                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl lg:text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Chart Section */}
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                  <div 
                    className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-sm border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">Desempenho Comercial</h3>
                        <p className="text-sm text-gray-500 font-medium">Visualização de crescimento mensal</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100">7 Dias</button>
                        <button className="px-4 py-2 bg-[#617964] rounded-xl text-xs font-bold text-white shadow-lg shadow-[#617964]/20">30 Dias</button>
                      </div>
                    </div>
                    
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardStats.chartData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#617964" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#617964" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                              padding: '16px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#617964" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Agenda Section on Overview */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-gray-900">Agenda do Dia</h3>
                      <button 
                        onClick={() => setActiveTab('calendar')}
                        className="text-xs font-black text-[#617964] uppercase tracking-widest hover:underline"
                      >
                        Ver Agenda Completa
                      </button>
                    </div>
                    <AgendaTab calendarOnly={true} />
                  </div>

                  {/* Recent Leads Table */}
                  <div 
                    className="bg-white rounded-[32px] lg:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6 lg:p-8 flex items-center justify-between border-b border-gray-50">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">Leads Recentes</h3>
                        <p className="text-sm text-gray-500 font-medium">Interações em tempo real</p>
                      </div>
                      <button className="flex items-center gap-2 text-[#617964] font-black text-sm hover:gap-3 transition-all">
                        Ver Todos <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lead</th>
                            <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Imóvel</th>
                            <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {proposals.slice(0, 5).map((proposal) => (
                            <tr key={proposal.id} className="hover:bg-gray-50/30 transition-colors group">
                              <td className="px-6 lg:px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 font-black text-xs group-hover:bg-[#617964] group-hover:text-white transition-all">
                                    {proposal.userName?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900 text-sm">{proposal.userName}</p>
                                    <p className="text-xs text-gray-500 font-medium hidden sm:block">{proposal.userEmail}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 lg:px-8 py-5 hidden md:table-cell">
                                <p className="text-sm font-bold text-gray-700">{proposal.propertyName}</p>
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" /> Recebido em {proposal.createdAt?.toDate ? proposal.createdAt.toDate().toLocaleDateString() : new Date(proposal.createdAt).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="px-6 lg:px-8 py-5">
                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 w-fit ${
                                  proposal.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                                  proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                                  'bg-red-50 text-red-600'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    proposal.status === 'pending' ? 'bg-blue-600' :
                                    proposal.status === 'accepted' ? 'bg-emerald-600' :
                                    'bg-red-600'
                                  }`}></div>
                                  {proposal.status === 'pending' ? 'Novo' : proposal.status === 'accepted' ? 'Aceito' : 'Recusado'}
                                </div>
                              </td>
                              <td className="px-6 lg:px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#617964] hover:bg-[#617964]/10 transition-all">
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6 lg:space-y-8">
                  
                  {/* Portfolio Distribution */}
                  <div 
                    className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-sm border border-gray-100"
                  >
                    <h3 className="text-xl font-black text-gray-900 mb-6">Distribuição</h3>
                    <div className="h-[200px] lg:h-[240px] w-full mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardStats.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {dashboardStats.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {dashboardStats.pieData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-sm text-gray-600 font-bold">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions / Tasks */}
                  <div 
                    className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] shadow-sm border border-gray-100"
                  >
                    <h3 className="text-xl font-black text-gray-900 mb-6">Tarefas do Dia</h3>
                    <div className="space-y-4">
                      {todaysTasks.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[32px]">
                           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                             <CheckCircle2 className="w-6 h-6 text-gray-300" />
                           </div>
                           <p className="text-sm font-bold text-gray-400">Nenhuma tarefa para hoje</p>
                           <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Aproveite para prospectar!</p>
                        </div>
                      ) : (
                        todaysTasks.map((event) => {
                          const title = event.type === 'tarefa' ? event.titulo : 
                                       event.type === 'visita' ? `Visita: ${event.nomeCliente || 'Cliente'}` :
                                       event.type === 'captacao' ? `Captação: ${event.nomeProprietario || 'Imóvel'}` :
                                       event.type === 'reuniao' ? `Reunião: ${event.assunto || 'Sem assunto'}` : 'Compromisso';
                          
                          return (
                            <div 
                              key={event.id} 
                              onClick={() => handleToggleTask(event.id, !!event.done)}
                              className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                                event.done 
                                  ? 'bg-gray-50 border-transparent opacity-60' 
                                  : 'bg-white border-gray-100 hover:border-[#617964]/30 group'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                event.done 
                                  ? 'bg-emerald-100 text-emerald-600' 
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-[#617964] group-hover:text-white'
                              }`}>
                                {event.done ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-bold ${event.done ? 'line-through text-gray-400' : 'text-gray-900 group-hover:text-[#617964]'}`}>
                                  {title}
                                </p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.horario}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <button 
                      onClick={() => setActiveTab('calendar')}
                      className="w-full mt-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm font-bold hover:border-[#617964] hover:text-[#617964] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Gerenciar Agenda
                    </button>
                  </div>

                </div>
              </div>
            </>
          ) : activeTab === 'brokers' ? (
            <div
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Corretores</h1>
                  <p className="text-sm lg:text-base text-gray-500 font-medium">Gerencie a equipe de corretores da sua imobiliária.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsEditingBroker(false);
                    setNewBrokerData({ name: '', role: '', photo: '', phone: '', email: '', bio: '', creci: '', instagram: '' });
                    setIsBrokerModalOpen(true);
                  }}
                  className="bg-[#617964] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Corretor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-12 max-w-6xl mx-auto">
                {brokers.map((broker) => {
                  const brokerProperties = properties.filter(p => p.broker === broker.name);
                  const latestProperty = brokerProperties.length > 0 ? brokerProperties[0] : null;
                  const propertyImage = latestProperty ? (latestProperty.images?.[0] || latestProperty.image) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={broker.id}
                      className="relative bg-white rounded-[40px] shadow-sm border border-gray-100 group pt-20 max-w-[340px] mx-auto w-full"
                    >
                      {/* Background Property Image with Blur */}
                      <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden rounded-t-[40px]">
                        <img 
                          src={propertyImage} 
                          alt="Latest Property"
                          className="w-full h-full object-cover blur-md scale-110 opacity-30 transition-transform duration-700 group-hover:scale-125"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
                      </div>

                      {/* Broker Image in Circle - "Leaving the canvas" */}
                      <div className="relative flex justify-center -mt-28 mb-4">
                        <div className="w-36 h-36 rounded-full border-[10px] border-white shadow-xl overflow-hidden z-10 transition-transform duration-500 group-hover:scale-105">
                          <img 
                            src={broker.photo} 
                            alt={broker.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <div className="p-6 relative z-20">
                        <div className="text-center mb-6">
                          <h3 className="font-black text-gray-900 text-lg leading-tight">{broker.name}</h3>
                          <p className="text-[#617964] font-bold text-xs uppercase tracking-widest">{broker.role}</p>
                        </div>

                        <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-2xl">
                          <div className="text-xs text-gray-500 font-bold flex items-center gap-3">
                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Phone className="w-3 h-3 text-[#617964]" />
                            </div>
                            {broker.phone}
                          </div>
                          <div className="text-xs text-gray-500 font-bold flex items-center gap-3">
                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Mail className="w-3 h-3 text-[#617964]" />
                            </div>
                            {broker.email}
                          </div>
                          {broker.creci && (
                            <div className="text-xs text-gray-500 font-bold flex items-center gap-3">
                              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <ShieldCheck className="w-3 h-3 text-[#617964]" />
                              </div>
                              CRECI: {broker.creci}
                            </div>
                          )}
                          {broker.instagram && (
                            <div className="text-xs text-gray-500 font-bold flex items-center gap-3">
                              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Instagram className="w-3 h-3 text-[#617964]" />
                              </div>
                              @{broker.instagram}
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-6 font-medium text-center px-2">
                          {broker.bio}
                        </p>

                        <button 
                          onClick={() => navigate(`/corretor/${broker.id}`)}
                          className="w-full py-3 mb-6 bg-gray-50 text-gray-900 rounded-2xl text-xs font-black hover:bg-[#617964] hover:text-white transition-all border border-gray-100 flex items-center justify-center gap-2 group/btn"
                        >
                          Ver Perfil Completo
                          <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </button>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <button 
                            onClick={() => handleEditBroker(broker)}
                            className="px-4 py-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#617964] hover:bg-[#617964]/10 transition-all flex items-center gap-2 text-xs font-black"
                          >
                            <Edit className="w-4 h-4" /> Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteBroker(broker.id)}
                            className="p-2 bg-red-50 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ) : activeTab === 'users_approval' ? (
            <div className="space-y-12">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Controle de Acessos</h1>
                <p className="text-sm lg:text-base text-gray-500 font-medium">Visualize solicitações pendentes e o histórico de aprovações.</p>
              </div>

              {/* Pendentes */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900">Solicitações Pendentes</h2>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full">
                      {usersToApprove.filter(u => u.status === 'pending').length}
                    </span>
                  </div>
                  {usersToApprove.filter(u => u.status === 'pending').length > 0 && (
                    <button
                      onClick={() => setUsersToClearStatus('pending')}
                      className="text-xs font-black text-red-500 hover:text-red-600 bg-red-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Limpar Todos
                    </button>
                  )}
                </div>
                
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">CRECI</th>
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Contato</th>
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {usersToApprove.filter(u => u.status === 'pending').length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-12 text-center">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <Users className="w-10 h-10 text-gray-200" />
                                <p className="text-gray-400 font-bold text-sm">Não há solicitações aguardando aprovação.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          usersToApprove.filter(u => u.status === 'pending').map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase tracking-widest">
                                    {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-black text-gray-900 text-sm truncate">{u.name || 'Sem nome'}</p>
                                    <p className="text-xs text-gray-500 font-medium truncate">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="text-sm font-bold text-gray-900">{u.creci || 'Não informado'}</div>
                              </td>
                              <td className="p-6">
                                <div className="text-sm font-bold text-gray-900">{u.phone || 'Não informado'}</div>
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.id, 'approved')}
                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-2 text-xs font-black"
                                    title="Aprovar Usuário"
                                  >
                                    <Check className="w-4 h-4" /> Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.id, 'rejected')}
                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 text-xs font-black"
                                    title="Rejeitar Usuário"
                                  >
                                    <X className="w-4 h-4" /> Recusar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                                    title="Excluir Usuário"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Aprovados */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-xl font-black text-gray-900">Corretores Aprovados</h2>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full">
                    {usersToApprove.filter(u => u.status === 'approved').length}
                  </span>
                </div>
                
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">CRECI</th>
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {usersToApprove.filter(u => u.status === 'approved').length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-12 text-center text-gray-400 font-bold text-sm">
                              Nenhum corretor aprovado ainda.
                            </td>
                          </tr>
                        ) : (
                          usersToApprove.filter(u => u.status === 'approved').map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs uppercase tracking-widest">
                                    {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900 text-sm">{u.name || 'Sem nome'}</p>
                                    <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="text-sm font-bold text-gray-900">{u.creci || '-'}</div>
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.id, 'rejected')}
                                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all font-black text-[10px] uppercase tracking-wider flex items-center gap-2"
                                    title="Revogar Acesso"
                                  >
                                    <X className="w-4 h-4" /> Revogar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Reprovados */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                    <h2 className="text-xl font-black text-gray-900">Solicitações Recusadas</h2>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full">
                      {usersToApprove.filter(u => u.status === 'rejected').length}
                    </span>
                  </div>
                  {usersToApprove.filter(u => u.status === 'rejected').length > 0 && (
                    <button
                      onClick={() => setUsersToClearStatus('rejected')}
                      className="text-xs font-black text-red-500 hover:text-red-600 bg-red-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Limpar Todos
                    </button>
                  )}
                </div>
                
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                          <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {usersToApprove.filter(u => u.status === 'rejected').length === 0 ? (
                          <tr>
                            <td colSpan={2} className="p-12 text-center text-gray-400 font-bold text-sm">
                              Nenhuma solicitação recusada.
                            </td>
                          </tr>
                        ) : (
                          usersToApprove.filter(u => u.status === 'rejected').map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors opacity-80">
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xs uppercase tracking-widest">
                                    {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900 text-sm">{u.name || 'Sem nome'}</p>
                                    <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.id, 'approved')}
                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all font-black text-[10px] uppercase tracking-wider flex items-center gap-2"
                                    title="Aprovar Agora"
                                  >
                                    <Check className="w-4 h-4" /> Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                    title="Excluir Definitivamente"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'condos' ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Condomínios</h1>
                  <p className="text-sm lg:text-base text-gray-500 font-medium">Gerencie todos os condomínios cadastrados.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsEditingCondo(false);
                    setEditingCondoId(null);
                    setNewCondoData({
                      name: '',
                      location: '',
                      portariaType: 'Não possui',
                      gasSupply: 'botijão',
                      leisure: [],
                      verticalConveniencies: [],
                      horizontalConveniencies: [],
                      bio: '',
                      image360Url: '',
                      logoUrl: '',
                      images: ['']
                    });
                    setIsCondoModalOpen(true);
                  }}
                  className="bg-[#617964] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Cadastrar Condomínio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {condos.map((condo) => (
                  <div
                    key={condo.id}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 group"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      {condo.images && condo.images.length > 0 ? (
                        <img 
                          src={condo.images[0]} 
                          alt={condo.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <ShieldCheck className="w-12 h-12 text-gray-200 mb-2" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sem foto</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-black text-gray-900 leading-tight mb-1">{condo.name}</h3>
                      <p className="text-xs text-gray-500 font-medium mb-4 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {condo.location || 'Localização não informada'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          Portaria: {condo.portariaType}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          Gás: {condo.gasSupply}
                        </span>
                        {(condo.leisure?.length || 0) > 0 && (
                          <span className="px-2 py-1 bg-[#617964]/10 text-[#617964] text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {condo.leisure?.length} Itens de Lazer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#617964]/10 rounded-xl border border-[#617964]/20">
                            <Home className="w-3.5 h-3.5 text-[#617964]" />
                            <span className="text-xs font-black text-[#617964]">
                              {properties.filter(p => p.condoId === condo.id).length} {properties.filter(p => p.condoId === condo.id).length === 1 ? 'Imóvel' : 'Imóveis'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditCondo(condo)}
                            className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#617964] hover:bg-[#617964]/10 transition-all"
                            title="Editar Condomínio"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCondo(condo.id)}
                            className="p-2 bg-red-50 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-100 hover:shadow-md transition-all"
                            title="Excluir Condomínio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'proposals' ? (
            <div className="space-y-12">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Propostas Recebidas</h1>
                <p className="text-sm lg:text-base text-gray-500 font-medium">Acompanhe e gerencie as propostas de compra dos seus clientes.</p>
              </div>

              {/* Pendentes */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-black text-gray-900">Novas Propostas</h2>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full">
                    {proposals.filter(p => !p.status || p.status === 'pending').length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {proposals.filter(p => !p.status || p.status === 'pending').length === 0 ? (
                    <div className="bg-gray-50/50 p-8 rounded-[32px] border border-dashed border-gray-200 text-center">
                      <p className="text-gray-400 font-bold text-sm">Nenhuma proposta pendente.</p>
                    </div>
                  ) : (
                    proposals.filter(p => !p.status || p.status === 'pending').map((proposal) => renderProposalCard(proposal))
                  )}
                </div>
              </div>

              {/* Aceitas */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-xl font-black text-gray-900">Propostas Aceitas</h2>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full">
                    {proposals.filter(p => p.status === 'accepted').length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {proposals.filter(p => p.status === 'accepted').length === 0 ? (
                    <div className="bg-gray-50/50 p-8 rounded-[32px] border border-dashed border-gray-200 text-center">
                      <p className="text-gray-400 font-bold text-sm">Nenhuma proposta aceita ainda.</p>
                    </div>
                  ) : (
                    proposals.filter(p => p.status === 'accepted').map((proposal) => renderProposalCard(proposal))
                  )}
                </div>
              </div>

              {/* Recusadas */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                  <h2 className="text-xl font-black text-gray-900">Propostas Recusadas</h2>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full">
                    {proposals.filter(p => p.status === 'rejected').length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {proposals.filter(p => p.status === 'rejected').length === 0 ? (
                    <div className="bg-gray-50/50 p-8 rounded-[32px] border border-dashed border-gray-200 text-center">
                      <p className="text-gray-400 font-bold text-sm">Nenhuma proposta recusada.</p>
                    </div>
                  ) : (
                    proposals.filter(p => p.status === 'rejected').map((proposal) => renderProposalCard(proposal))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'properties' ? (
            <div
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Todos Imóveis</h1>
                  <p className="text-sm lg:text-base text-gray-500 font-medium">Gerencie todos os imóveis dos seus corretores.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleAddProperty}
                    className="bg-[#617964] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Cadastrar Imóvel
                  </button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="relative group/tabs mb-6">
                <div 
                  id="broker-dashboard-categories" 
                  className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-x-auto no-scrollbar scroll-smooth relative z-10"
                >
                  <div className="flex items-center gap-3 min-w-max lg:pr-12 lg:pl-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-[#617964] text-white shadow-lg shadow-[#617964]/20'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    Todos
                  </button>

                  {/* Special Tab for Lançamentos as it's a major section */}
                  <button
                    onClick={() => setSelectedCategory('lançamento')}
                    className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-3 border ${
                      selectedCategory === 'lançamento'
                        ? 'bg-[#374001] text-white border-[#374001] shadow-lg shadow-[#374001]/20'
                        : 'bg-white text-gray-400 border-gray-100 hover:border-[#617964] hover:text-[#617964]'
                    } group`}
                  >
                    <div className={`${selectedCategory === 'lançamento' ? 'text-white' : 'text-[#617964]'} group-hover:scale-110 transition-all`}>
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[8px] uppercase opacity-60 font-bold">Imóveis em</p>
                      <p className="text-[10px] font-black uppercase tracking-tight">Lançamento</p>
                    </div>
                  </button>

                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-3 border ${
                        selectedCategory === cat.slug
                          ? 'bg-[#374001] text-white border-[#374001] shadow-lg shadow-[#374001]/20'
                          : 'bg-white text-gray-400 border-gray-100 hover:border-[#617964] hover:text-[#617964]'
                      } group`}
                    >
                      <div className={`${selectedCategory === cat.slug ? 'text-white' : 'text-[#617964]'} group-hover:scale-110 transition-all`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[8px] uppercase opacity-60 font-bold">{cat.label1}</p>
                        <p className="text-[10px] font-black uppercase tracking-tight">{cat.label2}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Left Scroll Button */}
              <button
                onClick={() => {
                  const el = document.getElementById('broker-dashboard-categories');
                  if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#617964] text-[#F3EFE6] hover:bg-[#374001] rounded-full shadow-lg items-center justify-center transition-all opacity-0 group-hover/tabs:opacity-100 cursor-pointer hidden md:flex"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Scroll Button */}
              <button
                onClick={() => {
                  const el = document.getElementById('broker-dashboard-categories');
                  if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#617964] text-[#F3EFE6] hover:bg-[#374001] rounded-full shadow-lg items-center justify-center transition-all opacity-0 group-hover/tabs:opacity-100 cursor-pointer hidden md:flex"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties
                  .filter(p => {
                    if (selectedCategory === 'all') return true;
                    if (selectedCategory === 'lançamento') return p.listingType === 'lançamento';
                    
                    // Robust filtering: check slug OR label match
                    const categoryMatch = p.categorySlug === selectedCategory;
                    const labelMatch = p.category?.toLowerCase().includes(selectedCategory.replace(/-/g, ' '));
                    return categoryMatch || labelMatch;
                  })
                  .map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 group"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      {(!property.image || property.image.includes('pe07Ikg.png')) && (!property.images || property.images.length === 0 || property.images[0] === '') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-500 group-hover:scale-110">
                          <img 
                            src="https://i.imgur.com/egg4k7M.png" 
                            alt="CR Imóveis" 
                            className="absolute inset-0 w-full h-full object-contain opacity-5 p-6"
                            referrerPolicy="no-referrer"
                          />
                          <Home className="w-8 h-8 text-gray-300 mb-2 relative z-10" />
                          <span className="text-[10px] font-bold text-gray-400 relative z-10 uppercase tracking-wider">Imóvel sem foto</span>
                        </div>
                      ) : (
                        <img 
                          src={property.images && property.images.length > 0 && property.images[0] !== '' ? property.images[0] : property.image} 
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xl">
                          {property.broker || 'Daniel CEO'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-black text-gray-900 leading-tight">{property.title}</h3>
                        <p className="text-[#617964] font-black text-sm whitespace-nowrap ml-4">{property.price}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {property.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-4 flex items-center gap-1">
                        <Home className="w-3 h-3" /> {property.location}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditProperty(property)}
                            className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#617964] hover:bg-[#617964]/10 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/imovel/${property.id}`)}
                            className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 bg-red-50 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'leads' ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Captações de Imóveis</h1>
                  <p className="text-sm lg:text-base text-gray-500 font-medium">Gerencie os leads de pessoas que querem vender ou alugar imóveis.</p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Data</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Proprietário</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Imóvel</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Localização</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Valor</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                            Nenhuma captação encontrada.
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6">
                              <div className="text-sm font-bold text-gray-900">
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="text-sm font-bold text-gray-900">{lead.ownerName}</div>
                              <div className="text-xs text-gray-500">{lead.ownerEmail}</div>
                              <div className="text-xs text-gray-500">{lead.ownerMobile || lead.ownerPhone}</div>
                            </td>
                            <td className="p-6">
                              <div className="text-sm font-bold text-gray-900 capitalize">{lead.propertyType}</div>
                              <div className="text-xs text-gray-500 capitalize">Para {lead.transactionType}</div>
                              <div className="text-xs text-gray-500">{lead.bedrooms} dorms • {lead.suites} suítes • {lead.parking} vagas</div>
                            </td>
                            <td className="p-6">
                              <div className="text-sm font-bold text-gray-900">{lead.neighborhood}</div>
                              <div className="text-xs text-gray-500">{lead.street}, {lead.number}</div>
                            </td>
                            <td className="p-6">
                              <div className="text-sm font-bold text-[#617964]">R$ {lead.price}</div>
                            </td>
                            <td className="p-6 text-right">
                              <button
                                onClick={() => setLeadToDelete(lead.id)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                                title="Excluir captação"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'calendar' ? (
            <AgendaTab />
          ) : activeTab === 'reports' ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Relatórios de Atividade</h1>
                  <p className="text-sm lg:text-base text-gray-500 font-medium">Log completo de todas as ações realizadas no sistema.</p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Data / Hora</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Ação</th>
                        <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {systemLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                             Nenhum registro de atividade encontrado.
                          </td>
                        </tr>
                      ) : (
                        systemLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-6 whitespace-nowrap">
                              <div className="text-xs font-bold text-gray-900">
                                {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleDateString('pt-BR') : 'Agora'}
                              </div>
                              <div className="text-[10px] text-gray-400 font-black">
                                {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleTimeString('pt-BR') : ''}
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-[#617964] uppercase tracking-tighter">
                                  {log.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{log.userName}</div>
                                  <div className="text-[10px] text-gray-400 font-medium">{log.userEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                log.type === 'lead' ? 'bg-blue-50 text-blue-600' :
                                log.type === 'property' ? 'bg-emerald-50 text-emerald-600' :
                                log.type === 'proposal' ? 'bg-purple-50 text-purple-600' :
                                log.type === 'broker' ? 'bg-amber-50 text-amber-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-6">
                              <p className="text-sm text-gray-500 font-medium line-clamp-2">{log.details}</p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Meu Perfil</h1>
                  <p className="text-sm lg:text-base text-gray-500 font-medium">Gerencie suas informações pessoais e de acesso.</p>
                </div>
                {currentBroker && (
                  <button 
                    onClick={() => handleEditBroker(currentBroker)}
                    className="bg-[#617964] text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Editar Perfil
                  </button>
                )}
              </div>

              {currentBroker ? (
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="relative h-64 bg-[#617964]">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center overflow-hidden">
                      <LayoutDashboard className="w-[500px] h-[500px] -rotate-12" />
                    </div>
                  </div>
                  
                  <div className="px-10 pb-10">
                    <div className="relative flex justify-between items-end -mt-20 mb-8">
                      <div className="w-40 h-40 rounded-full border-[8px] border-white shadow-2xl overflow-hidden bg-gray-100">
                        <img 
                          src={currentBroker.photo} 
                          alt={currentBroker.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-right pb-4">
                        <h2 className="text-3xl font-black text-gray-900">{currentBroker.name}</h2>
                        <p className="text-[#617964] font-black text-sm uppercase tracking-[0.2em]">{currentBroker.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Informações de Contato</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#617964]">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</p>
                              <p className="font-bold text-sm tracking-tight">{currentBroker.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#617964]">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone</p>
                              <p className="font-bold text-sm tracking-tight">{currentBroker.phone}</p>
                            </div>
                          </div>
                          {currentBroker.instagram && (
                             <div className="flex items-center gap-4 text-gray-700">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#617964]">
                                <Instagram className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instagram</p>
                                <p className="font-bold text-sm tracking-tight">@{currentBroker.instagram}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Sobre</h3>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50/50 p-6 rounded-3xl">
                          {currentBroker.bio || 'Nenhuma biografia informada.'}
                        </p>
                        {currentBroker.creci && (
                          <div className="flex items-center gap-3 px-6 py-4 bg-[#617964]/10 rounded-2xl w-fit">
                            <ShieldCheck className="w-5 h-5 text-[#617964]" />
                            <div>
                              <p className="text-[10px] font-black text-[#617964]/50 uppercase tracking-widest">Número do CRECI</p>
                              <p className="text-sm font-black text-[#617964]">{currentBroker.creci}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-20 rounded-[40px] border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-gray-300" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">Perfil não encontrado</h2>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">
                    Não conseguimos localizar seu cadastro de corretor vinculado ao e-mail {user?.email}.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Em Desenvolvimento</h2>
              <p className="text-gray-500 font-medium">Esta seção estará disponível em breve.</p>
            </div>
          )}
        </div>

        {/* Broker Modal */}
        <AnimatePresence>
          {isBrokerModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{isEditingBroker ? 'Editar Corretor' : 'Adicionar Corretor'}</h2>
                    <p className="text-sm text-gray-500 font-medium">Preencha as informações do membro da equipe.</p>
                  </div>
                  <button 
                    onClick={() => setIsBrokerModalOpen(false)}
                    className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveBroker} className="p-8 overflow-y-auto flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        type="text"
                        required
                        value={newBrokerData.name}
                        onChange={(e) => setNewBrokerData({...newBrokerData, name: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                        placeholder="Ex: Simone Silva"
                      />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                      <div 
                        onClick={() => setIsRoleModalOpen(true)}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 cursor-pointer min-h-[56px] flex items-center"
                      >
                        {newBrokerData.role ? (
                          <span className="truncate">{newBrokerData.role}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">Selecione as funções</span>
                        )}
                      </div>

                      {/* Role Selection Modal */}
                      <AnimatePresence>
                        {isRoleModalOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[110] max-h-[300px] overflow-y-auto p-4"
                          >
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                              <h3 className="font-bold text-gray-900">Selecionar Funções</h3>
                              <button 
                                type="button"
                                onClick={() => setIsRoleModalOpen(false)}
                                className="text-sm font-bold text-[#617964] hover:text-[#4a5c4c]"
                              >
                                Concluído
                              </button>
                            </div>
                            <div className="space-y-6">
                              {ROLE_GROUPS.map((group) => (
                                <div key={group.label} className="space-y-2">
                                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{group.label}</h4>
                                  <div className="space-y-1">
                                    {group.roles.map((role) => {
                                      const selectedRoles = newBrokerData.role ? newBrokerData.role.split(', ') : [];
                                      const isSelected = selectedRoles.includes(role);
                                      
                                      return (
                                        <label key={role} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#617964] border-[#617964]' : 'border-gray-300'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                          </div>
                                          <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {role}
                                          </span>
                                          <input 
                                            type="checkbox"
                                            className="hidden"
                                            checked={isSelected}
                                            onChange={(e) => {
                                              let newRoles;
                                              if (e.target.checked) {
                                                newRoles = [...selectedRoles, role];
                                              } else {
                                                newRoles = selectedRoles.filter(r => r !== role);
                                              }
                                              setNewBrokerData({...newBrokerData, role: newRoles.join(', ')});
                                            }}
                                          />
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                      <input 
                        type="text"
                        required
                        value={newBrokerData.phone}
                        onChange={(e) => setNewBrokerData({...newBrokerData, phone: formatPhone(e.target.value)})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                        placeholder="(32) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                      <input 
                        type="email"
                        required
                        value={newBrokerData.email}
                        onChange={(e) => setNewBrokerData({...newBrokerData, email: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                        placeholder="simone@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Número do CRECI</label>
                      <input 
                        type="text"
                        value={newBrokerData.creci}
                        onChange={(e) => setNewBrokerData({...newBrokerData, creci: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                        placeholder="Ex: 12.345-F"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Instagram (Usuário)</label>
                      <div className="relative">
                        <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          value={newBrokerData.instagram}
                          onChange={(e) => setNewBrokerData({...newBrokerData, instagram: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                          placeholder="Ex: simone_corretora"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">URL da Foto</label>
                    <input 
                      type="url"
                      required
                      value={newBrokerData.photo}
                      onChange={(e) => setNewBrokerData({...newBrokerData, photo: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900"
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Biografia / Descrição</label>
                    <textarea 
                      required
                      rows={4}
                      value={newBrokerData.bio}
                      onChange={(e) => setNewBrokerData({...newBrokerData, bio: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#617964] transition-all font-bold text-gray-900 resize-none"
                      placeholder="Conte um pouco sobre a experiência do corretor..."
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsBrokerModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 py-4 bg-[#617964] text-white rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {isEditingBroker ? 'Salvar Alterações' : 'Cadastrar Corretor'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
