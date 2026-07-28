# Implementation Plan: Selecionar Todos os Alunos no Cadastro de Jogo

**Branch**: `013-select-all-students` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-select-all-students/spec.md`

## Summary

Adiciona um controle "Selecionar todos" no painel de seleção de alunos do formulário de Jogos em [src/frontend/pages/games.html](../../src/frontend/pages/games.html). O controle é um checkbox tri-estado (vazio, marcado, indeterminado) posicionado dentro do `#painelSeletorAlunos`, acima da `#listaSeletorAlunos`. Sua semântica é **operar apenas sobre os alunos visíveis após filtros de nome/categoria**, ignorando alunos já adicionados como participantes (que aparecem desabilitados na lista). O checkbox é controlado: ativá-lo marca todos os checkboxes elegíveis visíveis; desativá-lo desmarca todos os visíveis; mudanças individuais e mudanças de filtro recalculam seu estado visual (todos / nenhum / parcial). A confirmação ("Adicionar Selecionados") permanece inalterada e continua a deduplicar pelo conjunto `participacoesAtual`. Sem alteração de schema em `sessionStorage`/`imperialState.jogos[]`.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+); Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
**Primary Dependencies**: Tailwind CSS v3 (CDN) — nenhuma dependência nova
**Storage**: `sessionStorage` chave `imperialState` — apenas leitura de `state.alunos[]` e leitura/escrita de `state.jogos[]` (sem alteração de esquema; reaproveita tudo da feature 008)
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667) + desktop ≥ 1024px; checklist `quickstart.md` validado antes de fechar
**Target Platform**: Mobile browser (primário) e desktop browser (secundário)
**Project Type**: web-app — frontend-only (sem backend nesta fase, igual features 002–012)
**Performance Goals**: Toggle "Selecionar todos" atualiza checkboxes visíveis em < 50ms para listas até 200 alunos; recálculo de estado tri-state após filtro/check individual em < 30ms
**Constraints**: Zero build step; zero dependência nova; alteração restrita a `games.html` (markup + script `<script type="module">`); sem novas chaves em `sessionStorage`; acessibilidade preservada (label associada via `<label for>` e `aria-checked` para o tri-state nativo do HTML)
**Scale/Scope**: 1 página alterada (`games.html`); ≈4 funções JS novas/modificadas; 1 elemento HTML novo (`<input type="checkbox" id="checkSelecionarTodos">` + `<label>`); 0 entidades novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | PASS | Convocações típicas envolvem selecionar a maioria de uma categoria; reduzir o esforço de N cliques para 1 é ganho direto e medido em SC-001. Sem novas entidades, sem novo estado persistido. |
| O professor consegue operar o fluxo sem suporte técnico? | PASS | Um único checkbox com label "Selecionar todos" — padrão universal de UI. Comportamento cobre estados óbvios (todos/nenhum/parcial). Sem instrução adicional necessária (SC-003). |
| Os dados do aluno permanecem consistentes? | PASS | Mudança puramente de UX no estado transitório `participacoesAtual`. Nenhuma alteração em `state.alunos`. A deduplicação existente em `btnConfirmarSelecao` continua a proteger contra duplicatas (FR-009, SC-004). |
| A API segue envelope padrão e está documentada? | EXCEÇÃO | Sem API nesta fase — prototipagem frontend (igual features 002–012). Ver Complexity Tracking. |
| O acesso ao MongoDB usa o driver oficial sem abstrações? | EXCEÇÃO | Sem MongoDB nesta fase — `sessionStorage` como substituto temporário (igual features 002–012). Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam. 2 exceções herdadas das features 002–012 (mesma fase de prototipagem frontend).

## Project Structure

### Documentation (this feature)

```text
specs/013-select-all-students/
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
├── index.html                       # Sem alteração
├── css/
│   └── imperial.css                 # Sem alteração
└── pages/
    ├── games.html                   # Modificada — único arquivo alterado
    ├── students.html                # Sem alteração
    ├── training.html                # Sem alteração
    ├── dashboard.html               # Sem alteração
    ├── student-eval.html            # Sem alteração
    └── login.html                   # Sem alteração
```

