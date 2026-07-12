import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CreateUserRequest, UpdateUserRequest, Usuario } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http
      .get<ApiResponse<Usuario[]>>(`${environment.apiUrl}/users`)
      .pipe(map((resposta) => resposta.data ?? []));
  }

  criar(request: CreateUserRequest): Observable<Usuario> {
    return this.http.post<ApiResponse<Usuario>>(`${environment.apiUrl}/users`, request).pipe(
      map((resposta) => {
        if (!resposta.success || !resposta.data) {
          throw new Error(resposta.message ?? 'Não foi possível cadastrar o usuário.');
        }
        return resposta.data;
      }),
    );
  }

  atualizar(id: string, request: UpdateUserRequest): Observable<Usuario> {
    return this.http.put<ApiResponse<Usuario>>(`${environment.apiUrl}/users/${id}`, request).pipe(
      map((resposta) => {
        if (!resposta.success || !resposta.data) {
          throw new Error(resposta.message ?? 'Não foi possível atualizar o usuário.');
        }
        return resposta.data;
      }),
    );
  }
}
