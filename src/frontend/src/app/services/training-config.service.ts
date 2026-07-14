import { Injectable } from '@angular/core';
import { ItemTrabalhado, Momento, PrincipioGrupo, VinculoMomentoPrincipio } from '../models/training-config.model';

/**
 * Fonte única (em memória / mockada) da configuração de itens de treino — feature 019.
 * Inicializado com o seed que antes ficava fixo em `training.component.ts`
 * (`MOMENTOS` / `PRINCIPIOS_GRUPOS`). Sem persistência backend nesta fase:
 * as alterações vivem enquanto a sessão do SPA estiver aberta e voltam ao seed ao recarregar.
 */
@Injectable({ providedIn: 'root' })
export class TrainingConfigService {
  private readonly _grupos: PrincipioGrupo[] = seedGrupos();
  private readonly _momentos: Momento[] = seedMomentos();

  get grupos(): PrincipioGrupo[] {
    return this._grupos;
  }

  get momentos(): Momento[] {
    return this._momentos;
  }

  // ── Princípios e Fundamentos (grupos) ──────────────────────────────────────

  criarGrupo(titulo: string, filtro: PrincipioGrupo['filtro'] = 'sempre'): PrincipioGrupo {
    const nome = titulo.trim();
    if (!nome) throw new Error('O nome do princípio/fundamento é obrigatório.');
    if (this._grupos.some((g) => g.titulo.trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error('Já existe um princípio/fundamento com esse nome.');
    }
    const grupo: PrincipioGrupo = { id: crypto.randomUUID(), titulo: nome, filtro, itens: [] };
    this._grupos.push(grupo);
    return grupo;
  }

  renomearGrupo(grupoId: string, titulo: string): void {
    const nome = titulo.trim();
    if (!nome) throw new Error('O nome do princípio/fundamento é obrigatório.');
    if (this._grupos.some((g) => g.id !== grupoId && g.titulo.trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error('Já existe um princípio/fundamento com esse nome.');
    }
    const grupo = this._grupos.find((g) => g.id === grupoId);
    if (grupo) grupo.titulo = nome;
  }

  removerGrupo(grupoId: string): void {
    const idx = this._grupos.findIndex((g) => g.id === grupoId);
    if (idx === -1) return;
    this._grupos.splice(idx, 1);
    // RI-1: remove vínculos órfãos daquele grupo em todos os momentos.
    for (const m of this._momentos) {
      m.vinculos = m.vinculos.filter((v) => v.grupoId !== grupoId);
    }
  }

  // ── Itens Trabalhados ──────────────────────────────────────────────────────

  adicionarItem(grupoId: string, label: string): ItemTrabalhado {
    const grupo = this._grupos.find((g) => g.id === grupoId);
    if (!grupo) throw new Error('Princípio/fundamento não encontrado.');
    const nome = label.trim();
    if (!nome) throw new Error('O nome do item trabalhado é obrigatório.');
    if (grupo.itens.some((i) => i.label.trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error('Já existe um item com esse nome neste princípio/fundamento.');
    }
    const item: ItemTrabalhado = { id: crypto.randomUUID(), label: nome };
    grupo.itens.push(item);
    return item;
  }

  renomearItem(grupoId: string, itemId: string, label: string): void {
    const grupo = this._grupos.find((g) => g.id === grupoId);
    if (!grupo) return;
    const nome = label.trim();
    if (!nome) throw new Error('O nome do item trabalhado é obrigatório.');
    if (grupo.itens.some((i) => i.id !== itemId && i.label.trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error('Já existe um item com esse nome neste princípio/fundamento.');
    }
    const item = grupo.itens.find((i) => i.id === itemId);
    if (item) item.label = nome;
  }

  removerItem(grupoId: string, itemId: string): void {
    const grupo = this._grupos.find((g) => g.id === grupoId);
    if (!grupo) return;
    grupo.itens = grupo.itens.filter((i) => i.id !== itemId);
    // RI-2: remove o item de qualquer seleção em vínculos dos momentos.
    for (const m of this._momentos) {
      for (const v of m.vinculos) {
        if (v.grupoId === grupoId) v.itemIds = v.itemIds.filter((id) => id !== itemId);
      }
    }
  }

  // ── Momentos do Jogo ───────────────────────────────────────────────────────

  criarMomento(label: string, tipo: Momento['tipo'] = 'ofensivo', desc = ''): Momento {
    const nome = label.trim();
    if (!nome) throw new Error('O nome do momento é obrigatório.');
    if (this._momentos.some((m) => m.label.trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error('Já existe um momento com esse nome.');
    }
    const momento: Momento = { id: crypto.randomUUID(), label: nome, desc, tipo, vinculos: [] };
    this._momentos.push(momento);
    return momento;
  }

  renomearMomento(momentoId: string, label: string, desc?: string): void {
    const nome = label.trim();
    if (!nome) throw new Error('O nome do momento é obrigatório.');
    if (this._momentos.some((m) => m.id !== momentoId && m.label.trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error('Já existe um momento com esse nome.');
    }
    const momento = this._momentos.find((m) => m.id === momentoId);
    if (momento) {
      momento.label = nome;
      if (desc !== undefined) momento.desc = desc.trim();
    }
  }

  removerMomento(momentoId: string): void {
    this._momentos.splice(
      this._momentos.findIndex((m) => m.id === momentoId),
      this._momentos.some((m) => m.id === momentoId) ? 1 : 0,
    );
  }

  // ── Vínculos Momento ↔ Princípio ───────────────────────────────────────────

  vincularPrincipio(momentoId: string, grupoId: string): void {
    const momento = this._momentos.find((m) => m.id === momentoId);
    if (!momento) return;
    if (!this._grupos.some((g) => g.id === grupoId)) return;
    if (momento.vinculos.some((v) => v.grupoId === grupoId)) return;
    momento.vinculos.push({ grupoId, itemIds: [] });
  }

  desvincularPrincipio(momentoId: string, grupoId: string): void {
    const momento = this._momentos.find((m) => m.id === momentoId);
    if (!momento) return;
    momento.vinculos = momento.vinculos.filter((v) => v.grupoId !== grupoId);
  }

  toggleItemVinculo(momentoId: string, grupoId: string, itemId: string): void {
    const momento = this._momentos.find((m) => m.id === momentoId);
    const vinculo = momento?.vinculos.find((v) => v.grupoId === grupoId);
    if (!vinculo) return;
    const idx = vinculo.itemIds.indexOf(itemId);
    if (idx >= 0) vinculo.itemIds.splice(idx, 1);
    else vinculo.itemIds.push(itemId);
  }

  /**
   * Substitui de uma vez todos os vínculos de um momento (usado ao salvar o
   * formulário). Descarta vínculos a grupos inexistentes e itens que não pertencem
   * mais ao grupo, evitando referências órfãs.
   */
  definirVinculos(momentoId: string, vinculos: VinculoMomentoPrincipio[]): void {
    const momento = this._momentos.find((m) => m.id === momentoId);
    if (!momento) return;
    momento.vinculos = vinculos
      .map((v) => {
        const grupo = this._grupos.find((g) => g.id === v.grupoId);
        if (!grupo) return null;
        const validos = new Set(grupo.itens.map((i) => i.id));
        return { grupoId: v.grupoId, itemIds: v.itemIds.filter((id) => validos.has(id)) };
      })
      .filter((v): v is VinculoMomentoPrincipio => v !== null);
  }
}

// ── Seed (espelha as constantes fixas anteriores de training.component.ts) ─────

function seedMomentos(): Momento[] {
  return [
    { id: 'org_ofensiva', label: 'Org. Ofensiva', desc: 'Equipe com a posse, construindo jogadas', tipo: 'ofensivo', vinculos: [] },
    { id: 'org_defensiva', label: 'Org. Defensiva', desc: 'Equipe sem a posse, organizada para defender', tipo: 'defensivo', vinculos: [] },
    { id: 'trans_ofensiva', label: 'Trans. Ofensiva', desc: 'Momento da recuperação da posse de bola', tipo: 'ofensivo', vinculos: [] },
    { id: 'trans_defensiva', label: 'Trans. Defensiva', desc: 'Momento da perda da posse de bola', tipo: 'defensivo', vinculos: [] },
  ];
}

function seedGrupos(): PrincipioGrupo[] {
  return [
    {
      id: 'principios_defensivos',
      titulo: 'Princípios Táticos Defensivos',
      filtro: 'defensivo',
      itens: [
        { id: 'contencao', label: 'Contenção' },
        { id: 'cobertura_defensiva', label: 'Cobertura Defensiva' },
        { id: 'unidade_defensiva', label: 'Unidade Defensiva' },
        { id: 'concentracao', label: 'Concentração' },
        { id: 'equilibrio', label: 'Equilíbrio' },
      ],
    },
    {
      id: 'principios_ofensivos',
      titulo: 'Princípios Táticos Ofensivos',
      filtro: 'ofensivo',
      itens: [
        { id: 'espaco_sem_bola', label: 'Espaço sem Bola' },
        { id: 'espaco_com_bola', label: 'Espaço com Bola' },
        { id: 'cobertura_ofensiva', label: 'Cobertura Ofensiva' },
        { id: 'unidade_ofensiva', label: 'Unidade Ofensiva' },
        { id: 'penetracao', label: 'Penetração' },
        { id: 'mobilidade', label: 'Mobilidade' },
      ],
    },
    {
      id: 'fundamentos_tecnicos',
      titulo: 'Fundamentos Técnicos',
      filtro: 'sempre',
      itens: [
        { id: 'controle_chao', label: 'Controle de Bola no Chão' },
        { id: 'controle_alto', label: 'Controle de Bola no Alto' },
        { id: 'drible', label: 'Drible' },
        { id: 'passe', label: 'Passe' },
        { id: 'dominio', label: 'Domínio' },
        { id: 'finalizacao', label: 'Finalização' },
        { id: 'cabeceio', label: 'Cabeceio' },
      ],
    },
  ];
}
