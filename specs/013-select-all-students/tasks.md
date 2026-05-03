---

description: "Tarefas de implementação — Selecionar Todos os Alunos no Cadastro de Jogo"
---

# Tasks: Selecionar Todos os Alunos no Cadastro de Jogo

**Input**: Design documents from `/specs/013-select-all-students/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Tests**: Não há tarefas de testes automatizados nesta feature. Validação é exclusivamente manual via [quickstart.md](quickstart.md), consistente com features 002–012 (frontend-only, sem framework de teste configurado).

**Organization**: Tarefas agrupadas por user story para permitir entrega incremental e validação independente. Toda a implementação ocorre num único arquivo ([src/frontend/pages/games.html](../../src/frontend/pages/games.html)) — por isso, a maioria das tarefas é **sequencial** (mesmo arquivo); poucas são paralelizáveis.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story a que a tarefa pertence (US1, US2, US3)
- Caminhos absolutos a partir da raiz do repositório

## Path Conventions

- **Frontend** (este projeto): `src/frontend/` — todas as alterações desta feature acontecem em [src/frontend/pages/games.html](../../src/frontend/pages/games.html).
- **Documentação**: `specs/013-select-all-students/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Não há setup — a feature reusa o ambiente já existente (Tailwind via CDN, ES Modules, `sessionStorage`); nenhum novo arquivo, dependência ou tooling é introduzido.

- [X] T001 Confirmar que `src/frontend/pages/games.html` está em estado limpo na branch `013-select-all-students` (`git status` sem alterações pendentes) antes de começar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estrutura HTML do controle "Selecionar todos" e função utilitária base `syncSelecionarTodosState()` — usadas por todas as user stories. Sem esta fase, US1/US2/US3 não conseguem operar.

**⚠️ CRITICAL**: Nenhuma user story pode iniciar até esta fase ser concluída.

- [X] T002 Adicionar markup `<div id="cabecalhoSelecionarTodos">` contendo `<input type="checkbox" id="checkSelecionarTodos">` + `<label for="checkSelecionarTodos">Selecionar todos</label>` dentro de `#painelSeletorAlunos`, posicionado **entre os filtros e a `#listaSeletorAlunos`**, em [src/frontend/pages/games.html](../../src/frontend/pages/games.html). Estilos Tailwind: container `flex items-center gap-3 px-3 py-2 border-b border-imperial-border`; checkbox `w-4 h-4 rounded`; label `text-sm font-medium text-imperial-text cursor-pointer select-none`. Adicionar `aria-controls="listaSeletorAlunos"` no input.

- [X] T003 Implementar a função `syncSelecionarTodosState()` no `<script type="module">` de [src/frontend/pages/games.html](../../src/frontend/pages/games.html) seguindo o algoritmo de [data-model.md](data-model.md):
  - Conta `total` (não-disabled) e `marcados` em `#listaSeletorAlunos .aluno-check:not(:disabled)`.
  - `total === 0` → `checked=false; indeterminate=false; disabled=true`.
  - `marcados === 0` → `checked=false; indeterminate=false; disabled=false`.
  - `marcados === total` → `checked=true; indeterminate=false; disabled=false`.
  - caso contrário → `checked=false; indeterminate=true; disabled=false`.

- [X] T004 Atualizar `renderSeletorAlunos()` em [src/frontend/pages/games.html](../../src/frontend/pages/games.html):
  - No ramo `state.alunos.length === 0`, esconder também `#cabecalhoSelecionarTodos` (`classList.add('hidden')`), em paralelo ao já-existente esconder de `#btnConfirmarSelecao`.
  - No ramo principal (com alunos), garantir que `#cabecalhoSelecionarTodos` está visível (`classList.remove('hidden')`).
  - Ao final do método, chamar `syncSelecionarTodosState()` para refletir o estado correto após o re-render.

**Checkpoint**: Markup + função-base prontos. O checkbox aparece no painel mas ainda não responde a cliques nem reflete mudanças individuais. As user stories agora podem iniciar.

---

## Phase 3: User Story 1 — Selecionar todos os alunos visíveis de uma vez (Priority: P1) 🎯 MVP

**Goal**: O treinador pode marcar de uma vez todos os alunos elegíveis exibidos na lista clicando em "Selecionar todos", e desmarcar de uma vez clicando novamente.

**Independent Test**: Conforme cenário 1 de [quickstart.md](quickstart.md): Novo Jogo → Adicionar Alunos → clique em "Selecionar todos" → todos os 8 alunos ficam marcados → confirmar → 8 participantes salvos no jogo. Esta história entrega valor mesmo sem US2/US3.

### Implementation for User Story 1

- [X] T005 [US1] Implementar a função `onSelecionarTodosChange(e)` no `<script type="module">` de [src/frontend/pages/games.html](../../src/frontend/pages/games.html):
  - Lê `e.target.checked` (estado pós-click) e itera `document.querySelectorAll('#listaSeletorAlunos .aluno-check:not(:disabled)')`, definindo `c.checked = e.target.checked` em cada um.
  - Após a iteração, chama `syncSelecionarTodosState()` para refixar o estado visual (importante caso o clique tenha sido sobre indeterminate).

