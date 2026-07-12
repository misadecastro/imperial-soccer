import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { CATEGORIAS, CATEGORIAS_LABELS } from '../../models/categoria.constants';
import { Aluno } from '../../models/aluno.model';
import { Avaliacao } from '../../models/avaliacao.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';

const AVATAR_COLORS = [
  '#16a34a', '#f97316', '#ec4899', '#8b5cf6',
  '#06b6d4', '#eab308', '#ef4444', '#6366f1',
];

const NOMES = [
  'Lucas', 'Gabriel', 'Pedro', 'Mateus', 'Rafael', 'Felipe', 'Gustavo', 'Henrique',
  'Bruno', 'Thiago', 'Carlos', 'Diego', 'André', 'Rodrigo', 'Leonardo',
  'Ana', 'Beatriz', 'Julia', 'Mariana', 'Larissa', 'Camila', 'Isabela',
  'Fernanda', 'Amanda', 'Natalia',
];
const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa',
  'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Pereira', 'Gomes', 'Martins', 'Rocha',
];
const CATEGORIAS_MOCK = ['Sub09', 'Sub10', 'Sub11', 'Sub12', 'Sub13', 'Sub14'];

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
export class StudentsComponent {
  readonly categorias = CATEGORIAS;
  readonly categoriasLabels = CATEGORIAS_LABELS;

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
    private readonly router: Router,
    public readonly authService: AuthService,
  ) {
    if (this.stateService.state.alunos.length === 0) {
      const mock = this.gerarMockData();
      this.stateService.state.alunos.push(...mock.alunos);
      this.stateService.state.avaliacoes.push(...mock.avaliacoes);
      this.stateService.save();
    }
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

    this.stateService.state.alunos.push({
      id: crypto.randomUUID(),
      nome,
      dataNascimento: this.dataNascimento,
      categoria: this.categoria,
    });
    this.stateService.save();

    this.nome = '';
    this.dataNascimento = '';
    this.categoria = '';
    this.fecharCadastro();
    this.mostrarToast('Aluno cadastrado com sucesso!');
  }

  excluirAluno(id: string): void {
    if (!window.confirm('Excluir este aluno? Esta ação também remove todas as suas avaliações.')) return;
    this.stateService.state.alunos = this.stateService.state.alunos.filter((a) => a.id !== id);
    this.stateService.state.avaliacoes = this.stateService.state.avaliacoes.filter((a) => a.alunoId !== id);
    this.stateService.save();
    this.mostrarToast('Aluno excluído.', 'error');
  }

  avaliar(alunoId: string): void {
    this.stateService.save();
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

  private gerarMockData(): { alunos: Aluno[]; avaliacoes: Avaliacao[] } {
    const alunos: Aluno[] = [];
    const avaliacoes: Avaliacao[] = [];

    for (let i = 0; i < 40; i++) {
      const alunoId = crypto.randomUUID();
      const categoria = CATEGORIAS_MOCK[i % CATEGORIAS_MOCK.length];
      const anoNasc = 2010 + Math.floor(Math.random() * 8);
      const mesNasc = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
      const diaNasc = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
      alunos.push({
        id: alunoId,
        nome: this.gerarNomeAleatorio(),
        dataNascimento: `${anoNasc}-${mesNasc}-${diaNasc}`,
        categoria,
      });

      const qtd = 5 + Math.floor(Math.random() * 11); // 5–15
      const datasUsadas = new Set<string>();
      for (let j = 0; j < qtd; j++) {
        let data = '';
        let tentativas = 0;
        do {
          data = this.gerarDataAleatoria('2025-01-01', '2026-04-04');
          tentativas++;
        } while (datasUsadas.has(data) && tentativas < 50);
        datasUsadas.add(data);
        avaliacoes.push({
          id: crypto.randomUUID(),
          alunoId,
          data,
          tatico: 2 + Math.floor(Math.random() * 4),
          tecnico: 2 + Math.floor(Math.random() * 4),
          mental: 2 + Math.floor(Math.random() * 4),
        });
      }
    }
    return { alunos, avaliacoes };
  }

  private gerarNomeAleatorio(): string {
    const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
    const sobrenome = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
    return `${nome} ${sobrenome}`;
  }

  private gerarDataAleatoria(inicio: string, fim: string): string {
    const tsInicio = new Date(inicio).getTime();
    const tsFim = new Date(fim).getTime();
    const ts = tsInicio + Math.random() * (tsFim - tsInicio);
    return new Date(ts).toISOString().split('T')[0];
  }
}
