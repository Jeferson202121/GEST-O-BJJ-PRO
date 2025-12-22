
export type Role = 'ADM' | 'PROFESSOR' | 'ALUNO';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Novo campo para WhatsApp
  password?: string;
  role: Role;
  status: 'active' | 'paused' | 'debt';
  teacherId?: string; // For students
  belt?: string;
  paymentStatus: 'paid' | 'unpaid';
  dueDate?: number; // Timestamp do vencimento
  lastAiAudit?: string; // Log da última ação da IA
  isVerified?: boolean; // Status de verificação de e-mail
}

export interface Teacher extends User {
  studentCount: number;
}

export interface Announcement {
  id: string;
  teacherId: string;
  content: string;
  timestamp: number;
  authorName: string;
}

export interface CrisisAccess {
  teacherId: string;
  active: boolean;
}
