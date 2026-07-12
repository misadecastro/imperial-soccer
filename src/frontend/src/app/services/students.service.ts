import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Aluno, CreateStudentRequest } from '../models/aluno.model';
import { StateService } from './state.service';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  constructor(
    private readonly http: HttpClient,
    private readonly stateService: StateService,
  ) {}

  /**
   * Busca todos os alunos do backend e popula stateService.state.alunos como cache
   * em memória. Não persiste em sessionStorage (alunos agora têm o backend como fonte de
   * verdade). Os demais componentes (Dashboard, Games, Training) continuam lendo
   * stateService.state.alunos sem precisar de nenhuma mudança — research.md decisão #1.
   */
  listar(): Observable<Aluno[]> {
    return this.http.get<ApiResponse<Aluno[]>>(`${environment.apiUrl}/students`).pipe(
      map((r) => r.data ?? []),
      tap((alunos) => {
        this.stateService.state.alunos = alunos;
      }),
    );
  }

  criar(request: CreateStudentRequest): Observable<Aluno> {
    return this.http.post<ApiResponse<Aluno>>(`${environment.apiUrl}/students`, request).pipe(
      map((r) => {
        if (!r.success || !r.data) throw new Error(r.message ?? 'Falha ao cadastrar aluno.');
        return r.data;
      }),
      tap((aluno) => {
        this.stateService.state.alunos.push(aluno);
      }),
    );
  }

  /**
   * Exclui o aluno do backend e limpa o cache local (state.alunos) + avaliações
   * vinculadas em sessionStorage — cascata local enquanto avaliações não estão no backend
   * (research.md decisão #2 / FR-009).
   */
  excluir(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/students/${id}`).pipe(
      map((r) => {
        if (!r.success) throw new Error(r.message ?? 'Falha ao excluir aluno.');
      }),
      tap(() => {
        this.stateService.state.alunos = this.stateService.state.alunos.filter((a) => a.id !== id);
        this.stateService.state.avaliacoes = this.stateService.state.avaliacoes.filter((av) => av.alunoId !== id);
      }),
    );
  }
}
