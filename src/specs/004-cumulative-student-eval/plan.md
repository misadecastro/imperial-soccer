# Implementation Plan: Avaliação Acumulativa do Aluno com Histórico e Gráfico

**Branch**: `004-cumulative-student-eval` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-cumulative-student-eval/spec.md`

## Summary

Substituir o modal de avaliação única da `students.html` por uma página dedicada de avaliação do aluno (`student-eval.html`), que exibe o histórico acumulativo de avaliações, permite adicionar/editar/excluir registros com data e pontuações (Tático, Técnico, Mental) e apresenta um gráfico de linha com a evolução temporal de cada aspecto. Como o projeto é atualmente 100% in-memory sem backend, o estado será serializado via `sessionStorage` para persistir durante a navegação entre páginas.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (browsers modernos 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN, Chart.js v4 via CDN (nova dependência para o gráfico)  
**Storage**: In-memory (`window`-scope array), com `sessionStorage` para compartilhamento de estado entre páginas  
**Testing**: Manual (sem framework de testes no MVP atual)  
**Target Platform**: Browser moderno (Chrome/Firefox/Edge 2023+)  
**Project Type**: Web application (frontend-only MVP)  
**Performance Goals**: Renderização imediata; gráfico atualizado sem reload de página  
**Constraints**: Sem build step — todas as dependências via CDN; sem backend/banco de dados nesta fase  
**Scale/Scope**: MVP — um professor, dados em memória perdidos ao fechar aba

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **A feature adiciona complexidade justificada pelo domínio?** — Sim. Avaliações acumulativas são o núcleo do acompanhamento pedagógico; a tela dedicada e o gráfico entregam valor real ao professor sem introduzir abstrações desnecessárias.
- [x] **O professor consegue operar o fluxo sem suporte técnico?** — Sim. Um clique em "Avaliar" → tela de histórico → formulário simples. Gráfico é puramente visual, sem configuração.
- [x] **Os dados do aluno permanecem consistentes após a operação?** — Sim. Edição e exclusão operam sobre o array `state.avaliacoes` por ID único; a lista e o gráfico são re-renderizados após cada mutação.
- [x] **A API segue o envelope padrão e está documentada?** — N/A nesta fase (MVP frontend-only, sem backend).
- [x] **O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias?** — N/A nesta fase (MVP frontend-only, sem MongoDB).

> **Nota**: Chart.js via CDN é a única dependência nova. É uma biblioteca madura, zero-build, compatível com ES Modules. Não há violação de princípios constitucionais.

## Project Structure

### Documentation (this feature)

```text
specs/004-cumulative-student-eval/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── index.html                     # Login (unchanged)
├── pages/
│   ├── login.html                 # (unchanged)
│   ├── students.html              # Modificar: botão "Avaliar" navega para student-eval.html
│   └── student-eval.html          # NOVA: página de avaliação individual do aluno
└── (sem subpastas de componentes — sem build step)
```

**Structure Decision**: Projeto usa Option 2 (Web application) com apenas frontend por ora. A nova página `student-eval.html` fica em `frontend/pages/` seguindo o padrão existente. Não há separação em componentes/módulos externos — todo JS fica inline no `<script type="module">` da própria página, mantendo a convenção atual.

## Complexity Tracking

> Nenhuma violação constitucional identificada. Tabela não aplicável.
