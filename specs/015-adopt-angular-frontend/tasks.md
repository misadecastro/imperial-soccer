# Tasks: Migração do Frontend para Angular

**Input**: Design documents from `/specs/015-adopt-angular-frontend/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Não solicitados na spec — validação manual via `quickstart.md` (paridade com specs 002–014).

**Organization**: Tarefas agrupadas pelas 3 user stories de `spec.md`. US1 (P1) é o MVP e está subdividida por página, em ordem que respeita dependências de dados (Aluno é base para Avaliação/Chamada/Jogo; Dashboard agrega todos).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: US1, US2 ou US3 — mapeia para `spec.md`
- Caminhos relativos à raiz do repositório

## Path Conventions

Web app com split `frontend`/`backend` (backend inalterado nesta feature). Frontend Angular vive em `src/frontend/src/app/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o projeto Angular que substituirá as páginas HTML estáticas.

- [x] T001 Criar projeto Angular (`ng new . --routing --style=css --skip-git --standalone`) dentro de `src/frontend/`, conforme `quickstart.md`
- [x] T002 [P] Configurar Tailwind CSS via build em `src/frontend/tailwind.config.js` e `src/frontend/postcss.config.js`, migrando a paleta `imperial` (cores, `fontFamily.display`) hoje duplicada nos `<script>` inline de cada página HTML
- [x] T003 [P] Adicionar diretivas `@tailwind base/components/utilities` em `src/frontend/src/styles.css`
- [x] T004 [P] Instalar Chart.js v4 como dependência npm em `src/frontend/package.json`
- [x] T005 Habilitar `strict`, `noImplicitAny` e `strictNullChecks` em `src/frontend/tsconfig.json`
- [x] T006 Criar esqueleto de rotas (sem componentes ainda) em `src/frontend/src/app/app.routes.ts` para `/`, `/login`, `/dashboard`, `/games`, `/training`, `/students`, `/student-eval`

**Checkpoint**: Projeto Angular roda com `ng serve` (página em branco), Tailwind e Chart.js disponíveis.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelos de dados e serviço de estado — usados por todas as páginas e por todos os componentes compartilhados.

**⚠️ CRITICAL**: Nenhuma página (US1) pode ser migrada até esta fase estar completa.

- [x] T007 [P] Criar interface `Aluno` em `src/frontend/src/app/models/aluno.model.ts` (campos: `id`, `nome`, `dataNascimento`, `categoria`) — conforme `data-model.md`
- [x] T008 [P] Criar interface `Avaliacao` em `src/frontend/src/app/models/avaliacao.model.ts` (campos: `id`, `alunoId`, `data`, `tatico`, `tecnico`, `mental`)
- [x] T009 [P] Criar interfaces `Chamada` e `RegistroPresenca` em `src/frontend/src/app/models/chamada.model.ts` (campos: `id`, `data`, `categoria`, `registros`, `momentos`, `principiosFundamentos`)
- [x] T010 [P] Criar interfaces `Jogo` e `Participacao` em `src/frontend/src/app/models/jogo.model.ts` (campos: `id`, `data`, `nome`, `participacoes`)
- [x] T011 Criar interface agregadora `ImperialState` em `src/frontend/src/app/models/imperial-state.model.ts` (depende de T007–T010)
- [x] T012 [P] Criar constantes `CATEGORIAS` e `CATEGORIAS_LABELS` (incluindo `Sub15F`/`Sub17F`) em `src/frontend/src/app/models/categoria.constants.ts`
- [x] T013 Implementar `StateService` (`providedIn: 'root'`) em `src/frontend/src/app/services/state.service.ts`: `load()`/`save()` para `sessionStorage` chave `imperialState`, expondo `alunos`, `avaliacoes`, `chamadas`, `jogos` tipados via `ImperialState` (depende de T011)

**Checkpoint**: `StateService` lê/escreve `sessionStorage` com os mesmos dados gravados pelas páginas HTML atuais — testável isoladamente antes de qualquer página existir.

---

## Phase 3: User Story 1 - Paridade Funcional Total para o Treinador (Priority: P1) 🎯 MVP

**Goal**: As 7 páginas funcionam em Angular com comportamento idêntico ao HTML/JS atual.

**Independent Test**: Executar os roteiros de cada spec original (002–014) na página Angular correspondente e confirmar resultado idêntico.

### Home + Login

