import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TrainingConfigService } from '../../services/training-config.service';
import { Momento, PrincipioGrupo, VinculoMomentoPrincipio } from '../../models/training-config.model';

@Component({
  selector: 'app-training-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.css',
})
export class TrainingConfigComponent {
  toast: { message: string; type: 'success' | 'error' } | null = null;

  abaAtiva: 'principios' | 'momentos' = 'principios';

  // Princípios e Fundamentos
  novoGrupoTitulo = '';
  editandoGrupoId: string | null = null;
  editGrupoTitulo = '';
  novoItem: Record<string, string> = {};
  editandoItemId: string | null = null;
  editItemLabel = '';

  // Momentos do Jogo — fluxo lista/formulário
  momentoView: 'lista' | 'form' = 'lista';
  formMomentoId: string | null = null; // null = novo momento
  formMomentoLabel = '';
  formMomentoTipo: Momento['tipo'] = 'ofensivo';
  formMomentoDesc = '';
  formVinculos: VinculoMomentoPrincipio[] = [];

  constructor(
    public readonly authService: AuthService,
    private readonly config: TrainingConfigService,
  ) {}

  get grupos(): PrincipioGrupo[] {
    return this.config.grupos;
  }

  get momentos(): Momento[] {
    return this.config.momentos;
  }

  // ── Grupos (Princípios e Fundamentos) ──────────────────────────────────────

  criarGrupo(): void {
    this.run(() => {
      this.config.criarGrupo(this.novoGrupoTitulo);
      this.novoGrupoTitulo = '';
    }, 'Princípio/fundamento adicionado.');
  }

  iniciarEdicaoGrupo(grupo: PrincipioGrupo): void {
    this.editandoGrupoId = grupo.id;
    this.editGrupoTitulo = grupo.titulo;
  }

  salvarEdicaoGrupo(grupoId: string): void {
    this.run(() => {
      this.config.renomearGrupo(grupoId, this.editGrupoTitulo);
      this.editandoGrupoId = null;
    }, 'Princípio/fundamento atualizado.');
  }

  cancelarEdicaoGrupo(): void {
    this.editandoGrupoId = null;
  }

  removerGrupo(grupo: PrincipioGrupo): void {
    if (!window.confirm(`Remover "${grupo.titulo}" e seus itens? Vínculos em momentos também serão removidos.`)) return;
    this.run(() => this.config.removerGrupo(grupo.id), 'Princípio/fundamento removido.', 'error');
  }

  // ── Itens Trabalhados ──────────────────────────────────────────────────────

  adicionarItem(grupoId: string): void {
    this.run(() => {
      this.config.adicionarItem(grupoId, this.novoItem[grupoId] ?? '');
      this.novoItem[grupoId] = '';
    }, 'Item adicionado.');
  }

  iniciarEdicaoItem(itemId: string, label: string): void {
    this.editandoItemId = itemId;
    this.editItemLabel = label;
  }

  salvarEdicaoItem(grupoId: string, itemId: string): void {
    this.run(() => {
      this.config.renomearItem(grupoId, itemId, this.editItemLabel);
      this.editandoItemId = null;
    }, 'Item atualizado.');
  }

  cancelarEdicaoItem(): void {
    this.editandoItemId = null;
  }

  removerItem(grupoId: string, itemId: string, label: string): void {
    if (!window.confirm(`Remover o item "${label}"?`)) return;
    this.run(() => this.config.removerItem(grupoId, itemId), 'Item removido.', 'error');
  }

  // ── Momentos do Jogo — lista ────────────────────────────────────────────────

  abrirNovoMomento(): void {
    this.momentoView = 'form';
    this.formMomentoId = null;
    this.formMomentoLabel = '';
    this.formMomentoTipo = 'ofensivo';
    this.formMomentoDesc = '';
    this.formVinculos = [];
  }

  abrirEdicaoMomento(momento: Momento): void {
    this.momentoView = 'form';
    this.formMomentoId = momento.id;
    this.formMomentoLabel = momento.label;
    this.formMomentoTipo = momento.tipo;
    this.formMomentoDesc = momento.desc;
    // cópia profunda para editar sem afetar o estado até salvar
    this.formVinculos = momento.vinculos.map((v) => ({ grupoId: v.grupoId, itemIds: [...v.itemIds] }));
  }

  cancelarForm(): void {
    this.momentoView = 'lista';
  }

  removerMomento(momento: Momento): void {
    if (!window.confirm(`Remover o momento "${momento.label}"?`)) return;
    this.run(() => this.config.removerMomento(momento.id), 'Momento removido.', 'error');
  }

  /** Grupos vinculados a um momento já salvo — usado no resumo da lista. */
  gruposVinculados(momento: Momento): PrincipioGrupo[] {
    return this.grupos.filter((g) => momento.vinculos.some((v) => v.grupoId === g.id));
  }

  grupoTitulo(grupoId: string): string {
    return this.grupos.find((g) => g.id === grupoId)?.titulo ?? '';
  }

  // ── Momentos do Jogo — formulário (rascunho de vínculos) ────────────────────

  isVinculadoForm(grupoId: string): boolean {
    return this.formVinculos.some((v) => v.grupoId === grupoId);
  }

  toggleVinculoForm(grupoId: string): void {
    const idx = this.formVinculos.findIndex((v) => v.grupoId === grupoId);
    if (idx >= 0) this.formVinculos.splice(idx, 1);
    else this.formVinculos.push({ grupoId, itemIds: [] });
  }

  itemSelecionadoForm(grupoId: string, itemId: string): boolean {
    const vinculo = this.formVinculos.find((v) => v.grupoId === grupoId);
    return !!vinculo && vinculo.itemIds.includes(itemId);
  }

  toggleItemForm(grupoId: string, itemId: string): void {
    const vinculo = this.formVinculos.find((v) => v.grupoId === grupoId);
    if (!vinculo) return;
    const idx = vinculo.itemIds.indexOf(itemId);
    if (idx >= 0) vinculo.itemIds.splice(idx, 1);
    else vinculo.itemIds.push(itemId);
  }

  gruposVinculadosForm(): PrincipioGrupo[] {
    return this.grupos.filter((g) => this.isVinculadoForm(g.id));
  }

  salvarMomento(): void {
    this.run(() => {
      if (this.formMomentoId) {
        this.config.renomearMomento(this.formMomentoId, this.formMomentoLabel, this.formMomentoDesc);
        this.config.definirVinculos(this.formMomentoId, this.formVinculos);
      } else {
        const momento = this.config.criarMomento(this.formMomentoLabel, this.formMomentoTipo, this.formMomentoDesc);
        this.config.definirVinculos(momento.id, this.formVinculos);
      }
      this.momentoView = 'lista';
    }, this.formMomentoId ? 'Momento atualizado.' : 'Momento adicionado.');
  }

  // ── Infra ──────────────────────────────────────────────────────────────────

  private run(acao: () => void, sucesso: string, tipo: 'success' | 'error' = 'success'): void {
    try {
      acao();
      this.mostrarToast(sucesso, tipo);
    } catch (e) {
      this.mostrarToast(e instanceof Error ? e.message : 'Operação inválida.', 'error');
    }
  }

  private mostrarToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