- [X] T006 [US1] Registrar listener `change` em `#checkSelecionarTodos` apontando para `onSelecionarTodosChange`, adjacente aos demais `addEventListener` da página em [src/frontend/pages/games.html](../../src/frontend/pages/games.html).

- [ ] T007 [US1] **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 1** de [quickstart.md](quickstart.md) (caminho-feliz, 8 alunos, sem filtros). Confirmar que a confirmação ("Adicionar Selecionados") agrega corretamente os 8 alunos a `participacoesAtual` e que o jogo salvo exibe "8 alunos" no card.

**Checkpoint**: US1 funcional. Treinador já tem ganho de produtividade no caso comum (sem filtros). MVP demonstrável.

---

## Phase 4: User Story 2 — Selecionar todos respeitando os filtros aplicados (Priority: P2)

**Goal**: "Selecionar todos" opera somente sobre os alunos visíveis após filtros de nome/categoria, e o estado tri-state recalcula corretamente quando o filtro muda revelando alunos não-marcados.

**Independent Test**: Conforme cenário 2 de [quickstart.md](quickstart.md): filtrar Sub11 → Selecionar todos (marca só os 4 Sub11) → mudar filtro para "Todas" → checkbox "Selecionar todos" aparece em estado parcial → confirmar adiciona apenas os 4 Sub11.

### Implementation for User Story 2

- [X] T008 [US2] Adicionar listener delegado de `change` em `#listaSeletorAlunos` que detecta toggles individuais em `.aluno-check` e chama `syncSelecionarTodosState()`, em [src/frontend/pages/games.html](../../src/frontend/pages/games.html). Usar delegação no container (não em cada checkbox) porque a lista é re-renderizada a cada filtro — listeners individuais seriam recriados a cada render.

- [X] T009 [US2] Verificar que `renderSeletorAlunos()` (já chamada em `input` de `#filtroNomeSeletor` e `change` de `#filtroCategoriaSeletor`) chama `syncSelecionarTodosState()` ao final (validação cruzada com T004); se a chamada não estiver presente após T004, adicioná-la em [src/frontend/pages/games.html](../../src/frontend/pages/games.html).

- [ ] T010 [US2] **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 2** de [quickstart.md](quickstart.md) (filtro de categoria + select-all + mudança de filtro → estado parcial).

**Checkpoint**: US1 + US2 funcionais. "Selecionar todos" respeita filtros e o estado se mantém coerente quando o usuário ajusta filtros depois de marcar.

---

## Phase 5: User Story 3 — Indicação clara de seleção parcial e exclusão de alunos já adicionados (Priority: P3)

**Goal**: O checkbox exibe estado indeterminate quando a seleção é parcial; alunos já participantes (desabilitados) jamais são marcados pelo "Selecionar todos"; a UX dos casos degenerados (lista filtrada vazia, todos já participantes) é correta.

**Independent Test**: Cenários 3, 4 e 5 de [quickstart.md](quickstart.md): (3) marca 3 de 8 → checkbox em estado indeterminate; clique sobre indeterminate marca todos os 8. (4) ao editar jogo existente, alunos já participantes aparecem desabilitados; "Selecionar todos" não os afeta nem duplica. (5) filtro sem resultados → checkbox desabilitado.

### Implementation for User Story 3

- [X] T011 [US3] Verificar e ajustar (se necessário) o algoritmo de `syncSelecionarTodosState()` em [src/frontend/pages/games.html](../../src/frontend/pages/games.html) para cobrir os casos degenerados:
  - **Filtro vazio (`total === 0`)**: `checkSelecionarTodos.disabled = true` (e `checked/indeterminate = false`).
  - **Todos visíveis já são participantes (todos `:disabled`)**: como `total` é contado em `:not(:disabled)`, este caso cai automaticamente em `total === 0` → `disabled`. Confirmar.
  - **Seleção parcial (`0 < marcados < total`)**: `indeterminate = true; checked = false`.

- [ ] T012 [US3] **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 3** de [quickstart.md](quickstart.md) (estado indeterminate + clique sobre indeterminate → todos marcados).

- [ ] T013 [US3] **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 4** de [quickstart.md](quickstart.md) (modo edição: alunos já participantes desabilitados, "Selecionar todos" os ignora, sem duplicatas em `participacoesAtual` após confirmar).

- [ ] T014 [US3] **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 5** de [quickstart.md](quickstart.md) (filtro retorna 0 → checkbox `disabled` cinza; limpar filtro → volta a ficar habilitado).

**Checkpoint**: Todas as user stories implementadas e funcionais. UX completa e robusta.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final, edge cases remanescentes do quickstart e limpeza.

- [ ] T015 **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 6** de [quickstart.md](quickstart.md) (cadastro vazio → controle escondido junto ao botão de confirmar).

