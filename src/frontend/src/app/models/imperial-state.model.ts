import { Aluno } from './aluno.model';
import { Avaliacao } from './avaliacao.model';
import { Chamada } from './chamada.model';
import { Jogo } from './jogo.model';

export interface ImperialState {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  chamadas: Chamada[];
  jogos: Jogo[];
}

export function criarEstadoVazio(): ImperialState {
  return { alunos: [], avaliacoes: [], chamadas: [], jogos: [] };
}
