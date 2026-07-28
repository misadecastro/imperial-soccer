export interface Participacao {
  alunoId: string;
  minutos: number;
}

export interface Jogo {
  id: string;
  data: string;
  nome: string;
  participacoes: Participacao[];
}
