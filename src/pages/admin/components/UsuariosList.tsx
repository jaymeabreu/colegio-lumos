import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Eye, EyeOff, Copy, Shuffle, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { mockDataService, Usuario, Aluno } from '../../../services/mockData';

export function UsuariosList() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados dos filtros - simplificados
  const [filters, setFilters] = useState({
    papel: '',
    temAluno: '',
    temProfessor: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    papel: '',
    alunoId: '',
    senha: '',
    confirmarSenha: ''
  });

  const loadData = useCallback(() => {
    setUsuarios(mockDataService.getUsuarios());
    setAlunos(mockDataService.getAlunos());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtros ultra-otimizados
  const filteredUsuarios = useMemo(() => {
    if (!searchTerm && !Object.values(filters).some(v => v && v !== 'all')) {
      return usuarios; // Retorna lista completa sem processamento
    }

    return usuarios.filter(usuario => {
      // Filtro de busca simples primeiro
      if (searchTerm && !usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !usuario.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtros básicos
      if (filters.papel && filters.papel !== 'all' && usuario.papel !== filters.papel) return false;

      // Filtros mais pesados apenas se necessário
      if (filters.temAluno && filters.temAluno !== 'all') {
        if (filters.temAluno === 'sim' && !usuario.alunoId) return false;
        if (filters.temAluno === 'nao' && usuario.alunoId) return false;
      }

      if (filters.temProfessor && filters.temProfessor !== 'all') {
        if (filters.temProfessor === 'sim' && !usuario.professorId) return false;
        if (filters.temProfessor === 'nao' && usuario.professorId) return false;
      }

      return true;
    });
  }, [usuarios, searchTerm, filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      papel: '',
      temAluno: '',
      temProfessor: ''
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '' && value !== 'all');
  }, [filters]);

  const generatePassword = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, senha: password, confirmarSenha: password }));
  }, []);

  const copyPassword = useCallback(() => {
    if (formData.senha) {
      navigator.clipboard.writeText(formData.senha);
    }
  }, [formData.senha]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    const data = {
      nome: formData.nome,
      email: formData.email,
      papel: formData.papel as 'COORDENADOR' | 'PROFESSOR' | 'ALUNO',
      alunoId: formData.alunoId ? Number(formData.alunoId) : undefined
    };

    if (editingUsuario) {
      mockDataService.updateUsuario(editingUsuario.id, data, formData.senha || undefined);
    } else {
      if (!formData.senha) {
        alert('Senha é obrigatória para novos usuários!');
        return;
      }
      mockDataService.createUsuario(data, formData.senha);
    }

    loadData();
    resetForm();
  }, [formData, editingUsuario, loadData]);

  const handleEdit = useCallback((usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      alunoId: usuario.alunoId?.toString() || '',
      senha: '',
      confirmarSenha: ''
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      mockDataService.deleteUsuario(id);
      loadData();
    }
  }, [loadData]);

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      email: '',
      papel: '',
      alunoId: '',
      senha: '',
      confirmarSenha: ''
    });
    setEditingUsuario(null);
    setIsDialogOpen(false);
    setShowPassword(false);
  }, []);

  // Funções otimizadas com cache
  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case 'COORDENADOR':
        return 'bg-purple-100 text-purple-800';
      case 'PROFESSOR':
        return 'bg-blue-100 text-blue-800';
      case 'ALUNO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getAlunoNome = useCallback((alunoId?: number) => {
    if (!alunoId) return '';
    return alunos.find(a => a.id === alunoId)?.nome || '';
  }, [alunos]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Gerencie os usuários do sistema
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            {/* ... dialog content stays the same ... */}
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={`flex items-center gap-2 whitespace-nowrap ${hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            {/* ... filter dialog content stays the same ... */}
          </Dialog>
        </div>
        
        <div className="space-y-4">
          {filteredUsuarios.map((usuario) => (
            <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">{usuario.nome}</h3>
                  <Badge className={getRoleBadgeColor(usuario.papel)}>
                    {usuario.papel}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Email: {usuario.email}</p>
                  {usuario.alunoId && (
                    <p>Aluno vinculado: {getAlunoNome(usuario.alunoId)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn btn-outline h-10 w-10 h-8 w-8"
                  onClick={() => handleEdit(usuario)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn btn-destructive h-10 w-10 h-8 w-8"
                  onClick={() => handleDelete(usuario.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredUsuarios.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
