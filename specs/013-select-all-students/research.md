# Phase 0 — Research: Selecionar Todos os Alunos no Cadastro de Jogo

**Branch**: `013-select-all-students` | **Date**: 2026-05-03

## Unknowns / Investigations

A spec já tinha 0 marcadores `[NEEDS CLARIFICATION]`. As únicas decisões a fixar nesta fase são de implementação (UX e mecânica do checkbox tri-state) — todas locais à página `games.html`. Nenhum tópico requer agente de pesquisa externo.

---

## Decisões

### D1 — Semântica do "Selecionar todos"

- **Decision**: Operar **apenas sobre os alunos visíveis após filtros** (busca por nome + categoria), excluindo alunos já adicionados (desabilitados).
- **Rationale**:
  - FR-004 e FR-005 da spec exigem exatamente esse comportamento.
  - Caso de uso primário (US2): "selecionar todos os Sub11" — depende de respeitar o filtro.
  - Convenção dominante em listas filtráveis (Gmail, Google Sheets, GitHub).
- **Alternatives considered**:
  - "Marcar todo o cadastro independente de filtros" — viola FR-004 e surpreende o usuário ("por que apareceram alunos de outras categorias?").
  - "Marcar todos os filtrados, incluindo os já desabilitados" — viola FR-005; permitiria que o `btnConfirmarSelecao` ignorasse silenciosamente parte do que o usuário marcou.

### D2 — Tipo de controle

- **Decision**: `<input type="checkbox" id="checkSelecionarTodos">` nativo + `<label for>` clicável; estado parcial via propriedade JS `indeterminate`.
- **Rationale**:
  - Suporte nativo a tri-state (checked / unchecked / indeterminate) com 0 dependências.
  - ARIA mapping da plataforma já anuncia "checkbox marcado/desmarcado/parcialmente marcado" sem código extra.
  - Layout mínimo, idêntico aos checkboxes da própria lista (consistência visual).
- **Alternatives considered**:
  - Botões duplos "Marcar todos" / "Desmarcar todos" — exige descobrir 2 controles e não expressa estado parcial.
  - `<button aria-pressed>` — útil para toggle binário, mas não para tri-state.
  - Componente customizado `<div role="checkbox">` — adiciona ARIA manual sem ganho.

### D3 — Posicionamento

- **Decision**: Cabeçalho da lista, dentro de `#painelSeletorAlunos`, **acima** de `#listaSeletorAlunos` e **abaixo** dos filtros, separado por `border-b border-imperial-border` e padding pequeno (`py-2`).
- **Rationale**:
  - Proximidade física com a lista que controla.
  - Não compete visualmente com o botão verde "Adicionar Selecionados" (final do painel) — a função "selecionar" é claramente distinta de "confirmar".
- **Alternatives considered**:
  - Topo absoluto do painel (acima dos filtros) — afasta o controle dos itens; usuário aplica filtro e o estado parece desconectado.
  - Próximo ao botão "Adicionar Selecionados" — confunde "selecionar" com "confirmar".

### D4 — Definição da propriedade `indeterminate`

- **Decision**: Setar imperativamente em JS: `el.indeterminate = true` ou `false`. Não usar atributo HTML (não existe).
- **Rationale**: HTML não tem atributo `indeterminate`; é apenas propriedade IDL do `HTMLInputElement`.
- **Alternatives considered**: Nenhuma viável — é a única forma definida na especificação HTML.

### D5 — Quando recalcular o tri-state

- **Decision**: Função pura `syncSelecionarTodosState()` chamada em três pontos:
  1. Final de `renderSeletorAlunos()` (cobre abertura do painel e mudança de filtros).
  2. Listener `change` em qualquer `input.aluno-check` (delegação de evento via `#listaSeletorAlunos`).
  3. Final de `onSelecionarTodosChange()` para garantir consistência mesmo após o próprio toggle.
- **Rationale**: Pontos de mudança são bem definidos e poucos; não há benefício em observação reativa.
- **Alternatives considered**:
  - `MutationObserver` em `#listaSeletorAlunos` — overengineering para 3 hooks claros.
  - Recalcular a cada `mousemove` / `input` global — desperdício de CPU.

### D6 — Comportamento do clique sobre estado indeterminado

- **Decision**: Clique sobre indeterminado → `checked = true` (selecionar todos os elegíveis visíveis). É o comportamento padrão dos navegadores quando o `indeterminate` é programaticamente verdadeiro: o `change` event vem com `el.checked = true`. Confirmamos isso no listener.
- **Rationale**: Convenção do GitHub, Gmail, Google Sheets — primeiro clique sobre parcial = "selecionar tudo".
- **Alternatives considered**:
  - Primeiro clique sobre parcial = "limpar seleção" — minoritário e contraintuitivo (usuário marcou alguns, não quer perdê-los).

### D7 — Listas vazias e estados degenerados

