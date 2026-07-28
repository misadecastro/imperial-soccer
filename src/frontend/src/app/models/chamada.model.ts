export interface RegistroPresenca {
  alunoId: string;
  status: 'pendente' | 'presente' | 'falta';
}

export interface Chamada {
  id: string;
  data: string;
  categoria: string;
  registros: RegistroPresenca[];
  momentos: string[];
  principiosFundamentos: string[];
}
