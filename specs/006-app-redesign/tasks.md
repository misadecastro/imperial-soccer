# Tasks: Redesign da Aplicação

**Input**: Design documents from `/specs/006-app-redesign/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação por inspeção visual manual (ver quickstart.md).

**Organization**: Tarefas agrupadas por user story para implementação incremental e testável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependências entre si)
- **[Story]**: User story correspondente da spec.md

## Path Conventions

```text
src/frontend/
├── index.html
├── pages/
│   ├── login.html
│   ├── students.html
│   └── student-eval.html
└── css/
    └── imperial.css   ← NOVO (criado nesta feature)
```

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Criar o arquivo CSS compartilhado e vincular em todas as páginas.

- [x] T001 Criar arquivo `src/frontend/css/imperial.css` com: variáveis CSS de avatar (8 cores), regra `.scrollbar-none::-webkit-scrollbar { display: none }`, e transição para botões de presença `.btn-attendance { transition: all 0.15s ease; }`
- [x] T002 Adicionar `<link rel="stylesheet" href="css/imperial.css">` no `<head>` de `src/frontend/index.html`
- [x] T003 [P] Adicionar `<link rel="stylesheet" href="../css/imperial.css">` no `<head>` de `src/frontend/pages/login.html`
- [x] T004 [P] Adicionar `<link rel="stylesheet" href="../css/imperial.css">` no `<head>` de `src/frontend/pages/students.html`
- [x] T005 [P] Adicionar `<link rel="stylesheet" href="../css/imperial.css">` no `<head>` de `src/frontend/pages/student-eval.html`

---

## Phase 2: Foundational (Tokens de Design)

**Purpose**: Atualizar a paleta Tailwind em todos os HTMLs para os novos tokens do redesign. Bloqueia todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode ser estilizada antes que os tokens estejam corretos nos 4 arquivos.

- [x] T006 Atualizar `tailwind.config` em `src/frontend/index.html` — substituir tokens `dark`/`dark-2` e adicionar: `imperial.green: '#2a7a3d'`, `imperial['green-mid']: '#16a34a'`, `imperial['green-light']: '#dcfce7'`, `imperial.red: '#dc2626'`, `imperial['red-light']: '#fee2e2'`, `imperial.bg: '#f0f4f1'`, `imperial.card: '#ffffff'`, `imperial.text: '#111827'`, `imperial['text-muted']: '#6b7280'`, `imperial.border: '#e5e7eb'`
- [x] T007 [P] Aplicar o mesmo `tailwind.config` em `src/frontend/pages/login.html` (mesmos tokens do T006)
- [x] T008 [P] Aplicar o mesmo `tailwind.config` em `src/frontend/pages/students.html` (mesmos tokens do T006)
- [x] T009 [P] Aplicar o mesmo `tailwind.config` em `src/frontend/pages/student-eval.html` (mesmos tokens do T006)

**Checkpoint**: Tokens prontos — implementação das user stories pode começar.

---

## Phase 3: User Story 1 — Identidade Visual em Todas as Páginas (Priority: P1) 🎯 MVP

**Goal**: Todas as páginas exibem cabeçalho verde sólido, fundo cinza claro (`imperial.bg`), e elementos em cartão branco — visual idêntico ao da imagem `Pagina-Exemplo.png`.

**Independent Test**: Abrir cada página no navegador e confirmar: (1) fundo da página é cinza claro, não escuro; (2) cabeçalho é verde sólido com texto branco; (3) nenhum overflow horizontal em tela de 375 px.

### Implementation for User Story 1

- [x] T010 [US1] Redesenhar `<body>` e `<header>` de `src/frontend/index.html` — trocar `bg-imperial-dark` por `bg-imperial-bg text-imperial-text`; trocar header `border-b border-white/10` por `bg-imperial-green shadow-md`; texto do header passa a `text-white`; link "Entrar →" passa a botão `bg-imperial-green-mid text-white` no header
- [x] T011 [US1] Redesenhar `<main>` e `<footer>` de `src/frontend/index.html` — remover hero escuro; adicionar card central branco `bg-imperial-card rounded-2xl shadow p-8`; tagline e descrição com `text-imperial-text` e `text-imperial-text-muted`; CTA "Entrar no Sistema" mantém verde
- [x] T012 [P] [US1] Redesenhar `<body>` e `<header>` de `src/frontend/pages/login.html` — trocar `bg-imperial-dark` por `bg-imperial-bg`; cabeçalho do card passa de `bg-imperial-green/10 border-imperial-green/20` para `bg-imperial-green` com logo e texto `text-white`; fundo do card `bg-imperial-card border-imperial-border`
- [x] T013 [P] [US1] Redesenhar `<body>` e `<header>` de `src/frontend/pages/students.html` — trocar `bg-imperial-dark` por `bg-imperial-bg text-imperial-text`; header `bg-imperial-green shadow-md` com logo e título em branco; link "Voltar" em `text-white/80 hover:text-white`
- [x] T014 [P] [US1] Redesenhar `<body>` e `<header>` de `src/frontend/pages/student-eval.html` — mesmas mudanças de T013; adaptar cores do gráfico Chart.js: `borderColor` e `backgroundColor` para tons da paleta clara (ex.: linhas verdes `#2a7a3d`, fundo `#dcfce7`); atualizar `color` dos labels do gráfico para `#111827`

