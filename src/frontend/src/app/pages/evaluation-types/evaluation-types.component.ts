import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationItemInput, EvaluationType } from '../../models/evaluation-type.model';
import { EvaluationTypesService } from '../../services/evaluation-types.service';

/**
 * Gestão dos tipos de avaliação (feature 022) — acesso exclusivo do Administrador
 * (rota guardada por `data.papel`). Lista com filtro por nome, criar/editar/arquivar.
 */
@Component({
  selector: 'app-evaluation-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-types.component.html',
})
export class EvaluationTypesComponent implements OnInit {
  filtro = '';
  carregando = true;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // Estado do formulário (null = fechado; '' = novo; id = edição)
  formAberto = false;
  editandoId: string | null = null;
  nome = '';
  itens: EvaluationItemInput[] = [];
  erro: string | null = null;

  constructor(
    private readonly service: EvaluationTypesService,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    this.service.carregar().subscribe({
      next: () => (this.carregando = false),
      error: () => {
        this.carregando = false;
        this.mostrarToast('Não foi possível carregar os tipos.', 'error');
      },
    });
  }

  get tiposFiltrados(): EvaluationType[] {
    const f = this.filtro.trim().toLowerCase();
    return this.service.tipos.filter((t) => !f || t.nome.toLowerCase().includes(f));
  }

  voltar(): void {
    this.location.back();
  }

  novo(): void {
    this.editandoId = null;
    this.nome = '';
    this.itens = [{ nome: '' }];
    this.erro = null;
    this.formAberto = true;
  }

  editar(tipo: EvaluationType): void {
    this.editandoId = tipo.id;
    this.nome = tipo.nome;
    this.itens = tipo.itens.map((i) => ({ id: i.id, nome: i.nome }));
    this.erro = null;
    this.formAberto = true;
  }

  fecharForm(): void {
    this.formAberto = false;
  }

  adicionarItem(): void {
    this.itens.push({ nome: '' });
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);
  }

  salvar(): void {
    const nome = this.nome.trim();
    const itensValidos = this.itens.map((i) => ({ ...i, nome: i.nome.trim() })).filter((i) => i.nome);
    if (!nome) {
      this.erro = 'Informe o nome do tipo de avaliação.';
      return;
    }
    if (itensValidos.length === 0) {
      this.erro = 'Adicione ao menos um item a avaliar.';
      return;
    }

    const obs = this.editandoId
      ? this.service.atualizar(this.editandoId, nome, itensValidos)
      : this.service.criar(nome, itensValidos.map((i) => i.nome));

    obs.subscribe({
      next: () => {
        this.formAberto = false;
        this.mostrarToast(this.editandoId ? 'Tipo atualizado.' : 'Tipo criado.');
      },
      error: (err) => (this.erro = err?.error?.message ?? err?.message ?? 'Falha ao salvar.'),
    });
  }

  arquivar(tipo: EvaluationType): void {
    if (!window.confirm(`Excluir o tipo "${tipo.nome}"? O histórico das avaliações é preservado.`)) return;
    this.service.arquivar(tipo.id).subscribe({
      next: () => this.mostrarToast('Tipo arquivado.', 'error'),
      error: (err) => this.mostrarToast(err?.message ?? 'Falha ao arquivar.', 'error'),
    });
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }
}
