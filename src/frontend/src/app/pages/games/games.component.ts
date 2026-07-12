import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { CATEGORIAS, CATEGORIAS_LABELS } from '../../models/categoria.constants';
import { Aluno } from '../../models/aluno.model';
import { Jogo, Participacao } from '../../models/jogo.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';

const AVATAR_COLORS = [
  '#16a34a', '#f97316', '#ec4899', '#8b5cf6',
  '#06b6d4', '#eab308', '#ef4444', '#6366f1',
];

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
})
export class GamesComponent {
  readonly categorias = CATEGORIAS;
  readonly categoriasLabels = CATEGORIAS_LABELS;
  readonly hoje = new Date().toISOString().split('T')[0];

  view: 'lista' | 'form' = 'lista';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  jogoEditando: Jogo | null = null;
  participacoesAtual: Participacao[] = [];

  dataJogo = '';
  nomeJogo = '';
  erroData = '';
  erroNome = '';

  mostrarSeletor = false;
  filtroNomeSeletor = '';
  filtroCategoriaSeletor = '';
  selecaoAtual = new Set<string>();

  constructor(
    private readonly stateService: StateService,
    public readonly authService: AuthService,
  ) {}

  get jogosOrdenados(): Jogo[] {
    return [...this.stateService.state.jogos].sort((a, b) => b.data.localeCompare(a.data));
  }

  get tituloForm(): string {
    return this.jogoEditando ? 'Editar Jogo' : 'Novo Jogo';
  }

  get alunosFiltrados(): Aluno[] {
    const nome = this.filtroNomeSeletor.trim().toLowerCase();
    return this.stateService.state.alunos.filter((a) => {
      const matchNome = !nome || a.nome.toLowerCase().includes(nome);
      const matchCat = !this.filtroCategoriaSeletor || a.categoria === this.filtroCategoriaSeletor;
      return matchNome && matchCat;
    });
  }

  get elegiveisCount(): number {
    return this.alunosFiltrados.filter((a) => !this.jaAdicionado(a.id)).length;
  }

  get marcadosCount(): number {
    return this.alunosFiltrados.filter((a) => !this.jaAdicionado(a.id) && this.selecaoAtual.has(a.id)).length;
  }

  get selecionarTodosChecked(): boolean {
    return this.elegiveisCount > 0 && this.marcadosCount === this.elegiveisCount;
  }

  get selecionarTodosIndeterminate(): boolean {
    return this.marcadosCount > 0 && this.marcadosCount < this.elegiveisCount;
  }

  jaAdicionado(alunoId: string): boolean {
    return this.participacoesAtual.some((p) => p.alunoId === alunoId);
  }

  isSelecionado(alunoId: string): boolean {
    return this.selecaoAtual.has(alunoId);
  }

  toggleSelecao(alunoId: string, checked: boolean): void {
    if (checked) this.selecaoAtual.add(alunoId);
    else this.selecaoAtual.delete(alunoId);
  }

  onSelecionarTodosChange(checked: boolean): void {
    this.alunosFiltrados
      .filter((a) => !this.jaAdicionado(a.id))
      .forEach((a) => this.toggleSelecao(a.id, checked));
  }

  initials(nomeCompleto: string): string {
    const parts = String(nomeCompleto).trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  avatarColor(alunoId: string): string {
    const idx = this.stateService.state.alunos.findIndex((a) => a.id === alunoId);
    return AVATAR_COLORS[idx % AVATAR_COLORS.length];
  }

  alunoPorId(alunoId: string): Aluno | undefined {
    return this.stateService.state.alunos.find((a) => a.id === alunoId);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.substring(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }

  abrirNovoJogo(): void {
    this.jogoEditando = null;
    this.participacoesAtual = [];
    this.view = 'form';
    this.dataJogo = '';
    this.nomeJogo = '';
    this.erroData = '';
    this.erroNome = '';
    this.mostrarSeletor = false;
    this.filtroNomeSeletor = '';
    this.filtroCategoriaSeletor = '';
    this.selecaoAtual.clear();
  }

  abrirEdicaoJogo(jogo: Jogo): void {
    this.jogoEditando = jogo;
    this.participacoesAtual = jogo.participacoes.map((p) => ({ ...p }));
    this.view = 'form';
    this.dataJogo = jogo.data;
    this.nomeJogo = jogo.nome;
    this.erroData = '';
    this.erroNome = '';
    this.mostrarSeletor = false;
    this.filtroNomeSeletor = '';
    this.filtroCategoriaSeletor = '';
    this.selecaoAtual.clear();
  }

  cancelarForm(): void {
    this.view = 'lista';
  }

  excluirJogo(id: string): void {
    if (!window.confirm('Excluir este jogo? Esta ação não pode ser desfeita.')) return;
    this.stateService.state.jogos = this.stateService.state.jogos.filter((j) => j.id !== id);
    this.stateService.save();
    this.mostrarToast('Jogo excluído.', 'error');
  }

  toggleSeletor(): void {
    this.mostrarSeletor = !this.mostrarSeletor;
  }

  confirmarSelecao(): void {
    this.selecaoAtual.forEach((alunoId) => {
      if (!this.jaAdicionado(alunoId)) {
        this.participacoesAtual.push({ alunoId, minutos: 0 });
      }
    });
    this.selecaoAtual.clear();
    this.mostrarSeletor = false;
    this.filtroNomeSeletor = '';
    this.filtroCategoriaSeletor = '';
  }

  removerParticipante(alunoId: string): void {
    this.participacoesAtual = this.participacoesAtual.filter((p) => p.alunoId !== alunoId);
  }

  salvarJogo(): void {
    this.erroData = '';
    this.erroNome = '';

    const nome = this.nomeJogo.trim();
    if (!this.dataJogo) this.erroData = 'Data é obrigatória.';
    if (!nome) this.erroNome = 'Nome do jogo é obrigatório.';
    if (this.erroData || this.erroNome) return;

    const isEditing = !!this.jogoEditando;
    if (this.jogoEditando) {
      const jogo = this.stateService.state.jogos.find((j) => j.id === this.jogoEditando!.id);
      if (jogo) {
        jogo.data = this.dataJogo;
        jogo.nome = nome;
        jogo.participacoes = this.participacoesAtual;
      }
    } else {
      this.stateService.state.jogos.push({
        id: crypto.randomUUID(),
        data: this.dataJogo,
        nome,
        participacoes: this.participacoesAtual,
      });
    }
    this.stateService.save();
    this.view = 'lista';
    this.mostrarToast(isEditing ? 'Jogo atualizado com sucesso!' : 'Jogo salvo com sucesso!');
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
