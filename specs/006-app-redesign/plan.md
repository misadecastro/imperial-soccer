# Implementation Plan: Redesign da Aplicação

**Branch**: `006-app-redesign` | **Date**: 2026-04-05 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/006-app-redesign/spec.md`

## Summary

Substituir o tema escuro atual (fundo `#0f172a`) por uma identidade visual mobile-first com cabeçalho verde sólido, fundo de página cinza claro e cartões brancos com sombra — conforme a imagem de referência `Novo-Design/Pagina-Exemplo.png`. Escopo: apenas HTML/CSS das 4 páginas estáticas; lógica JavaScript preservada integralmente.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`), Chart.js v4 via CDN (somente `student-eval.html`)  
**Storage**: `sessionStorage` com chave `"imperialState"` (existente, sem alteração)  
**Testing**: Inspeção visual manual no navegador (desktop e mobile); redimensionamento até 320 px  
**Target Platform**: Browsers modernos, mobile-first (320–480 px principal, até 1280 px)  
**Project Type**: Web application — frontend estático (`src/frontend/`)  
**Performance Goals**: Carregamento percebido < 1 s em conexão 4G (sem assets adicionais além dos CDNs já usados)  
**Constraints**: Sem build step; Tailwind via CDN em dev; Chart.js já carregado em `student-eval.html`  
**Scale/Scope**: 4 páginas HTML a redesenhar: `index.html`, `login.html`, `students.html`, `student-eval.html`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] A feature adiciona complexidade justificada pelo domínio? — **Sim**: melhora a usabilidade em campo (mobile), alinhada ao Princípio II (Professor como Ator Central).
- [x] O professor consegue operar o fluxo sem suporte técnico? — **Sim**: redesign reduz fricção visual; nenhuma nova ação técnica exigida.
- [x] Os dados do aluno permanecem consistentes após a operação? — **Sim**: nenhuma alteração de lógica ou dados; só apresentação.
- [x] A API segue o envelope padrão e está documentada? — **N/A**: feature é 100% frontend estático; nenhuma chamada de API nova.
- [x] O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias? — **N/A**: sem backend.

**Resultado: APROVADO — sem violações.**

## Project Structure

### Documentation (this feature)

```text
specs/006-app-redesign/
├── plan.md              ← este arquivo
├── research.md          ← decisões de design (paleta, tokens)
├── data-model.md        ← sem novas entidades (N/A — ver nota)
├── quickstart.md        ← como visualizar o redesign localmente
└── tasks.md             ← gerado por /speckit-tasks (próximo passo)
```

### Source Code (repository root)

```text
src/frontend/
├── index.html                    ← redesenhado (home/landing)
├── pages/
│   ├── login.html                ← redesenhado
│   ├── students.html             ← redesenhado
│   └── student-eval.html        ← redesenhado
└── css/
    └── imperial.css              ← NOVO: tokens de design e estilos custom
```

**Structure Decision**: Opção 2 (web application) — frontend existente em `src/frontend/`. Adição de um único arquivo CSS compartilhado (`css/imperial.css`) para tokens e overrides que Tailwind CDN não consegue expressar (ex.: avatar colors, scrollbar de abas). Todos os arquivos HTML vinculam esse CSS via `<link>`.

## Complexity Tracking

> Nenhuma violação da Constituição identificada. Tabela omitida conforme instrução do template.
