import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, Papel, Usuario } from '../models/user.model';

const TOKEN_KEY = 'imperialAuthToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioAtual: Usuario | null = this.lerUsuarioDoToken();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(credenciais: LoginRequest): Observable<Usuario> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, credenciais).pipe(
      map((resposta) => {
        if (!resposta.success || !resposta.data) {
          throw new Error(resposta.message ?? 'Falha no login.');
        }
        return resposta.data;
      }),
      tap((data) => {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        this.usuarioAtual = data.usuario;
      }),
      map((data) => data.usuario),
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => undefined });
    sessionStorage.removeItem(TOKEN_KEY);
    this.usuarioAtual = null;
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.usuarioAtual?.papel === 'Administrador';
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getUsuarioAtual(): Usuario | null {
    return this.usuarioAtual;
  }

  private lerUsuarioDoToken(): Usuario | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      const expiraEmSegundos = Number(payload.exp) * 1000;
      if (Number.isFinite(expiraEmSegundos) && Date.now() >= expiraEmSegundos) {
        sessionStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return {
        id: String(payload.sub),
        nome: String(payload.name),
        email: String(payload.email),
        papel: payload.role as Papel,
        ativo: true,
      };
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
}
