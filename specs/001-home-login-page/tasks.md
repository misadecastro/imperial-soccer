---
description: "Task list for feature 001-home-login-page"
---

# Tasks: Home e Login Pages

**Input**: Design documents from `/specs/001-home-login-page/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Não solicitados na spec — validação manual conforme `quickstart.md`.

**Organization**: Tarefas agrupadas por User Story para entrega incremental e teste independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependências)
- **[Story]**: User Story correspondente (US1, US2)
- Caminhos de arquivo absolutos a partir da raiz do repositório

## Path Conventions

- Frontend estático: `frontend/` na raiz do repositório
- Páginas: `frontend/index.html`, `frontend/pages/login.html`

---

## Phase 1: Setup

**Purpose**: Criação da estrutura de diretórios do frontend.

- [x] T001 Criar a estrutura de diretórios `frontend/` e `frontend/pages/` na raiz do repositório

---

## Phase 2: Foundational

**Purpose**: Recursos compartilhados que ambas as páginas dependem — nenhum nesta feature.

> Nenhuma tarefa foundational — as páginas são independentes entre si e não compartilham assets ou módulos JS.

---

## Phase 3: User Story 1 — Visitante acessa a página inicial (Priority: P1) 🎯 MVP

**Goal**: Criar `frontend/index.html` com hero section da Imperial Soccer e CTA de acesso ao sistema.

**Independent Test**: Abrir `frontend/index.html` no navegador e confirmar que o nome "Imperial Soccer",
descrição e botão "Entrar no Sistema" estão visíveis e o layout é responsivo em 360px e 1280px.

### Implementation for User Story 1

- [x] T002 [US1] Criar `frontend/index.html` com estrutura HTML5 base (doctype, head com meta viewport e charset, body vazio)
- [x] T003 [US1] Adicionar Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) no `<head>` de `frontend/index.html`
- [x] T004 [US1] Implementar o `<header>` da home com logo tipográfico "Imperial Soccer" em `frontend/index.html`
- [x] T005 [US1] Implementar a hero section com tagline, descrição breve da escolinha e fundo escuro com acento verde em `frontend/index.html`
- [x] T006 [US1] Adicionar o botão CTA "Entrar no Sistema" com link `href="pages/login.html"` na hero section de `frontend/index.html`
- [x] T007 [US1] Garantir responsividade mobile-first (360px → 1920px) usando classes Tailwind `sm:`, `md:`, `lg:` em `frontend/index.html`

**Checkpoint**: Abrir `frontend/index.html` no navegador. User Story 1 deve ser totalmente funcional e visualmente completa.

---

## Phase 4: User Story 2 — Visitante navega até a tela de autenticação (Priority: P1)

**Goal**: Criar `frontend/pages/login.html` com formulário visual de credenciais e link de retorno à home.

**Independent Test**: Clicar no botão "Entrar no Sistema" na home e confirmar que `frontend/pages/login.html`
carrega com campos de usuário, senha e botão "Entrar" visíveis.

### Implementation for User Story 2

- [x] T008 [US2] Criar `frontend/pages/login.html` com estrutura HTML5 base (doctype, head com meta viewport, charset e título "Login — Imperial Soccer")
- [x] T009 [US2] Adicionar Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) no `<head>` de `frontend/pages/login.html`
- [x] T010 [US2] Implementar card de login centralizado com nome "Imperial Soccer" em `frontend/pages/login.html`
- [x] T011 [US2] Adicionar campo de usuário/e-mail (`<input type="text">`) e campo de senha (`<input type="password">`) no formulário de `frontend/pages/login.html`
- [x] T012 [US2] Adicionar botão "Entrar" (`<button type="submit">`) no formulário — sem lógica de submissão real (`<form action="#">`) em `frontend/pages/login.html`
- [x] T013 [US2] Adicionar link "← Voltar" com `href="../index.html"` abaixo do formulário em `frontend/pages/login.html`
- [x] T014 [US2] Garantir responsividade mobile-first (360px → 1920px) usando classes Tailwind em `frontend/pages/login.html`

**Checkpoint**: Com ambas as páginas criadas, o fluxo home → login → home deve funcionar completamente via cliques. User Stories 1 e 2 estão completas e independentemente testáveis.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Consistência visual e validação cross-browser.

- [x] T015 [P] Revisar consistência visual (paleta de cores, tipografia, espaçamentos) entre `frontend/index.html` e `frontend/pages/login.html`
- [x] T016 [P] Verificar acessibilidade básica: atributos `alt`, `aria-label` no botão CTA e nos campos do formulário em ambas as páginas
- [ ] T017 Executar validação manual completa conforme `specs/001-home-login-page/quickstart.md` em Chrome, Firefox e Edge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nenhuma — iniciar imediatamente
- **User Story 1 (Phase 3)**: Depende de Phase 1 (diretório existe)
- **User Story 2 (Phase 4)**: Depende de Phase 1; pode ser desenvolvida em paralelo com US1 — mas a navegação entre as páginas só é testável com ambas presentes
- **Polish (Phase 5)**: Depende de US1 e US2 completas

### Within Each User Story

- Estrutura base HTML → CDN Tailwind → conteúdo → responsividade
- Sem dependências cruzadas entre US1 e US2 (arquivos distintos)

### Parallel Opportunities

- T002–T007 (US1) e T008–T014 (US2) podem ser desenvolvidas em paralelo por pessoas diferentes
- T015 e T016 (polish) podem rodar em paralelo entre si

---

## Parallel Example: User Stories em paralelo

```text
# Dev A — User Story 1 (home):
T002 → T003 → T004 → T005 → T006 → T007

# Dev B — User Story 2 (login) simultaneamente:
T008 → T009 → T010 → T011 → T012 → T013 → T014

# Após ambos:
T015 [P] + T016 [P] → T017
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002–T007)
3. **STOP e VALIDAR**: Abrir `frontend/index.html` — home está funcional
4. Avançar para US2

### Incremental Delivery

1. Setup → US1 → Validar home → Deploy/Demo (MVP!)
2. US2 → Validar fluxo completo home→login→home → Deploy/Demo
3. Polish → Validação cross-browser → Feature encerrada

---

## Notes

- [P] = arquivos distintos, sem dependências entre si
- [US1]/[US2] = rastreabilidade até a User Story do spec.md
- Nenhum test task gerado — validação é manual via quickstart.md
- Formulário de login é intenccionalmente visual only (FR-008 da spec)
- Total de tarefas: **17** | US1: 6 | US2: 7 | Setup: 1 | Polish: 3
