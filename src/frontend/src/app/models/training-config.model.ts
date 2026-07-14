/**
 * Modelos da configuração de itens de treino (feature 019).
 * Dados mockados/em memória — sem persistência backend nesta fase.
 */

export interface ItemTrabalhado {
  id: string;
  label: string;
}

export interface PrincipioGrupo {
  id: string;
  titulo: string;
  /** Preservado dos dados atuais; usado no filtro da montagem de treino. */
  filtro: 'defensivo' | 'ofensivo' | 'sempre';
  itens: ItemTrabalhado[];
}

/** Associação entre um Momento e um Princípio/Fundamento, com os itens aplicáveis. */
export interface VinculoMomentoPrincipio {
  grupoId: string;
  itemIds: string[];
}

export interface Momento {
  id: string;
  label: string;
  desc: string;
  /** Preservado dos dados atuais; usado no filtro da montagem de treino. */
  tipo: 'ofensivo' | 'defensivo';
  vinculos: VinculoMomentoPrincipio[];
}
