import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Momento, PrincipioGrupo, VinculoMomentoPrincipio } from '../models/training-config.model';

/**
 * Configuração de itens de treino (feature 020) — persistida no backend
 * (`/training-principles`, `/game-moments`). Mantém um cache em memória
 * (`_grupos` / `_momentos`) que os templates leem via getters síncronos; cada
 * operação de escrita chama a API e atualiza esse cache com a resposta do servidor.
 * Chame {@link carregar} uma vez ao entrar em cada página que consome a config.
 */
@Injectable({ providedIn: 'root' })
export class TrainingConfigService {
  private _grupos: PrincipioGrupo[] = [];
  private _momentos: Momento[] = [];

  private readonly principiosUrl = `${environment.apiUrl}/training-principles`;
  private readonly momentosUrl = `${environment.apiUrl}/game-moments`;

  constructor(private readonly http: HttpClient) {}

  get grupos(): PrincipioGrupo[] {
    return this._grupos;
  }

  get momentos(): Momento[] {
    return this._momentos;
  }

  /** Carrega princípios/fundamentos e momentos do backend, populando o cache. */
  carregar(): Observable<void> {
    return forkJoin({
      grupos: this.http.get<ApiResponse<PrincipioGrupo[]>>(this.principiosUrl),
      momentos: this.http.get<ApiResponse<Momento[]>>(this.momentosUrl),
    }).pipe(
      map(({ grupos, momentos }) => {
        this._grupos = grupos.data ?? [];
        this._momentos = momentos.data ?? [];
      }),
    );
  }

  // ── Princípios e Fundamentos (grupos) ──────────────────────────────────────

  criarGrupo(titulo: string, filtro: PrincipioGrupo['filtro'] = 'sempre'): Observable<PrincipioGrupo> {
    return this.http
      .post<ApiResponse<PrincipioGrupo>>(this.principiosUrl, { titulo, filtro })
      .pipe(this.unwrap(), tap((g) => this._grupos.push(g)));
  }

  renomearGrupo(grupoId: string, titulo: string, filtro?: PrincipioGrupo['filtro']): Observable<PrincipioGrupo> {
    const alvo = this._grupos.find((g) => g.id === grupoId);
    const body = { titulo, filtro: filtro ?? alvo?.filtro ?? 'sempre' };
    return this.http
      .put<ApiResponse<PrincipioGrupo>>(`${this.principiosUrl}/${grupoId}`, body)
      .pipe(this.unwrap(), tap((g) => this.upsertGrupo(g)));
  }

  removerGrupo(grupoId: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.principiosUrl}/${grupoId}`).pipe(
      map((r) => {
        if (!r.success) throw new Error(r.message ?? 'Falha ao remover.');
      }),
      tap(() => {
        this._grupos = this._grupos.filter((g) => g.id !== grupoId);
        // RI-1: espelha no cache a remoção dos vínculos órfãos daquele grupo.
        for (const m of this._momentos) m.vinculos = m.vinculos.filter((v) => v.grupoId !== grupoId);
      }),
    );
  }

  // ── Itens Trabalhados ──────────────────────────────────────────────────────

  adicionarItem(grupoId: string, label: string): Observable<PrincipioGrupo> {
    return this.http
      .post<ApiResponse<PrincipioGrupo>>(`${this.principiosUrl}/${grupoId}/items`, { label })
      .pipe(this.unwrap(), tap((g) => this.upsertGrupo(g)));
  }

  renomearItem(grupoId: string, itemId: string, label: string): Observable<PrincipioGrupo> {
    return this.http
      .put<ApiResponse<PrincipioGrupo>>(`${this.principiosUrl}/${grupoId}/items/${itemId}`, { label })
      .pipe(this.unwrap(), tap((g) => this.upsertGrupo(g)));
  }

  removerItem(grupoId: string, itemId: string): Observable<PrincipioGrupo> {
    return this.http.delete<ApiResponse<PrincipioGrupo>>(`${this.principiosUrl}/${grupoId}/items/${itemId}`).pipe(
      this.unwrap(),
      tap((g) => {
        this.upsertGrupo(g);
        // RI-2: espelha no cache a remoção do item de qualquer vínculo nos momentos.
        for (const m of this._momentos) {
          for (const v of m.vinculos) {
            if (v.grupoId === grupoId) v.itemIds = v.itemIds.filter((id) => id !== itemId);
          }
        }
      }),
    );
  }

  // ── Momentos do Jogo ───────────────────────────────────────────────────────

  criarMomento(label: string, tipo: Momento['tipo'] = 'ofensivo', desc = ''): Observable<Momento> {
    return this.http
      .post<ApiResponse<Momento>>(this.momentosUrl, { label, tipo, desc })
      .pipe(this.unwrapMomento(), tap((m) => this._momentos.push(m)));
  }

  renomearMomento(momentoId: string, label: string, desc = ''): Observable<Momento> {
    return this.http
      .put<ApiResponse<Momento>>(`${this.momentosUrl}/${momentoId}`, { label, desc })
      .pipe(this.unwrapMomento(), tap((m) => this.upsertMomento(m)));
  }

  removerMomento(momentoId: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.momentosUrl}/${momentoId}`).pipe(
      map((r) => {
        if (!r.success) throw new Error(r.message ?? 'Falha ao remover.');
      }),
      tap(() => {
        this._momentos = this._momentos.filter((m) => m.id !== momentoId);
      }),
    );
  }

  /** Substitui em bloco os vínculos de um momento (sanitizados pelo backend — RI-5). */
  definirVinculos(momentoId: string, vinculos: VinculoMomentoPrincipio[]): Observable<Momento> {
    const body = { vinculos: vinculos.map((v) => ({ grupoId: v.grupoId, itemIds: v.itemIds })) };
    return this.http
      .put<ApiResponse<Momento>>(`${this.momentosUrl}/${momentoId}/vinculos`, body)
      .pipe(this.unwrapMomento(), tap((m) => this.upsertMomento(m)));
  }

  // ── Infra de cache ─────────────────────────────────────────────────────────

  private upsertGrupo(grupo: PrincipioGrupo): void {
    const idx = this._grupos.findIndex((g) => g.id === grupo.id);
    if (idx >= 0) this._grupos[idx] = grupo;
    else this._grupos.push(grupo);
  }

  private upsertMomento(momento: Momento): void {
    const idx = this._momentos.findIndex((m) => m.id === momento.id);
    if (idx >= 0) this._momentos[idx] = momento;
    else this._momentos.push(momento);
  }

  private unwrap() {
    return map((r: ApiResponse<PrincipioGrupo>) => {
      if (!r.success || !r.data) throw new Error(r.message ?? 'Falha na operação.');
      return r.data;
    });
  }

  private unwrapMomento() {
    return map((r: ApiResponse<Momento>) => {
      if (!r.success || !r.data) throw new Error(r.message ?? 'Falha na operação.');
      return r.data;
    });
  }
}