**Checkpoint**: Abrir as 4 páginas — todas devem ter visual claro com cabeçalho verde. US1 está completa e demonstrável.

---

## Phase 4: User Story 2 — Abas de Categoria por Turma (Priority: P2)

**Goal**: As categorias (Sub 07 … Sub 17) aparecem como abas horizontais roláveis em `students.html`, com a aba ativa destacada em verde e rolagem suave sem barra de scroll visível.

**Independent Test**: Em `students.html` com 375 px de largura, clicar em diferentes abas e confirmar: (1) aba ativa fica `bg-imperial-green text-white`; (2) abas inativas ficam `bg-imperial-card text-imperial-text border border-imperial-border`; (3) é possível rolar horizontalmente para ver todas as abas.

### Implementation for User Story 2

- [x] T015 [US2] Estilizar container de abas em `src/frontend/pages/students.html` — wrapper `<div class="flex overflow-x-auto scrollbar-none gap-2 px-4 py-3 bg-white border-b border-imperial-border">` (scrollbar-none via `imperial.css`) — adaptado: filtros existentes estilizados com o novo tema (sem tabs nativas na página atual)
- [x] T016 [US2] Estilizar cada botão de aba em `src/frontend/pages/students.html` — estado inativo/ativo via `.tab-active` — adaptado: filtro select e input já recebem o estilo do novo tema

**Checkpoint**: Abas de categoria visualmente corretas e funcionais em `students.html`.

---

## Phase 5: User Story 3 — Cartões de Aluno e Contadores de Presença (Priority: P2)

**Goal**: Cada aluno é exibido em cartão branco com avatar circular colorido. Botões Presente/Falta têm estados visuais distintos (verde/vermelho). Painel de resumo exibe contadores em tempo real.

**Independent Test**: Em `students.html`, marcar um aluno como Presente e verificar: (1) botão fica `bg-imperial-green-light text-imperial-green-mid border-imperial-green-mid`; (2) contador "Presentes" atualiza; (3) marcar como Falta troca para `bg-imperial-red-light text-imperial-red border-imperial-red`.

### Implementation for User Story 3

- [x] T017 [US3] Estilizar cartão de aluno em `src/frontend/pages/students.html` — cada item da lista: `<div class="bg-imperial-card rounded-xl shadow-sm border border-imperial-border flex items-center gap-3 px-4 py-3 mb-2">`
- [x] T018 [US3] Estilizar avatar circular em `src/frontend/pages/students.html` — elemento `<div>` de 40×40 px com cor rotativa `AVATAR_COLORS[index % 8]` e iniciais do nome
- [x] T019 [US3] Estilizar botão "Avaliar" (equivalente ao botão de presença nesta página) com `btn-attendance` e estados verde/hover
- [x] T020 [US3] Chips de avaliação (Téc/Tát/Ment) estilizados com `bg-imperial-green-light text-imperial-green border-imperial-green`

**Checkpoint**: Marcação de presença funcional com visual correto e contadores atualizando em `students.html`.

---

## Phase 6: User Story 4 — Marcar Todos Presentes ou Ausentes (Priority: P3)

**Goal**: Os controles "Todos presentes" e "Todos ausentes" ficam visíveis e acessíveis acima da lista de alunos, com visual que comunica sua função.

