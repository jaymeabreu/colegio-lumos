
export interface User {
  id: number;
  nome: string;
  email: string;
  papel: 'COORDENADOR' | 'PROFESSOR' | 'ALUNO';
  alunoId?: number;     // Para usuários do tipo ALUNO
  professorId?: number; // Para usuários do tipo PROFESSOR
}


export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const MOCK_MODE = true;

class AuthService {
  private storageKey = 'gestao_escolar_auth';
  private cachedAuthState: AuthState | null = null;

  getAuthState(): AuthState {
    if (!MOCK_MODE) return { user: null, isAuthenticated: false };
    
    // Usar cache se disponível para evitar re-reads desnecessários
    if (this.cachedAuthState) {
      return this.cachedAuthState;
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const user = JSON.parse(stored);
        // Validação básica do objeto user
        if (user && user.id && user.email && user.papel) {
          this.cachedAuthState = { user, isAuthenticated: true };
          return this.cachedAuthState;
        }
      }
    } catch (error) {
      console.error('Erro ao ler auth do localStorage:', error);
      localStorage.removeItem(this.storageKey);
    }
    
    this.cachedAuthState = { user: null, isAuthenticated: false };
    return this.cachedAuthState;
  }

  private getUsuariosFromStorage() {
    try {
      const stored = localStorage.getItem('gestao_escolar_data');
      if (stored) {
        const data = JSON.parse(stored);
        return data.usuarios || [];
      }
    } catch (error) {
      console.error('Erro ao ler usuários do localStorage:', error);
    }
    return [];
  }

  private getSenhasFromStorage() {
    try {
      const stored = localStorage.getItem('gestao_escolar_senhas');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao ler senhas do localStorage:', error);
    }
    return {};
  }

  async login(email: string, senha: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!MOCK_MODE) {
      return { success: false, error: 'Modo mock desabilitado' };
    }

    // Buscar usuários do sistema administrativo
    const usuarios = this.getUsuariosFromStorage();
    const senhas = this.getSenhasFromStorage();

    // Usuários padrão do sistema (para compatibilidade)
    const usuariosPadrao = [
  {
    id: 1,
    nome: 'Coordenador Sistema',
    email: 'coordenador@demo.com',
    senha: '123456',
    papel: 'COORDENADOR' as const
  },
  {
    id: 2,
    nome: 'Professor História',
    email: 'prof@demo.com',
    senha: '123456',
    papel: 'PROFESSOR' as const,
    professorId: 1 // <- IMPORTANTE: bate com o professorId do mockData
  },
  {
    id: 3,
    nome: 'Ana Clara Santos',
    email: 'aluno@demo.com',
    senha: '123456',
    papel: 'ALUNO' as const,
    alunoId: 1
  }
];


    // Primeiro, verificar usuários padrão
    let usuario = usuariosPadrao.find(u => u.email === email && u.senha === senha);
    
    // Se não encontrou nos padrão, verificar nos usuários criados no sistema
    if (!usuario) {
  const usuarioSistema = usuarios.find((u: any) => u.email === email);
  if (usuarioSistema) {
    const senhaArmazenada = senhas[usuarioSistema.id];
    if (senhaArmazenada === senha) {
      usuario = {
        id: usuarioSistema.id,
        nome: usuarioSistema.nome,
        email: usuarioSistema.email,
        senha: senhaArmazenada,
        papel: usuarioSistema.papel,
        alunoId: usuarioSistema.alunoId,
        professorId: usuarioSistema.professorId
      };
    }
  }
}

    
    if (!usuario) {
      return { success: false, error: 'Email ou senha inválidos' };
    }

    const user: User = {
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  papel: usuario.papel,
  alunoId: usuario.alunoId,
  professorId: usuario.professorId
};


    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      // Atualizar cache
      this.cachedAuthState = { user, isAuthenticated: true };
      return { success: true, user };
    } catch (error) {
      console.error('Erro ao salvar auth no localStorage:', error);
      return { success: false, error: 'Erro ao salvar sessão' };
    }
  }

  logout(): void {
    try {
      localStorage.removeItem(this.storageKey);
      // Limpar cache
      this.cachedAuthState = null;
    } catch (error) {
      console.error('Erro ao limpar auth do localStorage:', error);
    }
  }

  getRedirectPath(papel: string): string {
    switch (papel) {
      case 'COORDENADOR':
        return '/app/admin';
      case 'PROFESSOR':
        return '/app/professor';
      case 'ALUNO':
        return '/app/aluno';
      default:
        return '/';
    }
  }

  hasPermission(userRole: string, requiredRole: string): boolean {
    if (userRole === 'COORDENADOR') return true;
    return userRole === requiredRole;
  }

  canAccessDiario(userId: number, diarioId: number): boolean {
    // Mock: Professor só acessa diário ID 1
    if (userId === 2 && diarioId === 1) return true;
    return false;
  }
}

export const authService = new AuthService();
