import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { CATEGORIAS, CATEGORIAS_LABELS } from '../../models/categoria.constants';
import { Chamada, RegistroPresenca } from '../../models/chamada.model';
import { PrincipioGrupo } from '../../models/training-config.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';
import { TrainingConfigService } from '../../services/training-config.service';

const AVATAR_COLORS = [
  '#16a34a', '#f97316', '#ec4899', '#8b5cf6',
  '#06b6d4', '#eab308', '#ef4444', '#6366f1',
];

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './training.component.html',
  styleUrl: './training.component.css',
})
export class TrainingComponent {
  readonly categorias = CATEGORIAS;
  readonly categoriasLabels = CATEGORIAS_LABELS;
  readonly hoje = this.todayISO();

  get momentos() {
    return this.trainingConfig.momentos;
  }

  get principiosGrupos() {
    return this.trainingConfig.grupos;
  }

  view: 'lista' | 'form' = 'lista';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  treinoEditando: Chamada | null = null;
  chamadaAtual: Chamada | null = null;
  momentosSelecionados: string[] = [];
  principiosSelecionados: string[] = [];
  chamadaExpandida = true;

  dataTreino = '';
  categoriaTreino = '';
  erroData = '';
  erroCategoria = '';

  constructor(
    private readonly stateService: StateService,
    public readonly authService: AuthService,
    private readonly trainingConfig: TrainingConfigService,
  ) {}

  get treinosOrdenados(): Chamada[] {
    return [...this.stateService.state.chamadas].sort((a, b) => b.data.localeCompare(a.data));
  }

  get tituloForm(): string {
    return this.treinoEditando ? 'Editar Treino' : 'Novo Treino';
  }

  get gruposVisiveis(): Set<string> {
    const tipos = new Set<string>(['sempre']);
    for (const m of this.momentos) {
      if (this.momentosSelecionados.includes(m.id)) tipos.add(m.tipo);
    }
    return tipos;
  }

  contarStatus(chamada: Chamada): { presentes: number; faltas: number; pendentes: number } {
    const presentes = chamada.registros.filter((r) => r.status === 'presente').length;
    const faltas = chamada.registros.filter((r) => r.status === 'falta').length;
    const pendentes = chamada.registros.filter((r) => r.status === 'pendente').length;
    return { presentes, faltas, pendentes };
  }

  labelPrincipio(id: string): string {
    for (const grupo of this.principiosGrupos) {
      const item = grupo.itens.find((i) => i.id === id);
      if (item) return item.label;
    }
    return id;
  }

  chipsPrincipios(chamada: Chamada): { visiveis: string[]; extra: number } {
    const labels = (chamada.principiosFundamentos || []).map((id) => this.labelPrincipio(id));
    const maxChips = 4;
    return { visiveis: labels.slice(0, maxChips), extra: labels.length - maxChips };
  }

  alunoNome(alunoId: string): string {
    return this.stateService.state.alunos.find((a) => a.id === alunoId)?.nome ?? '';
  }

