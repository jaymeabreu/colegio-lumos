// Exemplo: DiarioProfessorPage.tsx

import { useState, useEffect } from 'react';
import { DiarioHeader } from './DiarioHeader';
import { mockDataService, Diario, Disciplina, Turma, Usuario } from '../../../services/mockData';
import { AulasTab } from './AulasTab';
import { RecadosTab } from './RecadosTab';
// ... Tabs / TabsList / TabsTrigger / TabsContent conforme seu UI

interface DiarioProfessorPageProps {
  diarioId: number;
  onBackToDiarios: () => void;
}

export function DiarioProfessorPage({ diarioId, onBackToDiarios }: DiarioProfessorPageProps) {
  const [currentDiario, setCurrentDiario] = useState<Diario | null>(null);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const dataDiarios = mockDataService.getDiarios();
    const diario = dataDiarios.find(d => d.id === diarioId) || null;
    setCurrentDiario(diario);

    setDisciplinas(mockDataService.getDisciplinas());
    setTurmas(mockDataService.getTurmas());

    // User vindo do mockData, não do auth minimalista
    const usuarios = mockDataService.getUsuarios();
    const usuario = usuarios.find(u => u.id === 2) || null; // ou baseado no auth
    setCurrentUser(usuario);
  }, [diarioId]);

  const handleStatusChange = () => {
    // recarregar diário ou só atualizar state
    const diarioAtualizado = mockDataService.getDiarios().find(d => d.id === diarioId) || null;
    setCurrentDiario(diarioAtualizado);
  };

  return (
    <div className="flex flex-col min-h-full">
      <DiarioHeader
        currentDiario={currentDiario}
        disciplinas={disciplinas}
        turmas={turmas}
        currentUser={currentUser}
        onBackToDiarios={onBackToDiarios}
        onStatusChange={handleStatusChange}
      />

      {/* Tabs do conteúdo (Aulas, Recados, etc.) */}
      {/* Exemplo usando algum componente de Tabs que você já tem */}
      {/* <Tabs defaultValue="aulas"> */}
      {/*   <TabsList>...</TabsList> */}
      {/*   <TabsContent value="aulas"> */}
            <AulasTab diarioId={diarioId} />
      {/*   </TabsContent> */}
      {/*   <TabsContent value="recados"> */}
            <RecadosTab />
      {/*   </TabsContent> */}
      {/* </Tabs> */}
    </div>
  );
}
