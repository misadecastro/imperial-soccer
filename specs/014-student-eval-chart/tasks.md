# Tasks: Gráfico de Evolução do Aluno no Dashboard

**Input**: Design documents from `/specs/014-student-eval-chart/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Não solicitados na spec — verificação manual via quickstart.md.

**Organization**: Tarefas agrupadas por user story. Todas as mudanças são em um único arquivo: `src/frontend/pages/dashboard.html`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes ou sem dependência de tarefas incompletas)
- **[Story]**: A qual user story a tarefa pertence (US1, US2, US3)
- Todos os caminhos são relativos à raiz do repositório

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar o único ponto de mudança antes de qualquer implementação funcional.

- [x] T001 Declare a variável `chartEvolucaoAluno = null` ao lado de `chartMinutagem` e `chartVolumeAluno` no bloco de variáveis globais de `src/frontend/pages/dashboard.html`

**Checkpoint**: Variável declarada — nenhum comportamento muda ainda.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Adicionar `avaliacoesRecentes` ao retorno de `computeAlunoData()` — prerrequisito para todas as funções render das user stories.

**⚠️ CRITICAL**: Nenhuma tarefa de render pode começar até esta fase estar completa.

- [x] T002 Estender `computeAlunoData(aluno)` em `src/frontend/pages/dashboard.html` para computar e retornar `avaliacoesRecentes`: filtrar `state.avaliacoes` por `alunoId === aluno.id`, ordenar desc por `data`, pegar os primeiros 6, inverter para ordem ascendente

**Checkpoint**: `data.avaliacoesRecentes` disponível — implementação das user stories pode começar.

---

## Phase 3: User Story 1 - Visualizar Evolução nas Três Dimensões (Priority: P1) 🎯 MVP

**Goal**: Exibir o gráfico de linha com 3 séries (Tático, Técnico, Mental) ao selecionar um aluno no dashboard.

**Independent Test**: Abrir `dashboard.html`, selecionar um aluno com avaliações — gráfico aparece com 3 linhas coloridas e legenda. Aluno sem avaliações mostra mensagem "Nenhuma avaliação registrada".

### Implementation for User Story 1

- [x] T003 [US1] Adicionar HTML da seção de evolução em `src/frontend/pages/dashboard.html`: inserir `<section id="secaoEvolucaoAluno">` com `<canvas id="canvasEvolucaoAluno">` e placeholder `<p id="emptyEvolucaoAluno">` após a seção `#listaHistoricoJogos`, dentro de `#blocosAluno`
- [x] T004 [US1] Implementar função `renderEvolucaoAluno(data)` em `src/frontend/pages/dashboard.html`: gráfico de linha Chart.js com 3 datasets (Tático `#eab308`, Técnico `#2a7a3d`, Mental `#6366f1`), Y-axis `min:2 max:5`, `tension:0.3`, `pointRadius:5`, `pointHoverRadius:7`, labels = `data.avaliacoesRecentes.map(av => formatDate(av.data))` — seguindo exatamente o padrão de `student-eval.html` linhas 371–448
- [x] T005 [US1] Atualizar `clearAlunoView()` em `src/frontend/pages/dashboard.html` para destruir `chartEvolucaoAluno` (padrão já usado por `chartMinutagem` e `chartVolumeAluno`)
- [x] T006 [US1] Chamar `renderEvolucaoAluno(data)` em `refreshAluno()` em `src/frontend/pages/dashboard.html`, após a chamada existente a `renderHistoricoJogos(data)`

**Checkpoint**: US1 completa — gráfico renderiza ao selecionar aluno, desaparece ao trocar de aluno ou categoria.

---

## Phase 4: User Story 2 - Identificar Tendência de Evolução ou Regressão (Priority: P2)

**Goal**: Tooltip ao hover/toque exibe data + score, tornando tendências facilmente identificáveis.

**Independent Test**: Com o gráfico visível, passar o cursor sobre um ponto — tooltip aparece com o valor exato e a data da avaliação.

### Implementation for User Story 2

- [x] T007 [US2] Verificar e confirmar em `renderEvolucaoAluno()` em `src/frontend/pages/dashboard.html` que `pointHoverRadius: 7` está presente em todos os datasets e que o tooltip padrão do Chart.js exibe label (data) + value (score) — ajustar `options.plugins.tooltip` se o formato padrão não incluir a data legível

