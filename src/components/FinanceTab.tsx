import React, { useState, useEffect, useMemo } from 'react';
import { 
  CircleDollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  Minus,
  Calendar as CalendarIcon,
  Filter,
  X,
  Trash2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, getDocs, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { addLog } from '../services/logService';
import { playAlertSound } from '../lib/audio';

const DEFAULT_CATEGORIES = {
  entrada: {
    'Comissões de Venda': ['Comissões de Venda', 'Comissão por intermediação'],
    'Comissões de Locação': ['Taxa de intermediação de aluguel', 'Primeira mensalidade (ou % dela)'],
    'Administração de Aluguel': ['Taxa mensal de administração (% do aluguel)', 'Taxas extras (renovação de contrato, etc.)'],
    'Serviços Extras': ['Avaliação de imóveis', 'Consultoria imobiliária', 'Regularização documental'],
    'Parcerias / Indicações': ['Comissão por indicação de clientes', 'Parcerias com construtoras'],
    'Outras Receitas': ['Multas contratuais recebidas', 'Juros por atraso (se aplicável)']
  },
  saida: {
    'Custos com Equipe': ['Salários', 'Comissões de corretores', 'Bonificações', 'Encargos trabalhistas'],
    'Marketing e Vendas': ['Tráfego pago', 'Portais imobiliários (chaves na mão, OLX, VivaReal)'],
    'Estrutura / Operacional': ['Aluguel da imobiliária', 'Energia, água, internet', 'Material de escritório'],
    'Sistemas e Tecnologia': ['CRM imobiliário', 'Hospedagem de site', 'Domínio', 'Softwares'],
    'Jurídico e Contábil': ['Honorários contábeis', 'Advogado', 'Taxas cartoriais'],
    'Deslocamento': ['Combustível', 'Manutenção de veículo', 'Uber / viagen'],
    'Taxas e Impostos': ['Simples Nacional ou outro regime', 'Taxas bancárias', 'Emissão de boletos'],
    'Manutenção': ['Pequenos reparos em imóveis', 'Limpeza / conservação'],
    'Inadimplência / Perdas': ['Aluguéis não pagos', 'Descontos concedidos', 'Cancelamentos']
  }
};

import { Permissions } from '../constants/permissions';

export function FinanceTab({ permissions }: { permissions: Permissions }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<any>({ entrada: {}, saida: {} });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'entrada' | 'saida'>('entrada');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [timeRange, setTimeRange] = useState<'7days' | 'month' | 'year'>('month');

  useEffect(() => {
    const q = query(collection(db, 'finance_transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'finance_transactions');
    });

    const catUnsub = onSnapshot(collection(db, 'finance_categories'), (snapshot) => {
      const customs = { entrada: {} as any, saida: {} as any };
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === 'entrada' || data.type === 'saida') {
           if (!customs[data.type][data.category]) customs[data.type][data.category] = [];
           if (data.subCategory && !customs[data.type][data.category].includes(data.subCategory)) {
             customs[data.type][data.category].push(data.subCategory);
           }
        }
      });
      setCustomCategories(customs);
    });

    return () => {
      unsubscribe();
      catUnsub();
    }
  }, []);

  const mergedCategories = useMemo(() => {
    const merged = {
      entrada: { ...DEFAULT_CATEGORIES.entrada },
      saida: { ...DEFAULT_CATEGORIES.saida }
    };

    ['entrada', 'saida'].forEach(type => {
      const types = type as 'entrada' | 'saida';
      Object.keys(customCategories[types]).forEach(cat => {
        if (!merged[types][cat]) merged[types][cat] = [];
        const subs = customCategories[types][cat];
        subs.forEach((sub: string) => {
          if (!merged[types][cat].includes(sub)) {
            merged[types][cat].push(sub);
          }
        });
      });
    });
    return merged;
  }, [customCategories]);

  // Aggregate Data for Chart
  const chartData = useMemo(() => {
    const now = new Date();
    const dataMap = new Map<string, { date: string, label: string, entrada: number, saida: number }>();
    
    let daysToGenerate = 0;
    if (timeRange === '7days') daysToGenerate = 7;
    else if (timeRange === 'month') daysToGenerate = 30;
    else if (timeRange === 'year') daysToGenerate = 12; // Months

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      if (timeRange === 'year') {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7); // YYYY-MM
        const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        dataMap.set(key, { date: key, label, entrada: 0, saida: 0 });
      } else {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        dataMap.set(key, { date: key, label, entrada: 0, saida: 0 });
      }
    }

    transactions.forEach(t => {
      if (!t.date || !t.amount) return;
      
      const tDate = new Date(t.date);
      let key = t.date;
      
      if (timeRange === 'year') {
        key = t.date.slice(0, 7);
      }

      if (dataMap.has(key)) {
        const item = dataMap.get(key)!;
        if (t.type === 'entrada') item.entrada += Number(t.amount);
        else item.saida += Number(t.amount);
      }
    });

    return Array.from(dataMap.values());
  }, [transactions, timeRange]);

  const summary = useMemo(() => {
    let entrada = 0;
    let saida = 0;
    
    // Filter transactions by selected range for summary
    const now = new Date();
    let cutoff = new Date(0);
    if (timeRange === '7days') cutoff = new Date(now.setDate(now.getDate() - 7));
    else if (timeRange === 'month') cutoff = new Date(now.setMonth(now.getMonth() - 1));
    else if (timeRange === 'year') cutoff = new Date(now.setFullYear(now.getFullYear() - 1));

    transactions.forEach(t => {
      if (new Date(t.date) >= cutoff) {
        if (t.type === 'entrada') entrada += Number(t.amount);
        else saida += Number(t.amount);
      }
    });

    return { entrada, saida, balance: entrada - saida };
  }, [transactions, timeRange]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenModal = (type: 'entrada' | 'saida') => {
    setModalType(type);
    setAmount('');
    setCategory('');
    setSubCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    const numAmount = parseFloat(amount.replace(/\D/g, '')) / 100;
    
    try {
      setIsModalOpen(false);
      
      await addDoc(collection(db, 'finance_transactions'), {
        type: modalType,
        amount: numAmount,
        category,
        subCategory,
        description,
        date,
        createdAt: serverTimestamp()
      });

      // Check if category is custom, save it for future
      const isCustomCat = !DEFAULT_CATEGORIES[modalType][category];
      const isCustomSub = subCategory && !(DEFAULT_CATEGORIES[modalType][category] || []).includes(subCategory);
      
      if (isCustomCat || isCustomSub) {
        await addDoc(collection(db, 'finance_categories'), {
          type: modalType,
          category,
          subCategory: subCategory || '',
          createdAt: serverTimestamp()
        });
      }

      const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numAmount);
      await addLog(
        'finance',
        `Nova ${modalType === 'entrada' ? 'Entrada' : 'Saída'}`,
        `Adicionou ${formattedAmount} em ${category}${subCategory ? ` - ${subCategory}` : ''}`
      );

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'finance_transactions');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const docRef = doc(db, 'finance_transactions', id);
      setTransactionToDelete(null); // Close confirmation immediately
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.amount));
        await addLog(
          'finance',
          `Removeu ${data.type === 'entrada' ? 'Entrada' : 'Saída'}`,
          `Removeu o registro de ${formattedAmount} em ${data.category}${data.subCategory ? ` - ${data.subCategory}` : ''}`
        );
      }
      
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'finance_transactions');
    }
  };

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      setAmount('');
      return;
    }
    const num = parseInt(clean) / 100;
    setAmount(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num));
  };
  
  const currentCategoryOptions = Object.keys(mergedCategories[modalType]);
  const currentSubCategoryOptions = category && mergedCategories[modalType][category] ? mergedCategories[modalType][category] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Controle Financeiro</h1>
          <p className="text-sm lg:text-base text-gray-500 font-medium">Gestão de contas, receitas, despesas e comissões.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {permissions.canViewFinance && (
            <>
              <button 
                onClick={() => handleOpenModal('entrada')}
                className="px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nova Entrada
              </button>
              <button 
                onClick={() => handleOpenModal('saida')}
                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Minus className="w-4 h-4" /> Nova Saída
              </button>
            </>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-xl w-fit">
        <button 
          onClick={() => setTimeRange('7days')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === '7days' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          7 Dias
        </button>
        <button 
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Mês
        </button>
        <button 
          onClick={() => setTimeRange('year')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'year' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Ano
        </button>
      </div>

      {/* Finance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Entradas (Receitas)</h3>
              <p className="text-3xl font-black text-gray-900">{formatCurrency(summary.entrada)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 rounded-2xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Saídas (Despesas)</h3>
              <p className="text-3xl font-black text-gray-900">{formatCurrency(summary.saida)}</p>
            </div>
          </div>

          <div className={`p-6 rounded-[32px] shadow-sm flex flex-col justify-between transition-shadow border ${summary.balance >= 0 ? 'bg-[#617964]/5 border-[#617964]/20' : 'bg-red-50/50 border-red-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${summary.balance >= 0 ? 'bg-[#617964]/10' : 'bg-red-100'}`}>
                  <CircleDollarSign className={`w-6 h-6 ${summary.balance >= 0 ? 'text-[#617964]' : 'text-red-600'}`} />
              </div>
            </div>
            <div>
              <h3 className={`font-bold text-sm uppercase tracking-wider mb-1 ${summary.balance >= 0 ? 'text-[#617964]/80' : 'text-red-500'}`}>Saldo no Período</h3>
              <p className={`text-3xl font-black ${summary.balance >= 0 ? 'text-[#617964]' : 'text-red-600'}`}>{formatCurrency(summary.balance)}</p>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 sm:p-8">
           <h2 className="text-lg font-black text-gray-900 mb-6">Visão Geral de Caixa</h2>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#9ca3af'}}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Entradas" dataKey="entrada" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" />
                  <Area type="monotone" name="Saídas" dataKey="saida" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSaida)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Transactions List Column */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col h-[400px]">
           <h2 className="text-lg font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Últimas Movimentações</h2>
           <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
              {transactions.slice(0, 10).map((t, idx) => (
                <div 
                  key={t.id || idx} 
                  title={t.description || ''}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group relative"
                >
                  {/* Tooltip for description */}
                  {t.description && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-3 py-2 bg-gray-800 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-pre-wrap z-30 w-48 shadow-xl text-center font-medium border border-white/10 backdrop-blur-sm">
                      {t.description}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-gray-800" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${t.type === 'entrada' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'entrada' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.subCategory || t.category || (t.type === 'entrada' ? 'Entrada' : 'Saída')}</p>
                      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {new Date(t.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-black text-sm tracking-tight ${t.type === 'entrada' ? 'text-emerald-600' : 'text-gray-900'}`}>
                       {t.type === 'entrada' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </div>
                    {transactionToDelete === t.id ? (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setTransactionToDelete(null)}
                          className="px-2 py-1 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="px-2 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                          Confirmar
                        </button>
                      </div>
                    ) : (
                      permissions.canViewFinance && (
                        <button 
                          onClick={() => {
                            playAlertSound();
                            setTransactionToDelete(t.id);
                          }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remover transação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
             ))}
             {transactions.length === 0 && (
               <div className="text-center py-8 text-gray-400 font-medium text-sm">
                 Nenhuma movimentação registrada.
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start p-4 bg-gray-900/40 backdrop-blur-sm sm:p-6 sm:justify-center overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden my-auto border border-gray-100">
            <div className={`p-6 text-white flex items-center justify-between ${modalType === 'entrada' ? 'bg-emerald-500' : 'bg-red-500'}`}>
               <h2 className="text-xl font-black">
                 Adicionar {modalType === 'entrada' ? 'Nova Entrada' : 'Nova Saída'}
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <form onSubmit={handleSaveTransaction} className="p-8 space-y-6">
              
              <div className="space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase">Valor (R$)</label>
                 <input 
                   type="text" 
                   value={amount}
                   onChange={(e) => handleAmountChange(e.target.value)}
                   placeholder="0,00"
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-xl font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                   required
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase">Data</label>
                 <input 
                   type="date" 
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all text-gray-700"
                   required
                 />
              </div>

              <div className="space-y-2 relative">
                 <label className="text-xs font-black text-gray-400 uppercase flex items-center justify-between">
                    Categoria principal
                    <span className="text-[10px] lowercase font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">ou digite uma nova</span>
                 </label>
                 <input 
                   list="categories" 
                   value={category}
                   onChange={(e) => {
                     setCategory(e.target.value);
                     setSubCategory('');
                   }}
                   placeholder="Selecione ou digite"
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                   required
                 />
                 <datalist id="categories">
                   {currentCategoryOptions.map(c => <option key={c} value={c} />)}
                 </datalist>
              </div>

              <div className="space-y-2 relative">
                 <label className="text-xs font-black text-gray-400 uppercase flex items-center justify-between">
                    Sub-Categoria / Detalhe
                    <span className="text-[10px] lowercase font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">ou digite uma nova</span>
                 </label>
                 <input 
                   list="subcategories" 
                   value={subCategory}
                   onChange={(e) => setSubCategory(e.target.value)}
                   placeholder="Especifique o tipo (Opcional)"
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                 />
                 <datalist id="subcategories">
                   {currentSubCategoryOptions.map(sc => <option key={sc} value={sc} />)}
                 </datalist>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase">Observações (Opcional)</label>
                 <textarea 
                   rows={2}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Descreva a transação em detalhes..."
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                 />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(false)}
                   className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit"
                   className={`px-8 py-3 text-white rounded-xl text-sm font-black shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 ${modalType === 'entrada' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`}
                 >
                   Salvar Transação
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
