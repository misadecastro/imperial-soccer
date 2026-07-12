export type Papel = 'Administrador' | 'Professor';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
}

export interface UpdateUserRequest {
  nome?: string;
  papel?: Papel;
  novaSenha?: string;
  ativo?: boolean;
}
