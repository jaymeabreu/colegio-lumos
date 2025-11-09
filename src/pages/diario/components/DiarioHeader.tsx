import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { DiarioStatusControls } from '../../../components/shared/DiarioStatusControls';
import { mockDataService, Diario, Disciplina, Turma, Usuario } from '../../../services/mockData';

interface DiarioHeaderProps {
  currentDiario: Diario | null;
  disciplinas?: Disciplina[]; // opcional
  turmas?: Turma[];           // opcional
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

  // 1) Disciplina: tenta usar string do próprio diário; se não tiver,
  //    tenta achar na lista recebida por props; se não, busca no mockDataService.
  let disciplinaNome = currentDiario.disciplina ?? '';

  if (!disciplinaNome) {
    if (disciplinas && disciplinas.length > 0) {
      const d = disciplinas.find(d => d.id === currentDiario.disciplinaId);
      disciplinaNome = d?.nome ?? '';
    } else if (typeof currentDiario.disciplinaId !== 'undefined') {
      const d = mockDataService.getDisciplinaById(currentDiario.disciplinaId);
      disciplinaNome = d?.nome ?? '';
    }
  }

  // 2) Turma: mesma lógica da disciplina
  let turmaNome = currentDiario.turma ?? '';

  if (!turmaNome) {
    if (turmas && turmas.length > 0) {
      const t = turmas.find(t => t.id === currentDiario.turmaId);
      turmaNome = t?.nome ?? '';
    } else if (typeof currentDiario.turmaId !== 'undefined') {
      const t = mockDataService.getTurmaById(currentDiario.turmaId);
      turmaNome = t?.nome ?? '';
    }
  }

  // 3) Bimestre: aceita tanto "bimestre" quanto "bimestreAtual"
  const bimestre = (currentDiario as any).bimestre ?? (currentDiario as any).bimestreAtual ?? '';

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
                {disciplinaNome || 'Disciplina'}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {turmaNome || 'Turma'}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {bimestre ? `${bimestre}º Bimestre` : 'Bimestre não definido'}
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
