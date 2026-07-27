export interface Pontuacao {
  itemId: string;
  nota: number;
}

export interface Evaluation {
  id: string;
  alunoId: string;
  tipoId: string;
  data: string;
  pontuacoes: Pontuacao[];
}

export interface CreateEvaluationRequest {
  alunoId: string;
  tipoId: string;
  data: string;
  pontuacoes: Pontuacao[];
}
