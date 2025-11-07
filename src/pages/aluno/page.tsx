
import { useState, useEffect } from 'react';
import { BookOpen, ClipboardList, BarChart3, Calendar, User, Bell, AlertCircle, TrendingUp, Award, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { authService } from '../../services/auth';
import { mockDataService, Aluno, Diario, Nota, Presenca, Avaliacao, Ocorrencia, Disciplina } from '../../services/mockData';
import { AvisosTab } from './components/AvisosTab';

interface DisciplinaBoletim {
  disciplina: string;
  bimestre1: number | null;
  bimestre2: number | null;
  bimestre3: number | null;
  bimestre4: number | null;
  mediaFinal: number;
  frequencia: number;
  situacao: string;
  totalAulas: number;
  presencas: number;
  faltas: number;
}

export function AlunoPage() {
  const [activeTab, setActiveTab] = useState('avisos');
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [boletimCompleto, setBoletimCompleto] = useState<DisciplinaBoletim[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = authService.getAuthState();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (!user?.alunoId) {
      setLoading(false);
      return;
    }

    try {
      console.log('🎓 Carregando dados completos do aluno:', user.alunoId);

      // Carregar dados do aluno
      const alunoData = mockDataService.getAlunos().find(a => a.id === user.alunoId);
      setAluno(alunoData || null);

      if (alunoData?.turmaId) {
        // Buscar todos os diários que o aluno está vinculado
        const todosOsDiarios = mockDataService.getDiarios();
        const todasAsDisciplinas = mockDataService.getDisciplinas();
        const diarioAlunos = mockDataService.getData().diarioAlunos;

        const diariosDoAluno = todosOsDiarios.filter(diario =>
          diarioAlunos.some(da => da.alunoId === user.alunoId && da.diarioId === diario.id)
        );

        setDiarios(diariosDoAluno);

        // Carregar notas do aluno
        const notasAluno = mockDataService.getNotasByAluno(user.alunoId);
        setNotas(notasAluno);

        // Carregar presenças do aluno
        const presencasAluno = mockDataService.getPresencasByAluno(user.alunoId);
        setPresencas(presencasAluno);

        // Carregar todas as avaliações dos diários do aluno
        const todasAvaliacoes: Avaliacao[] = [];
        diariosDoAluno.forEach(diario => {
          const avaliacoesDiario = mockDataService.getAvaliacoesByDiario(diario.id);
          todasAvaliacoes.push(...avaliacoesDiario);
        });
        setAvaliacoes(todasAvaliacoes);

        // Carregar ocorrências do aluno
        const todasOcorrencias = mockDataService.getData().ocorrencias;
        const ocorrenciasDoAluno = todasOcorrencias.filter(o => o.alunoId === user.alunoId);
        setOcorrencias(ocorrenciasDoAluno);

        // Gerar boletim completo
        const boletim: DisciplinaBoletim[] = [];
        diariosDoAluno.forEach(diario => {
          const disciplina = todasAsDisciplinas.find(d => d.id === diario.disciplinaId);
          if (!disciplina) return;

          // Calcular média da disciplina
          const media = mockDataService.calcularMediaAluno(user.alunoId, diario.id);

          // Calcular frequência da disciplina
          const aulas = mockDataService.getAulasByDiario(diario.id);
          const presencasDaDisciplina = presencasAluno.filter(p =>
            aulas.some(a => a.id === p.aulaId)
          );

          const totalAulas = aulas.length;
          const presentes = presencasDaDisciplina.filter(p => p.status === 'PRESENTE').length;
          const faltas = presencasDaDisciplina.filter(p => p.status === 'FALTA').length;
          const frequencia = totalAulas > 0 ? (presentes / totalAulas) * 100 : 0;

          // Calcular notas por bimestre
          const avaliacoesDisciplina = mockDataService.getAvaliacoesByDiario(diario.id);
          const notasPorBimestre = { bim1: null, bim2: null, bim3: null, bim4: null };

          [1, 2, 3, 4].forEach(bimestre => {
            const avaliacoesBim = avaliacoesDisciplina.filter(av => av.bimestre === bimestre);
            if (avaliacoesBim.length > 0) {
              const notasAlunoBim = avaliacoesBim
                .map(av => notasAluno.find(n => n.avaliacaoId === av.id))
                .filter(nota => nota !== undefined);

              if (notasAlunoBim.length > 0) {
                const mediaBimestre = notasAlunoBim.reduce((sum, nota) => sum + nota!.valor, 0) / notasAlunoBim.length;
                notasPorBimestre[`bim${bimestre}` as keyof typeof notasPorBimestre] = Number(mediaBimestre.toFixed(1));
              }
            }
          });

          // Determinar situação
          let situacao = 'Em Andamento';
          if (media > 0) {
            if (media >= 7 && frequencia >= 75) {
              situacao = 'Aprovado';
            } else if (media >= 5 && media < 7) {
              situacao = 'Recuperação';
            } else if (media < 5 || frequencia < 60) {
              situacao = 'Reprovado';
            }
          }

          boletim.push({
            disciplina: disciplina.nome,
            bimestre1: notasPorBimestre.bim1,
            bimestre2: notasPorBimestre.bim2,
            bimestre3: notasPorBimestre.bim3,
            bimestre4: notasPorBimestre.bim4,
            mediaFinal: media,
            frequencia,
            situacao,
            totalAulas,
            presencas: presentes,
            faltas
          });
        });

        setBoletimCompleto(boletim);

        console.log('📊 Dados carregados:', {
          diarios: diariosDoAluno.length,
          notas: notasAluno.length,
          presencas: presencasAluno.length,
          avaliacoes: todasAvaliacoes.length,
          ocorrencias: ocorrenciasDoAluno.length,
          boletim: boletim.length
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMedia = (diarioId: number): number => {
    return mockDataService.calcularMediaAluno(user?.alunoId || 0, diarioId);
  };

  const calcularFrequencia = (diarioId: number): number => {
    const aulas = mockDataService.getAulasByDiario(diarioId);
    const presencasDiario = presencas.filter(p => 
      aulas.some(a => a.id === p.aulaId)
    );

    if (presencasDiario.length === 0) return 100;

    const presentes = presencasDiario.filter(p => p.status === 'PRESENTE').length;
    return (presentes / presencasDiario.length) * 100;
  };

  const getMediaColor = (media: number) => {
    if (media >= 7) return 'text-green-600';
    if (media >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFrequenciaColor = (freq: number) => {
    if (freq >= 75) return 'text-green-600';
    if (freq >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSituacaoVariant = (situacao: string) => {
    if (situacao === 'Aprovado') return 'default';
    if (situacao === 'Recuperação') return 'secondary';
    if (situacao === 'Reprovado') return 'destructive';
    return 'outline';
  };

  const getOcorrenciaColor = (tipo: string) => {
    if (tipo === 'disciplinar') return 'destructive';
    if (tipo === 'pedagogica') return 'secondary';
    return 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const tabsConfig = [
    { id: 'avisos', label: 'Avisos', icon: Bell },
    { id: 'boletim', label: 'Boletim', icon: BarChart3 },
    { id: 'frequencia', label: 'Frequência', icon: ClipboardList },
    { id: 'avaliacoes', label: 'Avaliações', icon: BookOpen },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Dados não encontrados</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados do aluno. Entre em contato com a secretaria.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calcular estatísticas gerais
  const mediaGeral = boletimCompleto.length > 0 
    ? boletimCompleto.reduce((sum, item) => sum + item.mediaFinal, 0) / boletimCompleto.length 
    : 0;
  
  const frequenciaGeral = boletimCompleto.length > 0 
    ? boletimCompleto.reduce((sum, item) => sum + item.frequencia, 0) / boletimCompleto.length 
    : 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'avisos':
        return <AvisosTab />;
      
      case 'boletim':
        return (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getMediaColor(mediaGeral)}`}>
                    {mediaGeral > 0 ? mediaGeral.toFixed(1) : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mediaGeral >= 6 ? 'Aprovado' : mediaGeral > 0 ? 'Abaixo da média' : 'Sem notas'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Frequência Geral</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getFrequenciaColor(frequenciaGeral)}`}>
                    {frequenciaGeral > 0 ? frequenciaGeral.toFixed(1) + '%' : '-'}
                  </div>
                  {frequenciaGeral > 0 && (
                    <Progress value={frequenciaGeral} className="mt-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Situação Geral</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {mediaGeral >= 6 && frequenciaGeral >= 75 ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Bom Desempenho
                      </Badge>
                    ) : mediaGeral > 0 ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Em Andamento
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sem Dados</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boletim Completo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Boletim Escolar Completo
                </CardTitle>
                <CardDescription>Notas e frequência por bimestre de todas as disciplinas</CardDescription>
              </CardHeader>
              <CardContent>
                {boletimCompleto.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Disciplina</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">1º Bim</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">2º Bim</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">3º Bim</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">4º Bim</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Média Final</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Frequência</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Aulas</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boletimCompleto.map((item, index) => (
                          <tr key={`boletim-${index}`} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">{item.disciplina}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.bimestre1 !== null ? (
                                <span className={getMediaColor(item.bimestre1)}>{item.bimestre1.toFixed(1)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.bimestre2 !== null ? (
                                <span className={getMediaColor(item.bimestre2)}>{item.bimestre2.toFixed(1)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.bimestre3 !== null ? (
                                <span className={getMediaColor(item.bimestre3)}>{item.bimestre3.toFixed(1)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.bimestre4 !== null ? (
                                <span className={getMediaColor(item.bimestre4)}>{item.bimestre4.toFixed(1)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span className={`font-bold ${getMediaColor(item.mediaFinal)}`}>
                                {item.mediaFinal > 0 ? item.mediaFinal.toFixed(1) : '-'}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span className={getFrequenciaColor(item.frequencia)}>
                                {item.frequencia > 0 ? item.frequencia.toFixed(1) + '%' : '-'}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                              <div>
                                {item.presencas}P / {item.faltas}F
                              </div>
                              <div className="text-muted-foreground">({item.totalAulas} total)</div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <Badge variant={getSituacaoVariant(item.situacao)}>{item.situacao}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de boletim encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'frequencia':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Frequência Escolar</h2>
              <p className="text-muted-foreground">
                Acompanhe sua presença nas aulas por disciplina
              </p>
            </div>

            {boletimCompleto.length === 0 ? (
              <Card className="border-border shadow-sm">
                <CardHeader className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <CardTitle>Nenhuma disciplina encontrada</CardTitle>
                  <CardDescription>
                    Você não está matriculado em nenhuma disciplina no momento.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {boletimCompleto.map((item, index) => (
                  <Card key={`freq-${index}`} className="border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.disciplina}</CardTitle>
                      <CardDescription>
                        Frequência e presença nas aulas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getFrequenciaColor(item.frequencia)}`}>
                          {item.frequencia > 0 ? item.frequencia.toFixed(1) + '%' : '-'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Frequência
                        </div>
                      </div>
                      {item.frequencia > 0 && (
                        <Progress value={item.frequencia} className="h-2" />
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-green-50">
                          <div className="text-xs text-green-600">Presentes</div>
                          <div className="font-bold text-green-700">{item.presencas}</div>
                        </div>
                        <div className="p-2 rounded bg-red-50">
                          <div className="text-xs text-red-600">Faltas</div>
                          <div className="font-bold text-red-700">{item.faltas}</div>
                        </div>
                        <div className="p-2 rounded bg-blue-50">
                          <div className="text-xs text-blue-600">Total</div>
                          <div className="font-bold text-blue-700">{item.totalAulas}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'avaliacoes':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Avaliações e Notas</h2>
              <p className="text-muted-foreground">
                Acompanhe suas notas e próximas avaliações
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notas das Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Notas das Avaliações
                  </CardTitle>
                  <CardDescription>Notas das avaliações realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {avaliacoes.length > 0 ? (
                    <div className="space-y-4">
                      {avaliacoes.map((avaliacao) => {
                        const nota = notas.find(n => n.avaliacaoId === avaliacao.id);
                        const disciplina = mockDataService.getDisciplinaById(
                          diarios.find(d => d.id === avaliacao.diarioId)?.disciplinaId || 0
                        );
                        
                        return (
                          <div
                            key={`avaliacao-${avaliacao.id}`}
                            className="flex items-center justify-between p-3 border rounded-lg bg-card"
                          >
                            <div>
                              <p className="font-medium text-foreground">{avaliacao.titulo}</p>
                              <p className="text-sm text-muted-foreground">
                                {disciplina?.nome} • {formatDate(avaliacao.data)} • Peso: {avaliacao.peso}
                              </p>
                            </div>
                            <div className="text-right">
                              {nota ? (
                                <div className={`text-lg font-bold ${getMediaColor(nota.valor)}`}>
                                  {nota.valor.toFixed(1)}
                                </div>
                              ) : (
                                <Badge variant="secondary">Pendente</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma avaliação encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Próximas Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Avaliações
                  </CardTitle>
                  <CardDescription>Avaliações agendadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const proximasAvaliacoes = avaliacoes.filter(a => new Date(a.data) >= new Date());
                    
                    if (proximasAvaliacoes.length > 0) {
                      return (
                        <div className="space-y-3">
                          {proximasAvaliacoes.map((avaliacao) => {
                            const disciplina = mockDataService.getDisciplinaById(
                              diarios.find(d => d.id === avaliacao.diarioId)?.disciplinaId || 0
                            );
                            
                            return (
                              <div key={`proxima-${avaliacao.id}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <div className="font-medium">{avaliacao.titulo}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {disciplina?.nome} • Peso: {avaliacao.peso} • Tipo: {avaliacao.tipo}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(avaliacao.data)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma avaliação agendada</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'ocorrencias':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Ocorrências</h2>
              <p className="text-muted-foreground">
                Histórico de ocorrências disciplinares e pedagógicas
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Ocorrências Registradas
                </CardTitle>
                <CardDescription>Histórico completo de ocorrências</CardDescription>
              </CardHeader>
              <CardContent>
                {ocorrencias.length > 0 ? (
                  <div className="space-y-4">
                    {ocorrencias.map(ocorrencia => (
                      <div key={`ocorrencia-${ocorrencia.id}`} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={getOcorrenciaColor(ocorrencia.tipo)}>
                            {ocorrencia.tipo === 'disciplinar' ? 'Disciplinar' : 'Pedagógica'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(ocorrencia.data)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-1">Descrição:</h4>
                          <p className="text-sm text-muted-foreground">{ocorrencia.descricao}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-1">Ação Tomada:</h4>
                          <p className="text-sm text-muted-foreground">{ocorrencia.acaoTomada}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma ocorrência registrada</p>
                    <p className="text-sm mt-2">Parabéns! Não há ocorrências registradas.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <AvisosTab />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header Fixo */}
        <header className="sticky top-0 z-50 border-b bg-card px-6 py-4 flex-shrink-0 h-20 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Área do Aluno
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {aluno.nome}
                </p>
              </div>
            </div>
            <AuthHeader />
          </div>
        </header>

        {/* Tabs Navigation Fixas */}
        <div className="sticky top-20 z-40 border-b bg-card px-6 flex-shrink-0">
          <nav className="flex space-x-8 py-0">
            {tabsConfig.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-fast ${
                  activeTab === id
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Scrollável */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <ErrorBoundary>
                {renderTabContent()}
              </ErrorBoundary>
            </div>
          </ScrollArea>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default AlunoPage;
