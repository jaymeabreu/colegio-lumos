
export const alunosData = [
  {
    id: 1,
    nome: "Ana Clara Santos",
    matricula: "2025001",
    contato: "(11) 99999-1111"
  },
  {
    id: 2,
    nome: "Bruno Silva Oliveira",
    matricula: "2025002",
    contato: "(11) 99999-2222"
  },
  {
    id: 3,
    nome: "Carla Mendes Costa",
    matricula: "2025003",
    contato: "(11) 99999-3333"
  },
  {
    id: 4,
    nome: "Diego Ferreira Lima",
    matricula: "2025004",
    contato: "(11) 99999-4444"
  },
  {
    id: 5,
    nome: "Eduarda Rocha Alves",
    matricula: "2025005",
    contato: "(11) 99999-5555"
  },
  {
    id: 6,
    nome: "Felipe Cardoso Nunes",
    matricula: "2025006",
    contato: "(11) 99999-6666"
  },
  {
    id: 7,
    nome: "Gabriela Torres Souza",
    matricula: "2025007",
    contato: "(11) 99999-7777"
  },
  {
    id: 8,
    nome: "Henrique Barbosa Cruz",
    matricula: "2025008",
    contato: "(11) 99999-8888"
  },
  {
    id: 9,
    nome: "Isabela Martins Dias",
    matricula: "2025009",
    contato: "(11) 99999-9999"
  },
  {
    id: 10,
    nome: "João Pedro Araújo",
    matricula: "2025010",
    contato: "(11) 99999-0000"
  },
  {
    id: 11,
    nome: "Larissa Gomes Pereira",
    matricula: "2025011",
    contato: "(11) 98888-1111"
  },
  {
    id: 12,
    nome: "Mateus Ribeiro Santos",
    matricula: "2025012",
    contato: "(11) 98888-2222"
  },
  {
    id: 13,
    nome: "Natália Campos Silva",
    matricula: "2025013",
    contato: "(11) 98888-3333"
  },
  {
    id: 14,
    nome: "Pedro Henrique Moura",
    matricula: "2025014",
    contato: "(11) 98888-4444"
  },
  {
    id: 15,
    nome: "Rafaela Costa Oliveira",
    matricula: "2025015",
    contato: "(11) 98888-5555"
  }
]

export const aulasData = [
  {
    id: 1,
    data: "2025-01-15",
    conteudo: "Introdução à História Antiga",
    materiais: "Livro didático cap. 1, slides",
    observacoes: "Primeira aula do ano, apresentação da disciplina",
    presentes: 14,
    faltas: 1
  },
  {
    id: 2,
    data: "2025-01-22",
    conteudo: "Civilizações Mesopotâmicas",
    materiais: "Livro didático cap. 2, documentário",
    observacoes: "Alunos demonstraram interesse no tema",
    presentes: 15,
    faltas: 0
  },
  {
    id: 3,
    data: "2025-01-29",
    conteudo: "Egito Antigo - Política e Sociedade",
    materiais: "Livro didático cap. 3, imagens",
    observacoes: "Discussão sobre hierarquia social",
    presentes: 13,
    faltas: 2
  }
]

export const avaliacoesData = [
  {
    id: 1,
    titulo: "Prova Bimestral - História Antiga",
    data: "2025-02-15",
    tipo: "prova",
    peso: 2.0,
    notas: [
      { alunoId: 1, valor: 8.5 },
      { alunoId: 2, valor: 7.0 },
      { alunoId: 3, valor: 9.0 },
      { alunoId: 4, valor: 6.5 },
      { alunoId: 5, valor: 8.0 },
      { alunoId: 6, valor: 5.5 },
      { alunoId: 7, valor: 9.5 },
      { alunoId: 8, valor: 7.5 },
      { alunoId: 9, valor: 8.0 },
      { alunoId: 10, valor: 6.0 }
    ]
  },
  {
    id: 2,
    titulo: "Trabalho sobre Civilizações",
    data: "2025-02-08",
    tipo: "trabalho",
    peso: 1.0,
    notas: [
      { alunoId: 1, valor: 9.0 },
      { alunoId: 2, valor: 8.0 },
      { alunoId: 3, valor: 8.5 },
      { alunoId: 4, valor: 7.0 },
      { alunoId: 5, valor: 9.5 },
      { alunoId: 6, valor: 6.5 },
      { alunoId: 7, valor: 10.0 },
      { alunoId: 8, valor: 8.5 },
      { alunoId: 9, valor: 9.0 },
      { alunoId: 10, valor: 7.5 }
    ]
  }
]

export const ocorrenciasData = [
  {
    id: 1,
    alunoId: 6,
    data: "2025-01-20",
    tipo: "disciplinar",
    descricao: "Conversou durante a explicação e atrapalhou outros colegas",
    acaoTomada: "Conversa individual com o aluno e orientação sobre comportamento em sala"
  },
  {
    id: 2,
    alunoId: 4,
    data: "2025-01-25",
    tipo: "pedagogica",
    descricao: "Dificuldade para acompanhar o conteúdo sobre civilizações antigas",
    acaoTomada: "Indicação de material complementar e agendamento de aula de reforço"
  },
  {
    id: 3,
    alunoId: 12,
    data: "2025-02-01",
    tipo: "comportamental",
    descricao: "Demonstrou desinteresse nas atividades e ficou disperso durante a aula",
    acaoTomada: "Conversa com o aluno para entender possíveis causas e motivá-lo"
  }
]
