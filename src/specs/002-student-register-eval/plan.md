# Implementation Plan: Student Registration and Evaluation

**Branch**: `002-student-register-eval` | **Date**: 2026-04-04 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-student-register-eval/spec.md`

## Summary

O professor precisa cadastrar alunos (nome, data de nascimento, categoria Sub 09–14), visualizar e filtrar a listagem por nome e categoria, e lançar avaliações de desempenho (Técnico, Tático, Mental) com notas numa escala de 4 pontos. Esta entrega é uma página HTML mock standalone (`frontend/pages/students.html`) com dados em memória, sem backend, para validação do fluxo com o professor antes da implementação real.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (browsers modernos 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) — zero instalação  
**Storage**: In-memory (JavaScript array em `window`-scope) — dados perdidos ao recarregar  
**Testing**: Validação manual pelo professor no browser  
**Target Platform**: Web browser moderno (Chrome, Edge, Firefox 2023+)  
**Project Type**: Web application — página mock frontend (sem backend nesta entrega)  
**Performance Goals**: Resposta instantânea — todos os filtros e interações operam em memória local  
**Constraints**: Sem build step, sem frameworks JS, sem backend, Tailwind via CDN  
**Scale/Scope**: Página única de validação; volume de alunos esperado < 50 para o mock

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **A feature adiciona complexidade justificada pelo domínio?** Sim — cadastro e avaliação de alunos é a entidade central do sistema (Princípio III). Mock é a forma mais simples de validar antes de construir.
- [x] **O professor consegue operar o fluxo sem suporte técnico?** Sim — formulário direto, filtros em tempo real, modal de avaliação com opções visuais. Sem jargão técnico.
- [x] **Os dados do aluno permanecem consistentes após a operação?** Sim para o mock (in-memory). Campo `deletadoEm` para soft delete será implementado na versão real.
- [x] **A API segue o envelope padrão e está documentada?** N/A para o mock. Contratos REST planejados documentados em `contracts/students-api.md`.
- [x] **O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias?** N/A para o mock. Será aplicado na implementação real do backend.

*Post-design re-check*: Todos os gates mantidos. A página mock não viola nenhum princípio constitucional — ela é a etapa de validação anterior à implementação real definida no Fluxo de Desenvolvimento (seção 4 da Constituição).

## Project Structure

### Documentation (this feature)

```text
specs/002-student-register-eval/
├── plan.md              ← este arquivo
├── research.md          ← decisões de abordagem (Phase 0)
├── data-model.md        ← entidades, campos, validações (Phase 1)
├── quickstart.md        ← como abrir e usar a página mock (Phase 1)
├── contracts/
│   └── students-api.md  ← contratos REST planejados (Phase 1)
├── checklists/
│   └── requirements.md  ← checklist de qualidade da spec
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
frontend/
├── index.html           (existente)
└── pages/
    ├── login.html       (existente)
    └── students.html    (NOVO — entrega desta feature)
```

**Structure Decision**: Frontend-only, página única. Nenhuma modificação em backend ou testes nesta entrega. Quando o backend for implementado, a estrutura seguirá o padrão da Constituição (`backend/Imperial.Api/Controllers/`, `Services/`, `Repositories/`).

## Complexity Tracking

> Nenhuma violação constitucional identificada. Tabela omitida.