  initials(nomeCompleto: string): string {
    const parts = nomeCompleto.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  avatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  abrirNovoTreino(): void {
    this.treinoEditando = null;
    this.view = 'form';
    this.dataTreino = this.hoje;
    this.categoriaTreino = '';
    this.momentosSelecionados = [];
    this.principiosSelecionados = [];
    this.chamadaAtual = null;
    this.chamadaExpandida = true;
    this.erroData = '';
    this.erroCategoria = '';
  }

  abrirEdicaoTreino(chamada: Chamada): void {
    this.treinoEditando = chamada;
    this.view = 'form';
    this.dataTreino = chamada.data;
    this.categoriaTreino = chamada.categoria;
    this.momentosSelecionados = [...(chamada.momentos || [])];
    this.principiosSelecionados = [...(chamada.principiosFundamentos || [])];
    this.chamadaAtual = chamada;
    this.chamadaExpandida = true;
    this.erroData = '';
    this.erroCategoria = '';
    this.aplicarFiltroPrincipios();
  }

  cancelarForm(): void {
    this.view = 'lista';
  }

  excluirTreino(id: string): void {
    if (!window.confirm('Excluir este treino? Esta ação não pode ser desfeita.')) return;
    this.stateService.state.chamadas = this.stateService.state.chamadas.filter((c) => c.id !== id);
    this.stateService.save();
    this.mostrarToast('Treino excluído.', 'error');
  }

  toggleChamadaAccordion(): void {
    this.chamadaExpandida = !this.chamadaExpandida;
  }

  onDataOuCategoriaChange(): void {
    if (this.treinoEditando) return;
    if (!this.dataTreino || !this.categoriaTreino) {
      this.chamadaAtual = null;
      return;
    }
    this.chamadaAtual = this.getOrCreateChamada(this.dataTreino, this.categoriaTreino);
  }

  setStatus(alunoId: string, status: RegistroPresenca['status']): void {
    if (!this.chamadaAtual) return;
    const reg = this.chamadaAtual.registros.find((r) => r.alunoId === alunoId);
    if (reg) reg.status = status;
  }

  marcarTodos(status: RegistroPresenca['status']): void {
    if (!this.chamadaAtual) return;
    this.chamadaAtual.registros.forEach((r) => {
      r.status = status;
    });
  }

  toggleMomento(id: string): void {
    const idx = this.momentosSelecionados.indexOf(id);
    if (idx >= 0) this.momentosSelecionados.splice(idx, 1);
    else this.momentosSelecionados.push(id);
    this.aplicarFiltroPrincipios();
  }

  togglePrincipio(id: string): void {
    const idx = this.principiosSelecionados.indexOf(id);
    if (idx >= 0) this.principiosSelecionados.splice(idx, 1);
    else this.principiosSelecionados.push(id);
  }

  gruposVisiveisLista(): PrincipioGrupo[] {
    const visiveis = this.gruposVisiveis;
    return this.principiosGrupos.filter((g) => visiveis.has(g.filtro));
  }

  private aplicarFiltroPrincipios(): void {
    const visiveis = this.gruposVisiveis;
    this.principiosGrupos.forEach((grupo) => {
      if (!visiveis.has(grupo.filtro)) {
        const idsDoGrupo = new Set(grupo.itens.map((i) => i.id));
        this.principiosSelecionados = this.principiosSelecionados.filter((id) => !idsDoGrupo.has(id));
      }
    });
  }

  salvarTreino(): void {
    this.erroData = '';
    this.erroCategoria = '';

    if (!this.dataTreino) this.erroData = 'Data é obrigatória.';
    if (!this.categoriaTreino) this.erroCategoria = 'Categoria é obrigatória.';
    if (this.erroData || this.erroCategoria) return;

    if (!this.chamadaAtual) {
      this.chamadaAtual = this.getOrCreateChamada(this.dataTreino, this.categoriaTreino);
    }

    this.chamadaAtual.momentos = [...this.momentosSelecionados];
    this.chamadaAtual.principiosFundamentos = [...this.principiosSelecionados];

    const isEditing = !!this.treinoEditando;
    this.salvarChamada(this.chamadaAtual);
    this.view = 'lista';
    this.mostrarToast(isEditing ? 'Treino atualizado com sucesso!' : 'Treino salvo com sucesso!');
  }

  private getOrCreateChamada(data: string, categoria: string): Chamada {
    const existente = this.stateService.state.chamadas.find((c) => c.data === data && c.categoria === categoria);
    if (existente) return existente;
    const alunosDaCategoria = this.stateService.state.alunos.filter((a) => a.categoria === categoria);
    const registros: RegistroPresenca[] = alunosDaCategoria.map((a) => ({ alunoId: a.id, status: 'pendente' }));
    return { id: crypto.randomUUID(), data, categoria, registros, momentos: [], principiosFundamentos: [] };
  }

  private salvarChamada(chamada: Chamada): void {
    const idx = this.stateService.state.chamadas.findIndex(
      (c) => c.data === chamada.data && c.categoria === chamada.categoria,
    );
    if (idx !== -1) {
      this.stateService.state.chamadas[idx] = chamada;
    } else {
      this.stateService.state.chamadas.push(chamada);
    }
    this.stateService.save();
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
