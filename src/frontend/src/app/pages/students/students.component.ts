import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { StudentsService } from '../../services/students.service';
import { CATEGORIAS, CATEGORIAS_LABELS } from '../../models/categoria.constants';
import { Aluno } from '../../models/aluno.model';
import { Avaliacao } from '../../models/avaliacao.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';

const AVATAR_COLORS = [
  '#16a34a', '#f97316', '#ec4899', '#8b5cf6',
  '#06b6d4', '#eab308', '#ef4444', '#6366f1',
];

interface EvalChip {
  key: 'tecnico' | 'tatico' | 'mental';
  label: string;
  nota: number | null;
}

interface FormErrors {
  nome?: string;
  dataNascimento?: string;
  categoria?: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit {
  readonly categorias = CATEGORIAS;
  readonly categoriasLabels = CATEGORIAS_LABELS;

  carregando = false;
  mostrarCadastro = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  nome = '';
  dataNascimento = '';
  categoria = '';
  erros: FormErrors = {};

  filtroNome = '';
  filtroCategoria = '';

  constructor(
    private readonly stateService: StateService,
    private readonly studentsService: StudentsService,
    private readonly router: Router,
    public readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.carregarAlunos();
  }

  private carregarAlunos(): void {
    this.carregando = true;
    this.studentsService.listar().subscribe({
      next: () => { this.carregando = false; },
      error: () => {
        this.carregando = false;
        this.mostrarToast('Não foi possível carregar os alunos. Tente novamente.', 'error');
      },
    });
  }

  get alunosFiltrados(): Aluno[] {
    const nome = this.filtroNome.trim().toLowerCase();
    return this.stateService.state.alunos.filter((a) => {
      const matchNome = !nome || a.nome.toLowerCase().includes(nome);
      const matchCat = !this.filtroCategoria || a.categoria === this.filtroCategoria;
      return matchNome && matchCat;
    });
  }

  get totalAlunos(): number {
    return this.stateService.state.alunos.length;
  }

  toggleCadastro(): void {
    this.mostrarCadastro = !this.mostrarCadastro;
  }

  fecharCadastro(): void {
    this.mostrarCadastro = false;
  }

  avatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  initials(nomeCompleto: string): string {
    const parts = nomeCompleto.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  evalChips(aluno: Aluno): EvalChip[] {
    const avaliacao = this.ultimaAvaliacao(aluno.id);
    return [
      { key: 'tecnico', label: 'Téc', nota: avaliacao ? avaliacao.tecnico : null },
      { key: 'tatico', label: 'Tát', nota: avaliacao ? avaliacao.tatico : null },
      { key: 'mental', label: 'Ment', nota: avaliacao ? avaliacao.mental : null },
    ];
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  }

  onSubmitCadastro(): void {
    this.erros = {};
    const nome = this.nome.trim();

    if (!nome || nome.length < 2) {
      this.erros.nome = 'O nome é obrigatório (mínimo 2 caracteres).';
    }
    if (!this.dataNascimento) {
      this.erros.dataNascimento = 'A data de nascimento é obrigatória.';
    } else if (new Date(this.dataNascimento) > new Date()) {
      this.erros.dataNascimento = 'A data de nascimento não pode ser uma data futura.';
    }
    if (!this.categoria) {
      this.erros.categoria = 'Selecione uma categoria.';
    }

    if (Object.keys(this.erros).length > 0) return;

    this.studentsService.criar({ nome, dataNascimento: this.dataNascimento, categoria: this.categoria }).subscribe({
      next: () => {
        this.nome = '';
        this.dataNascimento = '';
        this.categoria = '';
        this.fecharCadastro();
        this.mostrarToast('Aluno cadastrado com sucesso!');
      },
      error: (err) => {
        const mensagem = err?.error?.message ?? 'Não foi possível cadastrar o aluno.';
        this.mostrarToast(mensagem, 'error');
      },
    });
  }

  excluirAluno(id: string): void {
    if (!window.confirm('Excluir este aluno? Esta ação também remove todas as suas avaliações.')) return;
    this.studentsService.excluir(id).subscribe({
      next: () => { this.mostrarToast('Aluno excluído.', 'error'); },
      error: (err) => {
        const mensagem = err?.error?.message ?? 'Não foi possível excluir o aluno.';
        this.mostrarToast(mensagem, 'error');
      },
    });
  }

  avaliar(alunoId: string): void {
    this.router.navigate(['/student-eval'], { queryParams: { alunoId } });
  }

  private ultimaAvaliacao(alunoId: string): Avaliacao | null {
    const avals = this.stateService.state.avaliacoes
      .filter((a) => a.alunoId === alunoId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return avals[0] ?? null;
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
