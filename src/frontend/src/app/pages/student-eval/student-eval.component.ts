import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
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
    this.refreshAvaliacoes();
  }

  /**
   * Referência estável: recalculada apenas após mutações reais (não a cada
   * ciclo de change detection), para não destruir/recriar o gráfico de
   * evolução a cada interação não relacionada (ex.: digitar a data, marcar uma nota).
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

    this.stateService.state.avaliacoes.push({
      id: crypto.randomUUID(),
      alunoId: this.alunoId,
      data: this.novaData,
      tatico: this.novoTatico as number,
      tecnico: this.novoTecnico as number,
      mental: this.novoMental as number,
    });
    this.stateService.save();
    this.refreshAvaliacoes();
    this.paginaAtual = 0;
    this.mostrarToast('Avaliação registrada com sucesso!');
    this.ocultarFormulario();
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

    const idx = this.stateService.state.avaliacoes.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.stateService.state.avaliacoes[idx] = {
        ...this.stateService.state.avaliacoes[idx],
        data: this.editData,
        tatico: this.editTatico as number,
        tecnico: this.editTecnico as number,
        mental: this.editMental as number,
      };
    }

    this.stateService.save();
    this.refreshAvaliacoes();
    this.paginaAtual = 0;
    this.editandoId = null;
    this.mostrarToast('Avaliação atualizada com sucesso!');
  }

  excluirAvaliacao(id: string): void {
    if (!window.confirm('Excluir esta avaliação?')) return;
    this.stateService.state.avaliacoes = this.stateService.state.avaliacoes.filter((a) => a.id !== id);
    this.stateService.save();
    this.refreshAvaliacoes();
    this.paginaAtual = 0;
    this.mostrarToast('Avaliação excluída.', 'error');
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 0) this.paginaAtual--;
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas - 1) this.paginaAtual++;
  }

  voltarParaAlunos(): void {
    this.stateService.save();
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
