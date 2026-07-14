# Data Model: CRUD de Configuração de Itens de Treino

**Branch**: `019-training-config-crud` | **Date**: 2026-07-13

Modelo **frontend-only, em memória** (mock). Sem coleção MongoDB, sem DTOs de backend nesta fase. Interfaces TypeScript em `src/frontend/src/app/models/training-config.model.ts`.

## Entidades

### ItemTrabalhado

Item específico dentro de um grupo de Princípio/Fundamento.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | `string` | Identificador único (UUID para novos; slug fixo para os seed). Obrigatório. |
| `label` | `string` | Nome exibido. Não vazio (FR-010); único dentro do grupo (FR-011). |

### PrincipioGrupo

Grupo de Princípios/Fundamentos que contém zero ou mais itens.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | `string` | Identificador único. Obrigatório. |
| `titulo` | `string` | Nome do grupo. Não vazio (FR-010); único na lista de grupos (FR-011). |
| `filtro` | `'defensivo' \| 'ofensivo' \| 'sempre'` | Preservado dos dados atuais; opcional para novos grupos (default `'sempre'`). Não é foco do CRUD, mas mantido para compatibilidade com a montagem de treino. |
| `itens` | `ItemTrabalhado[]` | Zero ou mais itens (embedding). |

### VinculoMomentoPrincipio

Associação entre um Momento e um Princípio/Fundamento, com a seleção de itens aplicáveis.

| Campo | Tipo | Regras |
|-------|------|--------|
| `grupoId` | `string` | Referência ao `PrincipioGrupo.id`. Obrigatório; deve existir. |
| `itemIds` | `string[]` | IDs dos `ItemTrabalhado` selecionados daquele grupo. Podem ser vazios (princípio sem itens ou nenhum selecionado). |

### Momento (Momento do Jogo)

Fase do jogo trabalhada em treino, com seus vínculos.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | `string` | Identificador único. Obrigatório. |
| `label` | `string` | Nome exibido. Não vazio (FR-010); único na lista de momentos (FR-011). |
| `desc` | `string` | Descrição opcional (preservada dos dados atuais). |
| `tipo` | `'ofensivo' \| 'defensivo'` | Preservado dos dados atuais; opcional para novos (default `'ofensivo'`). Não é foco do CRUD. |
| `vinculos` | `VinculoMomentoPrincipio[]` | Zero ou mais vínculos (embedding). |

## Relacionamentos

- `PrincipioGrupo` 1—N `ItemTrabalhado` (embedding em `itens`).
- `Momento` 1—N `VinculoMomentoPrincipio` (embedding em `vinculos`).
- `VinculoMomentoPrincipio` N—1 `PrincipioGrupo` (via `grupoId`) e N—N `ItemTrabalhado` (via `itemIds`).

## Regras de integridade (aplicadas no serviço, em memória)

- **RI-1 (FR-012)**: Remover um `PrincipioGrupo` remove todos os `VinculoMomentoPrincipio` com aquele `grupoId` em todos os momentos.
- **RI-2 (FR-012)**: Remover um `ItemTrabalhado` remove seu `id` de todos os `itemIds` de vínculos que o referenciam.
- **RI-3 (FR-011)**: Nomes únicos — `titulo` entre grupos; `label` entre itens do mesmo grupo; `label` entre momentos. Comparação case-insensitive, trim aplicado.
- **RI-4 (FR-010)**: Nome não vazio (após trim) para grupo, item e momento.

## Estado inicial (seed mockado — espelha as constantes atuais)

Extraído de [training.component.ts](../../src/frontend/src/app/pages/training/training.component.ts):

**Momentos**: `Org. Ofensiva` (ofensivo), `Org. Defensiva` (defensivo), `Trans. Ofensiva` (ofensivo), `Trans. Defensiva` (defensivo) — todos iniciam com `vinculos: []`.

**Grupos de Princípios/Fundamentos**:
- **Princípios Táticos Defensivos** (`defensivo`): Contenção, Cobertura Defensiva, Unidade Defensiva, Concentração, Equilíbrio.
- **Princípios Táticos Ofensivos** (`ofensivo`): Espaço sem Bola, Espaço com Bola, Cobertura Ofensiva, Unidade Ofensiva, Penetração, Mobilidade.
- **Fundamentos Técnicos** (`sempre`): Controle de Bola no Chão, Controle de Bola no Alto, Drible, Passe, Domínio, Finalização, Cabeceio.

Os `id` seed reutilizam os slugs já existentes (ex.: `org_ofensiva`, `espaco_com_bola`, `finalizacao`) para compatibilidade com dados de treino já salvos em `chamadas[]`.
