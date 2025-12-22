
import React, { useState, useEffect } from 'react';
import { User, Role, Teacher } from '../types';
import { Eye, EyeOff, ChevronRight, Fingerprint, Mail, RefreshCw, CheckCircle2, ShieldAlert, CloudDownload, CheckCircle, Cloud, Zap, Database, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [view, setView] = useState<'login' | 'verify_pending' | 'sync_db'>('login');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [syncToken, setSyncToken] = useState('');
  const [autoSyncSuccess, setAutoSyncSuccess] = useState(false);

  // Detector de Storage Universal
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#storage=') || hash.startsWith('#sync=')) {
      const token = hash.split('=')[1];
      handleStorageImport(token);
    }
  }, []);

  const handleStorageImport = (token: string) => {
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.t && decoded.s) {
        localStorage.setItem('bjj_teachers', JSON.stringify(decoded.t));
        localStorage.setItem('bjj_students', JSON.stringify(decoded.s));
        setAutoSyncSuccess(true);
        window.history.replaceState(null, '', window.location.pathname);
        setTimeout(() => setAutoSyncSuccess(false), 5000);
      }
    } catch (e) {
      console.error("Falha ao Provisionar Storage:", e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(email, password);
  };

  const processLogin = (userEmail: string, userPass: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const normalizedEmail = userEmail.toLowerCase().trim();

      // Admin Bypass
      if (normalizedEmail === 'jefersoncarvalho252@gmail.com' && userPass === 'ben150718') {
        onLogin({
          id: 'admin-1',
          name: 'Jeferson Carvalho',
          email: userEmail,
          role: 'ADM',
          status: 'active',
          paymentStatus: 'paid',
          isVerified: true
        });
        setIsLoading(false);
        return;
      }

      const storedTeachers: Teacher[] = JSON.parse(localStorage.getItem('bjj_teachers') || '[]');
      const storedStudents: User[] = JSON.parse(localStorage.getItem('bjj_students') || '[]');

      const foundUser = [...storedTeachers, ...storedStudents].find(u => u.email.toLowerCase() === normalizedEmail);

      if (foundUser) {
        if (foundUser.password === userPass) {
          if (foundUser.isVerified === false) {
            setPendingUser(foundUser);
            setView('verify_pending');
          } else {
            onLogin(foundUser);
          }
        } else {
          alert('Chave de Segurança inválida.');
        }
      } else {
        alert('STORAGE NÃO ENCONTRADO NESTE DISPOSITIVO.\n\nSincronize sua base de dados primeiro.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleResendVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert(`LINK REENVIADO!\n\nUm novo token de ativação foi enviado para ${pendingUser?.email}. Verifique sua caixa de entrada e spam.`);
    }, 2000);
  };

  const handleConfirmVerification = () => {
    if (!pendingUser) return;
    
    setIsLoading(true);
    setTimeout(() => {
      // Simula a atualização no storage global
      const storedTeachers: Teacher[] = JSON.parse(localStorage.getItem('bjj_teachers') || '[]');
      const storedStudents: User[] = JSON.parse(localStorage.getItem('bjj_students') || '[]');

      const updatedUser = { ...pendingUser, isVerified: true };

      if (pendingUser.role === 'PROFESSOR') {
        const newList = storedTeachers.map(t => t.id === pendingUser.id ? { ...t, isVerified: true } : t);
        localStorage.setItem('bjj_teachers', JSON.stringify(newList));
      } else {
        const newList = storedStudents.map(s => s.id === pendingUser.id ? { ...s, isVerified: true } : s);
        localStorage.setItem('bjj_students', JSON.stringify(newList));
      }

      onLogin(updatedUser);
      setIsLoading(false);
    }, 1500);
  };

  const handleManualImport = () => {
    try {
      const decoded = JSON.parse(atob(syncToken));
      if (decoded.t && decoded.s) {
        localStorage.setItem('bjj_teachers', JSON.stringify(decoded.t));
        localStorage.setItem('bjj_students', JSON.stringify(decoded.s));
        alert("STORAGE SINCRONIZADO!");
        setView('login');
      } else {
        throw new Error();
      }
    } catch (e) {
      alert("ERRO NO TOKEN DE STORAGE.");
    }
  };

  if (view === 'sync_db') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="max-w-md w-full">
          <div className="glass-card p-1 bg-gradient-to-br from-blue-500/30 to-transparent rounded-[3rem]">
            <div className="bg-[#080808]/95 p-10 md:p-12 rounded-[2.9rem] text-center space-y-8">
              <div className="inline-flex p-6 bg-blue-500/10 rounded-full text-blue-500">
                <Database size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white uppercase italic">Provisionar Storage</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Importe os dados da Federação</p>
              </div>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-mono text-gray-400 h-32 focus:border-blue-500 outline-none"
                placeholder="Cole o Token de Storage aqui..."
                value={syncToken}
                onChange={(e) => setSyncToken(e.target.value)}
              />
              <div className="space-y-4">
                <button onClick={handleManualImport} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest transition-all">Importar Agora</button>
                <button onClick={() => setView('login')} className="w-full text-gray-600 font-bold uppercase text-[9px]">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'verify_pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/5 blur-[120px]"></div>
        <div className="max-w-md w-full relative z-10">
          <div className="glass-card p-1 bg-gradient-to-br from-yellow-500/30 to-transparent rounded-[3.5rem] shadow-[0_0_100px_rgba(212,175,55,0.1)]">
            <div className="bg-[#080808]/95 p-10 md:p-14 rounded-[3.4rem] text-center space-y-10">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full animate-ping"></div>
                <div className="bg-yellow-500/20 p-6 rounded-full text-yellow-500 relative z-10 border border-yellow-500/20">
                  <Mail size={40} />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Acesso Pendente</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                  Sua conta federativa ainda não foi validada. Verifique o e-mail:
                  <br />
                  <span className="text-yellow-500 mt-2 block lowercase tracking-normal text-xs">{pendingUser?.email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleConfirmVerification}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-yellow-500 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl h-[70px]"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                  {isLoading ? 'Autenticando...' : 'Confirmar Verificação'}
                </button>

                <button 
                  onClick={handleResendVerification}
                  disabled={isVerifying}
                  className="w-full bg-white/5 border border-white/10 hover:border-yellow-500/30 text-gray-400 hover:text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase text-[9px] tracking-widest transition-all"
                >
                  {isVerifying ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  {isVerifying ? 'Enviando...' : 'Reenviar Link de Ativação'}
                </button>
              </div>

              <button 
                onClick={() => setView('login')}
                className="flex items-center justify-center gap-2 mx-auto text-gray-700 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
              >
                <ArrowLeft size={12} /> Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden overflow-y-auto bg-black p-4 sm:p-8 relative">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      {autoSyncSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-500">
          <div className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/20">
            <Zap className="animate-pulse" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Storage Provisionado com Sucesso!</span>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full relative z-10 py-10 md:py-24 flex flex-col items-center">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center justify-center mb-6"><Logo size={100} /></div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-2 font-display">BJJ <span className="text-yellow-500">PRO</span></h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            <p className="text-gray-500 font-black uppercase tracking-[0.6em] text-[9px]">Storage Cloud Management</p>
          </div>
        </div>

        <div className="glass-card w-full p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[3.5rem] shadow-2xl">
          <div className="bg-[#080808]/90 p-8 md:p-14 rounded-[3.4rem] space-y-10">
            <div className="space-y-2 text-center">
              <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-2 text-yellow-500 border border-white/5 animate-pulse"><Fingerprint size={28} /></div>
              <h2 className="text-white text-base md:text-lg font-black uppercase italic tracking-tight">Criptografia Federal</h2>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Sincronize seu storage para entrar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <input type="email" placeholder="E-mail federativo" className="w-full py-4 px-6 md:py-5 md:px-8 rounded-2xl text-white outline-none font-medium bg-white/5 border border-white/10 focus:border-yellow-500 transition-all placeholder:text-gray-700" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Chave de Segurança" className="w-full py-4 px-6 md:py-5 md:px-8 rounded-2xl text-white outline-none font-medium bg-white/5 border border-white/10 focus:border-yellow-500 transition-all placeholder:text-gray-700 tracking-widest" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-white hover:bg-yellow-500 text-black font-black py-5 md:py-6 rounded-2xl transition-all duration-500 uppercase text-[10px] md:text-xs tracking-[0.3em] flex items-center justify-center gap-3 h-[60px] md:h-[70px] shadow-xl">
                {isLoading ? <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div> : <><span>Acessar Federação</span><ChevronRight size={18} /></>}
              </button>
            </form>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="p-4 bg-blue-500/5 rounded-2xl text-center">
                 <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest flex items-center justify-center gap-2">
                   <Cloud size={12} /> Storage Global Provisionado
                 </p>
              </div>
              <button 
                onClick={() => setView('sync_db')}
                className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/10 rounded-2xl text-gray-700 hover:text-blue-500 hover:border-blue-500/30 transition-all text-[9px] font-black uppercase tracking-widest"
              >
                <Database size={14} /> Importar Base de Dados Manual
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
