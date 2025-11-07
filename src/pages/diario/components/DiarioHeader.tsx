import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { DiarioStatusControls } from '../../../components/shared/DiarioStatusControls';
import { mockDataService, Diario, Disciplina, Turma, Usuario } from '../../../services/mockData';

interface DiarioHeaderProps {
  currentDiario: Diario | null;
  disciplinas: Disciplina[];
  turmas: Turma[];
  currentUser: Usuario | null;
  onBackToDiarios: () => void;
  onStatusChange: () => void;
}

export function DiarioHeader({ 
  currentDiario, 
  disciplinas, 
  turmas, 
  currentUser,
  onBackToDiarios,
  onStatusChange 
}: DiarioHeaderProps) {
  if (!currentDiario) {
    console.log('HEADER: currentDiario é null');
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

  // LOG GERAL
  console.log('HEADER: currentDiario recebido =>', currentDiario);
  console.log('HEADER: ids do diário =>', {
    disciplinaId: currentDiario.disciplinaId,
    turmaId: currentDiario.turmaId,
  });
  console.log('HEADER: disciplinas props =>', disciplinas);
  console.log('HEADER: turmas props =>', turmas);

  const disciplinaFromProps = (disciplinas || []).find(
    d => d.id === currentDiario.disciplinaId
  );
  const turmaFromProps = (turmas || []).find(
    t => t.id === currentDiario.turmaId
  );

  console.log('HEADER: disciplinaFromProps =>', disciplinaFromProps);
  console.log('HEADER: turmaFromProps =>', turmaFromProps);

  const disciplinaFromMock = mockDataService.getDisciplinaById(currentDiario.disciplinaId);
  const turmaFromMock = mockDataService.getTurmaById(currentDiario.turmaId);

  console.log('HEADER: disciplinaFromMock =>', disciplinaFromMock);
  console.log('HEADER: turmaFromMock =>', turmaFromMock);

  const disciplina = disciplinaFromProps || disciplinaFromMock;
  const turma = turmaFromProps || turmaFromMock;

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
              {currentDiario.nome}
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
                {currentDiario.bimestre}º Bimestre
              </span>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3">
            <DiarioStatusControls 
              diario={currentDiario}
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
