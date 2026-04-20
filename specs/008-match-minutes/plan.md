# Implementation Plan: Minutagem de Jogos

**Branch**: `008-match-minutes` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/008-match-minutes/spec.md`

## Summary

Adicionar ao Imperial Soccer a tela de **Gestão de Jogos** (`games.html`) e um **terceiro item "Jogos"** no menu de navegação inferior. O professor cadastra partidas (data + nome), adiciona alunos selecionando da lista com filtro por nome/categoria, registra a minutagem de cada participante e salva. Também permite editar e excluir jogos existentes. Dados persistem em `sessionStorage` com a chave `"imperialState"` — extensão do estado existente com o campo `jogos: []`. Fase de prototipagem frontend sem backend.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS  
**Storage**: `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `jogos: []`  
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667); fluxo professor validado antes de fechar feature  
**Target Platform**: Mobile browser (primary); desktop browser (secondary)  
**Project Type**: web-app — frontend-only (mock/protótipo; backend planejado em fase futura)  
**Performance Goals**: Lista de jogos carrega instantaneamente; painel de seleção de alunos filtra em < 50 ms  
**Constraints**: Zero build step; offline-capable (sessionStorage); compatível com iPhone SE (375 px)  
**Scale/Scope**: ~40 jogos histórico; ~20 alunos por jogo; menu com 3 itens em 375 px

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | ✅ PASS | MinutagemJogo é entidade central do domínio definida na constituição. Registrar minutos por aluno por partida é funcionalidade de negócio direta. |
| O professor consegue operar o fluxo sem suporte técnico? | ✅ PASS | Fluxo linear: Novo Jogo → data/nome → Adicionar Alunos → minutagem → Salvar. Lista com Editar/Excluir. Máximo 2 interações por operação (SC-005). |
| Os dados do aluno permanecem consistentes? | ✅ PASS | Participações referenciam `alunoId`; dados do aluno não são duplicados. Exclusão de jogo não afeta o aluno. |
| A API segue envelope padrão e está documentada? | ⚠️ EXCEÇÃO | Sem API nesta fase — prototipagem frontend. Ver Complexity Tracking. |
| O acesso ao MongoDB usa driver oficial sem abstrações? | ⚠️ EXCEÇÃO | Sem MongoDB nesta fase — sessionStorage como substituto temporário. Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam plenamente. 2 exceções documentadas — fase de prototipagem frontend explicitamente declarada na spec.md (Assumptions).

## Project Structure

### Documentation (this feature)

```text
specs/008-match-minutes/
├── plan.md              # Este arquivo (/speckit.plan)
├── research.md          # Phase 0 (/speckit.plan)
├── data-model.md        # Phase 1 (/speckit.plan)
├── quickstart.md        # Phase 1 (/speckit.plan)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks — gerado separadamente)
```

### Source Code

```text
src/frontend/
├── index.html                    # Sem alteração (pré-autenticação)
├── css/
│   └── imperial.css              # Sem alteração (tokens já existem)
└── pages/
    ├── login.html                # Sem alteração (pré-autenticação)
    ├── students.html             # Modificado: menu 2 → 3 itens
    ├── student-eval.html         # Modificado: menu 2 → 3 itens
    ├── training.html             # Modificado: menu 2 → 3 itens
    └── games.html                # NOVA: gestão de jogos e minutagem
```

**Structure Decision**: Projeto frontend puro, mesma estrutura das features anteriores. Arquivo JS inline (`<script type="module">`) dentro de `games.html`. Nenhum módulo externo, zero build step.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Sem backend .NET (viola Princípio IV) | MVP de validação do fluxo professor antes de investir em infraestrutura. Spec declara explicitamente fase mock. | Backend completo aumentaria tempo de entrega; a validação UX é o objetivo desta fase. |
| Sem MongoDB (viola Princípio V) | sessionStorage cobre 100% dos requisitos de persistência da fase mock. | Banco de dados exigiria Docker, migrations e setup — overhead desproporcional. |

## Phase 0: Research

> **Status**: Completo — ver [research.md](research.md)

### Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Estrutura de dados | `jogos[]` no estado existente, mesma estrutura de `chamadas[]` | Objeto indexado por ID; array plano de participações |
| Menu 3 itens | `flex-1` em cada item; terceiro `<a>` no `<nav>` existente | Hambúrguer; abas no topo |
| Seleção de alunos | Painel inline expansível dentro de `games.html` | Modal overlay; página separada |
| Campo minutos | `<input type="number" min="0">`, padrão 0, sem bloqueio > 120 | Slider; validação rígida |
| Criar vs editar | Mesmo formulário, variável `jogoEditando` distingue o modo | Formulários separados |
| Ordem da lista | Data decrescente via `localeCompare` | Alfabética por nome |

Nenhum NEEDS CLARIFICATION — todos os padrões derivam do código existente (features 004–007).

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Novas entidades** (adicionadas ao estado `sessionStorage`):

| Entidade | Chave de Negócio | Campos |
|---|---|---|
| `Jogo` | `id` (UUID) | `id`, `data` (YYYY-MM-DD), `nome`, `participacoes[]` |
| `Participacao` | `alunoId` dentro de `Jogo` | `alunoId`, `minutos` (int ≥ 0, default 0) |

**Entidade existente sem alteração**: `Aluno` (`id`, `nome`, `dataNascimento`, `categoria`).

**Estado completo**:
```js
// sessionStorage["imperialState"]
{
  alunos: [...],
  avaliacoes: [...],
  chamadas: [...],
  jogos: [          // NOVO
    {
      id: "uuid",
      data: "2026-04-20",
      nome: "vs. América",
      participacoes: [
        { alunoId: "uuid", minutos: 45 }
      ]
    }
  ]
}
```

### Contracts

Não aplicável — projeto frontend puro sem API exposta nesta fase.

### Funções Públicas do Módulo `games.html`

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `findJogo(id)` | string | `Jogo \| undefined` | Busca jogo por ID no estado |
| `saveJogo(dados, id?)` | objeto, string? | void | Cria novo jogo (sem id) ou atualiza existente (com id) |
| `deleteJogo(id)` | string | void | Remove jogo do array, persiste |
| `renderLista()` | — | void | Renderiza lista de jogos ordenada por data DESC |
| `renderFormJogo(jogo?)` | `Jogo \| null` | void | Formulário de criação (null) ou edição (jogo) |
| `renderSeletorAlunos()` | — | void | Painel de seleção com busca por nome + filtro de categoria |
| `renderParticipacoes(participacoes)` | array | void | Lista de participantes com campo de minutos e botão remover |

### UI Flow

```
LISTA DE JOGOS
  ├─→ [Novo Jogo]
  │     └─→ FORMULÁRIO (modo criação)
  │           ├─→ [Adicionar Alunos] → PAINEL SELEÇÃO → [Adicionar Selecionados] → FORMULÁRIO
  │           └─→ [Salvar] → LISTA (jogo adicionado)
  ├─→ [Editar jogo]
  │     └─→ FORMULÁRIO (modo edição, pré-preenchido)
  │           └─→ [Salvar] → LISTA (jogo atualizado)
  └─→ [Excluir jogo]
        └─→ confirm() → LISTA (jogo removido)
```

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | ✅ PASS | Participações referenciam `alunoId`. Exclusão de jogo não afeta alunos. Alunos excluídos de `state.alunos` ficam como referências órfãs — tratamento: filtrar ao renderizar. |
| Fluxo operável sem suporte técnico? | ✅ PASS | Testado no quickstart: 15 passos cobre criação completa. Edição e exclusão em ≤ 2 interações. |
| Simplicidade funcional? | ✅ PASS | Uma página nova, quatro modificações pequenas (adicionar `<a>` ao nav). Nenhuma abstração extra. |
| Exceções de stack documentadas? | ✅ PASS | Complexity Tracking preenchido. |

---

**Artifacts gerados nesta fase**:

| Arquivo | Status |
|---|---|
| [plan.md](plan.md) | ✅ Este arquivo |
| [research.md](research.md) | ✅ Completo |
| [data-model.md](data-model.md) | ✅ Completo |
| [quickstart.md](quickstart.md) | ✅ Completo |
| tasks.md | ⏳ Pendente — executar `/speckit-tasks` |
