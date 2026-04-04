# Tasks: Student Registration and Evaluation

**Input**: Design documents from `/specs/002-student-register-eval/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/students-api.md ✅, quickstart.md ✅

**Tests**: Não solicitados na spec — validação manual conforme `quickstart.md`.

**Organization**: Tasks organizadas por User Story para entrega incremental. Toda a implementação reside em um único arquivo `frontend/pages/students.html` com JS embutido (mock sem backend).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (sem dependências entre si no mesmo passo)
- **[Story]**: A qual User Story pertence (US1, US2, US3)
- Caminhos exatos incluídos em cada descrição

## Path Conventions

Web app (frontend-only mock):

```
frontend/
└── pages/
    └── students.html   ← única entrega desta feature
```

---

## Phase 1: Setup (Estrutura inicial)

**Purpose**: Criar o arquivo da página mock com a estrutura base

- [x] T001 Criar `frontend/pages/students.html` com doctype HTML5, meta tags, título "Imperial Soccer — Alunos" e CDN do Tailwind CSS v3 (`https://cdn.tailwindcss.com`)

---

## Phase 2: Foundational (Pré-requisitos bloqueantes)

**Purpose**: Estado em memória e utilitários que TODAS as user stories dependem

**⚠️ CRÍTICO**: Nenhuma user story pode ser iniciada antes desta fase estar completa

- [x] T002 Definir objeto de estado global `const state = { alunos: [], avaliacoes: [] }` e constantes `CATEGORIAS` (array com Sub09–Sub14) e `NOTAS` (mapa label→valor) no bloco `<script>` de `frontend/pages/students.html`
- [x] T003 Implementar funções utilitárias `generateId()` (UUID simples via `crypto.randomUUID()`), `formatDate(isoDate)` (formata para dd/mm/aaaa) e `getAvaliacaoByAlunoId(alunoId)` (retorna avaliação mais recente do aluno) no `<script>` de `frontend/pages/students.html`

**Checkpoint**: Estado e utilitários prontos — user stories podem iniciar

---

## Phase 3: User Story 1 — Cadastrar Aluno (Priority: P1) 🎯 MVP

**Goal**: Professor preenche nome, data de nascimento e categoria e confirma o cadastro; aluno aparece na listagem imediatamente.

**Independent Test**: Abrir `frontend/pages/students.html` no browser, preencher o formulário e verificar que o aluno aparece na listagem.

### Implementation for User Story 1

- [x] T004 [US1] Criar seção de formulário de cadastro no `<body>` de `frontend/pages/students.html` com campos: input texto `nome`, input date `dataNascimento`, select `categoria` (opções geradas a partir de `CATEGORIAS`) e botão "Cadastrar"
- [x] T005 [US1] Implementar função `validateCadastroForm(nome, dataNascimento, categoria)` que retorna array de mensagens de erro (campo vazio, data futura) no `<script>` de `frontend/pages/students.html`
- [x] T006 [US1] Implementar handler `cadastrarAluno(event)` — valida form via `validateCadastroForm()`, cria objeto aluno com `generateId()`, insere em `state.alunos`, chama `renderAlunos()` (stub até Phase 4) e limpa os campos em `frontend/pages/students.html`
- [x] T007 [US1] Exibir mensagens de erro inline abaixo de cada campo inválido (texto vermelho Tailwind `text-red-500`) sem submeter o form em `frontend/pages/students.html`
- [x] T008 [US1] Exibir notificação de sucesso ("Aluno cadastrado com sucesso!") por 3 segundos após cadastro bem-sucedido em `frontend/pages/students.html`

**Checkpoint**: US1 completa — cadastro funcional e aluno adicionado ao estado. US2 pode iniciar.

---

## Phase 4: User Story 2 — Listar e Filtrar Alunos (Priority: P2)

**Goal**: Professor vê todos os alunos cadastrados e pode filtrar por nome (tempo real) e categoria (tempo real), com suporte a filtros combinados.

