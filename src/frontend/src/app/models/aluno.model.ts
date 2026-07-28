export type PeDominante = 'Direito' | 'Esquerdo' | 'Ambidestro';

export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  categoria: string;
  // Campos da ficha (feature 022) — editados inline na ficha
  foto?: string | null;
  peDominante?: PeDominante | null;
  massaCorporal?: number | null;
  estatura?: number | null;
  avaliacaoGeral?: string | null;
}

export interface CreateStudentRequest {
  nome: string;
  dataNascimento: string;
  categoria: string;
}

export interface UpdateStudentProfileRequest {
  foto?: string | null;
  peDominante?: PeDominante | null;
  massaCorporal?: number | null;
  estatura?: number | null;
  avaliacaoGeral?: string | null;
}