**Structure Decision**: Alteração isolada em [src/frontend/pages/games.html](../../src/frontend/pages/games.html). Toda a feature reside no painel `#painelSeletorAlunos` já existente: adiciona-se um cabeçalho "Selecionar todos" com checkbox antes da `#listaSeletorAlunos`, e quatro pequenas funções no `<script type="module">` para gerir o tri-state. Nenhum outro arquivo é tocado.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Sem backend .NET (viola Princípio IV) | Fase de prototipagem frontend; consistência com features 002–012. | Subir backend nesta entrega de UX desproporcional ao escopo (uma melhoria de seleção). |
| Sem MongoDB (viola Princípio V) | `sessionStorage` cobre o estado transitório e o existente; nenhuma persistência nova é introduzida pela feature. | Mesmo motivo acima — não há dado novo a persistir. |

## Phase 0: Research

> **Status**: Completo — ver [research.md](research.md)

### Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Semântica do "Selecionar todos" | **Opera sobre itens visíveis após filtros** (busca + categoria), excluindo alunos já participantes (desabilitados) | "Marca tudo do banco" — fere FR-004/FR-005 e o caso de uso "convocar uma categoria"; também marcaria alunos fora do filtro corrente, surpreendendo o usuário |
| Tipo de controle | `<input type="checkbox" indeterminate>` nativo + `<label>` clicável | Botão "Marcar todos" / "Desmarcar todos" como par de botões — mais cliques e menos descoberta; sem suporte natural a estado parcial |
| Posicionamento | Cabeçalho da `#listaSeletorAlunos`, dentro do `#painelSeletorAlunos`, acima dos itens, separado por `border-b` | Junto ao botão "Adicionar Selecionados" — confunde a função (selecionar ≠ confirmar) e perde proximidade dos itens |
| Como a propriedade `indeterminate` é setada | Imperativamente em JS via `el.indeterminate = true/false` (não atributo HTML) | Atributo `indeterminate` em HTML — o atributo HTML não existe; `indeterminate` é apenas propriedade JS |
| Recálculo do tri-state | Função pura `computeSelecionarTodosState()` chamada após `renderSeletorAlunos`, após cada change individual e após cada change de filtro | Listener `MutationObserver` na lista — overengineering para um caso com hooks claros |
| Reset ao reabrir o painel | Painel já chama `renderSeletorAlunos()` no toggle de abertura → o checkbox é (re)inicializado naturalmente. O HTML novo terá `checked=false` por padrão. | Não tocar — não causa problema, mas convém deixar consistente: garantir `el.checked = false; el.indeterminate = false;` no `renderSeletorAlunos()` |
| Comportamento quando todos elegíveis estão indisponíveis (todos já participantes) | Checkbox **desabilitado** (cinza) + label inalterada | Esconder o checkbox — causa salto de layout; manter desabilitado deixa pista visual de que controle existe |
| Comportamento quando filtro não retorna ninguém | Checkbox desabilitado (junto com a mensagem "Nenhum aluno encontrado") | Esconder — mesma razão acima |
| Comportamento quando `state.alunos.length === 0` | Já existe ramo que esconde o `btnConfirmarSelecao` e mostra "Nenhum aluno cadastrado". O checkbox também deve estar oculto nesse ramo (consistência). | Mostrar desabilitado — ramo já tem zero itens; manter oculto é mais limpo |
| Acessibilidade | `<label for="checkSelecionarTodos">` + `aria-controls="listaSeletorAlunos"`; estado é refletido pelo próprio `<input>` (UA ARIA mapping) | Atributo `role="checkbox"` em `<div>` customizado — não há ganho visual e adiciona complexidade ARIA |
| Edição de jogo | A nova UI é a mesma; alunos já adicionados ao jogo (carregados em `participacoesAtual` ao editar) continuam aparecendo desabilitados na lista; "Selecionar todos" os ignora corretamente sem mudança de lógica | Tratamento especial para edição — não é necessário; a regra "ignora desabilitados" já cobre o caso |

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Sem alteração de esquema.** Reutiliza `state.alunos[]` (feature 002) e `state.jogos[]` (feature 008) sem modificar nenhum campo. A feature atua puramente sobre o estado transitório de UI do painel de seleção.

**Estado transitório de UI** (vive somente enquanto o painel está aberto, em variáveis locais ao módulo já existentes):

```text
participacoesAtual: Array<{ alunoId, minutos }>   // já existente
DOM #listaSeletorAlunos input.aluno-check         // já existente
DOM #checkSelecionarTodos                         // NOVO — controle único
```

**Derivações no painel** (computadas a cada render/change):

