
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, Announcement, Teacher } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Logo from './components/Logo';
import { LogOut, Cpu, ShieldAlert, Lock, Bell, X } from 'lucide-react';
import { processFinancialStatus } from './services/geminiService';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'system' | 'alert';
}

const App: React.FC = () => {
  const initialT: Teacher[] = [
    { id: 't1', name: 'Professor Carlos', email: 'carlos@academia.com', role: 'PROFESSOR', status: 'active', studentCount: 2, paymentStatus: 'paid', password: '123', belt: 'Preta', isVerified: true, phone: '11999999999' }
  ];
  const initialS: User[] = [
    { id: 's1', name: 'Ricardo Almeida', email: 'ricardo@aluno.com', role: 'ALUNO', status: 'active', teacherId: 't1', belt: 'Azul', paymentStatus: 'paid', password: '123', isVerified: true, phone: '11888888888' }
  ];

  const loadFromStorage = (key: string, fallback: any) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Erro ao carregar ${key}:`, e);
      return fallback;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadFromStorage('bjj_teachers', initialT));
  const [students, setStudents] = useState<User[]>(() => loadFromStorage('bjj_students', initialS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('bjj_announcements', []));
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('bjj_teachers', JSON.stringify(teachers));
    localStorage.setItem('bjj_students', JSON.stringify(students));
    localStorage.setItem('bjj_announcements', JSON.stringify(announcements));
  }, [teachers, students, announcements]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  }, []);

  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements(prev => [newAnn, ...prev]);
    
    // Dispara "Push" se o usuário logado for um aluno deste professor
    if (currentUser && currentUser.role === 'ALUNO' && currentUser.teacherId === newAnn.teacherId) {
      addNotification({
        title: `Novo Comunicado: Mestre ${newAnn.authorName}`,
        message: newAnn.content,
        type: 'announcement'
      });
    }
  };

  const handleToggleTeacherStatus = (id: string) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t));
  };

  const handleToggleStudentStatus = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s));
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };

  const handleUpdateStudent = (updatedStudent: User) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    setStudents(prev => prev.map(s => s.teacherId === id ? { ...s, status: 'paused' } : s));
  };

  const runAudit = async () => {
    setIsAiProcessing(true);
    try {
      const audit = async (u: User) => {
        const result = await processFinancialStatus(u.name, u.role, Math.floor(Math.random() * 10) - 5);
        return { ...u, paymentStatus: result.action === 'block' ? 'unpaid' : u.paymentStatus, lastAiAudit: result.message };
      };
      
      const updatedTeachers = await Promise.all(teachers.map(t => audit(t) as Promise<Teacher>));
      const updatedStudents = await Promise.all(students.map(s => audit(s)));
      
      setTeachers(updatedTeachers);
      setStudents(updatedStudents);
      addNotification({
        title: "Auditoria Finalizada",
        message: "A IA concluiu o escaneamento financeiro de toda a base.",
        type: 'system'
      });
    } catch (e) {
      console.error("Erro na auditoria:", e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const userSession = [...teachers, ...students, { id: 'admin-1', role: 'ADM', status: 'active', paymentStatus: 'paid' }].find(u => u.id === currentUser.id) || currentUser;
  const isUnpaid = userSession.paymentStatus === 'unpaid';
  const isPaused = userSession.status === 'paused';
  const isBlocked = (isUnpaid || isPaused) && userSession.role !== 'ADM';

  if (isBlocked) {
    return (
      <div className="min-h-screen bjj-gradient flex items-center justify-center p-8">
        <div className="glass-card p-10 md:p-14 rounded-[3rem] text-center max-w-md border-red-500/30">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black uppercase text-red-500 mb-4 italic">Acesso Restrito</h2>
          <p className="text-gray-400 text-sm mb-8 italic">
            {isPaused 
              ? "Sua conta foi suspensa temporariamente pela administração da federação." 
              : (userSession.lastAiAudit || "Pendência financeira detectada no sistema.")}
          </p>
          <button onClick={() => setCurrentUser(null)} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all">Voltar ao Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bjj-gradient text-white flex flex-col overflow-x-hidden relative">
      
      {/* Sistema de Toasts (Push Local) */}
      <div className="fixed top-24 right-4 md:right-8 z-[200] flex flex-col gap-4 w-full max-w-[320px] pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="glass-card p-5 rounded-2xl border-indigo-500/30 bg-[#0A0A0A]/95 shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-500 flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider leading-none">{n.title}</p>
              <p className="text-xs text-gray-400 font-medium leading-tight">{n.message}</p>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-gray-600 hover:text-white"><X size={14} /></button>
          </div>
        ))}
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/5 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center bg-black/80 backdrop-blur-xl">
        <Logo size={32} showText={true} />
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={runAudit} disabled={isAiProcessing} className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
            <Cpu size={14} className={isAiProcessing ? 'animate-spin' : ''} /> Auditoria IA
          </button>
          <button onClick={() => setCurrentUser(null)} className="p-2.5 md:p-3 bg-white/5 hover:bg-red-500/20 rounded-xl transition-all border border-white/10"><LogOut size={16} /></button>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10">
        {userSession.role === 'ADM' && (
          <AdminDashboard 
            teachers={teachers} 
            setTeachers={setTeachers} 
            students={students} 
            setStudents={setStudents} 
            onToggleStatus={handleToggleTeacherStatus} 
            onToggleStudentStatus={handleToggleStudentStatus}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onUpdateStudent={handleUpdateStudent}
          />
        )}
        {userSession.role === 'PROFESSOR' && (
          <TeacherDashboard 
            user={userSession} 
            students={students} 
            setStudents={setStudents} 
            announcements={announcements} 
            onAddAnnouncement={handleAddAnnouncement}
            setTeachers={setTeachers} 
            onToggleStudentStatus={handleToggleStudentStatus}
            onUpdateStudent={handleUpdateStudent}
          />
        )}
        {userSession.role === 'ALUNO' && <StudentDashboard user={userSession} onUpdateStudent={handleUpdateStudent} announcements={announcements} />}
      </main>
    </div>
  );
};

export default App;
