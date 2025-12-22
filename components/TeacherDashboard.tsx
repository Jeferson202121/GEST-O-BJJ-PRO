
import React, { useState } from 'react';
import { User, Announcement, Teacher } from '../types';
import { moderateAnnouncement } from '../services/geminiService';
import { 
  PlusCircle, Trash2, Send, MessageSquare, GraduationCap, 
  DollarSign, CheckCircle, AlertCircle, Loader2, Key, Edit3, X,
  CreditCard, Shield, UserCheck, ShieldAlert, Calendar, Hash, Pause, Play, Phone, MessageCircle, Sparkles, Megaphone
} from 'lucide-react';

interface TeacherDashboardProps {
  user: User;
  students: User[];
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  announcements: Announcement[];
  onAddAnnouncement: (ann: Announcement) => void;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  onToggleStudentStatus: (id: string) => void;
  onUpdateStudent: (updated: User) => void;
}

const BELTS = ['Branca', 'Cinza/Branca', 'Cinza', 'Cinza/Preta', 'Amarela/Branca', 'Amarela', 'Amarela/Preta', 'Laranja/Branca', 'Laranja', 'Laranja/Preta', 'Verde/Branca', 'Verde', 'Verde/Preta', 'Azul', 'Roxa', 'Marrom', 'Preta', 'Coral', 'Vermelha'];

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, 
  students, 
  setStudents, 
  announcements, 
  onAddAnnouncement,
  setTeachers,
  onToggleStudentStatus,
  onUpdateStudent
}) => {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentBelt, setNewStudentBelt] = useState('Branca');

  const [announcementContent, setAnnouncementContent] = useState('');
  const [isModerating, setIsModerating] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [targetToEdit, setTargetToEdit] = useState<User | null>(null);

  const teacherStudents = students.filter(s => s.teacherId === user.id);
  const myAnnouncements = announcements.filter(a => a.teacherId === user.id);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStudentName,
      email: newStudentEmail,
      phone: newStudentPhone,
      password: newStudentPassword,
      role: 'ALUNO',
      status: 'active',
      teacherId: user.id,
      belt: newStudentBelt,
      paymentStatus: 'paid',
      isVerified: false
    };
    setStudents(prev => [...prev, newStudent]);
    setNewStudentName(''); setNewStudentEmail(''); setNewStudentPhone(''); setNewStudentPassword(''); setNewStudentBelt('Branca');
    alert(`Matrícula efetuada para ${newStudentName}.`);
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;

    setIsModerating(true);
    const moderation = await moderateAnnouncement(announcementContent);

    if (moderation.authorized) {
      const newAnn: Announcement = {
        id: Math.random().toString(36).substr(2, 9),
        teacherId: user.id,
        content: announcementContent,
        timestamp: Date.now(),
        authorName: user.name
      };
      onAddAnnouncement(newAnn);
      setAnnouncementContent('');
      alert("DIRETRIZ TRANSMITIDA!\nSeus alunos receberão uma notificação instantânea.");
    } else {
      alert(`CONSELHO FEDERAL: ${moderation.reason}`);
    }
    setIsModerating(false);
  };

  const openEditModal = (student: User) => {
    setTargetToEdit({ ...student });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetToEdit) {
      onUpdateStudent(targetToEdit);
      setShowEditModal(false);
      setTargetToEdit(null);
    }
  };

  const sendWhatsAppCredentials = (student: User) => {
    if (!student.phone) {
      alert("WhatsApp não cadastrado.");
      return;
    }
    const cleanPhone = student.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`OSS! 🥋 Dados atualizados pelo Prof. ${user.name}.\n\nE-mail: ${student.email}\nChave: ${student.password}`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const deleteStudent = (id: string) => {
    const password = prompt('AUTORIZAÇÃO FEDERAL: Digite a senha 2026 para excluir:');
    if (password === '2026') {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else if (password !== null) {
      alert('Acesso Negado.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      
      {/* Modal de Edição de Aluno */}
      {showEditModal && targetToEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-xl p-1 bg-gradient-to-b from-indigo-500/30 to-transparent rounded-[3rem]">
            <div className="bg-[#080808] p-10 md:p-12 rounded-[2.9rem] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Editar Atleta</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nome</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-indigo-500" value={targetToEdit.name} onChange={e => setTargetToEdit({...targetToEdit, name: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">E-mail</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-indigo-500" value={targetToEdit.email} onChange={e => setTargetToEdit({...targetToEdit, email: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">WhatsApp</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-indigo-500" value={targetToEdit.phone || ''} onChange={e => setTargetToEdit({...targetToEdit, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Graduação</label>
                  <select className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-indigo-500" value={targetToEdit.belt} onChange={e => setTargetToEdit({...targetToEdit, belt: e.target.value})}>
                    {BELTS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all uppercase text-[10px] tracking-widest mt-4">Confirmar Alterações</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Painel do <span className="text-yellow-500">Instrutor</span></h2>
            <p className="text-gray-500 font-medium">Controle de alunos, graduações e avisos moderados.</p>
          </div>
        </header>

        {/* Emissão de Diretrizes / Notificações Push */}
        <section className="glass-card p-8 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400"><Megaphone size={24} /></div>
            <h3 className="text-xl font-black uppercase tracking-tight">Emitir Diretriz Federal</h3>
          </div>
          <form onSubmit={handlePostAnnouncement} className="space-y-4">
            <div className="relative">
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium text-white focus:border-indigo-500 outline-none h-32 resize-none placeholder:text-gray-700"
                placeholder="Escreva uma diretriz para seus alunos. A IA moderará o conteúdo antes do envio das notificações push."
                value={announcementContent}
                onChange={e => setAnnouncementContent(e.target.value)}
                required
              />
              {isModerating && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-indigo-400" />
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">IA Analisando Guarda...</span>
                </div>
              )}
            </div>
            <button 
              disabled={isModerating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-indigo-600/20"
            >
              <Send size={16} /> Transmitir Comunicado
            </button>
          </form>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem] border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-yellow-500/10 p-2 rounded-xl"><PlusCircle size={24} className="text-yellow-500" /></div>
            <h3 className="text-xl font-black uppercase tracking-tight">Novas Matrículas</h3>
          </div>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nome</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-yellow-500 text-sm font-medium" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase ml-2">E-mail</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-yellow-500 text-sm" type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} required /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase ml-2">WhatsApp</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-yellow-500 text-sm" value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)} required /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase ml-2">Graduação</label><select className="w-full bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-white" value={newStudentBelt} onChange={e => setNewStudentBelt(e.target.value)}>{BELTS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            <button className="md:col-span-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl uppercase text-xs tracking-widest">Matricular Atleta</button>
          </form>
        </section>

        <section className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><GraduationCap size={24} className="text-yellow-500" /> Gestão de Alunos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="px-8 py-5 font-black">Informação</th>
                  <th className="px-8 py-5 font-black text-center">Status</th>
                  <th className="px-8 py-5 font-black text-center">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teacherStudents.map(student => (
                  <tr key={student.id} className={`hover:bg-white/[0.02] transition-colors group ${student.status === 'paused' ? 'opacity-40 grayscale' : ''}`}>
                    <td className="px-8 py-5"><p className="font-black text-sm uppercase tracking-tighter">{student.name}</p><p className="text-[10px] text-gray-600 font-bold">{student.email}</p></td>
                    <td className="px-8 py-5 text-center"><span className="px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest bg-green-500/10 border-green-500/20 text-green-500">Ativo</span></td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => sendWhatsAppCredentials(student)} title="Zap" className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 transition-all"><MessageCircle size={18} /></button>
                        <button onClick={() => openEditModal(student)} title="Editar" className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => onToggleStudentStatus(student.id)} className="p-3 text-gray-500 hover:bg-white/10 rounded-xl">{student.status === 'active' ? <Pause size={18} /> : <Play size={18} />}</button>
                        <button onClick={() => deleteStudent(student.id)} className="text-gray-700 hover:text-red-500 p-3 rounded-xl"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <section className="glass-card p-8 rounded-[2.5rem] border-white/5 h-fit">
          <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 flex items-center gap-2">
            <History size={18} className="text-gray-600" /> Histórico de Avisos
          </h3>
          <div className="space-y-4">
            {myAnnouncements.length === 0 ? (
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest text-center py-10 border border-dashed border-white/5 rounded-2xl">Sem registros recentes</p>
            ) : (
              myAnnouncements.map(ann => (
                <div key={ann.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">"{ann.content}"</p>
                  <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{new Date(ann.timestamp).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