```text
1. visiveis              = state.alunos filtrados por nome/categoria (já existe — em renderSeletorAlunos)
2. visiveisElegiveis     = visiveis menos os ids ∈ participacoesAtual
3. checksVisiveis        = NodeList de input.aluno-check (não-disabled) na DOM
4. marcadosVisiveis      = checksVisiveis.filter(c => c.checked)
5. estadoTriState        = (
     visiveisElegiveis.length === 0                              → 'disabled',
     marcadosVisiveis.length === 0                                → 'unchecked',
     marcadosVisiveis.length === visiveisElegiveis.length         → 'checked',
     else                                                          → 'indeterminate'
   )
```

### Contracts

Não aplicável — projeto frontend puro; nenhuma API exposta nesta fase. As "interfaces" são funções JS internas ao módulo de `games.html` (escopo do `<script type="module">` da página), documentadas abaixo.

### Funções (novas / modificadas)

| Função | Tipo | Entrada | Saída | Descrição |
|---|---|---|---|---|
| `renderSeletorAlunos()` | **Modificada** | — | void | Após renderizar a lista, chama `syncSelecionarTodosState()` para refletir o estado correto do checkbox. Ramo `state.alunos.length === 0` esconde o controle "Selecionar todos" junto ao `btnConfirmarSelecao`. |
| `syncSelecionarTodosState()` | **Nova** | — | void | Lê os `input.aluno-check` visíveis (não-disabled), conta marcados/total, e define `checkSelecionarTodos.checked` e `checkSelecionarTodos.indeterminate` de acordo. Define `disabled` quando não há elegíveis visíveis. |
| `onSelecionarTodosChange()` | **Nova** | — | void | Listener de `change` do checkbox `#checkSelecionarTodos`. Lê o `checked` resultante e aplica em todos os `input.aluno-check` visíveis (não-disabled). Se a propriedade ficou em `indeterminate` por interação de teclado/clique sobre estado parcial, força `checked = true` (UX padrão: clique sobre indeterminado tende a "selecionar tudo"). |
| `onAlunoCheckChange()` | **Nova** (consolidada) | — | void | Listener de `change` (delegado em `#listaSeletorAlunos`) para qualquer `input.aluno-check`. Após cada alteração, chama `syncSelecionarTodosState()`. |

### UI Flow

```text
PAINEL "ADICIONAR ALUNOS"
  ├─ Filtros (busca por nome | categoria)        ← sem alteração
  ├─ [NOVO] Cabeçalho "Selecionar todos"
  │     └─ <label><input type=checkbox id=checkSelecionarTodos> Selecionar todos</label>
  ├─ Lista de alunos (#listaSeletorAlunos)        ← itens com input.aluno-check (sem alteração)
  └─ Botão "Adicionar Selecionados"               ← sem alteração

Eventos:
  - Abertura do painel                  → renderSeletorAlunos() → syncSelecionarTodosState()
  - Input/change nos filtros            → renderSeletorAlunos() → syncSelecionarTodosState()
  - change em #checkSelecionarTodos     → onSelecionarTodosChange() → syncSelecionarTodosState()
  - change em qualquer input.aluno-check → onAlunoCheckChange() → syncSelecionarTodosState()
  - Clique em "Adicionar Selecionados"  → fluxo existente (sem alteração) → fecha painel
```

### Update do Agent Context

Executado via `update-agent-context.ps1 -AgentType claude` — sem novas tecnologias além das já listadas em features anteriores; apenas reforça uso de Tailwind via CDN + ES Modules na feature 013.

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | PASS | Nenhuma escrita em `state.alunos`; deduplicação em `btnConfirmarSelecao` preservada (FR-009, SC-004). |
| Fluxo operável sem suporte técnico? | PASS | Um único checkbox com label clara; comportamento tri-state coberto por convenção universal de UI. |
| Simplicidade funcional? | PASS | Quatro funções pequenas, todas locais à página `games.html`; sem alteração de esquema; sem dependência nova. |
| Exceções de stack documentadas? | PASS | Complexity Tracking preenchido (2 exceções herdadas; nenhuma exceção nova). |

---

**Artifacts gerados nesta fase**:

| Arquivo | Status |
|---|---|
| [plan.md](plan.md) | Este arquivo |
| [research.md](research.md) | Completo |
| [data-model.md](data-model.md) | Completo |
| [quickstart.md](quickstart.md) | Completo |
| tasks.md | Pendente — executar `/speckit.tasks` |
