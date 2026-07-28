import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CreateEvaluationRequest, Evaluation } from '../models/evaluation.model';

/**
 * Registros de avaliação (feature 022). Sem cache global — cada tela consulta o
 * histórico do aluno/tipo sob demanda (radar, evolução, histórico).
 */
@Injectable({ providedIn: 'root' })
export class EvaluationsService {
  private readonly url = `${environment.apiUrl}/evaluations`;

  constructor(private readonly http: HttpClient) {}

  /** Lista as avaliações de um aluno (opcionalmente filtrando por tipo), por data asc. */
  listarPorAluno(alunoId: string, tipoId?: string): Observable<Evaluation[]> {
    let params = `?alunoId=${encodeURIComponent(alunoId)}`;
    if (tipoId) params += `&tipoId=${encodeURIComponent(tipoId)}`;
    return this.http.get<ApiResponse<Evaluation[]>>(`${this.url}${params}`).pipe(map((r) => r.data ?? []));
  }

  criar(request: CreateEvaluationRequest): Observable<Evaluation> {
    return this.http.post<ApiResponse<Evaluation>>(this.url, request).pipe(
      map((r) => {
        if (!r.success || !r.data) throw new Error(r.message ?? 'Falha ao registrar a avaliação.');
        return r.data;
      }),
    );
  }
}