- [x] T014 [P] [US1] Criar `HomeComponent` em `src/frontend/src/app/pages/home/home.component.ts`, replicando `src/frontend/pages/index.html` (spec 001)
- [x] T015 [P] [US1] Criar `LoginComponent` em `src/frontend/src/app/pages/login/login.component.ts`, replicando `src/frontend/pages/login.html` (spec 001)
- [x] T016 [US1] Conectar `HomeComponent` e `LoginComponent` às rotas `/` e `/login` em `app.routes.ts` (depende de T014, T015)

### Students (specs 003, 005)

- [x] T017 [US1] Criar `StudentsComponent` em `src/frontend/src/app/pages/students/students.component.ts`, replicando `students.html`: CRUD de aluno, seletor de categoria, busca, geração de mock data
- [x] T018 [US1] Validar paridade de `StudentsComponent` contra os roteiros das specs 003 e 005 (`quickstart.md`)

### Student-Eval (specs 002, 004)

- [x] T019 [US1] Criar `StudentEvalComponent` em `src/frontend/src/app/pages/student-eval/student-eval.component.ts`, replicando `student-eval.html`: seleção de categoria/aluno, formulário de nova avaliação, gráfico de evolução completo (todas as avaliações)
- [x] T020 [US1] Validar paridade de `StudentEvalComponent` contra os roteiros das specs 002 e 004

### Training (specs 007, 009, 010)

- [x] T021 [US1] Criar `TrainingComponent` em `src/frontend/src/app/pages/training/training.component.ts`, replicando `training.html`: chamada de presença, seleção de momentos e princípios/fundamentos, listagem/edição/exclusão de treinos
- [x] T022 [US1] Validar paridade de `TrainingComponent` contra os roteiros das specs 007, 009 e 010

### Games (specs 008, 013)

- [x] T023 [US1] Criar `GamesComponent` em `src/frontend/src/app/pages/games/games.component.ts`, replicando `games.html`: CRUD de jogo, seletor de participantes com filtro por nome/categoria, "selecionar todos"
- [x] T024 [US1] Validar paridade de `GamesComponent` contra os roteiros das specs 008 e 013

### Dashboard (specs 006, 007, 009, 010, 011, 012, 014) — depende dos dados produzidos pelas páginas acima

- [x] T025 [US1] Criar `DashboardComponent` (aba Treinos) em `src/frontend/src/app/pages/dashboard/dashboard.component.ts`, replicando a aba Treinos de `dashboard.html`: seletor de categoria, gráfico de volume (barra), gráfico de distribuição (doughnut) — specs 006, 011
- [x] T026 [US1] Adicionar aba Alunos ao `DashboardComponent`: cards de resumo de treinos, gráfico de volume por momento, princípios absorvidos, cards de resumo de jogos, gráfico de minutagem, histórico de jogos — spec 012 (depende de T025)
- [x] T027 [US1] Adicionar seção de evolução técnico-tática-mental (últimas 6 avaliações) ao `DashboardComponent` — spec 014 (depende de T026)
- [x] T028 [US1] Conectar `StudentsComponent`, `StudentEvalComponent`, `TrainingComponent`, `GamesComponent` e `DashboardComponent` às rotas restantes em `app.routes.ts` (depende de T017, T019, T021, T023, T025)
- [x] T029 [US1] Validar paridade completa do `DashboardComponent` contra os roteiros das specs 006, 007, 009, 010, 011, 012 e 014

**Checkpoint**: Todas as 7 páginas funcionam em Angular com paridade total — MVP entregue e demonstrável.

---

## Phase 4: User Story 2 - Componentização Reutilizável para a Equipe de Desenvolvimento (Priority: P2)

**Goal**: Padrões de UI duplicados entre páginas (hoje copiados em HTML/JS) passam a ser componentes Angular únicos e reutilizados.

**Independent Test**: Confirmar que um padrão repetido em ≥3 páginas (ex.: seletor de categoria) existe como um único componente, e que alterá-lo reflete em todas as páginas que o usam.

