# Tasks: Students Listing — Evaluation Display & Registration Toggle

**Input**: Design documents from `specs/003-students-eval-display/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação manual via `quickstart.md`.

**Organization**: Tarefas agrupadas por user story. Único arquivo modificado: `frontend/pages/students.html`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes ou sem dependência de tarefa incompleta)
- **[Story]**: User story à qual a tarefa pertence (US1, US2)

---

## Phase 1: Setup

**Purpose**: Nenhuma infraestrutura nova necessária — feature é puramente uma modificação do arquivo existente.

- [x] T001 Ler e mapear a estrutura atual de `frontend/pages/students.html` (seções HTML, função `renderAlunos()`, constantes `NOTAS`, estado `state.avaliacoes`) para confirmar pontos de integração antes de modificar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Definir constantes de ícones SVG compartilhadas pelas duas user stories.

**⚠️ CRITICAL**: T002 deve ser concluído antes das fases US1 e US2, pois ambas referenciam os ícones.

- [x] T002 Adicionar constante `ICONS` com três SVGs inline (Técnico: bola, Tático: losango/campo, Mental: cabeça) no bloco `<script type="module">` de `frontend/pages/students.html`, logo após a constante `NOTAS`

**Checkpoint**: Ícones definidos — implementação das user stories pode começar.

---

## Phase 3: User Story 1 — Indicadores de avaliação nos cards (Priority: P1) 🎯 MVP

**Goal**: Cada card da listagem exibe chips visuais com ícone + nota para Técnico, Tático e Mental da última avaliação. Alunos sem avaliação exibem chips no estado "sem avaliação" (nota "–").

**Independent Test**: Abrir `frontend/pages/students.html`, cadastrar um aluno, confirmar que os chips aparecem em estado "sem avaliação"; avaliar o aluno, confirmar que os chips exibem as notas corretas; avaliar novamente com notas diferentes e confirmar que apenas os valores da última avaliação são exibidos.

### Implementation for User Story 1

- [x] T003 [US1] Adicionar função `renderEvalChips(avaliacao)` no bloco `<script type="module">` de `frontend/pages/students.html` — recebe o objeto avaliação (ou `null`) e retorna a string HTML com três chips lado a lado (ícone SVG de `ICONS` + rótulo curto "Téc"/"Tát"/"Ment" + nota numérica ou "–"), usando classes Tailwind para estado ativo (verde) e inativo (cinza)
- [x] T004 [US1] Atualizar a função `renderAlunos()` em `frontend/pages/students.html` — substituir o bloco do badge `✓ Avaliado` pela chamada `renderEvalChips(avaliacao)` posicionando os chips como segunda linha dentro do card (abaixo do nome e dados básicos do aluno)

**Checkpoint**: US1 completa e testável independentemente. Abrir a página e verificar chips em todos os cards.

---

## Phase 4: User Story 2 — Toggle do formulário de cadastro (Priority: P2)

**Goal**: A seção de cadastro fica oculta no carregamento. Um botão "Novo Aluno" ao lado do título "Alunos Cadastrados" alterna sua visibilidade. Após submit bem-sucedido, o formulário se oculta automaticamente.

**Independent Test**: Carregar a página e confirmar que a seção de cadastro está oculta; clicar em "Novo Aluno" e confirmar que a seção aparece; clicar novamente e confirmar que se oculta; abrir o form, preencher e submeter um aluno, confirmar que o form se oculta automaticamente após o sucesso.

### Implementation for User Story 2

- [x] T005 [US2] Adicionar classe `hidden` à `<section aria-labelledby="tituloCadastro">` no HTML de `frontend/pages/students.html` para ocultá-la no carregamento inicial
- [x] T006 [US2] Alterar o cabeçalho da seção "Alunos Cadastrados" em `frontend/pages/students.html` — envolver o `<h2 id="tituloListagem">` e um novo `<button id="btnNovoAluno">` em um `<div class="flex items-center justify-between mb-6">`, removendo o `mb-6` direto do `<h2>` e aplicando estilo verde ao botão (mesmo padrão dos outros botões da página)
- [x] T007 [US2] Adicionar funções `toggleCadastro()` e `fecharCadastro()` no bloco `<script type="module">` de `frontend/pages/students.html` — `toggleCadastro()` alterna `hidden` na seção de cadastro; wiring do `click` no `btnNovoAluno`
- [x] T008 [US2] Chamar `fecharCadastro()` ao final do handler de submit bem-sucedido do `formCadastro` em `frontend/pages/students.html` (logo após `showToast('Aluno cadastrado com sucesso!')`)

**Checkpoint**: US2 completa e testável independentemente. Recarregar a página e testar o fluxo completo de toggle.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificação final de qualidade e consistência visual.

- [x] T009 Verificar responsividade mobile dos chips de avaliação em `frontend/pages/students.html` — garantir que os três chips não transbordam em telas pequenas (flex-wrap se necessário)
- [x] T010 Executar validação manual completa seguindo todos os cenários do `specs/003-students-eval-display/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: Depende da conclusão do Setup — bloqueia US1 e US2
- **US1 (Phase 3)**: Depende da Phase 2 (T002)
- **US2 (Phase 4)**: Depende da Phase 2 (T002) — pode rodar em paralelo com US1
- **Polish (Phase 5)**: Depende da conclusão de US1 e US2

### User Story Dependencies

- **US1 (P1)**: Pode iniciar após Foundational — sem dependência de US2
- **US2 (P2)**: Pode iniciar após Foundational — sem dependência de US1

### Within Each User Story

- **US1**: T003 (helper function) → T004 (usar no renderAlunos)
- **US2**: T005 (ocultar section) → T006 (botão + layout) → T007 (funções JS) → T008 (wiring no submit)

### Parallel Opportunities

- US1 e US2 podem ser trabalhadas em paralelo após Phase 2 concluída (por desenvolvedores diferentes)
- T005 pode rodar em paralelo com T003 (partes diferentes do arquivo: HTML vs JS)

---

## Parallel Example: US1 e US2 juntas

```
# Após T002 concluído:

Thread A (US1):
  T003 → T004

Thread B (US2):
  T005 → T006 → T007 → T008
```

---

## Implementation Strategy

### MVP First (US1 apenas)

1. Concluir Phase 1: Setup (T001)
2. Concluir Phase 2: Foundational (T002)
3. Concluir Phase 3: US1 (T003, T004)
4. **STOP e VALIDATE**: Chips de avaliação funcionando em todos os cards
5. Demonstrar resultado ao professor

### Entrega Incremental

1. Setup + Foundational → arquivo pronto para modificações
2. US1 → chips de avaliação visíveis na listagem (MVP!)
3. US2 → formulário oculto por padrão com toggle
4. Polish → validação final e ajustes de responsividade

---

## Notes

- Todas as alterações ocorrem em um único arquivo: `frontend/pages/students.html`
- Nenhuma dependência externa nova — SVGs inline, Tailwind via CDN
- Não há backend ou API envolvidos
- Não há testes automatizados — validação manual via quickstart.md
- Commit recomendado após cada fase (T002, T004, T008, T010)
