import { Aluno } from './aluno.model';
import { Chamada } from './chamada.model';
import { Jogo } from './jogo.model';

export interface ImperialState {
  alunos: Aluno[];
  chamadas: Chamada[];
  jogos: Jogo[];
}

export function criarEstadoVazio(): ImperialState {
  return { alunos: [], chamadas: [], jogos: [] };
}