**Checkpoint**: US2 completa — hover em qualquer ponto mostra data + score sem trabalho adicional.

---

## Phase 5: User Story 3 - Integração no Dashboard Existente (Priority: P3)

**Goal**: Garantir que o gráfico de evolução coexiste com todas as seções existentes do dashboard sem regressões de layout ou comportamento.

**Independent Test**: Abrir `dashboard.html`, navegar pela aba Alunos — todas as seções pré-existentes (cabeçalho, resumo de treinos, volume, princípios, resumo de jogos, minutagem, histórico) renderizam corretamente com a nova seção ao final.

### Implementation for User Story 3

- [x] T008 [US3] Verificação manual de regressão em `src/frontend/pages/dashboard.html`: selecionar um aluno com dados completos e confirmar que cabeçalho, cards de treinos, gráfico de volume, princípios absorvidos, cards de jogos, gráfico de minutagem, histórico de jogos e nova seção de evolução aparecem todos na ordem correta, sem sobreposição ou overflow

**Checkpoint**: US3 completa — todas as 3 user stories funcionam de forma independente e integrada.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Verificação final e validação dos cenários documentados.

- [x] T009 Executar todos os 5 cenários de teste de `specs/014-student-eval-chart/quickstart.md` em `src/frontend/pages/dashboard.html`: sem avaliações, 1 avaliação, 3 avaliações, 8 avaliações (deve exibir só 6), troca de aluno

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia todas as user stories**.
- **US1 (Phase 3)**: Depende da Phase 2. T003 (HTML) e T004 (JS) podem ser escritos em paralelo por pessoas diferentes; T005 e T006 dependem de T004.
- **US2 (Phase 4)**: Depende de T004 estar completa.
- **US3 (Phase 5)**: Depende de US1, US2 completas.
- **Polish (Final)**: Depende de todas as user stories completas.

### User Story Dependencies

- **US1 (P1)**: Depende apenas da Phase 2 — bloco principal da feature.
- **US2 (P2)**: Depende de US1 (reutiliza `renderEvolucaoAluno()` já implementada).
- **US3 (P3)**: Depende de US1 + US2 — é verificação de integração.

### Within Each User Story

- T003 (HTML) pode ser feito em paralelo com T004 (JS) se houver dois contribuidores.
- T005 e T006 dependem de T003 e T004 estarem completas.

### Parallel Opportunities

```
Phase 2 completa
       │
       ├── T003 [HTML da seção]  ──┐
       │                           ├── T005, T006 (após ambos)
       └── T004 [função render]  ──┘
```

---

## Parallel Example: User Story 1

```
# T003 e T004 podem ser escritos simultaneamente:
Task T003: Adicionar HTML da seção (canvas + placeholder) em dashboard.html
Task T004: Implementar renderEvolucaoAluno() em dashboard.html

# Após ambos concluídos:
Task T005: Atualizar clearAlunoView()
Task T006: Chamar renderEvolucaoAluno() em refreshAluno()
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (T001)
2. Completar Phase 2: Foundational (T002) — **crítico**
3. Completar Phase 3: US1 (T003 → T004 → T005 → T006)
4. **PARAR E VALIDAR**: Selecionar aluno com avaliações no dashboard — gráfico aparece
5. Feature MVP entregue e demonstrável

### Incremental Delivery

1. Setup + Foundational → base pronta (T001, T002)
2. US1 → gráfico visível com 3 linhas (T003–T006) → **MVP!**
3. US2 → tooltip confirmado (T007)
4. US3 → regressão verificada (T008)
5. Polish → todos os cenários do quickstart validados (T009)

---

## Notes

- [P] indica tarefas em arquivos diferentes ou sem dependência de tarefas incompletas
- [Story] mapeia cada tarefa à user story correspondente para rastreabilidade
- Todas as mudanças estão em `src/frontend/pages/dashboard.html` — fazer commit após cada fase
- A função `renderEvolucaoAluno()` é uma réplica direta da função em `student-eval.html` (linhas 371–448); consultar esse arquivo como referência de implementação
- `formatDate()` já existe em `dashboard.html` — reutilizar para os labels do eixo X