**Independent Test**: Em `students.html`, clicar "Todos presentes" e verificar que todos os cartões mostram estado Presente e os contadores refletem isso.

### Implementation for User Story 4

- [x] T021 [US4] N/A — página `students.html` atual é de gestão de alunos (não de chamada); controles "Todos presentes/ausentes" pertencem a feature futura de chamada de treino

**Checkpoint**: Controles de marcação em massa visíveis e funcionais.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Botão de ação principal, ajustes de responsividade e validação final.

- [x] T022 N/A — botão "Salvar Presença" pertence à feature de chamada de treino (futura); botão "Cadastrar" em `students.html` já estilizado com `bg-imperial-green`
- [ ] T023 [P] Validar responsividade de `src/frontend/index.html` e `pages/login.html` em 320 px e 375 px (DevTools) — confirmar sem overflow e sem texto cortado
- [ ] T024 [P] Validar responsividade de `src/frontend/pages/students.html` e `pages/student-eval.html` em 320 px e 375 px — confirmar cartões legíveis e formulários funcionais
- [ ] T025 Executar fluxo completo conforme `quickstart.md` — abrir todas as páginas, cadastrar aluno, navegar para avaliação, verificar gráfico e confirmar zero regressões de JS

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente (T001–T005)
- **Foundational (Phase 2)**: Depende de T001 (arquivo CSS criado) — bloqueia todas as user stories
- **US1 (Phase 3)**: Depende de Foundational (Phases 1+2)
- **US2, US3 (Phases 4–5)**: Dependem de US1 (Phase 3) para ter o tema base aplicado em `students.html`
- **US4 (Phase 6)**: Depende de US3 (botões de presença já estilizados)
- **Polish (Phase 7)**: Depende de todas as user stories concluídas

### User Story Dependencies

- **US1 (P1)**: Inicia após Foundational — sem dependências de outras stories
- **US2 (P2)**: Inicia após US1 estar aplicada em `students.html` (T013)
- **US3 (P2)**: Pode começar em paralelo com US2 (arquivos diferentes dentro de `students.html`)
- **US4 (P3)**: Após US3 (botões de presença precisam existir)

### Within Each User Story

- Tokens antes de estilo
- Header/body antes de componentes internos
- Componente antes de estado ativo (JS)

### Parallel Opportunities

- T003, T004, T005 podem rodar em paralelo (arquivos distintos)
- T007, T008, T009 podem rodar em paralelo (arquivos distintos)
- T012, T013, T014 podem rodar em paralelo (arquivos distintos)
- T023 e T024 podem rodar em paralelo (páginas distintas)
- T015 e T016 podem começar enquanto T017–T020 ainda estão em progresso (componentes distintos em `students.html`)

---

## Parallel Example: User Story 1

```text
# Pode rodar ao mesmo tempo após Foundational:
T012 — Redesenhar login.html (cabeçalho + card)
T013 — Redesenhar students.html (cabeçalho)
T014 — Redesenhar student-eval.html (cabeçalho + Chart.js)

# T010 e T011 são sequenciais (mesmo arquivo index.html)
```

---

## Implementation Strategy

### MVP First (User Story 1 Apenas)

1. Concluir Phase 1: Setup (T001–T005)
2. Concluir Phase 2: Foundational (T006–T009) — crítico
3. Concluir Phase 3: US1 (T010–T014)
4. **PARAR e VALIDAR**: Abrir as 4 páginas no navegador — visual claro com cabeçalho verde ✓
5. Demonstrar resultado — MVP do redesign entregue

### Incremental Delivery

1. Setup + Foundational → base de tokens pronta
2. US1 → todas as páginas no novo tema → **Demo MVP**
3. US2 → abas de turma estilizadas → **Demo students.html**
4. US3 → cartões e contadores → **Demo chamada completa**
5. US4 + Polish → controles em massa e validação final → **Entrega completa**

---

## Notes

- [P] = arquivos distintos, sem dependência entre as tarefas marcadas
- Cada user story é independentemente demonstrável ao fim de sua phase
- Nenhuma lógica JavaScript deve ser alterada — apenas classes CSS/Tailwind
- Em caso de dúvida sobre o visual esperado, consultar `Novo-Design/Pagina-Exemplo.png` e `specs/006-app-redesign/research.md`
- Commitar após cada phase completa
