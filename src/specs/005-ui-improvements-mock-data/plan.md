# Implementation Plan: Melhorias de UI, Dados Mocados e Fluxo de Acesso

**Branch**: `005-ui-improvements-mock-data` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-ui-improvements-mock-data/spec.md`

## Summary

Cinco melhorias independentes de UI/UX e dados na aplicação frontend-only: (1) ocultar o formulário de nova avaliação por padrão em `student-eval.html` com toggle via botão; (2) inverter a ordenação da lista para mais recente primeiro e adicionar paginação client-side de 10 em 10; (3) adicionar botão "Voltar" ao final da lista; (4) pré-popular `sessionStorage` com ~40 alunos mocados com avaliações entre jan/2025 e abr/2026 quando não houver dados; (5) redirecionar o formulário de login para `students.html`.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (browsers modernos 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN, Chart.js v4 via CDN (já existente)  
**Storage**: `sessionStorage` com chave `"imperialState"` (padrão da feature 004)  
**Testing**: Manual  
**Target Platform**: Browser moderno (Chrome/Firefox/Edge 2023+)  
**Project Type**: Web application (frontend-only MVP)  
**Performance Goals**: Toggle do formulário e troca de página imediatos; carregamento dos dados mocados < 100ms  
**Constraints**: Sem build step — JavaScript inline no `<script type="module">` de cada página  
**Scale/Scope**: ~40 alunos mocados × média de 10 avaliações = ~400 registros em memória

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **A feature adiciona complexidade justificada pelo domínio?** — Sim. Todas as cinco melhorias são ajustes de UX diretos com valor imediato; sem abstrações novas.
- [x] **O professor consegue operar o fluxo sem suporte técnico?** — Sim. Botão "Nova Avaliação" é auto-explicativo; paginação usa padrão convencional; fluxo de login é direto.
- [x] **Os dados do aluno permanecem consistentes após a operação?** — Sim. Dados mocados são injetados uma única vez; paginação apenas filtra exibição, não muta estado.
- [x] **A API segue o envelope padrão e está documentada?** — N/A (MVP frontend-only).
- [x] **O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias?** — N/A (MVP frontend-only).

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-improvements-mock-data/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── index.html                     # Unchanged
├── pages/
│   ├── login.html                 # Modificar: submit do form → redirect students.html
│   ├── students.html              # Modificar: injetar mock data se sessionStorage vazio
│   └── student-eval.html          # Modificar: toggle form, ordenação DESC, paginação, botão Voltar rodapé
```

**Structure Decision**: Todas as mudanças são em arquivos existentes. A lógica de mock data reside em `students.html` e é partilhada via `sessionStorage`.

## Complexity Tracking

> Nenhuma violação constitucional. Tabela não aplicável.
