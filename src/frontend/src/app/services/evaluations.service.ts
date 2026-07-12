import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Avaliacao, CreateEvaluationRequest, UpdateEvaluationRequest } from '../models/avaliacao.model';
import { StateService } from './state.service';

@Injectable({ providedIn: 'root' })
export class EvaluationsService {
  constructor(
    private readonly http: HttpClient,
    private readonly stateService: StateService,
  ) {}

  /**
   * Carrega avaliações de um aluno do backend (lazy — apenas quando o professor
   * acessa a tela de avaliação de um aluno específico). Popula stateService.state.avaliacoes
   * como cache em memória; não persiste em sessionStorage — research.md decisão #2.
   */
  listarPorAluno(alunoId: string): Observable<Avaliacao[]> {
    return this.http
      .get<ApiResponse<Avaliacao[]>>(`${environment.apiUrl}/evaluations?alunoId=${encodeURIComponent(alunoId)}`)
      .pipe(
        map((r) => r.data ?? []),
        tap((avaliacoes) => {
          this.stateService.state.avaliacoes = avaliacoes;
        }),
      );
  }

  criar(request: CreateEvaluationRequest): Observable<Avaliacao> {
    return this.http.post<ApiResponse<Avaliacao>>(`${environment.apiUrl}/evaluations`, request).pipe(
      map((r) => {
        if (!r.success || !r.data) throw new Error(r.message ?? 'Falha ao registrar avaliação.');
        return r.data;
      }),
      tap((av) => {
        this.stateService.state.avaliacoes.push(av);
      }),
    );
  }

  atualizar(id: string, request: UpdateEvaluationRequest): Observable<Avaliacao> {
    return this.http.put<ApiResponse<Avaliacao>>(`${environment.apiUrl}/evaluations/${id}`, request).pipe(
      map((r) => {
        if (!r.success || !r.data) throw new Error(r.message ?? 'Falha ao atualizar avaliação.');
        return r.data;
      }),
      tap((av) => {
        const idx = this.stateService.state.avaliacoes.findIndex((a) => a.id === id);
        if (idx !== -1) this.stateService.state.avaliacoes[idx] = av;
      }),
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/evaluations/${id}`).pipe(
      map((r) => {
        if (!r.success) throw new Error(r.message ?? 'Falha ao excluir avaliação.');
      }),
      tap(() => {
        this.stateService.state.avaliacoes = this.stateService.state.avaliacoes.filter((a) => a.id !== id);
      }),
    );
  }
}
