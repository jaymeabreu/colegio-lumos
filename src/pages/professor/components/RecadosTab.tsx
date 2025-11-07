import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Calendar, Users, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { DiarioHeader } from './DiarioHeader';
import {
  mockDataService,
  Recado,
  Turma,
  Aluno,
  Diario,
  Disciplina,
  Usuario
} from '../../../services/mockData';

interface RecadosTabProps {
  currentDiario: Diario | null;
  disciplinas: Disciplina[];
  turmas: Turma[];
  currentUser: Usuario | null;
  onBackToDiarios: () => void;
  onStatusChange: () => void;
}

export function RecadosTab({
  currentDiario,
  disciplinas,
  turmas,
  currentUser,
  onBackToDiarios,
  onStatusChange
}: RecadosTabProps) {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecado, setEditingRecado] = useState<Recado | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    turmaId: '',
    alunoId: ''
  });

  // professorId e nome vindo do currentUser (Usuario do mockData)
  const professorId = currentUser?.professorId;
  const professorNome = currentUser?.nome ?? 'Professor';

  useEffect(() => {
    loadData();
  }, [professorId]);

  const loadData = () => {
    try {
      console.log('Carregando dados dos recados...');
      setLoading(true);

      if (professorId) {
        const recadosData = mockDataService.getRecadosByProfessor(professorId);
        setRecados(
          recadosData.sort(
            (a, b) =>
              new Date(b.dataEnvio).getTime() -
              new Date(a.dataEnvio).getTime()
          )
        );
      } else {
        setRecados([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlunosByTurma = (turmaId: string) => {
    if (turmaId) {
      const alunosData = mockDataService.getAlunosByTurma(parseInt(turmaId));
      setAlunos(alunosData);
    } else {
      setAlunos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.mensagem.trim() || !formData.turmaId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!professorId) {
      alert('Não foi possível identificar o professor logado.');
      return;
    }

    setIsSubmitting(true);

    try {
      const turma = turmas.find(t => t.id === parseInt(formData.turmaId));
      const aluno = formData.alunoId
        ? alunos.find(a => a.id === parseInt(formData.alunoId))
        : null;

      if (editingRecado) {
        const updatedRecado = mockDataService.updateRecado(editingRecado.id, {
          titulo: formData.titulo.trim(),
          mensagem: formData.mensagem.trim(),
          turmaId: parseInt(formData.turmaId),
          turmaNome: turma?.nome || '',
          alunoId: formData.alunoId ? parseInt(formData.alunoId) : undefined,
          alunoNome: aluno?.nome || undefined
        });

        if (updatedRecado) {
          alert('Recado atualizado com sucesso!');
          setRecados(prev =>
            prev.map(r => (r.id === updatedRecado.id ? updatedRecado : r))
          );
        } else {
          throw new Error('Falha ao atualizar recado');
        }
      } else {
        const novoRecado = mockDataService.createRecado({
          titulo: formData.titulo.trim(),
          mensagem: formData.mensagem.trim(),
          professorId,
          professorNome,
          turmaId: parseInt(formData.turmaId),
          turmaNome: turma?.nome || '',
          alunoId: formData.alunoId ? parseInt(formData.alunoId) : undefined,
          alunoNome: aluno?.nome || undefined,
          dataEnvio: new Date().toISOString().split('T')[0]
        });

        if (novoRecado) {
          alert('Recado enviado com sucesso!');
          setRecados(prev => [novoRecado, ...prev]);
        } else {
          throw new Error('Falha ao criar recado');
        }
      }

      handleCloseDialog();
      setTimeout(() => {
        loadData();
      }, 100);
    } catch (error) {
      console.error('Erro ao salvar recado:', error);
      alert('Erro ao salvar recado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (recado: Recado) => {
    setEditingRecado(recado);
    setFormData({
      titulo: recado.titulo,
      mensagem: recado.mensagem,
      turmaId: recado.turmaId.toString(),
      alunoId: recado.alunoId?.toString() || ''
    });
    loadAlunosByTurma(recado.turmaId.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este recado?')) {
      try {
        const success = mockDataService.deleteRecado(id);
        if (success) {
          alert('Recado excluído com sucesso!');
          setRecados(prev => prev.filter(r => r.id !== id));
          setTimeout(() => {
            loadData();
          }, 100);
        } else {
          alert('Erro ao excluir recado.');
        }
      } catch (error) {
        console.error('Erro ao excluir recado:', error);
        alert('Erro ao excluir recado. Tente novamente.');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecado(null);
    setFormData({
      titulo: '',
      mensagem: '',
      turmaId: '',
      alunoId: ''
    });
    setAlunos([]);
  };

  const handleTurmaChange = (value: string) => {
    setFormData(prev => ({ ...prev, turmaId: value, alunoId: '' }));
    loadAlunosByTurma(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* HEADER DO DIÁRIO */}
      <DiarioHeader
        currentDiario={currentDiario}
        disciplinas={disciplinas}
        turmas={turmas}
        currentUser={currentUser}
        onBackToDiarios={onBackToDiarios}
        onStatusChange={onStatusChange}
      />

      {/* CARD DE RECADOS */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Recados</CardTitle>
              <CardDescription>
                Envie recados individuais ou para toda a turma
              </CardDescription>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCloseDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="sm:hidden">Novo</span>
                  <span className="hidden sm:inline">Novo Recado</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] lg:max-w-[800px] max-h-[95vh] overflow-y-auto">
                {/* ...form igual ao que você já montou... */}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando recados...</p>
              </div>
            </div>
          ) : recados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 opacity-60" />
              </div>
              <p className="font-medium mb-1">Nenhum recado encontrado</p>
              <p className="text-sm">
                Crie o primeiro recado para suas turmas ou alunos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recados.map(recado => (
                <div
                  key={recado.id}
                  className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{recado.titulo}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(recado.dataEnvio)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recado.turmaNome}
                      </span>
                      {recado.alunoNome && (
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {recado.alunoNome}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(recado)}
                      title="Editar recado"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(recado.id)}
                      title="Excluir recado"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
