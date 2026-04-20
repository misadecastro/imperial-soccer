# Implementation Plan: Listagem e CRUD de Treinos com Filtro de Fundamentos

**Branch**: `010-training-crud-list` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-training-crud-list/spec.md`

## Summary

Reestruturar a tela de Treino (`training.html`) de um fluxo de "formulário direto" para um padrão "lista + formulário CRUD" (similar a `games.html`). A lista exibe treinos ordenados por data com categoria, presentes e princípios/fundamentos. O formulário de criação/edição inclui filtro inteligente: momentos ofensivos mostram princípios ofensivos, defensivos mostram defensivos, técnicos sempre visíveis. Ao desmarcar um momento, princípios do grupo correspondente são auto-desmarcados. Suporte completo a criar, editar e excluir treinos.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
**Primary Dependencies**: Tailwind CSS v3 via CDN
**Storage**: `sessionStorage` com chave `"imperialState"` — reutiliza `chamadas[]` existente sem alteração de esquema
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667); fluxo professor validado antes de fechar feature
**Target Platform**: Mobile browser (primary); desktop browser (secondary)
**Project Type**: web-app — frontend-only (mock/protótipo; backend planejado em fase futura)
**Performance Goals**: Lista carrega instantaneamente; filtro de princípios reage em < 50ms
**Constraints**: Zero build step; offline-capable (sessionStorage); compatível com iPhone SE (375 px)
**Scale/Scope**: ~40 treinos histórico; ~20 alunos por categoria; 18 chips de princípios; 4 cards de momentos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | PASS | SessãoDeTreino é entidade central do domínio. CRUD e filtro por momento são funcionalidades de negócio diretas. |
| O professor consegue operar o fluxo sem suporte técnico? | PASS | Padrão lista+formulário já validado em `games.html`. Filtro automático simplifica preenchimento. |
| Os dados do aluno permanecem consistentes? | PASS | Dados do aluno não são alterados. Treinos referenciam alunos por ID. |
| A API segue envelope padrão e está documentada? | EXCEÇÃO | Sem API nesta fase — prototipagem frontend. Ver Complexity Tracking. |
| O acesso ao MongoDB usa driver oficial sem abstrações? | EXCEÇÃO | Sem MongoDB nesta fase — sessionStorage como substituto temporário. Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam. 2 exceções documentadas — fase de prototipagem frontend.

## Project Structure

### Documentation (this feature)

```text
specs/010-training-crud-list/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/frontend/
├── index.html                    # Sem alteração
├── css/
│   └── imperial.css              # Sem alteração
└── pages/
    ├── students.html             # Sem alteração
    ├── student-eval.html         # Sem alteração
    ├── training.html             # REESTRUTURADA: lista + formulário CRUD + filtro
    ├── games.html                # Sem alteração
    └── login.html                # Sem alteração
```

**Structure Decision**: Alteração confinada a `training.html`. Reestruturação significativa do HTML e JS, mas zero arquivos novos.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Sem backend .NET (viola Princípio IV) | MVP de validação do fluxo professor. | Backend aumentaria tempo de entrega. |
| Sem MongoDB (viola Princípio V) | sessionStorage cobre requisitos da fase mock. | Banco exigiria Docker e setup. |

## Phase 0: Research

> **Status**: Completo — ver [research.md](research.md)

### Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Fluxo de navegação | Lista → Formulário (show/hide, padrão `games.html`) | Formulário direto (feature 009) — não suporta CRUD |
| Modelo de dados | Reutilizar `state.chamadas` sem alteração | Entidade separada `Treino` — duplicaria dados |
| Classificação momentos | Constante `MOMENTOS_TIPO` com mapa `id → 'ofensivo'/'defensivo'` | Inferir do nome — frágil |
| Filtro princípios | Derivar visibilidade dos grupos a partir dos momentos selecionados | Todos sempre visíveis — viola spec |
| Auto-desmarcação | Remover IDs de grupos ocultos ao desmarcar momento | Manter seleções ocultas — confuso |
| Categoria no formulário | `<select>` dropdown (não abas) | Abas — não encaixa no fluxo CRUD |

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Sem alteração de esquema**. A entidade Chamada já possui todos os campos necessários (`data`, `categoria`, `registros`, `momentos`, `principiosFundamentos`).

**Nova constante**: `MOMENTOS_TIPO` — mapa de classificação dos momentos (ofensivo/defensivo).

**Nova lógica**: Filtro de visibilidade de grupos de princípios baseado nos momentos selecionados.

### Contracts

Não aplicável — projeto frontend puro.

### Funções Públicas (novas e modificadas)

| Função | Descrição |
|---|---|
| `renderListaTreinos()` | Lista de treinos ordenada por data DESC |
| `renderFormTreino(chamada?)` | Formulário de criação/edição |
| `deleteTreino(id)` | Remove treino e persiste |
| `getGruposVisiveis()` | Retorna tipos visíveis baseado nos momentos |
| `renderPrincipios()` | **Mod**: filtra grupos + auto-desmarca |
| `renderMomentos()` | **Mod**: chama renderPrincipios após toggle |
| `salvarTreino()` | Coleta, valida, salva e volta para lista |

### UI Flow

```
LISTA DE TREINOS (tela principal)
  ├─→ [Novo Treino] → FORMULÁRIO (modo criação)
  │     ├─→ Data + Categoria → Carregar alunos da categoria
  │     ├─→ Chamada (accordion, opcional)
  │     ├─→ Especificações
  │     │     ├─→ Momentos (grid 2×2, multi-select)
  │     │     └─→ Princípios/Fundamentos (filtrados por momento)
  │     ├─→ [Salvar Treino] → LISTA (treino adicionado)
  │     └─→ [Cancelar] → LISTA
  ├─→ [Editar] → FORMULÁRIO (modo edição, pré-preenchido)
  │     └─→ [Salvar Treino] → LISTA (treino atualizado)
  └─→ [Excluir] → confirm() → LISTA (treino removido)
```

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | PASS | Treinos referenciam alunos por ID. Exclusão de treino não afeta alunos. |
| Fluxo operável sem suporte técnico? | PASS | Quickstart: 22 passos. Padrão lista+formulário já familiar (games.html). |
| Simplicidade funcional? | PASS | Uma página modificada, zero arquivos novos. Filtro é lógica simples de lookup. |
| Exceções de stack documentadas? | PASS | Complexity Tracking preenchido. |

---

**Artifacts gerados nesta fase**:

| Arquivo | Status |
|---|---|
| [plan.md](plan.md) | Este arquivo |
| [research.md](research.md) | Completo |
| [data-model.md](data-model.md) | Completo |
| [quickstart.md](quickstart.md) | Completo |
| tasks.md | Pendente — executar `/speckit.tasks` |
