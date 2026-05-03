# Phase 1 — Data Model: Selecionar Todos os Alunos no Cadastro de Jogo

**Branch**: `013-select-all-students` | **Date**: 2026-05-03

## Resumo

Esta feature **não introduz nem modifica entidades persistidas**. Ela atua exclusivamente sobre o estado transitório de UI do painel de seleção de alunos do formulário de Jogos. O estado em `sessionStorage` (chave `imperialState`) e os esquemas de `Aluno`, `Participação` e `Jogo` permanecem como definidos em features anteriores (002, 008).

## Entidades existentes (referência — sem alteração)

### Aluno (feature 002, 003)

```text
{
  id: string (uuid),
  nome: string,
  categoria: 'Sub09' | 'Sub10' | 'Sub11' | 'Sub12' | 'Sub13' | 'Sub14',
  // demais campos da feature 002
}
```

### Jogo (feature 008)

```text
{
  id: string (uuid),
  data: string (YYYY-MM-DD),
  nome: string,
  participacoes: Array<{ alunoId: string, minutos: number }>
}
```

### Participação (embutida em Jogo)

```text
{ alunoId: string, minutos: number }
```

## Estado transitório de UI (escopo: `<script type="module">` de `games.html`)

### Já existente (sem alteração)

| Variável / DOM | Tipo | Origem | Descrição |
|---|---|---|---|
| `participacoesAtual` | `Array<{ alunoId, minutos }>` | módulo | Conjunto de alunos selecionados/em-edição antes da gravação do jogo |
| `jogoEditando` | `Jogo \| null` | módulo | Jogo em edição (ou `null` para novo) |
| `#listaSeletorAlunos input.aluno-check` | `HTMLInputElement[]` | DOM (re-renderizado a cada filtro) | Checkboxes individuais por aluno visível |
| `#filtroNomeSeletor` | `HTMLInputElement` | DOM (estático) | Filtro de busca por nome |
| `#filtroCategoriaSeletor` | `HTMLSelectElement` | DOM (estático) | Filtro de categoria |
| `#btnConfirmarSelecao` | `HTMLButtonElement` | DOM (estático) | Botão "Adicionar Selecionados" |

### Novo (introduzido por esta feature)

| Elemento / Função | Tipo | Descrição |
|---|---|---|
| `#cabecalhoSelecionarTodos` | `HTMLDivElement` | Container do controle "Selecionar todos" |
| `#checkSelecionarTodos` | `HTMLInputElement` (checkbox) | Controle único; expressa estado tri-state via `checked` + `indeterminate` |
| `<label for="checkSelecionarTodos">` | `HTMLLabelElement` | Texto "Selecionar todos" |

## Estado tri-state — função de cálculo

```text
syncSelecionarTodosState():
  elegiveis = querySelectorAll('#listaSeletorAlunos .aluno-check:not(:disabled)')
  total     = elegiveis.length
  marcados  = elegiveis.filter(c => c.checked).length

  if total === 0:
    checkSelecionarTodos.checked       = false
    checkSelecionarTodos.indeterminate = false
    checkSelecionarTodos.disabled      = true
  else if marcados === 0:
    checkSelecionarTodos.checked       = false
    checkSelecionarTodos.indeterminate = false
    checkSelecionarTodos.disabled      = false
  else if marcados === total:
    checkSelecionarTodos.checked       = true
    checkSelecionarTodos.indeterminate = false
    checkSelecionarTodos.disabled      = false
  else:
    checkSelecionarTodos.checked       = false
    checkSelecionarTodos.indeterminate = true
    checkSelecionarTodos.disabled      = false
```

## Pontos de modificação no estado transitório

| Trigger | Função | Efeito |
|---|---|---|
| Abertura do painel | `btnAdicionarAlunos click` → `renderSeletorAlunos()` → `syncSelecionarTodosState()` | Reflete estado inicial (geralmente "unchecked" para novo jogo; pode ser "disabled" em edição com todos já participantes) |
| Filtro nome/categoria muda | `renderSeletorAlunos()` → `syncSelecionarTodosState()` | Recalcula com base nos novos visíveis |
| Click em `.aluno-check` individual | listener delegado em `#listaSeletorAlunos` → `syncSelecionarTodosState()` | Atualiza tri-state após cada toggle |
| Click em `#checkSelecionarTodos` | `onSelecionarTodosChange()` → set `c.checked` em todos os visíveis elegíveis → `syncSelecionarTodosState()` | Aplica em massa e refixa estado |
| Confirmar seleção (`#btnConfirmarSelecao`) | Fluxo existente (sem alteração) | Painel é fechado; estado transitório dos checkboxes é descartado |

## Invariantes

- **I1**: Em qualquer momento, `#checkSelecionarTodos` reflete corretamente um dos quatro estados: `unchecked`, `checked`, `indeterminate`, `disabled` (FR-006, FR-008).
- **I2**: Quando o usuário aciona `#checkSelecionarTodos`, somente `input.aluno-check` **não-disabled** dentro de `#listaSeletorAlunos` mudam — alunos já participantes (com checkbox `disabled`) jamais são afetados (FR-005).
- **I3**: A operação não toca `state.alunos` nem `state.jogos` em `sessionStorage`. A única mutação no estado transitório é a propriedade `.checked` dos checkboxes visíveis e dos campos `.checked`, `.indeterminate`, `.disabled` do controle único.
- **I4**: Após `#btnConfirmarSelecao`, a deduplicação existente (`Set` de `idsJa`) garante que nenhum aluno é adicionado duas vezes a `participacoesAtual`, mesmo se o usuário oscilar a seleção (FR-009, SC-004).
- **I5**: Mudanças de filtro não preservam o estado prévio dos checkboxes ocultados pelo filtro: ao re-renderizar, eles voltam a aparecer desmarcados. Isso é intencional — o "carrinho" de seleção persistente é o `participacoesAtual`, não os checkboxes; "Selecionar todos" trabalha sempre sobre o que está visível agora.

## Estados ilustrativos

```text
Cenário A — Cadastro vazio (state.alunos.length === 0):
  #cabecalhoSelecionarTodos → hidden
  #btnConfirmarSelecao      → hidden

Cenário B — Filtro retorna 0 visíveis:
  #cabecalhoSelecionarTodos → visível
  #checkSelecionarTodos     → disabled

Cenário C — Todos os 8 visíveis estão elegíveis e desmarcados:
  #checkSelecionarTodos     → unchecked, enabled

Cenário D — 3 de 8 visíveis estão marcados:
  #checkSelecionarTodos     → indeterminate, enabled

Cenário E — 8 de 8 visíveis estão marcados:
  #checkSelecionarTodos     → checked, enabled

Cenário F — 8 visíveis: 5 já participantes (disabled) + 3 elegíveis:
  total elegíveis = 3
  Se 0 marcados   → unchecked, enabled
  Se 1 ou 2       → indeterminate, enabled
  Se 3            → checked, enabled

Cenário G — 8 visíveis, todos já participantes (todos disabled):
  total elegíveis = 0
  #checkSelecionarTodos     → disabled (e checked/indeterminate forçados a false)
```
