export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  categoria: string;
}

export interface CreateStudentRequest {
  nome: string;
  dataNascimento: string;
  categoria: string;
}
