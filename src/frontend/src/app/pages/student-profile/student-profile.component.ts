import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Aluno, UpdateStudentProfileRequest } from '../../models/aluno.model';
import { EvaluationType } from '../../models/evaluation-type.model';
import { Evaluation } from '../../models/evaluation.model';
import { StudentsService } from '../../services/students.service';
import { EvaluationTypesService } from '../../services/evaluation-types.service';
import { EvaluationsService } from '../../services/evaluations.service';
import { AuthService } from '../../services/auth.service';
import { StudentInfoCardComponent } from '../../components/student-info-card/student-info-card.component';
import { GeneralEvaluationComponent } from '../../components/general-evaluation/general-evaluation.component';
import { EvaluationTypePanelComponent } from '../../components/evaluation-type-panel/evaluation-type-panel.component';

/**
 * Ficha do Aluno (feature 022). Layout de 3 colunas (1 no celular):
 * col 1 = quadro Aluno + Avaliação Geral; col 2/3 = quadros dos tipos de avaliação.
 */
@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StudentInfoCardComponent,
    GeneralEvaluationComponent,
    EvaluationTypePanelComponent,
  ],
  templateUrl: './student-profile.component.html',
})
export class StudentProfileComponent implements OnInit {
  aluno: Aluno | null = null;
  tipos: EvaluationType[] = [];
  avaliacoes: Evaluation[] = [];
  carregando = true;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly studentsService: StudentsService,
    private readonly evaluationTypesService: EvaluationTypesService,
    private readonly evaluationsService: EvaluationsService,
    public readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const alunoId = this.route.snapshot.queryParamMap.get('alunoId');
    if (!alunoId) {
      this.router.navigateByUrl('/students');
      return;
    }

    const emCache = this.studentsService.obter(alunoId);
    if (emCache) {
      this.aluno = emCache;
      this.carregarAvaliacoes(alunoId);
    } else {
      this.studentsService.listar().subscribe({
        next: () => {
          this.aluno = this.studentsService.obter(alunoId) ?? null;
          if (this.aluno) this.carregarAvaliacoes(alunoId);
          else {
            this.carregando = false;
            this.mostrarToast('Aluno não encontrado.', 'error');
          }
        },
        error: () => {
          this.carregando = false;
          this.mostrarToast('Não foi possível carregar o aluno.', 'error');
        },
      });
    }
  }

  private carregarAvaliacoes(alunoId: string): void {
    forkJoin({
      tipos: this.evaluationTypesService.carregar(),
      avaliacoes: this.evaluationsService.listarPorAluno(alunoId),
    }).subscribe({
      next: ({ tipos, avaliacoes }) => {
        this.tipos = tipos;
        this.avaliacoes = avaliacoes;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mostrarToast('Não foi possível carregar as avaliações.', 'error');
      },
    });
  }

  /** Tipos distribuídos entre as colunas 2 e 3 (par → col 2, ímpar → col 3). */
  get tiposColuna2(): EvaluationType[] {
    return this.tipos.filter((_, i) => i % 2 === 0);
  }

  get tiposColuna3(): EvaluationType[] {
    return this.tipos.filter((_, i) => i % 2 === 1);
  }

  avaliacoesDoTipo(tipoId: string): Evaluation[] {
    return this.avaliacoes.filter((a) => a.tipoId === tipoId);
  }

  onAvaliar(tipo: EvaluationType): void {
    if (!this.aluno) return;
    this.router.navigate(['/student-evaluation'], {
      queryParams: { alunoId: this.aluno.id, tipoId: tipo.id },
    });
  }

  atualizarFicha(dados: UpdateStudentProfileRequest): void {
    if (!this.aluno) return;
    this.studentsService.atualizarFicha(this.aluno.id, dados).subscribe({
      next: (aluno) => {
        this.aluno = aluno;
        this.mostrarToast('Ficha atualizada.');
      },
      error: (err) => this.mostrarToast(err?.error?.message ?? 'Falha ao atualizar a ficha.', 'error'),
    });
  }

  salvarAvaliacaoGeral(texto: string): void {
    this.atualizarFicha({ avaliacaoGeral: texto });
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }
}