- [x] T030 [P] [US2] Extrair `CategorySelectorComponent` em `src/frontend/src/app/components/category-selector/category-selector.component.ts` — **escopo corrigido após inspeção real do código**: o padrão pill-button só existe dentro de `dashboard.html` (2 instâncias: seletor da aba Treinos + seletor da aba Alunos); `games`/`students`/`training` usam `<select>` dropdown para categoria, não pill-buttons, logo não se aplicam aqui
- [x] T031 [US2] Substituir os dois seletores de categoria inline em `DashboardComponent` (aba Treinos e aba Alunos) pelo `CategorySelectorComponent` (depende de T030, T025–T026)
- [x] T032 [P] [US2] Extrair `MetricCardComponent` em `src/frontend/src/app/components/metric-card/metric-card.component.ts` (cards de resumo: presenças, frequência, min em jogo, jogos disputados, etc.)
- [x] T033 [US2] Substituir os 3 grids de cards inline no `DashboardComponent` (cardsResumo, cardsTreinosAluno, cardsJogosAluno) pelo `MetricCardComponent` (depende de T032, T025–T026)
- [x] T034 [P] [US2] Extrair `EvolutionChartComponent` em `src/frontend/src/app/components/evolution-chart/evolution-chart.component.ts` (gráfico de linha de 3 séries Tático/Técnico/Mental, usado em `student-eval` e `dashboard`)
- [x] T035 [US2] Substituir a lógica de gráfico de evolução em `StudentEvalComponent` e `DashboardComponent` pelo `EvolutionChartComponent` (depende de T034, T019, T027) — removidos `Chart`, `ViewChild` e métodos de render de gráfico de ambos os componentes
- [x] T036 [P] [US2] Extrair `EmptyStateComponent` em `src/frontend/src/app/components/empty-state/empty-state.component.ts` — aplicado em: 4 overlays de canvas no `DashboardComponent` (variant="overlay") e nos 4 placeholders "Nenhum/Nenhuma X registrado(a) ainda" idênticos (`py-14`) em `StudentsComponent`, `GamesComponent`, `TrainingComponent` e `StudentEvalComponent` (variant="block")
- [x] T037 [US2] Validado cenário de propagação: alterada a classe do `CategorySelectorComponent` (`font-medium` → `font-bold uppercase`), confirmado via build que a string aparece **1 única vez** no bundle (`main.js`) cobrindo as 2 instâncias usadas em `DashboardComponent`, depois revertida — confirma fonte única, sem edição duplicada

**Checkpoint**: Pelo menos 4 padrões de UI duplicados (SC-003 da spec) agora são componentes únicos reutilizados.

---

## Phase 5: User Story 3 - Detecção de Erros em Tempo de Build (Priority: P3)

**Goal**: Erros de tipo e referências inválidas a campos são pegos no build, antes de chegar ao navegador do treinador.

**Independent Test**: Introduzir deliberadamente um erro de tipo e confirmar que `ng build`/`ng serve` falha apontando arquivo e linha.

- [x] T038 [US3] Revisado: todos os `@Input`/`@Output` das Phases 2–4 têm tipos explícitos (`Input({required:true})` nos componentes compartilhados); nenhum `any` implícito — `strict`/`noImplicitAny` (T005) mantiveram o build limpo em toda a implementação
- [x] T039 [US3] Validado cenário de falha de build: introduzido `this.todasAvaliacoes[0]?.tatic` (campo inexistente) em `student-eval.component.ts` — build falhou com `TS2551: Property 'tatic' does not exist on type 'Avaliacao'. Did you mean 'tatico'?`, apontando arquivo `student-eval.component.ts:101:36` e a declaração correta em `avaliacao.model.ts:5:2`; revertido em seguida
- [x] T040 [US3] Confirmado: `ng build` (produção) conclui sem erros de tipo para as 7 páginas migradas — build final em 655.44 kB, idêntico ao build anterior ao teste de falha (T039), confirmando que o revert foi limpo

**Checkpoint**: Build falha de forma confiável em erros de tipo; nenhuma página migrada tem erro de tipo pendente.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Finalizar a transição e documentar o novo fluxo de desenvolvimento.

