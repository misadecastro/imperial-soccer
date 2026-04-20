# Implementation Plan: Especificações do Treino

**Branch**: `009-training-drill-specs` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-training-drill-specs/spec.md`

## Summary

Estender a tela de Treino (`training.html`) com duas melhorias: (1) reorganizar a chamada de presença existente dentro de um painel recolhível (accordion) e (2) adicionar uma nova seção de "Especificações do Treino" abaixo, onde o professor seleciona momentos do jogo (grid 2×2) e princípios/fundamentos trabalhados (chips/tags em 3 grupos). O botão "Salvar Presença" é substituído por "Salvar Treino" que persiste tudo em uma operação. Dados salvos em `sessionStorage` estendendo o objeto `Chamada` existente com campos `momentos` e `principiosFundamentos`.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
**Primary Dependencies**: Tailwind CSS v3 via CDN; Chart.js não é necessário nesta página
**Storage**: `sessionStorage` com chave `"imperialState"` — estrutura de `chamadas[]` estendida com campos `momentos` e `principiosFundamentos`
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667); fluxo professor validado antes de fechar feature
**Target Platform**: Mobile browser (primary); desktop browser (secondary)
**Project Type**: web-app — frontend-only (mock/protótipo; backend planejado em fase futura)
**Performance Goals**: Toggle de accordion instantâneo; seleção de chips em < 50ms
**Constraints**: Zero build step; offline-capable (sessionStorage); compatível com iPhone SE (375 px)
**Scale/Scope**: 18 chips de princípios/fundamentos; 4 cards de momentos; ~7 alunos por categoria na chamada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | PASS | SessãoDeTreino é entidade central do domínio definida na constituição. Registrar momentos e princípios/fundamentos por treino é funcionalidade de negócio direta. |
| O professor consegue operar o fluxo sem suporte técnico? | PASS | Fluxo visual: tocar em cards e chips. Accordion para recolher chamada. Um botão "Salvar Treino". Máximo 2 interações por operação (SC-005). |
| Os dados do aluno permanecem consistentes? | PASS | Dados do aluno não são alterados. Especificações são vinculadas à chamada (data+categoria), não ao aluno diretamente. |
| A API segue envelope padrão e está documentada? | EXCEÇÃO | Sem API nesta fase — prototipagem frontend. Ver Complexity Tracking. |
| O acesso ao MongoDB usa driver oficial sem abstrações? | EXCEÇÃO | Sem MongoDB nesta fase — sessionStorage como substituto temporário. Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam plenamente. 2 exceções documentadas — fase de prototipagem frontend explicitamente declarada na spec.md (Assumptions).

## Project Structure

### Documentation (this feature)

```text
specs/009-training-drill-specs/
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
├── index.html                    # Sem alteração
├── css/
│   └── imperial.css              # Sem alteração
└── pages/
    ├── students.html             # Sem alteração
    ├── student-eval.html         # Sem alteração
    ├── training.html             # MODIFICADA: accordion + especificações
    ├── games.html                # Sem alteração
    └── login.html                # Sem alteração
```

**Structure Decision**: Alteração confinada a um único arquivo (`training.html`). Nenhum arquivo novo, nenhum módulo externo. JS inline no `<script type="module">` existente.

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
| Modelo de dados | Estender `Chamada` com `momentos[]` e `principiosFundamentos[]` | Entidade separada `SessaoDeTreino` — complexidade desnecessária |
| Layout momentos | Grid 2×2 com cards (conforme protótipo) | Lista vertical; tabs |
| Layout princípios | Chips/tags com wrap, 3 grupos (conforme protótipo) | Checkboxes em lista; accordion por grupo |
| Seleção | Multi-select toggle para ambos | Single-select para momentos |
| Accordion da chamada | Toggle manual com `classList.toggle('hidden')` + chevron | `<details>/<summary>` — difícil de estilizar |
| Botão salvar | "Salvar Treino" único (substitui "Salvar Presença") | Dois botões separados |
| Persistência | Campos adicionados ao objeto Chamada existente | Array separado `state.treinos` |

Nenhum NEEDS CLARIFICATION — todos os padrões derivam do protótipo e do código existente.

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Entidade estendida** (`Chamada` em `state.chamadas`):

| Campo Novo | Tipo | Descrição |
|---|---|---|
| `momentos` | string[] | IDs dos momentos do jogo selecionados (ex.: `["org_ofensiva", "trans_defensiva"]`) |
| `principiosFundamentos` | string[] | IDs dos princípios/fundamentos selecionados (ex.: `["contencao", "passe"]`) |

**Constantes fixas** (18 itens):
- 4 momentos do jogo (grid 2×2)
- 5 princípios táticos defensivos (chips)
- 6 princípios táticos ofensivos (chips)
- 7 fundamentos técnicos (chips)

### Contracts

Não aplicável — projeto frontend puro sem API exposta nesta fase.

### Funções Públicas (novas e modificadas)

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `toggleChamada()` | — | void | Expande/recolhe seção de chamada |
| `renderMomentos()` | — | void | Renderiza grid 2×2 de momentos com estado de seleção |
| `renderPrincipios()` | — | void | Renderiza chips com estado de seleção e contador |
| `renderEspecificacoes()` | — | void | Orquestra renderMomentos + renderPrincipios |
| `salvarChamada(chamada)` | Chamada | void | **Estendida**: salva também momentos e principiosFundamentos |
| `getOrCreateChamada(data, cat)` | string, string | Chamada | **Estendida**: inicializa campos novos se ausentes |

### UI Flow

```
TELA DE TREINO
  ├─→ [Data + Categoria] ──→ Carrega chamada existente ou cria nova
  │
  ├─→ [CHAMADA] (accordion)
  │     ├─→ Header clicável "Chamada" + chevron + resumo (presentes/faltas)
  │     └─→ Conteúdo expandível: lista de alunos + Todos Presentes/Ausentes
  │
  ├─→ [ESPECIFICAÇÕES DO TREINO]
  │     ├─→ Momento do Jogo (grid 2×2, multi-select)
  │     └─→ Princípios e Fundamentos (3 grupos de chips, multi-select + contador)
  │
  └─→ [Salvar Treino] ──→ Persiste chamada + especificações → Toast sucesso
```

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | PASS | Dados do aluno não são alterados. Especificações vinculadas à Chamada, não ao Aluno. |
| Fluxo operável sem suporte técnico? | PASS | Testado no quickstart: 18 passos cobre criação completa. Toques em cards/chips são intuitivos. |
| Simplicidade funcional? | PASS | Uma página modificada, zero arquivos novos. Accordion e chips/tags são padrões simples. |
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
