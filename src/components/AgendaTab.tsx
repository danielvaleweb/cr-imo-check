import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, MapPin, Video, Users, Clock, AlertCircle, Phone, Mail, Link as LinkIcon, Download, Check, ExternalLink, X, MessageCircle, ChevronDown, ChevronUp, ChevronRight, Building } from 'lucide-react';
import { useBrokers } from '../context/BrokerContext';
import { useCondos } from '../context/CondoContext';
import { collection, onSnapshot, addDoc, serverTimestamp, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { addLog } from '../services/logService';
import { Trash, Edit2, Eye, User } from 'lucide-react';
import { playAlertSound } from '../lib/audio';

import { Permissions } from '../constants/permissions';

interface AgendaTabProps {
  calendarOnly?: boolean;
  permissions?: Permissions;
}

export function AgendaTab({ calendarOnly = false, permissions }: AgendaTabProps) {
  const { brokers } = useBrokers();
  const { condos } = useCondos();
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedDayLabel, setSelectedDayLabel] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [eventType, setEventType] = useState<'captacao' | 'visita' | 'reuniao' | 'tarefa'>('captacao');
  
  // Shared
  const [local, setLocal] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressCondo, setAddressCondo] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [tituloTarefa, setTituloTarefa] = useState('');
  const [envolveQuem, setEnvolveQuem] = useState<string[]>([]);
  const [assunto, setAssunto] = useState('');
  const [quemVai, setQuemVai] = useState<string[]>([]);
  
  // Captação
  const [temFilmagem, setTemFilmagem] = useState(false);
  const [temDrone, setTemDrone] = useState(false);
  const [proprietarioAvisado, setProprietarioAvisado] = useState(false);
  const [quemVaiFilmar, setQuemVaiFilmar] = useState<'daniel' | 'terceirizado'>('daniel');
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [telefoneProprietario, setTelefoneProprietario] = useState('');
  const [emailProprietario, setEmailProprietario] = useState('');

  // Visita
  const [termoAssinado, setTermoAssinado] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [encontroLocal, setEncontroLocal] = useState<'no_local' | 'na_imobiliaria'>('no_local');

  // Reunião

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['tarefa', 'visita', 'captacao', 'reuniao']);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleEventExpand = (id: string) => {
    setExpandedEvents(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const q = query(collection(db, 'agenda_events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    }, (error) => {
      console.warn("Agenda read error (permissions likely locked):", error);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async () => {
    try {
      const existingEvent = isEditMode ? events.find(e => e.id === editingEventId) : null;
      
      const authorInfo = existingEvent?.createdBy || {
        name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Corretor',
        email: auth.currentUser?.email,
        uid: auth.currentUser?.uid,
        photo: auth.currentUser?.photoURL
      };

      // Construct a combined local string for display/GPS if split fields are used
      let combinedLocal = local;
      if (addressStreet || addressCity) {
        const parts = [
          addressStreet && `${addressStreet}${addressNumber ? `, ${addressNumber}` : ''}`,
          addressCondo,
          addressNeighborhood,
          addressCity,
          addressState
        ].filter(Boolean);
        combinedLocal = parts.join(' - ');
      }

      const baseData: any = {
        type: eventType,
        local: combinedLocal,
        addressStreet,
        addressNumber,
        addressCondo,
        addressNeighborhood,
        addressCity,
        addressState,
        data,
        horario,
        status: 'confirmed',
        updatedAt: serverTimestamp(),
        createdBy: authorInfo
      };

      let specificData = {};
      if (eventType === 'captacao') {
        specificData = {
          quemVai,
          temFilmagem,
          temDrone,
          proprietarioAvisado,
          quemVaiFilmar,
          nomeProprietario,
          telefoneProprietario,
          emailProprietario
        };
      } else if (eventType === 'visita') {
        specificData = {
          termoAssinado,
          nomeCliente,
          telefoneCliente,
          emailCliente,
          encontroLocal,
          envolveQuem
        };
      } else if (eventType === 'reuniao') {
        specificData = { 
          assunto,
          envolveQuem
        };
      } else if (eventType === 'tarefa') {
        specificData = {
          titulo: tituloTarefa,
          envolveQuem,
        };
      }

      const finalData = { ...baseData, ...specificData };

      setIsModalOpen(false);
      resetForm();

      let docId = editingEventId;
      if (isEditMode && editingEventId) {
        await updateDoc(doc(db, 'agenda_events', editingEventId), finalData);
        await addLog('agenda', 'Editou compromisso', `${finalData.type === 'visita' ? 'Visita' : 'Tarefa'}: ${finalData.type === 'visita' ? finalData.nomeCliente : finalData.tituloTarefa}`);
      } else {
        const docRef = await addDoc(collection(db, 'agenda_events'), { ...finalData, createdAt: serverTimestamp() });
        docId = docRef.id;
        await addLog('agenda', 'Agendou compromisso', `${finalData.type === 'visita' ? 'Visita' : 'Tarefa'}: ${finalData.type === 'visita' ? finalData.nomeCliente : finalData.tituloTarefa}`);

        // Notify participants
        const participants = eventType === 'captacao' ? quemVai : 
                            (eventType === 'visita' ? quemVai : envolveQuem); // Visita also uses quemVai for brokers
        if (participants && participants.length > 0) {
           for (const memberName of participants) {
             const broker = brokers.find(b => b.name === memberName);
             if (broker && broker.id.toString() !== auth.currentUser?.uid) {
               const eventLabel = {
                 'captacao': 'Captação',
                 'visita': 'Visita',
                 'reuniao': 'Reunião',
                 'tarefa': 'Tarefa'
               }[eventType];

               const detail = eventType === 'tarefa' ? tituloTarefa : 
                             eventType === 'visita' ? `com ${nomeCliente}` :
                             eventType === 'reuniao' ? assunto : '';

               let title = `Novo Compromisso: ${eventLabel}`;
               let message = `Você foi incluído no(a) ${eventLabel.toLowerCase()}${detail ? ': ' + detail : ''}. Horário: ${horario}`;

               // Refine wording based on user request
               if (eventType === 'tarefa') {
                 title = 'Nova Tarefa';
                 message = `Hoje você tem uma nova tarefa: ${detail}.`;
               } else if (eventType === 'captacao') {
                 title = 'Agenda: Nova Captação';
                 message = `Hoje você tem 1 captação para fazer às ${horario}.`;
               } else if (eventType === 'visita') {
                 title = 'Agenda: Nova Visita';
                 message = `Você tem uma visita agendada ${detail} às ${horario}.`;
               }

               await addDoc(collection(db, 'notificacoes'), {
                 userId: broker.id,
                 title,
                 message,
                 type: eventType,
                 read: false,
                 clickAction: 'calendar',
                 createdAt: serverTimestamp()
               });
               
               // Internal Message Notification
               await addDoc(collection(db, 'mensagens'), {
                 from: auth.currentUser?.uid,
                 to: broker.id,
                 room: `${auth.currentUser?.uid}_${broker.id}`,
                 text: `Olá ${broker.name}, você foi marcado em um(a) ${eventLabel.toLowerCase()}: ${detail || local} agendado para o dia ${new Date(data).toLocaleDateString('pt-BR')} às ${horario}.`,
                 createdAt: serverTimestamp(),
                 type: 'system'
               });
             }
           }
        }
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar compromisso.');
    }
  };

  const resetForm = () => {
    setLocal('');
    setAddressStreet('');
    setAddressNumber('');
    setAddressCondo('');
    setAddressNeighborhood('');
    setAddressCity('');
    setAddressState('');
    setData('');
    setHorario('');
    setQuemVai([]);
    setTemFilmagem(false);
    setTemDrone(false);
    setProprietarioAvisado(false);
    setNomeProprietario('');
    setTelefoneProprietario('');
    setEmailProprietario('');
    setTermoAssinado(false);
    setNomeCliente('');
    setTelefoneCliente('');
    setEmailCliente('');
    setAssunto('');
    setTituloTarefa('');
    setEnvolveQuem([]);
    setIsEditMode(false);
    setEditingEventId(null);
  };

  const handleDelete = (id: string) => {
    playAlertSound();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null); // Close immediately for responsive UI
    
    try {
      const event = events.find(e => e.id === id);
      await deleteDoc(doc(db, 'agenda_events', id));
      await addLog('agenda', 'Excluiu compromisso', `${event?.type === 'visita' ? 'Visita' : 'Tarefa'}: ${event?.type === 'visita' ? event?.nomeCliente : event?.tituloTarefa}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir compromisso.');
      // Optionally restore id if failed? Usually not worth the complexity unless critical
    }
  };

  const getConfirmationMessage = (event: any) => {
    let msg = `Olá ${event.nomeProprietario} passando para confirmar sobre nossa visita hoje às ${event.horario}.`;
    if (event.temDrone) {
      msg += " Lembrando que é sempre bom avisar seu sindico sobre o voo de drone na região ok?";
    }
    return msg;
  };

  const handleToggleDone = async (id: string, currentDone: boolean) => {
    try {
      await updateDoc(doc(db, 'agenda_events', id), {
        done: !currentDone,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling event status:", error);
    }
  };

  const handleEditRequest = (event: any) => {
    setEventType(event.type);
    setLocal(event.local || '');
    setAddressStreet(event.addressStreet || '');
    setAddressNumber(event.addressNumber || '');
    setAddressCondo(event.addressCondo || '');
    setAddressNeighborhood(event.addressNeighborhood || '');
    setAddressCity(event.addressCity || '');
    setAddressState(event.addressState || '');
    setData(event.data || '');
    setHorario(event.horario || '');
    if (event.type === 'captacao') {
      setQuemVai(event.quemVai || []);
      setTemFilmagem(event.temFilmagem || false);
      setTemDrone(event.temDrone || false);
      setProprietarioAvisado(event.proprietarioAvisado || false);
      setQuemVaiFilmar(event.quemVaiFilmar || 'daniel');
      setNomeProprietario(event.nomeProprietario || '');
      setTelefoneProprietario(event.telefoneProprietario || '');
      setEmailProprietario(event.emailProprietario || '');
    } else if (event.type === 'visita') {
      setTermoAssinado(event.termoAssinado || false);
      setNomeCliente(event.nomeCliente || '');
      setTelefoneCliente(event.telefoneCliente || '');
      setEmailCliente(event.emailCliente || '');
      setEncontroLocal(event.encontroLocal || 'no_local');
    } else if (event.type === 'reuniao') {
      setAssunto(event.assunto || '');
    } else if (event.type === 'tarefa') {
      setTituloTarefa(event.titulo || '');
      setEnvolveQuem(event.envolveQuem || []);
    }
    setEditingEventId(event.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  // Function to approve pending visit requests
  const handleApprove = async (eventId: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const eventRef = doc(db, 'agenda_events', eventId);
      await updateDoc(eventRef, {
        status: 'confirmed'
      });
    } catch(err) {
      console.error(err);
      alert('Erro ao aprovar.');
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Separating events
  const pendingEvents = events.filter(e => e.status === 'pending');
  const confirmedEvents = events.filter(e => e.status !== 'pending');

  const getMapsLink = (address: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const toggleBroker = (name: string) => {
    setQuemVai(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const getEventsForDay = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return confirmedEvents.filter(e => e.data === dateString);
  };

  const handleDayClick = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    const dayEvents = confirmedEvents.filter(e => e.data === dateString);
    
    if (dayEvents.length > 0) {
      setSelectedDateStr(dateString);
      setSelectedDayLabel(`${day} de ${monthNames[currentMonth]} de ${currentYear}`);
      setIsDayModalOpen(true);
    } else {
      setIsEditMode(false);
      resetForm();
      setData(dateString);
      setIsModalOpen(true);
    }
  };

  const currentDayEvents = selectedDateStr 
    ? confirmedEvents.filter(e => e.data === selectedDateStr)
    : [];

  const handleDayCreate = () => {
    if (selectedDateStr) {
        setIsEditMode(false);
        resetForm();
        setData(selectedDateStr);
        setIsDayModalOpen(false);
        setIsModalOpen(true);
    }
  };

  const today = new Date();
  const isToday = (day: number) => {
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
  };

  // Close day modal if all events are deleted
  useEffect(() => {
    if (isDayModalOpen && selectedDateStr && currentDayEvents.length === 0) {
      setIsDayModalOpen(false);
      setSelectedDateStr(null);
    }
  }, [currentDayEvents, isDayModalOpen, selectedDateStr]);

  return (
    <div className="space-y-8">
      {!calendarOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Agenda</h1>
            <p className="text-sm lg:text-base text-gray-500 font-medium">Gerencie suas captações, visitas e reuniões.</p>
          </div>
          {permissions?.canEditProperties && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#617964] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Agendamento
            </button>
          )}
        </div>
      )}

      {/* Calendar Top View */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 transition-all">{'<'}</button>
          <h2 className="text-xl font-bold text-gray-900 w-40 text-center">{monthNames[currentMonth]} {currentYear}</h2>
          <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 transition-all">{'>'}</button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-tight">{day}</div>
          ))}
          
          {blanksArray.map(blank => (
            <div key={`blank-${blank}`} className="p-2 h-14 bg-gray-50/30 rounded-xl" />
          ))}

          {daysArray.map(day => {
            const dayEvents = getEventsForDay(day);
            const todayMark = isToday(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`p-2 h-14 rounded-xl flex flex-col items-center justify-start border transition-all cursor-pointer group relative ${
                  hasEvents 
                    ? 'bg-[#617964] border-[#617964] text-white shadow-lg shadow-[#617964]/20' 
                    : todayMark 
                      ? 'bg-green-50 border-green-200 ring-2 ring-[#617964]/30 ring-offset-1' 
                      : 'bg-gray-50 border-gray-100 hover:border-[#617964]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 w-full relative">
                  <span className={`text-sm font-bold ${hasEvents ? 'text-white' : todayMark ? 'text-green-700' : 'text-gray-600'}`}>{day}</span>
                  {todayMark && !hasEvents && (
                    <span className="text-[8px] font-black uppercase text-green-600 absolute -top-1 right-0">Hoje</span>
                  )}
                  {todayMark && hasEvents && (
                    <span className="text-[8px] font-black uppercase text-white/80 absolute -top-1 right-0">Hoje</span>
                  )}
                </div>
                
                {hasEvents && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((_, idx) => (
                      <span key={idx} className="w-1 h-1 rounded-full bg-white/40 shadow-sm" />
                    ))}
                    {dayEvents.length > 3 && <span className="text-[8px] text-white/60 font-bold">+{dayEvents.length - 3}</span>}
                  </div>
                )}

                {/* Tooltip Hover - Visible on hover */}
                {hasEvents && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20 scale-95 group-hover:scale-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 text-left">Compromissos</p>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            ev.type === 'captacao' ? 'bg-purple-500' : 
                            ev.type === 'visita' ? 'bg-blue-500' : 
                            'bg-orange-500'
                          }`} />
                          <p className="text-[10px] font-bold text-gray-700 truncate text-left">
                            {ev.horario} - {ev.type === 'captacao' ? 'Captação' : ev.type === 'visita' ? 'Visita' : 'Reunião'}
                          </p>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-center text-gray-400 font-medium whitespace-nowrap">clique para ver mais {dayEvents.length - 3}</p>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!calendarOnly && pendingEvents.length > 0 && (
        <div className="bg-amber-50 rounded-[32px] border border-amber-100 p-6 lg:p-8">
          <h3 className="text-lg font-black text-amber-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Solicitações Pendentes do Site ({pendingEvents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingEvents.map(event => (
              <div key={event.id} className="relative bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-4">
                    Aprovação Pendente
                  </span>
                  <h4 className="font-bold text-gray-900 mb-2">Visita</h4>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600"><strong className="text-gray-900">Cliente:</strong> {event.nomeCliente}</p>
                    <p className="text-sm text-gray-600"><strong className="text-gray-900">Onde:</strong> {event.local}</p>
                    <p className="text-sm text-gray-600 flex items-center justify-between">
                      <span><strong className="text-gray-900">Contato:</strong> {event.telefoneCliente}</span>
                      {event.telefoneCliente && (
                        <button 
                          onClick={() => {
                            const formatted = event.telefoneCliente.replace(/\D/g, '');
                            const msg = `Olá ${event.nomeCliente}, passando para confirmar sobre nossa visita ao imóvel no local ${event.local} no dia ${new Date(event.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às ${event.horario}.`;
                            window.open(`https://wa.me/55${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-all ml-2"
                          title="Falar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]/20" />
                        </button>
                      )}
                    </p>
                    <p className="text-sm font-bold text-[#617964]"><Calendar className="w-4 h-4 inline mr-1 -mt-0.5" />{event.data ? new Date(event.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''} às {event.horario}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleApprove(event.id)}
                  className="w-full bg-[#617964] hover:bg-[#374001] text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Aprovar Consulta
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!calendarOnly && (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 lg:p-8">
          <h3 className="text-lg font-black text-gray-900 mb-6 font-display">Agenda Confirmada</h3>
          {confirmedEvents.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum compromisso agendado.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {[
                { id: 'tarefa', label: 'Tarefas', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                { id: 'visita', label: 'Visitas', bg: 'bg-blue-50', text: 'text-blue-700' },
                { id: 'captacao', label: 'Captações', bg: 'bg-purple-50', text: 'text-purple-700' },
                { id: 'reuniao', label: 'Reuniões', bg: 'bg-orange-50', text: 'text-orange-700' },
              ].map(cat => {
                const catEvents = confirmedEvents.filter(e => {
                  if (cat.id === 'reuniao') {
                    return e.type === 'reuniao' || (e.type !== 'tarefa' && e.type !== 'visita' && e.type !== 'captacao');
                  }
                  return e.type === cat.id;
                });

                if (catEvents.length === 0) return null;

                const isExpanded = expandedCategories.includes(cat.id);

                return (
                  <div key={cat.id} className="space-y-4">
                    <button 
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full flex items-center justify-between p-4 ${cat.bg} rounded-2xl transition-all hover:bg-opacity-80`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center ${cat.text} shadow-sm`}>
                          {cat.id === 'tarefa' && <Clock className="w-4 h-4" />}
                          {cat.id === 'visita' && <Users className="w-4 h-4" />}
                          {cat.id === 'captacao' && <MapPin className="w-4 h-4" />}
                          {cat.id === 'reuniao' && <Video className="w-4 h-4" />}
                        </div>
                        <h4 className={`text-sm font-black uppercase tracking-widest ${cat.text}`}>{cat.label}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.text} bg-white font-black`}>
                          {catEvents.length}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className={`w-5 h-5 ${cat.text}`} /> : <ChevronDown className={`w-5 h-5 ${cat.text}`} />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden"
                        >
                          {catEvents.map(event => {
                            const isEventExpanded = expandedEvents.includes(event.id);
                            return (
                              <div key={event.id} className="relative bg-gray-50 rounded-3xl p-5 border border-gray-100 hover:border-[#617964]/30 transition-all group overflow-hidden">
                                <div className="absolute top-3 right-3 flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleDone(event.id, !!event.done);
                                    }}
                                    className={`p-1.5 rounded-lg shadow-sm border transition-all ${event.done ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-400 border-gray-100 hover:bg-emerald-50 hover:text-emerald-500'}`}
                                    title={event.done ? 'Marcar como pendente' : 'Marcar como concluído'}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  {(permissions?.canEditProperties || event.createdBy?.uid === auth.currentUser?.uid) && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditRequest(event);
                                      }}
                                      className="p-1.5 bg-white rounded-lg text-[#617964] shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {(permissions?.canDeleteProperties || event.createdBy?.uid === auth.currentUser?.uid) && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(event.id);
                                      }}
                                      className="p-1.5 bg-white rounded-lg text-red-500 shadow-sm border border-gray-100 hover:bg-red-50 transition-all"
                                      title="Excluir"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 mb-3 pr-20">
                                  <div className={`w-2 h-2 rounded-full ${event.done ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : cat.text.replace('text-', 'bg-')}`} />
                                  <h5 className={`font-bold text-sm truncate ${event.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                    {event.type === 'captacao' ? 'Nova Captação' : event.type === 'visita' ? 'Atendimento / Visita' : event.type === 'tarefa' ? event.titulo : 'Reunião'}
                                  </h5>
                                  {event.done && (
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Concluído</span>
                                  )}
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(event.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} | {event.horario}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-medium text-gray-600 truncate">
                                    <MapPin className="w-3 h-3" />
                                    {event.local || 'Local não definido'}
                                  </div>
                                </div>

                                <button 
                                  onClick={() => toggleEventExpand(event.id)}
                                  className="w-full flex items-center justify-between py-2 text-[10px] font-black uppercase tracking-widest text-[#617964] hover:text-[#374001] transition-colors border-t border-gray-100"
                                >
                                  {isEventExpanded ? 'Recolher detalhes' : 'Ver mais detalhes'}
                                  {isEventExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>

                                <AnimatePresence>
                                  {isEventExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden pt-4 space-y-4"
                                    >
                                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 w-fit">
                                        {event.createdBy?.photo ? (
                                          <img src={event.createdBy.photo} alt={event.createdBy.name} className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="w-3 h-3 text-gray-400" />
                                          </div>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                          Por: {event.createdBy?.name || 'Administrador'}
                                        </span>
                                      </div>

                                      {event.local && (
                                        <a 
                                          href={getMapsLink(event.local)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#617964] px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#617964]/20 hover:scale-105"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                          Me leve até lá
                                        </a>
                                      )}

                                      {event.type === 'captacao' && (
                                        <div className="space-y-2 text-xs text-gray-600">
                                          <p><strong>Corretores:</strong> {event.quemVai?.join(', ') || 'Nenhum'}</p>
                                          <p><strong>Filmagem:</strong> {event.temFilmagem ? 'Sim' : 'Não'} {event.temDrone ? '(com drone)' : ''}</p>
                                          <p><strong>Proprietário:</strong> {event.nomeProprietario}</p>
                                          <div className="flex items-center gap-2">
                                            <p><strong>Contato:</strong> {event.telefoneProprietario}</p>
                                            <div className="flex gap-1">
                                              <a 
                                                href={`https://wa.me/${event.telefoneProprietario?.replace(/\D/g, '')}?text=${encodeURIComponent(getConfirmationMessage(event))}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 px-2 text-emerald-600 bg-emerald-50 rounded-lg font-bold"
                                              >
                                                Zap
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {event.type === 'visita' && (
                                        <div className="space-y-2 text-xs text-gray-600">
                                          <p><strong>Cliente:</strong> {event.nomeCliente}</p>
                                          <p><strong>Contato:</strong> {event.telefoneCliente}</p>
                                          <p><strong>Encontro:</strong> {event.encontroLocal === 'na_imobiliaria' ? 'Na Imobiliária' : 'No Local'}</p>
                                          <p className={`font-medium ${event.termoAssinado ? 'text-green-600' : 'text-amber-600'}`}>
                                            {event.termoAssinado ? 'Termo Assinado' : 'Termo Pendente'}
                                          </p>
                                        </div>
                                      )}

                                      {event.type === 'reuniao' && (
                                        <div className="space-y-1 text-xs text-gray-600">
                                          <p className="font-bold uppercase text-[10px] text-gray-400">Assunto</p>
                                          <p>{event.assunto}</p>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 lg:p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
                  <p className="text-sm text-gray-500 mt-1">Preencha os dados do compromisso.</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 lg:p-8 overflow-y-auto space-y-8 flex-1">
                {/* Tipo de Agendamento */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Tipo de Agendamento</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'captacao', label: 'Captação' },
                      { id: 'visita', label: 'Visita/Atendimento' },
                      { id: 'reuniao', label: 'Reunião' },
                      { id: 'tarefa', label: 'Tarefa' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setEventType(type.id as any)}
                        className={`p-3 rounded-2xl text-xs font-bold text-center transition-all ${
                          eventType === type.id 
                            ? 'bg-[#617964] text-white shadow-lg shadow-[#617964]/20' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos Comuns */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                    <input
                      type="date"
                      value={data}
                      onChange={e => setData(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Horário</label>
                    <input
                      type="time"
                      value={horario}
                      onChange={e => setHorario(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Rua / Logradouro</label>
                      <input
                        type="text"
                        value={addressStreet}
                        onChange={e => setAddressStreet(e.target.value)}
                        placeholder="Ex: Rua das Flores"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Número</label>
                      <input
                        type="text"
                        value={addressNumber}
                        onChange={e => setAddressNumber(e.target.value)}
                        placeholder="Ex: 123"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Condomínio</label>
                      <select
                        value={addressCondo}
                        onChange={e => setAddressCondo(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      >
                        <option value="">Nenhum / Não informado</option>
                        {condos.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        <option value="other">Outro (especificar no bairro)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Bairro</label>
                      <input
                        type="text"
                        value={addressNeighborhood}
                        onChange={e => setAddressNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Cidade</label>
                      <input
                        type="text"
                        value={addressCity}
                        onChange={e => setAddressCity(e.target.value)}
                        placeholder="Ex: Petrópolis"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Estado (UF)</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={addressState}
                        onChange={e => setAddressState(e.target.value.toUpperCase())}
                        placeholder="Ex: RJ"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2 hidden">
                  </div>
                </div>

                {/* Captação */}
                {eventType === 'captacao' && (
                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase">Quem vai? (Corretores)</label>
                      <div className="flex flex-wrap gap-2">
                        {brokers.map(broker => (
                          <button
                            key={broker.id}
                            onClick={() => toggleBroker(broker.name)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              quemVai.includes(broker.name)
                                ? 'bg-blue-100 text-blue-700 border-transparent'
                                : 'bg-gray-50 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {broker.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-100">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${temFilmagem ? 'bg-[#617964]' : 'bg-white border-2 border-gray-300'}`}>
                          {temFilmagem && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-gray-700">Terá filmagem?</span>
                        <input type="checkbox" className="hidden" checked={temFilmagem} onChange={e => setTemFilmagem(e.target.checked)} />
                      </label>
                      
                      {temFilmagem && (
                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-100">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${temDrone ? 'bg-[#617964]' : 'bg-white border-2 border-gray-300'}`}>
                            {temDrone && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-sm font-bold text-gray-700">Com drone?</span>
                          <input type="checkbox" className="hidden" checked={temDrone} onChange={e => setTemDrone(e.target.checked)} />
                        </label>
                      )}
                    </div>

                    {temFilmagem && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Quem vai filmar?</label>
                          <select 
                            value={quemVaiFilmar} 
                            onChange={e => setQuemVaiFilmar(e.target.value as 'daniel' | 'terceirizado')}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                          >
                            <option value="daniel">Daniel</option>
                            <option value="terceirizado">Videomaker Terceirizado</option>
                          </select>
                        </div>
                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-100 mt-6 sm:mt-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${proprietarioAvisado ? 'bg-[#617964]' : 'bg-white border-2 border-gray-300'}`}>
                            {proprietarioAvisado && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-sm font-bold text-gray-700">Proprietário avisado da filmagem?</span>
                          <input type="checkbox" className="hidden" checked={proprietarioAvisado} onChange={e => setProprietarioAvisado(e.target.checked)} />
                        </label>
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Dados do Proprietário</p>
                      <div className="grid sm:grid-cols-2 flex-col gap-4">
                        <input type="text" placeholder="Nome do proprietário" value={nomeProprietario} onChange={e => setNomeProprietario(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964]" />
                        <input type="text" placeholder="Telefone" value={telefoneProprietario} onChange={e => setTelefoneProprietario(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964]" />
                        <input type="email" placeholder="Email (opcional)" value={emailProprietario} onChange={e => setEmailProprietario(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] sm:col-span-2" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tarefa specific fields */}
                {eventType === 'tarefa' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Título da Tarefa</label>
                      <input 
                        type="text" 
                        value={tituloTarefa}
                        onChange={(e) => setTituloTarefa(e.target.value)}
                        placeholder="Ex: Assinatura de contrato"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Participantes</label>
                      <div className="flex flex-wrap gap-2">
                        {brokers.map(broker => (
                          <button
                            key={broker.id}
                            type="button"
                            onClick={() => setEnvolveQuem(prev => prev.includes(broker.name) ? prev.filter(b => b !== broker.name) : [...prev, broker.name])}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              envolveQuem.includes(broker.name)
                                ? 'bg-[#617964] border-[#617964] text-white'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-[#617964]/50'
                            }`}
                          >
                            {broker.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Visita */}
                {eventType === 'visita' && (
                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${termoAssinado ? 'bg-amber-500' : 'bg-white border-2 border-amber-200'}`}>
                          {termoAssinado && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-amber-900">O cliente já assinou o Termo de Visita?</span>
                        <input type="checkbox" className="hidden" checked={termoAssinado} onChange={e => setTermoAssinado(e.target.checked)} />
                      </label>
                      
                      {!termoAssinado && (
                        <a 
                          href="#" 
                          className="flex items-center gap-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Baixar PDF do Termo
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Onde será o encontro?</label>
                      <select 
                        value={encontroLocal} 
                        onChange={e => setEncontroLocal(e.target.value as 'no_local' | 'na_imobiliaria')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all"
                      >
                        <option value="no_local">No Local do Imóvel</option>
                        <option value="na_imobiliaria">Na Imobiliária</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Quem vai na visita?</p>
                      <div className="flex flex-wrap gap-2">
                        {brokers.map(broker => (
                          <button
                            key={broker.id}
                            type="button"
                            onClick={() => setEnvolveQuem(prev => prev.includes(broker.name) ? prev.filter(b => b !== broker.name) : [...prev, broker.name])}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              envolveQuem.includes(broker.name)
                                ? 'bg-[#617964] border-[#617964] text-white'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-[#617964]/50'
                            }`}
                          >
                            {broker.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Dados do Cliente</p>
                      <div className="grid sm:grid-cols-2 flex-col gap-4">
                        <input type="text" placeholder="Nome" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964]" />
                        <input type="text" placeholder="Telefone / WhatsApp" value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964]" />
                        <input type="email" placeholder="Email (opcional)" value={emailCliente} onChange={e => setEmailCliente(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] sm:col-span-2" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Reunião */}
                {eventType === 'reuniao' && (
                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Participantes</label>
                      <div className="flex flex-wrap gap-2">
                        {brokers.map(broker => (
                          <button
                            key={broker.id}
                            type="button"
                            onClick={() => setEnvolveQuem(prev => prev.includes(broker.name) ? prev.filter(b => b !== broker.name) : [...prev, broker.name])}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              envolveQuem.includes(broker.name)
                                ? 'bg-[#617964] border-[#617964] text-white'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-[#617964]/50'
                            }`}
                          >
                            {broker.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Assunto</label>
                      <textarea
                        placeholder="Qual o tema principal desta reunião?"
                        value={assunto}
                        onChange={e => setAssunto(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#617964] outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8 border-t border-gray-100 bg-gray-50/50 shrink-0">
                <button
                  onClick={handleCreate}
                  disabled={(!local && !addressStreet && !addressCondo) || !horario}
                  className="w-full bg-[#617964] disabled:bg-gray-300 text-white py-4 rounded-2xl font-black text-lg hover:bg-[#374001] transition-all shadow-lg shadow-[#617964]/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Confirmar Agendamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Day Modal - List all events for selected day */}
      <AnimatePresence>
        {isDayModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Eventos do Dia</h2>
                  <p className="text-sm text-[#617964] font-bold uppercase tracking-tight">{selectedDayLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDayCreate}
                        className="w-10 h-10 bg-[#617964] text-white rounded-full flex items-center justify-center hover:bg-[#374001] transition-all shadow-md"
                        title="Adicionar compromisso este dia"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsDayModalOpen(false)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                {currentDayEvents.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 font-medium">Nenhum evento neste dia.</div>
                ) : currentDayEvents.map(event => (
                  <div key={event.id} className="p-6 bg-gray-50 rounded-[32px] border border-gray-200 relative group overflow-hidden">
                    <div className="absolute top-6 right-6 flex gap-2">
                       <button 
                        onClick={() => {
                          setIsDayModalOpen(false);
                          handleEditRequest(event);
                        }}
                        className="p-2 bg-white rounded-xl text-[#617964] shadow-sm border border-gray-100 hover:bg-gray-50 transition-all font-bold"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="p-2 bg-white rounded-xl text-red-500 shadow-sm border border-gray-100 hover:bg-red-50 transition-all font-bold"
                        title="Excluir"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                             event.type === 'captacao' ? 'bg-purple-100 text-purple-700' :
                             event.type === 'visita' ? 'bg-blue-100 text-blue-700' :
                             'bg-orange-100 text-orange-700'
                        }`}>
                             {event.type === 'captacao' ? 'CAPTAÇÃO' : event.type === 'visita' ? 'VISITA' : 'REUNIÃO'}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{event.horario}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-gray-900">
                                {event.type === 'captacao' ? 'Nova Captação' : event.type === 'visita' ? 'Atendimento / Visita' : event.type === 'tarefa' ? event.titulo : 'Reunião'}
                            </h4>
                            
                            <div className="flex items-center gap-2 py-1">
                              <span className="text-[10px] font-bold text-[#617964] uppercase opacity-60">
                                Cadastrado por: {event.createdBy?.name || 'Administrador'}
                              </span>
                            </div>

                            <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 mt-1 shrink-0 text-[#617964]" />
                                <span className="text-sm font-medium">{event.local}</span>
                            </div>
                        </div>

                        {/* Specific info */}
                        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
                             {event.type === 'captacao' && (
                                 <div className="text-xs space-y-1.5 text-gray-600">
                                    <p><strong>Corretores:</strong> {event.quemVai?.join(', ')}</p>
                                    <p><strong>Proprietário:</strong> {event.nomeProprietario}</p>
                                    <div className="flex items-center gap-2">
                                      <p><strong>Contato:</strong> {event.telefoneProprietario}</p>
                                      <div className="flex gap-1">
                                        <a 
                                          href={`https://wa.me/${event.telefoneProprietario?.replace(/\D/g, '')}?text=${encodeURIComponent(getConfirmationMessage(event))}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                          title="Confirmar via WhatsApp"
                                        >
                                          <MessageCircle className="w-4 h-4 fill-emerald-600/10" />
                                        </a>
                                        {event.emailProprietario && (
                                          <a 
                                            href={`mailto:${event.emailProprietario}?subject=Confirmação de Visita&body=${encodeURIComponent(getConfirmationMessage(event))}`}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Confirmar via Email"
                                          >
                                            <Mail className="w-4 h-4 fill-blue-600/10" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <p><strong>Email:</strong> {event.emailProprietario || 'N/A'}</p>
                                    <p><strong>Filmagem:</strong> {event.temFilmagem ? 'Sim' : 'Não'} {event.temDrone ? '(com drone)' : ''}</p>
                                    {event.temFilmagem && <p><strong>Equipe:</strong> {event.quemVaiFilmar === 'daniel' ? 'Daniel' : 'Terceirizado'}</p>}
                                 </div>
                             )}
                             {event.type === 'visita' && (
                                 <div className="text-xs space-y-1.5 text-gray-600">
                                    <p><strong>Cliente:</strong> {event.nomeCliente}</p>
                                    <p><strong>Contato:</strong> {event.telefoneCliente}</p>
                                    <p><strong>Email:</strong> {event.emailCliente || 'N/A'}</p>
                                    <p><strong>Encontro:</strong> {event.encontroLocal === 'na_imobiliaria' ? 'Na Imobiliária' : 'No Local'}</p>
                                    <p className={`font-bold flex items-center gap-1 ${event.termoAssinado ? 'text-green-600' : 'text-amber-600'}`}>
                                      {event.termoAssinado ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                      {event.termoAssinado ? 'Termo Assinado' : 'Termo Pendente'}
                                    </p>
                                 </div>
                             )}
                             {event.type === 'reuniao' && (
                                 <p className="text-xs text-gray-600"><strong>Assunto:</strong> {event.assunto}</p>
                             )}
                             {event.type === 'tarefa' && (
                                 <div className="text-xs space-y-1.5 text-gray-600">
                                    <p><strong>Quem:</strong> {event.envolveQuem?.join(', ')}</p>
                                 </div>
                             )}
                             
                             <div className="flex items-end justify-end">
                                <a 
                                    href={getMapsLink(event.local)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-black text-white bg-[#617964] hover:bg-[#374001] px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-[#617964]/20"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Me leve até lá
                                </a>
                             </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Excluir Compromisso?</h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">Esta ação não pode ser desfeita. Deseja realmente remover este agendamento?</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-3 px-6 rounded-2xl font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-3 px-6 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