- **Decision**:
  - `state.alunos.length === 0` → ambos `#checkSelecionarTodos` e `#btnConfirmarSelecao` ficam **escondidos** (mantém o ramo "Nenhum aluno cadastrado" minimalista).
  - Filtro retorna 0 visíveis → `#checkSelecionarTodos` fica **desabilitado**, `#btnConfirmarSelecao` permanece visível mas sem efeito (já é o comportamento atual).
  - Todos os visíveis já são participantes (todos desabilitados) → `#checkSelecionarTodos` fica **desabilitado**.
- **Rationale**:
  - Cadastro vazio é um estado de "primeiro uso"; UI minimalista é mais convidativa.
  - Filtro vazio é transitório; manter o controle visível (desabilitado) sinaliza que "ele existe quando houver itens".
- **Alternatives considered**:
  - Esconder em todos os casos vazios — causa salto de layout quando o filtro muda.

### D8 — Acessibilidade

- **Decision**:
  - `<label for="checkSelecionarTodos">Selecionar todos</label>` (nome acessível claro).
  - `aria-controls="listaSeletorAlunos"` no input para indicar relação com a lista.
  - Sem `aria-checked` manual: o UA já anuncia o estado tri-state corretamente para `<input type=checkbox>` com `indeterminate`.
- **Rationale**: Solução nativa é correta e acessível por padrão; ARIA manual só adicionaria risco de divergência.
- **Alternatives considered**: `role="checkbox"` em `<div>` customizado — desnecessário.

### D9 — Edição de jogo existente

- **Decision**: Nenhuma lógica especial. Ao editar, `participacoesAtual` é populado com os participantes existentes (já é o comportamento atual de `renderFormJogo`); a regra "Selecionar todos ignora desabilitados" já cobre este caso porque cada participante existente vira um item desabilitado na lista.
- **Rationale**: Reuso direto da lógica existente de `idsJaAdicionados`.
- **Alternatives considered**: Tratamento separado para "modo edição" — desnecessário; aumentaria a superfície de teste.

### D10 — Estilo visual

- **Decision**: Mesmo estilo Tailwind dos checkboxes da lista (`w-4 h-4 rounded`); label em `text-sm font-medium text-imperial-text`; container do cabeçalho com `flex items-center gap-3 px-3 py-2 border-b border-imperial-border`.
- **Rationale**: Consistência total com itens da lista; o usuário reconhece "é a mesma coisa, em escala 'todos'".
- **Alternatives considered**:
  - Estilo destacado (verde imperial) — chama atenção desproporcional para um controle de produtividade.
  - Outro tamanho — quebra ritmo visual.

### D11 — Performance

- **Decision**: `syncSelecionarTodosState()` faz `querySelectorAll('.aluno-check:not(:disabled)')` no `#listaSeletorAlunos` (escopo restrito). Para 200 alunos visíveis, o custo é trivial (< 5ms em hardware mobile médio).
- **Rationale**: Atende meta de Technical Context (< 30ms para recálculo).
- **Alternatives considered**:
  - Cache de NodeList — pequeno ganho que não compensa o risco de sincronização com re-renders.

---

## Notas de implementação consolidadas

1. Adicionar dentro de `#painelSeletorAlunos`, entre os filtros e a `#listaSeletorAlunos`:

   ```html
   <div class="flex items-center gap-3 px-3 py-2 border-b border-imperial-border" id="cabecalhoSelecionarTodos">
     <input type="checkbox" id="checkSelecionarTodos" class="w-4 h-4 rounded" aria-controls="listaSeletorAlunos">
     <label for="checkSelecionarTodos" class="text-sm font-medium text-imperial-text cursor-pointer select-none">Selecionar todos</label>
   </div>
   ```

2. Ramo `state.alunos.length === 0` em `renderSeletorAlunos()` deve esconder também `#cabecalhoSelecionarTodos`.

3. Função `syncSelecionarTodosState()` percorre `document.querySelectorAll('#listaSeletorAlunos .aluno-check:not(:disabled)')`, conta `checked`, e seta:
   - `count === 0 && total > 0` → `checked = false; indeterminate = false; disabled = false`
   - `count === total && total > 0` → `checked = true;  indeterminate = false; disabled = false`
   - `count > 0 && count < total`  → `checked = false; indeterminate = true;  disabled = false`
   - `total === 0`                  → `checked = false; indeterminate = false; disabled = true`

4. Listener `change` em `#checkSelecionarTodos` itera `document.querySelectorAll('#listaSeletorAlunos .aluno-check:not(:disabled)')` e seta cada `c.checked = e.target.checked`. Em seguida chama `syncSelecionarTodosState()` para garantir consistência.

5. Listener delegado em `#listaSeletorAlunos` para `change` em `.aluno-check` chama `syncSelecionarTodosState()`.

6. Reset visual ao reabrir o painel: já é coberto pelo `renderSeletorAlunos()` que recria a lista; o `<input>` em si **não é recriado** (é estático no markup), portanto é importante que `syncSelecionarTodosState()` faça o reset explicitamente em vez de assumir um estado inicial.
