
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { mockDataService, Comunicado } from '../../../services/mockData';
import { authService } from '../../../services/auth';

export function ComunicadosList() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    autor: ''
  });
  const { user } = authService.getAuthState();

  useEffect(() => {
    loadData();
    
    // Escutar eventos de atualização de dados
    const handleDataUpdate = () => {
      console.log('Evento de atualização de dados recebido');
      loadData();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      console.log('Carregando comunicados...');
      setLoading(true);
      
      // Força recarregamento dos dados do localStorage
      const comunicadosData = mockDataService.getComunicados();
      console.log('Comunicados carregados:', comunicadosData);
      setComunicados(comunicadosData.sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()));
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.mensagem.trim() || !formData.autor.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Dados do formulário:', formData);

      if (editingComunicado) {
        console.log('Editando comunicado:', editingComunicado.id);
        const updatedComunicado = mockDataService.updateComunicado(editingComunicado.id, {
          titulo: formData.titulo.trim(),
          mensagem: formData.mensagem.trim(),
          autor: formData.autor.trim()
        });
        console.log('Comunicado atualizado:', updatedComunicado);
        
        if (updatedComunicado) {
          // Atualizar estado local imediatamente
          setComunicados(prev => prev.map(c => c.id === editingComunicado.id ? updatedComunicado : c));
          alert('Comunicado atualizado com sucesso!');
        } else {
          throw new Error('Falha ao atualizar comunicado');
        }
      } else {
        console.log('Criando novo comunicado...');
        const novoComunicado = mockDataService.createComunicado({
          titulo: formData.titulo.trim(),
          mensagem: formData.mensagem.trim(),
          autor: formData.autor.trim(),
          autorId: user?.id || 1,
          dataPublicacao: new Date().toISOString().split('T')[0]
        });
        console.log('Comunicado criado:', novoComunicado);
        
        if (novoComunicado) {
          // Adicionar ao estado local imediatamente
          setComunicados(prev => [novoComunicado, ...prev]);
          alert('Comunicado criado com sucesso!');
        } else {
          throw new Error('Falha ao criar comunicado');
        }
      }
      
      // Fechar modal
      handleCloseDialog();
      
      // Recarregar dados para garantir sincronização
      setTimeout(() => {
        loadData();
      }, 100);
      
    } catch (error) {
      console.error('Erro ao salvar comunicado:', error);
      alert('Erro ao salvar comunicado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comunicado: Comunicado) => {
    console.log('Editando comunicado:', comunicado);
    setEditingComunicado(comunicado);
    setFormData({
      titulo: comunicado.titulo,
      mensagem: comunicado.mensagem,
      autor: comunicado.autor
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
      try {
        console.log('Excluindo comunicado:', id);
        const success = mockDataService.deleteComunicado(id);
        console.log('Resultado da exclusão:', success);
        
        if (success) {
          // Remover do estado local imediatamente
          setComunicados(prev => prev.filter(c => c.id !== id));
          alert('Comunicado excluído com sucesso!');
          
          // Recarregar dados para garantir sincronização
          setTimeout(() => {
            loadData();
          }, 100);
        } else {
          alert('Erro ao excluir comunicado.');
        }
      } catch (error) {
        console.error('Erro ao excluir comunicado:', error);
        alert('Erro ao excluir comunicado. Tente novamente.');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingComunicado(null);
    setFormData({
      titulo: '',
      mensagem: '',
      autor: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando comunicados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Comunicados</h2>
          <p className="text-muted-foreground">
            Gerencie os comunicados gerais da escola
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Novo Comunicado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingComunicado ? 'Editar Comunicado' : 'Novo Comunicado'}
              </DialogTitle>
              <DialogDescription>
                {editingComunicado 
                  ? 'Edite as informações do comunicado abaixo.'
                  : 'Crie um novo comunicado para toda a escola.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Digite o título do comunicado"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autor">Autor *</Label>
                <Input
                  id="autor"
                  value={formData.autor}
                  onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))}
                  placeholder="Ex: Coordenação Pedagógica, Direção Escolar"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem *</Label>
                <Textarea
                  id="mensagem"
                  value={formData.mensagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Digite a mensagem do comunicado"
                  rows={8}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? 'Salvando...' 
                    : editingComunicado 
                      ? 'Salvar Alterações' 
                      : 'Criar Comunicado'
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {comunicados.length === 0 ? (
        <Card className="border-border shadow-sm">
          <CardHeader className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Nenhum comunicado encontrado</CardTitle>
            <CardDescription>
              Crie o primeiro comunicado para a escola.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {comunicados.map((comunicado) => (
            <Card key={comunicado.id} className="border-border shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{comunicado.titulo}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Geral
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{comunicado.autor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(comunicado.dataPublicacao)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(comunicado)}
                      title="Editar comunicado"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(comunicado.id)}
                      title="Excluir comunicado"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{comunicado.mensagem}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
