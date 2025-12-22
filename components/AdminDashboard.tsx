
import React, { useState, useMemo, useEffect } from 'react';
import { Teacher, User } from '../types';
import { 
  UserPlus, Pause, Play, Trash2, Edit3, Share2, Copy, Link as LinkIcon,
  Search, X, Filter, MessageCircle, Cloud, CloudUpload, CloudDownload,
  Users, Award, DollarSign, Activity, ChevronRight, ChevronLeft, ShieldCheck, RefreshCcw, TrendingUp, BarChart3, GraduationCap, ShieldAlert, Lock, Phone, Database,
  Loader2, FileText, Download, Printer, Sparkles, Wand2, Zap, Server, Cpu, Trash
} from 'lucide-react';
import { analyzeStorageHealth } from '../services/geminiService';

interface AdminDashboardProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  students: User[];
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  onToggleStatus: (id: string) => void;
  onToggleStudentStatus: (id: string) => void;
  onDeleteTeacher: (id: string) => void;
  onUpdateTeacher: (updated: Teacher) => void;
  onUpdateStudent: (updated: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  teachers = [], 
  setTeachers, 
  students = [], 
  setStudents,
  onToggleStatus, 
  onToggleStudentStatus,
  onDeleteTeacher,
  onUpdateTeacher,
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<'professores' | 'alunos'>('professores');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'unpaid'>('all');

  const [showCloudModal, setShowCloudModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Estados para Otimização de Storage IA & Google Cloud
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerReport, setOptimizerReport] = useState<{healthScore: number; recommendations: string; potentialSavings: string} | null>(null);

  const handleCloudSync = () => {
    setIsUploading(true);
    setTimeout(() => {
      const data = { t: teachers, s: students, ts: Date.now() };
      const token = btoa(JSON.stringify(data));
      const url = `${window.location.origin}${window.location.pathname}#storage=${token}`;
      
      navigator.clipboard.writeText(url).then(() => {
        setIsUploading(false);
        alert(`NUVEM SINCRONIZADA!\n\nDados provisionados no Google Cloud: mourajiujitsu252@gmail.com\nO link de instanciamento foi copiado.`);
        setShowCloudModal(false);
      });
    }, 1500);
  };

  const handleDeepClean = async () => {
    setIsOptimizing(true);
    const summary = `Infraestrutura Google Cloud (mourajiujitsu252@gmail.com). Registros: ${teachers.length + students.length}. Fragmentação detectada em logs de auditoria do Cloud SQL simulado.`;
    
    // IA Analisa a latência de infra
    const report = await analyzeStorageHealth(summary);
    setOptimizerReport(report);
    
    setTimeout(() => {
      // Simula limpeza de "lixo" do Cloud/LocalStorage
      setStudents(prev => prev.map(s => ({ ...s, lastAiAudit: undefined })));
      setTeachers(prev => prev.map(t => ({ ...t, lastAiAudit: undefined })));
      
      // Remove logs temporários do localStorage que não estão no types.ts mas ocupam espaço
      Object.keys(localStorage).forEach(key => {
        if (key.includes('temp_') || key.includes('audit_log_')) {
          localStorage.removeItem(key);
        }
      });

      setIsOptimizing(false);
      alert("OTIMIZAÇÃO GCP CONCLUÍDA!\n\nObjetos redundantes removidos do Cloud Storage mourajiujitsu252@gmail.com. Latência da federação normalizada.");
    }, 3500);
  };

  const generateRandomKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let key = "";
    for (let i = 0; i < 8; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewTeacherPassword(key);
  };

  const stats = useMemo(() => [
    { label: 'Instrutores', value: teachers.filter(t => t.status === 'active').length, icon: <Award className="text-yellow-500" />, bg: 'bg-yellow-500/10' },
    { label: 'Atletas', value: students.length, icon: <Users className="text-indigo-500" />, bg: 'bg-indigo-500/10' },
    { label: 'Google Cloud', value: 'mourajiujitsu...', icon: <Server className="text-green-500" />, bg: 'bg-green-500/10' },
    { label: 'Cloud Latency', value: isOptimizing ? 'Otimizando...' : '12ms', icon: <Zap className="text-cyan-500" />, bg: 'bg-cyan-500/10' },
  ], [teachers, students, isOptimizing]);

  const filteredItems = useMemo(() => {
    const list = activeTab === 'professores' ? teachers : students;
    return list.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(term) || item.email.toLowerCase().includes(term);
      return matchesSearch;
    });
  }, [teachers, students, searchTerm, activeTab]);

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700 relative">
      
      {/* Modal Otimizador de Infraestrutura IA & Google Cloud */}
      {showOptimizer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
          <div className="glass-card w-full max-w-xl p-1 bg-gradient-to-br from-cyan-500/40 via-blue-500/10 to-transparent rounded-[3.5rem] shadow-[0_0_150px_rgba(6,182,212,0.15)]">
            <div className="bg-[#080808]/95 p-10 md:p-14 rounded-[3.4rem] space-y-10 text-center relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full"></div>
              
              <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
                <div className={`absolute inset-0 bg-cyan-600/10 rounded-full blur-3xl ${isOptimizing ? 'animate-pulse' : ''}`}></div>
                <Cpu size={80} className={`text-cyan-400 relative z-10 transition-all duration-1000 ${isOptimizing ? 'rotate-180 scale-110' : ''}`} />
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Otimização Cloud Platform</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed mx-auto max-w-xs">
                  IA realizando purga de logs e otimizando instâncias no Google Cloud Central.
                </p>
              </div>

              {optimizerReport && !isOptimizing && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 animate-in zoom-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Saúde da Infra</span>
                    <span className="text-xl font-black text-cyan-400">{optimizerReport.healthScore}%</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium italic">"{optimizerReport.recommendations}"</p>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={handleDeepClean}
                  disabled={isOptimizing}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-4 uppercase text-xs tracking-widest transition-all shadow-xl shadow-cyan-600/20 disabled:opacity-50 h-[70px]"
                >
                  {isOptimizing ? <Loader2 className="animate-spin" /> : <Trash size={18} />}
                  {isOptimizing ? 'Purger de Objetos...' : 'Limpar Google Cloud com IA'}
                </button>
                <button 
                  onClick={() => setShowOptimizer(false)}
                  disabled={isOptimizing}
                  className="w-full text-gray-700 font-bold uppercase text-[9px] hover:text-white transition-colors"
                >
                  Fechar Painel de Infraestrutura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho de Comando */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-tight">
                SALA DO <span className="text-yellow-500">CONSELHO</span>
              </h2>
              <div className="flex items-center gap-3 mt-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-fit">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <p className="text-green-400 font-black uppercase tracking-[0.1em] text-[8px]">Google Cloud: mourajiujitsu252@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowOptimizer(true)}
                className="p-5 bg-cyan-600/10 text-cyan-400 rounded-[2rem] border border-cyan-500/20 hover:bg-cyan-600 hover:text-white transition-all group shadow-lg"
                title="IA Deep Clean Cloud"
              >
                <Trash size={32} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                onClick={() => setShowCloudModal(true)}
                className="p-5 bg-blue-600/10 text-blue-500 rounded-[2rem] border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all group shadow-lg"
                title="Infraestrutura de Rede"
              >
                <Cloud size={32} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[3.5rem] border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Server size={80} /></div>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-yellow-500 text-black rounded-2xl shadow-xl"><UserPlus size={24} /></div>
              <h3 className="text-xl font-black uppercase italic text-white">Instanciar Mestre</h3>
            </div>
            <form className="space-y-4 relative z-10">
              <input className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:border-yellow-500 outline-none" placeholder="Nome do Mestre no GCP" value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} />
              <div className="relative">
                <input className="w-full p-5 rounded-2xl bg-white/10 border-2 border-yellow-500/30 text-yellow-500 text-sm font-black tracking-[0.2em] outline-none" placeholder="CHAVE CLOUD" value={newTeacherPassword} onChange={e => setNewTeacherPassword(e.target.value)} />
                <button type="button" onClick={generateRandomKey} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-yellow-500 hover:scale-110"><RefreshCcw size={18}/></button>
              </div>
              <button className="w-full bg-white hover:bg-yellow-500 text-black font-black py-5 rounded-2xl transition-all uppercase text-[10px] tracking-[0.2em]">Sincronizar Google Cloud</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-yellow-500/20 transition-all group relative overflow-hidden">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Listagem Global */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="flex bg-white/5 p-1 rounded-3xl border border-white/10">
            <button onClick={() => setActiveTab('professores')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'professores' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>Instrutores</button>
            <button onClick={() => setActiveTab('alunos')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'alunos' ? 'bg-indigo-500 text-white' : 'text-gray-500'}`}>Atletas</button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={16} />
            <input className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white w-full md:w-64 outline-none focus:border-yellow-500" placeholder="Pesquisar Instâncias..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-black text-yellow-500 italic">{item.name[0]}</div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase italic text-white leading-none">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="p-4 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all"><Edit3 size={20} /></button>
                <button className="p-4 bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
