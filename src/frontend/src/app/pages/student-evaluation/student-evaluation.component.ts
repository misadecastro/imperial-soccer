import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import Chart from 'chart.js/auto';
import { Aluno } from '../../models/aluno.model';
import { EvaluationType } from '../../models/evaluation-type.model';
import { Evaluation } from '../../models/evaluation.model';
import { StudentsService } from '../../services/students.service';
import { EvaluationTypesService } from '../../services/evaluation-types.service';
import { EvaluationsService } from '../../services/evaluations.service';

const CORES = ['#2563eb', '#16a34a', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#eab308', '#ef4444'];

/**
 * Tela "Avaliar" de um tipo (feature 022): data + notas 1–5 por item; abaixo,
 * gráfico de evolução por item e histórico das avaliações do aluno naquele tipo.
 */
@Component({
  selector: 'app-student-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-evaluation.component.html',
})
export class StudentEvaluationComponent implements OnInit, AfterViewChecked {
  @ViewChild('evolucaoCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly notasPossiveis = [5, 4, 3, 2, 1];
  readonly rotulos: Record<number, string> = {
    5: 'Excelente', 4: 'Bom', 3: 'Regular', 2: 'Precisa Melhorar', 1: 'Insuficiente',
  };

  alunoId = '';
  tipoId = '';
  aluno: Aluno | null = null;
  tipo: EvaluationType | null = null;
  historico: Evaluation[] = [];
  carregando = true;
  salvando = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  data = new Date().toISOString().slice(0, 10);
  notas: Record<string, number> = {};

  private chart?: Chart;
  private chartPendente = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly studentsService: StudentsService,
    private readonly evaluationTypesService: EvaluationTypesService,
    private readonly evaluationsService: EvaluationsService,
  ) {}

  ngOnInit(): void {
    this.alunoId = this.route.snapshot.queryParamMap.get('alunoId') ?? '';
    this.tipoId = this.route.snapshot.queryParamMap.get('tipoId') ?? '';
    if (!this.alunoId || !this.tipoId) {
      this.router.navigateByUrl('/students');
      return;
    }

    const precisaAlunos = !this.studentsService.obter(this.alunoId);
    forkJoin({
      _alunos: precisaAlunos ? this.studentsService.listar() : of(null),
      tipos: this.evaluationTypesService.carregar(),
      hist: this.evaluationsService.listarPorAluno(this.alunoId, this.tipoId),
    }).subscribe({
      next: ({ tipos, hist }) => {
        this.aluno = this.studentsService.obter(this.alunoId) ?? null;
        this.tipo = tipos.find((t) => t.id === this.tipoId) ?? null;
        this.historico = hist;
        for (const item of this.tipo?.itens ?? []) this.notas[item.id] = 3;
        this.carregando = false;
        this.chartPendente = true;
      },
      error: () => {
        this.carregando = false;
        this.mostrarToast('Não foi possível carregar a avaliação.', 'error');
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.chartPendente && this.canvasRef) {
      this.chartPendente = false;
      this.renderEvolucao();
    }
  }

  selecionar(itemId: string, nota: number): void {
    this.notas[itemId] = nota;
  }

  salvar(): void {
    if (!this.tipo || !this.aluno) return;
    this.salvando = true;
    this.evaluationsService
      .criar({
        alunoId: this.alunoId,
        tipoId: this.tipoId,
        data: this.data,
        pontuacoes: this.tipo.itens.map((i) => ({ itemId: i.id, nota: this.notas[i.id] ?? 3 })),
      })
      .subscribe({
        next: () => {
          this.mostrarToast('Avaliação registrada!');
          this.router.navigate(['/student-profile'], { queryParams: { alunoId: this.alunoId } });
        },
        error: (err) => {
          this.salvando = false;
          this.mostrarToast(err?.error?.message ?? err?.message ?? 'Falha ao registrar.', 'error');
        },
      });
  }

  voltar(): void {
    this.router.navigate(['/student-profile'], { queryParams: { alunoId: this.alunoId } });
  }

  formatarData(iso: string): string {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  nomeItem(itemId: string): string {
    return this.tipo?.itens.find((i) => i.id === itemId)?.nome ?? itemId;
  }

  private renderEvolucao(): void {
    if (!this.canvasRef || !this.tipo || this.historico.length === 0) return;
    const ordenado = [...this.historico].sort((a, b) => a.data.localeCompare(b.data));
    const labels = ordenado.map((e) => this.formatarData(e.data));
    const datasets = this.tipo.itens.map((item, idx) => ({
      label: item.nome,
      data: ordenado.map((e) => e.pontuacoes.find((p) => p.itemId === item.id)?.nota ?? null),
      borderColor: CORES[idx % CORES.length],
      backgroundColor: CORES[idx % CORES.length],
      tension: 0.3,
      spanGaps: true,
    }));

    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
      },
    });
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }
}
