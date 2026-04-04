# Implementation Plan: Home e Login Pages

**Branch**: `001-home-login-page` | **Date**: 2026-04-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-home-login-page/spec.md`

---

## Summary

Criar as duas páginas estáticas de entrada da aplicação Imperial Soccer:

1. **Página Inicial** (`frontend/index.html`) — hero section com apresentação da escolinha e CTA de acesso.
2. **Tela de Login** (`frontend/pages/login.html`) — formulário visual de credenciais sem lógica de autenticação.

Abordagem: HTML5 puro + Tailwind CSS v3 via CDN, sem build step, sem framework JS, navegação via `href` nativo.

---

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores modernos 2023+)
**Primary Dependencies**: Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) — zero instalação
**Storage**: N/A — nenhum dado persistido nesta feature
**Testing**: Validação manual no navegador (checklist em quickstart.md)
**Target Platform**: Web browser (Chrome, Firefox, Edge, Safari modernos)
**Project Type**: Static web frontend (2 páginas HTML)
**Performance Goals**: Carregamento completo < 2 segundos (SC-001); HTML < 50KB por página
**Constraints**: Sem build step; sem framework JS; navegação funciona sem JavaScript habilitado
**Scale/Scope**: 2 arquivos HTML, 1 usuário-tipo (professor), 0 chamadas de API

---

## Constitution Check

*GATE: Avaliado antes de Phase 0. Re-checado pós-design.*

| Gate | Status | Justificativa |
|------|--------|---------------|
| Feature adiciona complexidade justificada pelo domínio? | ✅ PASS | Página inicial é requisito mínimo — ponto de entrada obrigatório da aplicação |
| Professor consegue operar o fluxo sem suporte técnico? | ✅ PASS | 1 clique da home ao login; formulário visual padrão e familiar |
| Dados do aluno permanecem consistentes após a operação? | ✅ N/A | Nenhum dado de aluno manipulado nesta feature |
| A API segue o envelope padrão e está documentada? | ✅ N/A | Nenhuma chamada de API nesta feature |
| O acesso ao MongoDB usa o driver oficial sem abstrações? | ✅ N/A | Nenhum acesso a banco de dados nesta feature |

**Resultado**: ✅ APROVADO — sem violações. Prosseguir para implementação.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-home-login-page/
├── plan.md              ✅ Este arquivo
├── research.md          ✅ Decisões de design e tecnologia
├── quickstart.md        ✅ Como visualizar e validar
└── checklists/
    └── requirements.md  ✅ Qualidade da spec
```

*Arquivos não gerados nesta feature (N/A):*
- `data-model.md` — nenhuma entidade de dados
- `contracts/` — nenhuma interface de API
- `tasks.md` — gerado pelo `/speckit.tasks`

### Source Code (repository root)

```text
frontend/
├── index.html           # Página inicial — hero + CTA
└── pages/
    └── login.html       # Tela de login — formulário visual
```

**Structure Decision**: Frontend estático na raiz `frontend/`, seguindo a estrutura definida na constituição.
Apenas os arquivos estritamente necessários para as 2 páginas desta feature.

---

## Design Decisions (resumo de research.md)

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Estrutura de navegação | Arquivos HTML separados + `href` nativo | SPA com router JS |
| CSS | Tailwind v3 CDN | Tailwind CLI / Bootstrap |
| Layout home | Hero full-viewport, dark + verde, tipografia | Imagem de fundo externa |
| Formulário login | `<form action="#">` sem submissão real | Validação JS / modal na home |
| Responsividade | Tailwind mobile-first (`sm:`, `md:`, `lg:`) | CSS media queries custom |

---

## Complexity Tracking

> Sem violações da constituição — tabela não aplicável.
