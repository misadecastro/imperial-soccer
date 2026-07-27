import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Aluno, CreateStudentRequest, UpdateStudentProfileRequest } from '../models/aluno.model';
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
   * Exclui o aluno do backend e limpa o cache local (state.alunos).
   */
  excluir(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/students/${id}`).pipe(
      map((r) => {
        if (!r.success) throw new Error(r.message ?? 'Falha ao excluir aluno.');
      }),
      tap(() => {
        this.stateService.state.alunos = this.stateService.state.alunos.filter((a) => a.id !== id);
      }),
    );
  }

  /** Retorna o aluno do cache (populado por {@link listar}). */
  obter(id: string): Aluno | undefined {
    return this.stateService.state.alunos.find((a) => a.id === id);
  }

  /**
   * Atualiza os campos da ficha (feature 022) via PUT /students/{id}/profile e
   * espelha a resposta no cache local (state.alunos).
   */
  atualizarFicha(id: string, dados: UpdateStudentProfileRequest): Observable<Aluno> {
    return this.http.put<ApiResponse<Aluno>>(`${environment.apiUrl}/students/${id}/profile`, dados).pipe(
      map((r) => {
        if (!r.success || !r.data) throw new Error(r.message ?? 'Falha ao atualizar a ficha.');
        return r.data;
      }),
      tap((aluno) => {
        const idx = this.stateService.state.alunos.findIndex((a) => a.id === id);
        if (idx !== -1) this.stateService.state.alunos[idx] = aluno;
      }),
    );
  }
}
