# Implementation Plan: Students Listing — Evaluation Display & Registration Toggle

**Branch**: `003-students-eval-display` | **Date**: 2026-04-04 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/003-students-eval-display/spec.md`

## Summary

Dois ajustes na página `frontend/pages/students.html`:

1. **Indicadores de avaliação nos cards** — cada card da listagem exibe a nota da última avaliação para os três aspectos (Técnico, Tático, Mental) com ícone SVG distinto por aspecto. Alunos sem avaliação mostram os ícones em estado inativo.
2. **Toggle do formulário de cadastro** — a `<section>` de cadastro fica oculta por padrão; um botão "Novo Aluno" na área de listagem alterna sua visibilidade. Após submit bem-sucedido o formulário se oculta automaticamente.

Ambas as mudanças são puramente de UI/renderização na camada frontend em-memória — sem alterações no modelo de dados nem em APIs.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (browsers modernos 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`)  
**Storage**: In-memory (array `state.alunos` / `state.avaliacoes` em `window`-scope) — sem persistência  
**Testing**: Manual (abrir HTML no navegador)  
**Target Platform**: Navegador Web moderno (Chrome/Firefox/Safari/Edge 2023+)  
**Project Type**: Web application — frontend HTML/JS puro, sem build step  
**Performance Goals**: Renderização instantânea — lista esperada de até ~50 alunos por categoria  
**Constraints**: Sem Webpack/Vite; Tailwind via CDN; nenhum framework JS  
**Scale/Scope**: Página única com estado em memória; feature isolada em `students.html`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **A feature adiciona complexidade justificada pelo domínio?** — Sim. Exibir scores na listagem é a evolução natural após US3 (avaliação). Ocultar o form reduz ruído cognitivo para o professor.
- [x] **O professor consegue operar o fluxo sem suporte técnico?** — Sim. Botão "Novo Aluno" é auto-explicativo; ícones com rótulos por aspecto são imediatos.
- [x] **Os dados do aluno permanecem consistentes após a operação?** — Sim. Nenhuma alteração no modelo de dados — apenas renderização.
- [x] **A API segue o envelope padrão e está documentada?** — N/A nesta fase (frontend in-memory, sem backend envolvido).
- [x] **O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias?** — N/A nesta fase.

**Resultado**: Todos os gates aplicáveis passam. ✅

## Project Structure

### Documentation (this feature)

```text
specs/003-students-eval-display/
├── plan.md              ← este arquivo
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── pages/
│   └── students.html    ← único arquivo modificado nesta feature
└── index.html           (sem alteração)
```

**Structure Decision**: Projeto frontend puro de página única. Toda alteração se concentra em `frontend/pages/students.html` — seção HTML da listagem e bloco `<script type="module">`.

## Complexity Tracking

Nenhuma violação da Constitution nesta feature. Tabela omitida.
