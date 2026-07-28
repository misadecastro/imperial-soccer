export interface EvaluationItem {
  id: string;
  nome: string;
}

export interface EvaluationType {
  id: string;
  nome: string;
  itens: EvaluationItem[];
  arquivado: boolean;
}

/** Item no payload de edição: `id` ausente = item novo. */
export interface EvaluationItemInput {
  id?: string;
  nome: string;
}
