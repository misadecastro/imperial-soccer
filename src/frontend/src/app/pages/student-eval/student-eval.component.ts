import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { EvaluationsService } from '../../services/evaluations.service';
import { CATEGORIAS_LABELS } from '../../models/categoria.constants';
import { Aluno } from '../../models/aluno.model';
import { Avaliacao } from '../../models/avaliacao.model';
import { EvolutionChartComponent } from '../../components/evolution-chart/evolution-chart.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';

interface NotaOption {
  label: string;
  valor: number;
}

const NOTAS: NotaOption[] = [
  { label: 'Excelente', valor: 5 },
  { label: 'Bom', valor: 4 },
  { label: 'Regular', valor: 3 },
  { label: 'Precisa Melhorar', valor: 2 },
];

const PAGE_SIZE = 10;

interface ErrosAvaliacao {
  data?: string;
  tatico?: string;
  tecnico?: string;
  mental?: string;
}

@Component({
  selector: 'app-student-eval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EvolutionChartComponent, EmptyStateComponent],
  templateUrl: './student-eval.component.html',
  styleUrl: './student-eval.component.css',
})
export class StudentEvalComponent implements OnInit {
  readonly notas = NOTAS;
  readonly categoriasLabels = CATEGORIAS_LABELS;
  readonly pageSize = PAGE_SIZE;

  aluno: Aluno | null = null;
  private alunoId = '';

  carregando = false;
  mostrarFormulario = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  novaData = '';
  novoTatico: number | null = null;
  novoTecnico: number | null = null;
  novoMental: number | null = null;
  errosNovo: ErrosAvaliacao = {};

  paginaAtual = 0;

  editandoId: string | null = null;
  editData = '';
  editTatico: number | null = null;
  editTecnico: number | null = null;
  editMental: number | null = null;
  errosEdit: ErrosAvaliacao = {};

  readonly hoje = this.todayISO();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly stateService: StateService,
    private readonly evaluationsService: EvaluationsService,
    public readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const alunoId = this.route.snapshot.queryParamMap.get('alunoId');
    if (!alunoId) {
      this.router.navigateByUrl('/students');
      return;
    }
    const aluno = this.stateService.state.alunos.find((a) => a.id === alunoId);
    if (!aluno) {
      this.router.navigateByUrl('/students');
      return;
    }
    this.alunoId = alunoId;
    this.aluno = aluno;
    this.novaData = this.hoje;
    this.carregarAvaliacoes();
  }

  private carregarAvaliacoes(): void {
    this.carregando = true;
    this.evaluationsService.listarPorAluno(this.alunoId).subscribe({
      next: () => {
        this.carregando = false;
        this.refreshAvaliacoes();
      },
      error: () => {
        this.carregando = false;
        this.mostrarToast('Não foi possível carregar as avaliações.', 'error');
      },
    });
  }

  /**
   * Campo estável (não getter) populado pelo EvaluationsService via cache em state.avaliacoes.
   * Recomputado apenas após mutações reais para não recriar o gráfico a cada ciclo de CD.
   */
  todasAvaliacoes: Avaliacao[] = [];

  private refreshAvaliacoes(): void {
    this.todasAvaliacoes = this.stateService.state.avaliacoes
      .filter((a) => a.alunoId === this.alunoId)
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.todasAvaliacoes.length / this.pageSize));
  }

  get avaliacoesPagina(): Avaliacao[] {
    const todas = this.todasAvaliacoes;
    if (this.paginaAtual >= this.totalPaginas) this.paginaAtual = this.totalPaginas - 1;
    if (this.paginaAtual < 0) this.paginaAtual = 0;
    return todas.slice(this.paginaAtual * this.pageSize, (this.paginaAtual + 1) * this.pageSize);
  }

  toggleFormulario(): void {
    this.mostrarFormulario = true;
  }

  cancelarNovaAvaliacao(): void {
    this.ocultarFormulario();
  }

  private ocultarFormulario(): void {
    this.mostrarFormulario = false;
    this.novaData = this.hoje;
    this.novoTatico = null;
    this.novoTecnico = null;
    this.novoMental = null;
    this.errosNovo = {};
  }

  submitNovaAvaliacao(): void {
    this.errosNovo = {};

    if (!this.novaData) {
      this.errosNovo.data = 'A data é obrigatória.';
    } else if (this.novaData > this.hoje) {
      this.errosNovo.data = 'A data não pode ser futura.';
    }
    if (this.novoTatico === null) this.errosNovo.tatico = 'Selecione uma nota para Tático.';
    if (this.novoTecnico === null) this.errosNovo.tecnico = 'Selecione uma nota para Técnico.';
    if (this.novoMental === null) this.errosNovo.mental = 'Selecione uma nota para Mental.';

    if (Object.keys(this.errosNovo).length > 0) return;

    this.evaluationsService
      .criar({
        alunoId: this.alunoId,
        data: this.novaData,
        tatico: this.novoTatico as number,
        tecnico: this.novoTecnico as number,
        mental: this.novoMental as number,
      })
      .subscribe({
        next: () => {
          this.refreshAvaliacoes();
          this.paginaAtual = 0;
          this.mostrarToast('Avaliação registrada com sucesso!');
          this.ocultarFormulario();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Não foi possível registrar a avaliação.';
          this.mostrarToast(msg, 'error');
        },
      });
  }

  iniciarEdicao(av: Avaliacao): void {
    this.editandoId = av.id;
    this.editData = av.data.substring(0, 10);
    this.editTatico = av.tatico;
    this.editTecnico = av.tecnico;
    this.editMental = av.mental;
    this.errosEdit = {};
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.errosEdit = {};
  }

  salvarEdicao(id: string): void {
    this.errosEdit = {};

    if (!this.editData) {
      this.errosEdit.data = 'A data é obrigatória.';
    } else if (this.editData > this.hoje) {
      this.errosEdit.data = 'A data não pode ser futura.';
    }
    if (this.editTatico === null) this.errosEdit.tatico = 'Selecione uma nota para Tático.';
    if (this.editTecnico === null) this.errosEdit.tecnico = 'Selecione uma nota para Técnico.';
    if (this.editMental === null) this.errosEdit.mental = 'Selecione uma nota para Mental.';

    if (Object.keys(this.errosEdit).length > 0) return;

    this.evaluationsService
      .atualizar(id, {
        data: this.editData,
        tatico: this.editTatico as number,
        tecnico: this.editTecnico as number,
        mental: this.editMental as number,
      })
      .subscribe({
        next: () => {
          this.refreshAvaliacoes();
          this.paginaAtual = 0;
          this.editandoId = null;
          this.mostrarToast('Avaliação atualizada com sucesso!');
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Não foi possível atualizar a avaliação.';
          this.mostrarToast(msg, 'error');
        },
      });
  }

  excluirAvaliacao(id: string): void {
    if (!window.confirm('Excluir esta avaliação?')) return;
    this.evaluationsService.excluir(id).subscribe({
      next: () => {
        this.refreshAvaliacoes();
        this.paginaAtual = 0;
        this.mostrarToast('Avaliação excluída.', 'error');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Não foi possível excluir a avaliação.';
        this.mostrarToast(msg, 'error');
      },
    });
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 0) this.paginaAtual--;
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas - 1) this.paginaAtual++;
  }

  voltarParaAlunos(): void {
    this.router.navigateByUrl('/students');
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const dateStr = isoDate.substring(0, 10);
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }

  private todayISO(): string {
    return new Date().toISOString().split('T')[0];
  }
}