**Independent Test**: Com alunos pré-populados em `state.alunos` (adicionados manualmente no código para teste), abrir a página e verificar que filtros funcionam corretamente.

### Implementation for User Story 2

- [x] T009 [US2] Criar seção de listagem no `<body>` de `frontend/pages/students.html` com: input texto `filtroNome`, select `filtroCategoria` (opções geradas a partir de `CATEGORIAS` + opção "Todas") e `<div id="listaAlunos">` como container da lista
- [x] T010 [US2] Implementar função `renderAlunos()` — lê `state.alunos`, aplica filtros ativos de `filtroNome` e `filtroCategoria`, renderiza cards/linhas com nome, data de nascimento formatada, categoria e botão "Avaliar" para cada aluno em `frontend/pages/students.html`
- [x] T011 [US2] Implementar lógica de filtro combinado dentro de `renderAlunos()`: filtro por nome é case-insensitive e parcial (`includes`); filtro por categoria é exato; ambos aplicados simultaneamente via `filter()` em `frontend/pages/students.html`
- [x] T012 [US2] Adicionar event listeners `input` no `filtroNome` e `change` no `filtroCategoria` que chamam `renderAlunos()` imediatamente (sem botão de confirmar) em `frontend/pages/students.html`
- [x] T013 [US2] Exibir mensagem "Nenhum aluno encontrado para os filtros aplicados." quando a lista filtrada está vazia em `frontend/pages/students.html`
- [x] T014 [US2] Chamar `renderAlunos()` ao final de `cadastrarAluno()` para que o aluno recém-cadastrado apareça imediatamente na listagem em `frontend/pages/students.html`

**Checkpoint**: US2 completa — listagem e filtros funcionais. US3 pode iniciar.

---

## Phase 5: User Story 3 — Lançar Avaliação do Aluno (Priority: P3)

**Goal**: Professor clica em "Avaliar" em um aluno, preenche as notas de Técnico, Tático e Mental no modal e confirma; aluno recebe indicador visual de "avaliado" na listagem.

**Independent Test**: Com aluno pré-cadastrado, clicar em "Avaliar", selecionar notas para todos os aspectos, confirmar e verificar badge "Avaliado" na listagem.

### Implementation for User Story 3

- [x] T015 [US3] Criar modal de avaliação no `<body>` de `frontend/pages/students.html` (inicialmente `hidden` com Tailwind): título com nome do aluno, três grupos de radio buttons (Técnico, Tático, Mental) cada um com 4 opções (Excelente/Bom/Regular/Precisa Melhorar) e botões "Confirmar Avaliação" e "Cancelar"
- [x] T016 [US3] Implementar função `abrirModal(alunoId)` — armazena `alunoId` em variável de contexto, exibe o nome do aluno no título do modal, limpa seleções anteriores e remove a classe `hidden` do modal em `frontend/pages/students.html`
- [x] T017 [US3] Conectar o botão "Avaliar" de cada linha da listagem (gerado em `renderAlunos()`) ao `abrirModal(alunoId)` em `frontend/pages/students.html`
- [x] T018 [US3] Implementar função `validateAvaliacaoForm()` que verifica se os três aspectos (tecnico, tatico, mental) estão selecionados e exibe mensagens de erro por aspecto faltante em `frontend/pages/students.html`
- [x] T019 [US3] Implementar handler `lancarAvaliacao(event)` — valida via `validateAvaliacaoForm()`, cria objeto avaliação com `generateId()`, `alunoId` de contexto e notas selecionadas, insere em `state.avaliacoes`, fecha o modal, exibe confirmação de sucesso e chama `renderAlunos()` em `frontend/pages/students.html`
- [x] T020 [US3] Atualizar `renderAlunos()` para exibir badge "✓ Avaliado" (Tailwind `bg-green-100 text-green-700`) no card de cada aluno que possui entrada em `state.avaliacoes` (via `getAvaliacaoByAlunoId()`) em `frontend/pages/students.html`

**Checkpoint**: US3 completa — todas as 3 user stories funcionais e testáveis individualmente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Refinamentos visuais e de usabilidade que abrangem múltiplas user stories

