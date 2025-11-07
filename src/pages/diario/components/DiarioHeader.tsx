import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { DiarioStatusControls } from '../../../components/shared/DiarioStatusControls';
import { mockDataService, Diario, Usuario } from '../../../services/mockData';

interface DiarioHeaderProps {
  currentDiario: Diario | null;
  currentUser: Usuario | null;
  onBackToDiarios: () => void;
  onStatusChange: () => void;
}

export function DiarioHeader({ 
  currentDiario,
  currentUser,
  onBackToDiarios,
  onStatusChange 
}: DiarioHeaderProps) {
  if (!currentDiario) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onBackToDiarios}
              className="h-9 w-9"
              title="Voltar aos Diários"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carregando...</h1>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 1) Buscar todos os dados do mock (sempre atualizados do localStorage)
  const todosDiarios = mockDataService.getDiarios();
  const todasDisciplinas = mockDataService.getDisciplinas();
  const todasTurmas = mockDataService.getTurmas();

  // 2) Garantir que estamos usando a versão do diário que está salva no storage
  const diario = todosDiarios.find(d => d.id === currentDiario.id) || currentDiario;

  // 3) Achar disciplina e turma pelo ID do diário
  const disciplina = todasDisciplinas.find(d => d.id === diario.disciplinaId);
  const turma = todasTurmas.find(t => t.id === diario.turmaId);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBackToDiarios}
            className="h-9 w-9"
            title="Voltar aos Diários"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {diario.nome}
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-primary">
                {disciplina?.nome || 'Disciplina'}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {turma?.nome || 'Turma'}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {diario.bimestre}º Bimestre
              </span>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3">
            <DiarioStatusControls 
              diario={diario}
              currentUser={currentUser}
              onStatusChange={onStatusChange}
              compact={true}
            />
          </div>
        )}
      </div>
    </header>
  );
}
