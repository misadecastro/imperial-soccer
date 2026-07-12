export interface Avaliacao {
  id: string;
  alunoId: string;
  data: string;
  tatico: number;
  tecnico: number;
  mental: number;
}

export interface CreateEvaluationRequest {
  alunoId: string;
  data: string;
  tatico: number;
  tecnico: number;
  mental: number;
}

export interface UpdateEvaluationRequest {
  data: string;
  tatico: number;
  tecnico: number;
  mental: number;
}
