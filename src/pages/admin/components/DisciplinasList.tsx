import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { mockDataService, Disciplina } from '../../../services/mockData';

export function DisciplinasList() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cargaHoraria: ''
  });

  const loadData = useCallback(() => {
    setDisciplinas(mockDataService.getDisciplinas());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtro otimizado
  const filteredDisciplinas = useMemo(() => {
    if (!searchTerm) return disciplinas; // Sem processamento se não há busca
    
    return disciplinas.filter(disciplina =>
      disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [disciplinas, searchTerm]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      nome: formData.nome,
      cargaHoraria: Number(formData.cargaHoraria)
    };

    if (editingDisciplina) {
      mockDataService.updateDisciplina(editingDisciplina.id, data);
    } else {
      mockDataService.createDisciplina(data);
    }

    loadData();
    resetForm();
  }, [formData, editingDisciplina, loadData]);

  const handleEdit = useCallback((disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setFormData({
      nome: disciplina.nome,
      cargaHoraria: disciplina.cargaHoraria.toString()
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
      mockDataService.deleteDisciplina(id);
      loadData();
    }
  }, [loadData]);

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      cargaHoraria: ''
    });
    setEditingDisciplina(null);
    setIsDialogOpen(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div class="space-y-2">
            <h3 className="card-title">Disciplinas</h3>
            <p className="card-description">
              Gerencie as disciplinas da escola
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Disciplina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-[800px] max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDisciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações da disciplina
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Disciplina</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargaHoraria">Carga Horária (horas)</Label>
                    <Input
                      id="cargaHoraria"
                      type="number"
                      value={formData.cargaHoraria}
                      onChange={(e) => setFormData({ ...formData, cargaHoraria: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingDisciplina ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Buscar disciplinas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          {filteredDisciplinas.map((disciplina) => (
            <div key={disciplina.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{disciplina.nome}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Carga horária: {disciplina.cargaHoraria} horas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="none"
                  className="h-8 w-8 p-0 inline-flex items-center justify-center"
                  onClick={() => handleEdit(disciplina)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="none"
                   className="h-8 w-8 p-0 inline-flex items-center justify-center"
                  onClick={() => handleDelete(disciplina.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredDisciplinas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma disciplina encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
