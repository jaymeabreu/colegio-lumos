import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { mockDataService, Turma } from '../../../services/mockData';

export function TurmasList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    anoLetivo: '',
    turno: ''
  });

  const loadData = useCallback(() => {
    setTurmas(mockDataService.getTurmas());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtro otimizado
  const filteredTurmas = useMemo(() => {
    if (!searchTerm) return turmas; // Sem processamento se não há busca
    
    return turmas.filter(turma =>
      turma.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [turmas, searchTerm]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTurma) {
      mockDataService.updateTurma(editingTurma.id, formData);
    } else {
      mockDataService.createTurma(formData);
    }

    loadData();
    resetForm();
  }, [formData, editingTurma, loadData]);

  const handleEdit = useCallback((turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      anoLetivo: turma.anoLetivo,
      turno: turma.turno
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      mockDataService.deleteTurma(id);
      loadData();
    }
  }, [loadData]);

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      anoLetivo: '',
      turno: ''
    });
    setEditingTurma(null);
    setIsDialogOpen(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div class="space-y-2">
            <h3 className="card-title">Turmas</h3>
            <p className="card-description">
              Gerencie as turmas da escola
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-[800px] max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTurma ? 'Editar Turma' : 'Nova Turma'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações da turma
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Turma</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: 6º Ano - Manhã"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="anoLetivo">Ano Letivo</Label>
                    <Input
                      id="anoLetivo"
                      value={formData.anoLetivo}
                      onChange={(e) => setFormData({ ...formData, anoLetivo: e.target.value })}
                      placeholder="Ex: 2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="turno">Turno</Label>
                    <Select value={formData.turno} onValueChange={(value) => setFormData({ ...formData, turno: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manhã">Manhã</SelectItem>
                        <SelectItem value="Tarde">Tarde</SelectItem>
                        <SelectItem value="Noite">Noite</SelectItem>
                        <SelectItem value="Integral">Integral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTurma ? 'Salvar' : 'Criar'}
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
            placeholder="Buscar turmas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          {filteredTurmas.map((turma) => (
            <div key={turma.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{turma.nome}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>Ano letivo: {turma.anoLetivo}</span>
                  <span>Turno: {turma.turno}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="none"
                  className="h-8 w-8 p-0 inline-flex items-center justify-center"
                  onClick={() => handleEdit(turma)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="none"
                   className="h-8 w-8 p-0 inline-flex items-center justify-center"
                  onClick={() => handleDelete(turma.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredTurmas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma turma encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
