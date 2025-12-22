
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Announcement } from '../types';
import { 
  Trophy, Calendar, User as UserIcon, ShieldCheck, Zap, 
  ArrowRight, Cpu, Clock, Flame, Quote, RefreshCw, ShieldAlert, ExternalLink, Loader2, CheckCircle2
} from 'lucide-react';
import { getDailyMotivation } from '../services/geminiService';

interface StudentDashboardProps {
  user: User;
  announcements: Announcement[];
  onUpdateStudent: (updated: User) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, announcements, onUpdateStudent }) => {
  const [mantra, setMantra] = useState<string>("Sincronizando com a mente do mestre...");
  const [loadingMantra, setLoadingMantra] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Simulação de delay para efeito visual de carregamento de dados da Federação
  useEffect(() => {
    const timer = setTimeout(() => setLoadingAnnouncements(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchMantra = useCallback(async () => {
    setLoadingMantra(true);
    try {
      const text = await getDailyMotivation();
      setMantra(text);
    } catch (error) {
      setMantra("Mantenha a guarda alta e o foco no objetivo.");
    } finally {
      setLoadingMantra(false);
    }
  }, []);

  useEffect(() => {
    fetchMantra();
  }, [fetchMantra]);

  const handlePayment = async () => {
    const confirm = window.confirm("Você será redirecionado para o Checkout Seguro da Federação. Deseja prosseguir com a regularização?");
    if (!confirm) return;

    setIsProcessingPayment(true);
    
    // Simulação de gateway de pagamento
    setTimeout(() => {
      onUpdateStudent({
        ...user,
        paymentStatus: 'paid',
        lastAiAudit: "Pagamento confirmado via Link Neural. Sua guarda está sólida."
      });
      setIsProcessingPayment(false);
      alert("OSS! Pagamento processado com sucesso. Seu acesso Pro foi reestabelecido.");
    }, 2500);
  };

  // Filtragem estrita: Apenas comunicados do MEU professor
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter(ann => ann.teacherId === user.teacherId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [announcements, user.teacherId]);

  const daysToDue = user.dueDate ? Math.floor((user.dueDate - Date.now()) / (24 * 60 * 60 * 1000)) : 15;
  const isUnpaid = user.paymentStatus === 'unpaid';

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      
      {/* ALERTA DE PAGAMENTO */}
      {isUnpaid && (
        <section className="glass-card p-8 rounded-[2.5rem] bg-red-500/10 border-red-500/30 animate-pulse relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="bg-red-500 text-white p-5 rounded-3xl shadow-lg shadow-red-500/20">
                {isProcessingPayment ? <Loader2 size={32} className="animate-spin" /> : <ShieldAlert size={32} />}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic text-white tracking-tight">
                  {isProcessingPayment ? "Processando Link Federal..." : "Guarda Exposta: Pendência Financeira"}
                </h3>
                <p className="text-sm text-red-200/70 font-medium max-w-xl">
                  {isProcessingPayment ? "Aguarde enquanto validamos seu token de pagamento no blockchain federativo." : (user.lastAiAudit || "Detectamos uma irregularidade no seu plano federal. Regularize sua situação.")}
                </p>
              </div>
            </div>
            <button 
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="w-full md:w-auto bg-white text-black font-black px-10 py-5 rounded-2xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Regularizar Agora</span>
                  <ExternalLink size={16} />
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* STATUS E AUDITORIA IA */}
      <section className={`glass-card p-6 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${isUnpaid ? 'opacity-50 grayscale' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-indigo-500/20 p-4 rounded-3xl"><Cpu size={32} className="text-indigo-400 animate-pulse" /></div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Análise Biopsicossocial IA</p>
            <p className="text-sm text-gray-400 italic font-medium">"{user.lastAiAudit || 'Suas conexões neurais e físicas com o tatame estão sincronizadas.'}"</p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right">
             <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Status Pro</p>
             <div className="text-lg font-black text-white flex items-center gap-2 justify-end">
               {isUnpaid ? (
                 <>
                   <ShieldAlert size={16} className="text-red-500" />
                   <span className="text-red-500">Acesso Restrito</span>
                 </>
               ) : (
                 <>
                   <CheckCircle2 size={16} className="text-green-500" />
                   <span className="text-green-500">Plano Ativo</span>
                 </>
               )}
             </div>
          </div>
        </div>
      </section>

      {/* CITAÇÃO DE HONRA */}
      <section className="relative">
        <div className="glass-card p-12 md:p-20 rounded-[4rem] border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent text-center relative overflow-hidden group border-t-yellow-500/20">
          <div className="absolute top-8 left-8 text-yellow-500/10 group-hover:text-yellow-500/20 transition-all duration-700"><Quote size={120} /></div>
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col items-center gap-5">
              <div className="p-5 bg-yellow-500/10 rounded-full"><Flame size={40} className={`text-yellow-500 ${loadingMantra ? 'animate-pulse' : 'animate-bounce'}`} /></div>
              <h3 className="text-[14px] font-black text-yellow-500 uppercase tracking-[1em] ml-[1em]">Citação de Honra</h3>
            </div>
            <div className="min-h-[120px] flex items-center justify-center">
              <p className={`text-3xl md:text-5xl lg:text-7xl font-black italic tracking-tighter text-white leading-[1.05] transition-all duration-1000 ${loadingMantra ? 'opacity-30 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}>
                {mantra}
              </p>
            </div>
            <button onClick={fetchMantra} disabled={loadingMantra} className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 disabled:opacity-50">
              <RefreshCw size={18} className={`text-yellow-500 ${loadingMantra ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Nova Inspiração</span>
            </button>
          </div>
        </div>
      </section>

      {/* PERFIL E MURAL OTIMIZADO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <section className="glass-card p-10 rounded-[3.5rem] text-center border-white/5 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
            <div className="w-28 h-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:rotate-6 transition-transform"><UserIcon size={48} className="text-yellow-500" /></div>
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">{user.name}</h3>
            <p className="text-[10px] text-gray-600 font-black mb-8 uppercase tracking-widest">{user.email}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10"><p className="text-[9px] text-gray-600 font-black uppercase mb-1">Rank</p><p className="text-sm font-black text-yellow-500 uppercase tracking-widest">{user.belt}</p></div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10"><p className="text-[9px] text-gray-600 font-black uppercase mb-1">Nível</p><p className="text-sm font-black text-white uppercase tracking-widest">PRO</p></div>
            </div>
            {isUnpaid && (
              <button 
                onClick={handlePayment}
                className="w-full mt-8 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl uppercase text-[9px] tracking-widest transition-all"
              >
                Regularizar Pendência
              </button>
            )}
          </section>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Comunicados <span className="text-yellow-500">Oficiais</span></h3>
          </div>
          
          <div className="space-y-6">
            {loadingAnnouncements ? (
              // Loading State Visual
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="glass-card p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <div className="h-6 w-3/4 bg-white/5 rounded-xl mb-8"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-white/5 rounded-full"></div>
                        <div className="h-2 w-32 bg-white/5 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center py-4 gap-3 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">
                  <Loader2 className="animate-spin" size={16} /> Escaneando Link Neural...
                </div>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="glass-card p-16 rounded-[4rem] text-center border-dashed border-white/10">
                 <p className="text-[10px] font-black uppercase text-gray-700 tracking-[0.6em]">Nenhuma diretriz emitida pelo seu mestre</p>
              </div>
            ) : (
              filteredAnnouncements.map(ann => (
                <div key={ann.id} className="glass-card p-10 rounded-[3.5rem] border-l-4 border-yellow-500 hover:bg-white/[0.02] transition-all group">
                  <p className="text-lg text-gray-200 font-semibold mb-8 italic leading-relaxed">"{ann.content}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center font-black text-black">{ann.authorName.charAt(0)}</div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-white tracking-widest">{ann.authorName}</p>
                        <p className="text-[9px] text-gray-600 font-black uppercase">Seu Mestre Credenciado</p>
                      </div>
                    </div>
                    <ArrowRight size={24} className="text-gray-800 group-hover:text-yellow-500 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
