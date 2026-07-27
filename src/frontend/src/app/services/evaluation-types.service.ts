import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { EvaluationItemInput, EvaluationType } from '../models/evaluation-type.model';

/**
 * Tipos de avaliação dinâmicos (feature 022) — persistidos no backend
 * (`/evaluation-types`). Mantém um cache em memória que os templates leem via
 * getter síncrono; cada escrita chama a API e atualiza o cache com a resposta.
 * Padrão espelhado de {@link TrainingConfigService} (feature 020).
 */
@Injectable({ providedIn: 'root' })
export class EvaluationTypesService {
  private _tipos: EvaluationType[] = [];
  private readonly url = `${environment.apiUrl}/evaluation-types`;

  constructor(private readonly http: HttpClient) {}

  get tipos(): EvaluationType[] {
    return this._tipos;
  }

  /** Carrega os tipos ativos do backend, populando o cache. */
  carregar(): Observable<EvaluationType[]> {
    return this.http.get<ApiResponse<EvaluationType[]>>(this.url).pipe(
      map((r) => r.data ?? []),
      tap((tipos) => (this._tipos = tipos)),
    );
  }

  criar(nome: string, itens: string[]): Observable<EvaluationType> {
    return this.http.post<ApiResponse<EvaluationType>>(this.url, { nome, itens }).pipe(
      this.unwrap(),
      tap((t) => this._tipos.push(t)),
    );
  }

  atualizar(id: string, nome: string, itens: EvaluationItemInput[]): Observable<EvaluationType> {
    return this.http.put<ApiResponse<EvaluationType>>(`${this.url}/${id}`, { nome, itens }).pipe(
      this.unwrap(),
      tap((t) => this.upsert(t)),
    );
  }

  arquivar(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(
      map((r) => {
        if (!r.success) throw new Error(r.message ?? 'Falha ao arquivar o tipo.');
      }),
      tap(() => (this._tipos = this._tipos.filter((t) => t.id !== id))),
    );
  }

  private upsert(tipo: EvaluationType): void {
    const idx = this._tipos.findIndex((t) => t.id === tipo.id);
    if (idx >= 0) this._tipos[idx] = tipo;
    else this._tipos.push(tipo);
  }

  private unwrap() {
    return map((r: ApiResponse<EvaluationType>) => {
      if (!r.success || !r.data) throw new Error(r.message ?? 'Falha na operação.');
      return r.data;
    });
  }
}