- [x] T021 Adicionar cabeçalho de página com logo/nome "Imperial Soccer" e link "← Voltar ao Login" apontando para `../index.html` em `frontend/pages/students.html`
- [x] T022 Aplicar layout responsivo Tailwind: container centralizado (`max-w-4xl mx-auto`), seções separadas visualmente, paleta de cores consistente com `frontend/index.html` em `frontend/pages/students.html`
- [x] T023 Implementar fechamento do modal ao clicar no backdrop (área fora do painel central) em `frontend/pages/students.html`
- [x] T024 Executar validação manual conforme `specs/002-student-register-eval/quickstart.md` — abrir `frontend/pages/students.html` no browser e testar os 3 fluxos completos (cadastro → filtro → avaliação)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente
- **Foundational (Phase 2)**: Depende da conclusão de Phase 1 — BLOQUEIA todas as user stories
- **US1 (Phase 3)**: Depende de Phase 2 — sem dependência de outras stories
- **US2 (Phase 4)**: Depende de Phase 2 + Phase 3 (usa `renderAlunos()` chamado por `cadastrarAluno()`)
- **US3 (Phase 5)**: Depende de Phase 4 (usa `renderAlunos()` para exibir badge e botão "Avaliar")
- **Polish (Phase 6)**: Depende de todas as user stories estarem completas

### User Story Dependencies

- **US1 (P1)**: Inicia após Phase 2 — independente
- **US2 (P2)**: Inicia após US1 — integra com `cadastrarAluno()` e `renderAlunos()`
- **US3 (P3)**: Inicia após US2 — estende `renderAlunos()` com badge e botão

### Within Each User Story

- HTML da seção → funções JS auxiliares → handler principal → integração com `renderAlunos()`
- US1 deve estar completa antes de US2 iniciar (T014 depende de `renderAlunos()` de US2)

### Parallel Opportunities

- T002 e T003 (Phase 2) podem ser escritos em paralelo por dois agentes
- T004 (HTML) e T005 (função de validação) dentro de US1 podem ser desenvolvidos em paralelo
- T009 (HTML da listagem) e T011 (lógica de filtro) dentro de US2 podem ser desenvolvidos em paralelo
- T015 (HTML do modal) e T018 (validação da avaliação) dentro de US3 podem ser desenvolvidos em paralelo

---

## Parallel Example: User Story 3

```text
# Pode iniciar em paralelo dentro de US3:
Task T015: Criar HTML do modal de avaliação em frontend/pages/students.html
Task T018: Implementar validateAvaliacaoForm() em frontend/pages/students.html

# Sequencial após T015 + T016:
Task T017: Conectar botão "Avaliar" ao abrirModal()

# Sequencial após T015 + T018:
Task T019: Implementar lancarAvaliacao()

# Sequencial após T019:
Task T020: Adicionar badge "✓ Avaliado" em renderAlunos()
```

---

## Implementation Strategy

### MVP First (User Story 1 Apenas)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloqueia tudo)
3. Completar Phase 3: User Story 1 (T004–T008)
4. **PARAR E VALIDAR**: Cadastrar um aluno e verificar que aparece na listagem
5. Demonstrar ao professor se necessário

### Entrega Incremental

1. Phase 1 + 2 → Estrutura pronta
2. US1 → Cadastro funcional → Validar
3. US2 → Listagem e filtros → Validar
4. US3 → Avaliação completa → Validar
5. Polish → Página pronta para demonstração

---

## Notes

- [P] = arquivos diferentes ou funções sem dependências entre si
- [Story] mapeia cada task à sua user story para rastreabilidade
- Toda a implementação está em um único arquivo `frontend/pages/students.html`
- Não há backend nesta entrega — todos os dados ficam em `state` (in-memory)
- Ao recarregar a página os dados são perdidos — comportamento esperado no mock
- Commitar após cada fase ou checkpoint
- Parar em qualquer checkpoint para validar a story com o professor
