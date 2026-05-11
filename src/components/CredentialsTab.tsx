import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Search,
  Mail,
  User,
  ExternalLink,
  Save,
  X,
  Lock
} from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

interface Credential {
  id: string;
  name: string;
  email: string;
  password: string;
  notes?: string;
  createdAt: any;
}

export function CredentialsTab() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    notes: ''
  });

  useEffect(() => {
    // Only fetch if it's the correct user (extra safety)
    if (auth.currentUser?.email !== 'danielvaleweb@gmail.com') return;

    const q = query(collection(db, 'team_credentials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Credential[];
      setCredentials(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'team_credentials'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setFormData({ name: '', email: '', password: '', notes: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding credential:", error);
      alert("Erro ao salvar credencial.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta credencial?")) return;
    try {
      await deleteDoc(doc(db, 'team_credentials', id));
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCredentials = credentials.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-black text-[#617964] flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Credenciais da Equipe
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento seguro de acessos (disponível apenas para você)</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#617964] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#4a5c4c] transition-all shadow-lg shadow-[#617964]/20"
        >
          <Plus className="w-4 h-4" />
          Nova Credencial
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#617964] outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCredentials.map((cred) => (
            <motion.div
              key={cred.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#617964]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{cred.name || 'Sem nome'}</h3>
                    <p className="text-xs text-gray-500">Adicionado em {cred.createdAt?.toDate ? new Date(cred.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cred.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{cred.email}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(cred.email, `${cred.id}-email`)}
                    className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-[#617964]"
                  >
                    {copiedId === `${cred.id}-email` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <KeyRound className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-mono text-gray-600 truncate">
                      {showPasswords[cred.id] ? cred.password : '••••••••••••'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => togglePassword(cred.id)}
                      className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-[#617964]"
                    >
                      {showPasswords[cred.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(cred.password, `${cred.id}-pass`)}
                      className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-[#617964]"
                    >
                      {copiedId === `${cred.id}-pass` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {cred.notes && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Observações</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{cred.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCredentials.length === 0 && !isLoading && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Nenhuma credencial encontrada</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Comece adicionando as credenciais de acesso da sua equipe para nunca mais perdê-las.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-black text-[#617964]">Nova Credencial</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddCredential} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nome do Membro</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#617964] outline-none transition-all"
                    placeholder="Ex: João Corretor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">E-mail de Acesso</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#617964] outline-none transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Senha</label>
                  <input
                    required
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#617964] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#617964] outline-none transition-all h-24 resize-none"
                    placeholder="Algum lembrete importante..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-[#617964] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4a5c4c] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