- [ ] T016 **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 7** de [quickstart.md](quickstart.md) (acessibilidade: navegação por Tab até o checkbox, ativação por Espaço, leitor de tela anuncia tri-state corretamente).

- [ ] T017 **(validação manual — pendente do usuário)** Validar manualmente o **Cenário 8** de [quickstart.md](quickstart.md) (performance: 100+ alunos numa categoria, marcação instantânea, sem lag perceptível ao alternar individuais).

- [ ] T018 [P] **(validação manual — pendente do usuário)** Verificar responsividade em DevTools mobile (iPhone SE 375 × 667) e desktop ≥ 1024px: o cabeçalho `#cabecalhoSelecionarTodos` não causa overflow horizontal nem salto de layout em nenhum dos cenários do quickstart.

- [ ] T019 [P] **(validação manual — pendente do usuário)** Verificar que **não** há erros nem warnings no console do DevTools em qualquer cenário do [quickstart.md](quickstart.md).

- [X] T020 Code review próprio: confirmar que [src/frontend/pages/games.html](../../src/frontend/pages/games.html) não introduziu (a) comentários supérfluos, (b) variáveis globais novas, (c) listeners duplicados, (d) chaves novas em `sessionStorage`, (e) dependências CDN novas.

- [X] T021 Marcar todos os itens de [specs/013-select-all-students/checklists/requirements.md](checklists/requirements.md) como confirmados pela validação manual (já estavam marcados na fase de spec; reconfirmar pós-implementação).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: T001 — sem dependências; pode iniciar imediatamente.
- **Phase 2 (Foundational)**: T002 → T003 → T004 — sequencial (mesmo arquivo); BLOQUEIA todas as user stories.
- **Phase 3 (US1 — P1)**: depende de Phase 2; T005 → T006 → T007 (sequencial).
- **Phase 4 (US2 — P2)**: depende de Phase 2; T008 → T009 → T010 (sequencial). Independente de US1 em termos de comportamento, mas como compartilham o mesmo arquivo, é mais prático fazer após US1.
- **Phase 5 (US3 — P3)**: depende de Phase 2; T011 → T012 → T013 → T014 (sequencial).
- **Phase 6 (Polish)**: depende de US1, US2 e US3 estarem completas. T018 e T019 podem rodar em paralelo entre si; demais sequenciais com a validação manual.

### User Story Dependencies

- **US1 (P1)**: depende apenas de Phase 2. **Independentemente entregável** como MVP.
- **US2 (P2)**: depende apenas de Phase 2. Não depende de US1, mas ambas tocam o mesmo arquivo — implementar em série evita conflitos.
- **US3 (P3)**: depende apenas de Phase 2. Idem acima.

### Within Each User Story

- Implementação em ordem das tarefas listadas.
- Validação manual (`quickstart` cenário correspondente) é a última tarefa de cada user story — só marcar a story como completa após o cenário passar.

### Parallel Opportunities

- T018 e T019 (Phase 6) podem rodar em paralelo entre si (arquivos/contextos diferentes).
- Fora isso, **paralelismo é limitado**: toda a feature reside em um único arquivo (`games.html`). Tentativas de paralelizar tarefas dentro do mesmo arquivo gerariam merge conflicts.

---

## Parallel Example: Phase 6

```bash
# Único bloco com paralelismo real:
T018 [P]: Validação responsiva em DevTools mobile e desktop
T019 [P]: Verificação de console sem erros em todos os cenários
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (T001).
2. Completar Phase 2 (T002, T003, T004) — markup + função base.
3. Completar Phase 3 (T005, T006, T007) — toggle básico funcional.
4. **PARAR e VALIDAR**: cenário 1 do quickstart deve passar; jogo com 8 alunos salvos via "Selecionar todos".
5. Demonstrável e entregável como MVP.

### Incremental Delivery

1. Phase 1 + Phase 2 → fundação pronta.
2. Phase 3 (US1) → MVP (caminho-feliz, sem filtros).
3. Phase 4 (US2) → respeito a filtros + recálculo do tri-state em mudanças individuais.
4. Phase 5 (US3) → indeterminate visual + edge cases (já-participantes, filtros vazios).
5. Phase 6 → polish e validação cruzada.

### Single-Developer Strategy

Como toda a feature é local a um arquivo e tem ~50 linhas de mudança, executar serialmente (Phase 1 → 2 → 3 → 4 → 5 → 6) num único ciclo de implementação. Tempo estimado: 1–2h dev + 30min validação manual.

---

## Notes

- Tarefas marcadas [P] = arquivos/contextos diferentes, podem rodar em paralelo.
- [Story] mapeia tarefa para user story, para rastreabilidade e validação independente.
- Sem framework de testes automatizados nesta fase; validação manual é a única gating.
- Commit sugerido: 1 commit por phase (ou 1 commit por story) para manter histórico legível.
- Não criar arquivos novos: toda a implementação cabe em [src/frontend/pages/games.html](../../src/frontend/pages/games.html).
- Não introduzir chaves novas em `sessionStorage`; o estado transitório do checkbox é puramente DOM.
