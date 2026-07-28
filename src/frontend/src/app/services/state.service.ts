import { Injectable } from '@angular/core';
import { ImperialState, criarEstadoVazio } from '../models/imperial-state.model';

const STATE_KEY = 'imperialState';

@Injectable({ providedIn: 'root' })
export class StateService {
  readonly state: ImperialState = this.load();

  private load(): ImperialState {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (!raw) return criarEstadoVazio();
      const parsed = JSON.parse(raw);
      return {
        alunos: parsed.alunos ?? [],
        chamadas: parsed.chamadas ?? [],
        jogos: parsed.jogos ?? [],
      };
    } catch {
      return criarEstadoVazio();
    }
  }

  save(): void {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(this.state));
  }
}
