
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Filter, CheckCircle, Clock, RotateCcw, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { mockDataService, Diario, Turma, Disciplina, Usuario } from '../../../services/mockData';

export function DiariosList() {
  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isDevolverDialogOpen, setIsDevolverDialogOpen] = useState(false);
  const [isFinalizarDialogOpen, setIsFinalizarDialogOpen] = useState(false);
  const [editingDiario, setEditingDiario] = useState<Diario | null>(null);
  const [selectedDiario, setSelectedDiario] = useState<Diario | null>(null);
  const [observacaoDevolucao, setObservacaoDevolucao] = useState('');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [filters, setFilters] = useState({
    disciplina: '',
    turma: '',
    professor: '',
    bimestre: '',
    status: '',
    statusDiario: ''
  });
  const [formData, setFormData] = useState({
    nome: '',
    disciplinaId: '',
    turmaId: '',
    professorId: '',
    bimestre: '',
    dataInicio: '',
    dataTermino: ''
  });

  const loadData = useCallback(() => {
    setDiarios(mockDataService.getDiarios());
    setTurmas(mockDataService.getTurmas());
    setDisciplinas(mockDataService.getDisciplinas());
    setProfessores(mockDataService.getUsuarios().filter(u => u.papel === 'PROFESSOR'));
    
    // Carregar usuário atual
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtros ultra-otimizados - cache de cálculos pesados
  const filteredDiarios = useMemo(() => {
    if (!searchTerm && !Object.values(filters).some(v => v && v !== 'all')) {
      return diarios; // Retorna lista completa sem processamento
    }

    return diarios.filter(diario => {
      // Filtro de busca simples primeiro
      if (searchTerm && !diario.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtros simples primeiro
      if (filters.disciplina && filters.disciplina !== 'all' && 
          diario.disciplinaId.toString() !== filters.disciplina) return false;
      
      if (filters.turma && filters.turma !== 'all' && 
          diario.turmaId.toString() !== filters.turma) return false;
      
      if (filters.professor && filters.professor !== 'all' && 
          diario.professorId.toString() !== filters.professor) return false;
      
      if (filters.bimestre && filters.bimestre !== 'all' && diario.bimestre && 
          diario.bimestre.toString() !== filters.bimestre) return false;

      // Filtro por status do diário
      if (filters.statusDiario && filters.statusDiario !== 'all' && 
          diario.status !== filters.statusDiario) return false;

      // Status baseado nas datas - cálculo mais pesado por último
      if (filters.status && filters.status !== 'all') {
        const hoje = new Date();
        const dataInicio = new Date(diario.dataInicio);
        const dataTermino = new Date(diario.dataTermino);
        
        if (filters.status === 'ativo' && !(hoje >= dataInicio && hoje <= dataTermino)) return false;
        if (filters.status === 'finalizado' && !(hoje > dataTermino)) return false;
        if (filters.status === 'futuro' && !(hoje < dataInicio)) return false;
      }

      return true;
    });
  }, [diarios, searchTerm, filters]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      nome: formData.nome,
      disciplinaId: Number(formData.disciplinaId),
      turmaId: Number(formData.turmaId),
      professorId: Number(formData.professorId),
      bimestre: Number(formData.bimestre),
      dataInicio: formData.dataInicio,
      dataTermino: formData.dataTermino,
      status: 'PENDENTE' as const
    };

    if (editingDiario) {
      mockDataService.updateDiario(editingDiario.id, data);
    } else {
      mockDataService.createDiario(data);
    }

    loadData();
    resetForm();
  }, [formData, editingDiario, loadData]);

  const handleEdit = useCallback((diario: Diario) => {
    setEditingDiario(diario);
    setFormData({
      nome: diario.nome,
      disciplinaId: diario.disciplinaId.toString(),
      turmaId: diario.turmaId.toString(),
      professorId: diario.professorId.toString(),
      bimestre: diario.bimestre ? diario.bimestre.toString() : '1',
      dataInicio: diario.dataInicio || '',
      dataTermino: diario.dataTermino || ''
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja excluir este diário?')) {
      mockDataService.deleteDiario(id);
      loadData();
    }
  }, [loadData]);

  const handleDevolverDiario = useCallback(() => {
    if (!selectedDiario || !currentUser) return;
    
    const sucesso = mockDataService.devolverDiario(
      selectedDiario.id, 
      currentUser.id, 
      observacaoDevolucao
    );
    
    if (sucesso) {
      loadData();
      setIsDevolverDialogOpen(false);
      setObservacaoDevolucao('');
      setSelectedDiario(null);
    }
  }, [selectedDiario, currentUser, observacaoDevolucao, loadData]);

  const handleFinalizarDiario = useCallback(() => {
    if (!selectedDiario || !currentUser) return;
    
    const sucesso = mockDataService.finalizarDiario(selectedDiario.id, currentUser.id);
    
    if (sucesso) {
      loadData();
      setIsFinalizarDialogOpen(false);
      setSelectedDiario(null);
    }
  }, [selectedDiario, currentUser, loadData]);

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      disciplinaId: '',
      turmaId: '',
      professorId: '',
      bimestre: '',
      dataInicio: '',
      dataTermino: ''
    });
    setEditingDiario(null);
    setIsDialogOpen(false);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setIsFilterDialogOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      disciplina: '',
      turma: '',
      professor: '',
      bimestre: '',
      status: '',
      statusDiario: ''
    });
  }, []);

  const getActiveFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '' && value !== 'all').length;
  }, [filters]);

  // Cache de nomes para evitar buscas repetidas
  const getTurmaNome = useCallback((turmaId: number) => {
    return turmas.find(t => t.id === turmaId)?.nome || 'N/A';
  }, [turmas]);

  const getDisciplinaNome = useCallback((disciplinaId: number) => {
    return disciplinas.find(d => d.id === disciplinaId)?.nome || 'N/A';
  }, [disciplinas]);

  const getProfessorNome = useCallback((professorId: number) => {
    return professores.find(p => p.id === professorId)?.nome || 'N/A';
  }, [professores]);

  const getStatusDiario = useCallback((diario: Diario) => {
    const hoje = new Date();
    const dataInicio = new Date(diario.dataInicio);
    const dataTermino = new Date(diario.dataTermino);
    
    if (hoje < dataInicio) return { label: 'Futuro', variant: 'secondary' as const };
    if (hoje > dataTermino) return { label: 'Finalizado', variant: 'outline' as const };
    return { label: 'Ativo', variant: 'default' as const };
  }, []);

  const getStatusDiarioInfo = useCallback((status: string) => {
    switch (status) {
      case 'PENDENTE':
        return { 
          label: 'Pendente', 
          variant: 'secondary' as const, 
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'ENTREGUE':
        return { 
          label: 'Entregue', 
          variant: 'default' as const, 
          icon: CheckCircle,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'DEVOLVIDO':
        return { 
          label: 'Devolvido', 
          variant: 'destructive' as const, 
          icon: RotateCcw,
          color: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'FINALIZADO':
        return { 
          label: 'Finalizado', 
          variant: 'outline' as const, 
          icon: XCircle,
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return { 
          label: 'Desconhecido', 
          variant: 'secondary' as const, 
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  }, []);

  const canManageDiario = useCallback((diario: Diario) => {
    if (!currentUser || currentUser.papel !== 'COORDENADOR') return { canDevolver: false, canFinalizar: false };
    return mockDataService.coordenadorPodeGerenciarDiario(diario.id);
  }, [currentUser]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="space-y-2">
            <h3 className="card-title">Diários</h3>
            <p className="card-description">
              Gerencie os diários de classe e controle o status de entrega
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">Novo</span>
                <span className="hidden sm:inline">Novo Diário</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-[800px] max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDiario ? 'Editar Diário' : 'Novo Diário'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do diário de classe
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome do Diário"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select 
                        value={formData.disciplinaId} 
                        onValueChange={(value) => setFormData({ ...formData, disciplinaId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplinas.map((disciplina) => (
                            <SelectItem key={disciplina.id} value={disciplina.id.toString()}>
                              {disciplina.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select 
                        value={formData.turmaId} 
                        onValueChange={(value) => setFormData({ ...formData, turmaId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {turmas.map((turma) => (
                            <SelectItem key={turma.id} value={turma.id.toString()}>
                              {turma.nome} - {turma.turno}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select 
                        value={formData.professorId} 
                        onValueChange={(value) => setFormData({ ...formData, professorId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Professor" />
                        </SelectTrigger>
                        <SelectContent>
                          {professores.map((professor) => (
                            <SelectItem key={professor.id} value={professor.id.toString()}>
                              {professor.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select 
                        value={formData.bimestre} 
                        onValueChange={(value) => setFormData({ ...formData, bimestre: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bimestre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1º Bimestre</SelectItem>
                          <SelectItem value="2">2º Bimestre</SelectItem>
                          <SelectItem value="3">3º Bimestre</SelectItem>
                          <SelectItem value="4">4º Bimestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataTermino">Data de Término</Label>
                      <Input
                        id="dataTermino"
                        type="date"
                        value={formData.dataTermino}
                        onChange={(e) => setFormData({ ...formData, dataTermino: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingDiario ? 'Salvar Alterações' : 'Criar Diário'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar diários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant={getActiveFiltersCount > 0 ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {getActiveFiltersCount > 0 && (
                  <span className="bg-white text-blue-600 rounded-full px-1.5 py-0.5 text-xs font-medium">
                    {getActiveFiltersCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filtrar Diários</DialogTitle>
                <DialogDescription>
                  Use os filtros abaixo para refinar a lista de diários
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filterStatusDiario">Status do Diário</Label>
                  <Select 
                    value={filters.statusDiario} 
                    onValueChange={(value) => setFilters({ ...filters, statusDiario: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="ENTREGUE">Entregue</SelectItem>
                      <SelectItem value="DEVOLVIDO">Devolvido</SelectItem>
                      <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filterDisciplina">Disciplina</Label>
                  <Select 
                    value={filters.disciplina} 
                    onValueChange={(value) => setFilters({ ...filters, disciplina: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as disciplinas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as disciplinas</SelectItem>
                      {disciplinas.map((disciplina) => (
                        <SelectItem key={disciplina.id} value={disciplina.id.toString()}>
                          {disciplina.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filterTurma">Turma</Label>
                  <Select 
                    value={filters.turma} 
                    onValueChange={(value) => setFilters({ ...filters, turma: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as turmas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as turmas</SelectItem>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id.toString()}>
                          {turma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filterProfessor">Professor</Label>
                  <Select 
                    value={filters.professor} 
                    onValueChange={(value) => setFilters({ ...filters, professor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os professores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os professores</SelectItem>
                      {professores.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id.toString()}>
                          {professor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filterBimestre">Bimestre</Label>
                  <Select 
                    value={filters.bimestre} 
                    onValueChange={(value) => setFilters({ ...filters, bimestre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os bimestres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os bimestres</SelectItem>
                      <SelectItem value="1">1º Bimestre</SelectItem>
                      <SelectItem value="2">2º Bimestre</SelectItem>
                      <SelectItem value="3">3º Bimestre</SelectItem>
                      <SelectItem value="4">4º Bimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="futuro">Futuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Limpar Filtros
                </Button>
                <Button type="button" onClick={handleApplyFilters}>
                  Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-4">
          {filteredDiarios.map((diario) => {
            const status = getStatusDiario(diario);
            const statusDiario = getStatusDiarioInfo(diario.status);
            const StatusIcon = statusDiario.icon;
            const permissions = canManageDiario(diario);
            
            return (
              <div key={diario.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium">{diario.nome}</h3>
                    <Badge variant="outline">{diario.bimestre}º Bimestre</Badge>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDiario.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusDiario.label}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span>Disciplina: {getDisciplinaNome(diario.disciplinaId)}</span>
                    <span>Turma: {getTurmaNome(diario.turmaId)}</span>
                    <span>Professor: {getProfessorNome(diario.professorId)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-500">
                    <span>Início: {new Date(diario.dataInicio).toLocaleDateString('pt-BR')}</span>
                    <span>Término: {new Date(diario.dataTermino).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {diario.solicitacaoDevolucao && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      <div className="flex items-center gap-1 text-orange-800 font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Solicitação de Devolução
                      </div>
                      <p className="text-orange-700 mt-1">{diario.solicitacaoDevolucao.comentario}</p>
                      <p className="text-orange-600 text-xs mt-1">
                        Solicitado em: {new Date(diario.solicitacaoDevolucao.dataSolicitacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {/* Ações do Coordenador */}
                  {currentUser?.papel === 'COORDENADOR' && (
                    <>
                      {permissions.canDevolver && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1 whitespace-nowrap"
                          onClick={() => {
                            setSelectedDiario(diario);
                            setIsDevolverDialogOpen(true);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Devolver
                        </Button>
                      )}
                      {permissions.canFinalizar && (
                        <Button
                          variant="default"
                          size="sm"
                          className="inline-flex items-center gap-1 whitespace-nowrap"
                          onClick={() => {
                            setSelectedDiario(diario);
                            setIsFinalizarDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Finalizar
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="none"
                  className="h-8 w-8 p-0 inline-flex items-center justify-center"
                    onClick={() => handleEdit(diario)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="none"
                  className="h-8 w-8 p-0 inline-flex items-center justify-center"
                    onClick={() => handleDelete(diario.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {filteredDiarios.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum diário encontrado</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Modal de Devolução */}
      <Dialog open={isDevolverDialogOpen} onOpenChange={setIsDevolverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver Diário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja devolver este diário para o professor? Adicione uma observação explicando o motivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                value={observacaoDevolucao}
                onChange={(e) => setObservacaoDevolucao(e.target.value)}
                placeholder="Explique o motivo da devolução..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDevolverDialogOpen(false);
                setObservacaoDevolucao('');
                setSelectedDiario(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDevolverDiario}>
              Devolver Diário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Finalização */}
      <Dialog open={isFinalizarDialogOpen} onOpenChange={setIsFinalizarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Diário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja finalizar este diário? Após a finalização, nem o professor nem o coordenador poderão mais editá-lo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsFinalizarDialogOpen(false);
                setSelectedDiario(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleFinalizarDiario}>
              Finalizar Diário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