- [x] T041 Removidos `src/frontend/pages/{login,dashboard,games,training,students,student-eval}.html` e `src/frontend/css/imperial.css` via `git rm -f` (recuperáveis pelo histórico do git); todas as 7 páginas já validadas com paridade pelas tarefas T018/T020/T022/T024/T029
- [x] T042 [P] Atualizado `CLAUDE.md` com seção "Frontend Angular" — comandos (`ng serve`/`ng build`), estrutura de diretórios e notas (StateService único, strict mode, Chart.js, budget)
- [x] T043 Não aplicável: as 7 páginas foram migradas e validadas dentro desta mesma sessão de implementação (T014–T029), sem intervalo de deploy parcial — o HTML legado foi removido na mesma sessão (T041), portanto a janela de coexistência sessionStorage entre versões nunca existiu em produção
- [x] T044 Confirmados os 4 critérios de "página migrada com sucesso" para as 7 páginas: (1) cenários de aceitação validados por revisão de código contra specs 001–014; (2) `ng build` limpo, sem warnings; (3) sem erros de tipo (strict mode, validado também via T039); (4) HTML estático removido (T041)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia todas as user stories**.
- **US1 (Phase 3)**: Depende da Phase 2. Sub-grupos seguem ordem de dependência de dados: Home/Login → Students → Student-Eval/Training/Games (paralelizáveis entre si) → Dashboard (depende de todos os anteriores para validação completa, embora o componente em si possa ser esqueletado em paralelo).
- **US2 (Phase 4)**: Depende de US1 — os componentes só podem ser extraídos depois que o padrão duplicado existir nas páginas migradas.
- **US3 (Phase 5)**: Pode rodar em paralelo com US2, mas a validação final (T040) depende de todas as páginas de US1 estarem migradas.
- **Polish (Final)**: Depende de US1, US2 e US3 completas.

### User Story Dependencies

- **US1 (P1)**: Depende apenas da Phase 2 — é o bloco principal e o MVP.
- **US2 (P2)**: Depende de US1 (precisa do código duplicado existir antes de poder extraí-lo).
- **US3 (P3)**: Depende da Phase 1 (tsconfig strict) e é continuamente verificável a cada página migrada em US1; a validação formal (T039–T040) é melhor feita após US1 completa.

### Parallel Opportunities

```
Phase 2 completa
       │
       ├── T014, T015 (Home, Login) ── paralelos
       │
       ├── T017 (Students) ──┐
       │                     ├── T019, T021, T023 (Student-Eval, Training, Games) — paralelos entre si após Students existir
       │                     │
       └────────────────────→└── T025–T027 (Dashboard) — depende de todos os anteriores para validação completa
```

```
US1 completa
       │
       ├── T030 (CategorySelector) ──┐
       ├── T032 (MetricCard)         ├── extrações em paralelo (arquivos diferentes)
       ├── T034 (EvolutionChart)     │
       └── T036 (EmptyState) ────────┘
              │
              └── T031, T033, T035 (substituições nas páginas) — sequenciais por página afetada
```

---

## Parallel Example: User Story 1

```
# Após Phase 2 completa, em paralelo:
Task T014: Criar HomeComponent
Task T015: Criar LoginComponent

# Após T017 (Students) completa, em paralelo:
Task T019: Criar StudentEvalComponent
Task T021: Criar TrainingComponent
Task T023: Criar GamesComponent
```

## Parallel Example: User Story 2

```
# Extrações de componentes compartilhados, todas em arquivos diferentes:
Task T030: Extrair CategorySelectorComponent
Task T032: Extrair MetricCardComponent
Task T034: Extrair EvolutionChartComponent
Task T036: Extrair EmptyStateComponent
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (T001–T006)
2. Completar Phase 2: Foundational (T007–T013) — **crítico**
3. Completar Phase 3: US1, na ordem Home/Login → Students → Student-Eval/Training/Games → Dashboard (T014–T029)
4. **PARAR E VALIDAR**: rodar a tabela de paridade do `quickstart.md` para as 7 páginas
5. MVP entregue: frontend 100% Angular, com paridade funcional total

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → 7 páginas com paridade total → **MVP!** (pode já substituir as páginas HTML em produção)
3. US2 → componentização extraída, eliminando duplicação (SC-003)
4. US3 → build-time safety formalmente validado
5. Polish → HTML legado removido, documentação atualizada

### Parallel Team Strategy

Com múltiplos desenvolvedores, após Phase 2:
- Dev A: Home + Login, depois Dashboard
- Dev B: Students, depois Student-Eval
- Dev C: Training, depois Games
- Reconvergem para US2 (extração de componentes) somente depois que os padrões duplicados existirem em pelo menos 2–3 páginas migradas

---

## Notes

- [P] indica arquivos diferentes sem dependência de tarefas incompletas
- [Story] mapeia cada tarefa à user story correspondente para rastreabilidade
- US1 é deliberadamente "duplicada primeiro, componentizada depois" (US2) — consistente com a justificativa de prioridade na spec: "a migração ainda entrega valor parcial (P1) mesmo que a componentização inicial seja limitada"
- Cada página migrada deve ser validada contra as specs originais (002–014) antes de remover o HTML estático correspondente (T041)
- `StateService` (T013) é o único ponto de acesso a `sessionStorage` — nenhum componente deve ler/escrever a chave `imperialState` diretamente
