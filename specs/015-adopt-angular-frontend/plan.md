# Implementation Plan: Migração do Frontend para Angular

**Branch**: `015-adopt-angular-frontend` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/015-adopt-angular-frontend/spec.md`

## Summary

Reconstruir as 7 páginas do frontend (`index`, `login`, `dashboard`, `games`, `training`, `students`, `student-eval`) como uma aplicação Angular (standalone components + Router), preservando 100% do comportamento das features 001–014 e mantendo `sessionStorage` (`imperialState`) como única camada de dados. A migração é incremental, página por página, e introduz uma camada de componentes e serviços reutilizáveis para eliminar a duplicação de UI hoje presente em HTML/JS puro.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 18+ (standalone components, sem NgModules)  
**Primary Dependencies**: Angular CLI, Angular Router, Tailwind CSS v3 (integrado via build do Angular), Chart.js v4 (uso direto, sem wrapper como ng2-charts)  
**Storage**: `sessionStorage` chave `imperialState` — mesmo esquema atual (`alunos`, `avaliacoes`, `chamadas`, `jogos`), agora acessado via `StateService` Angular injetável  
**Testing**: Manual via `quickstart.md` — comparação de paridade com os roteiros das specs 002–014 (sem suíte automatizada nesta feature, consistente com a decisão da feature 014)  
**Target Platform**: Browsers modernos 2023+  
**Project Type**: Web application — SPA Angular no frontend; backend .NET inalterado e fora de escopo  
**Performance Goals**: Tempo de carregamento percebido pelo treinador não deve aumentar perceptivelmente em relação à versão estática atual (SC-005)  
**Constraints**: Build step obrigatório via Angular CLI (autorizado pela emenda da constituição v2.0.0); nenhuma chamada de API nova introduzida só pela migração de framework; aparência visual (Tailwind, paleta `imperial`, Chart.js) preservada sem redesign  
**Scale/Scope**: 7 páginas migradas incrementalmente; 14 features de domínio existentes (002–014) sem alteração de comportamento

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

> Constituição emendada para v2.0.0 antes deste plano, autorizando Angular como framework de frontend (ver Sync Impact Report em `.specify/memory/constitution.md`). Gate avaliado contra a versão emendada.

- [x] **Complexidade justificada?** Sim — componentização e tipagem resolvem duplicação real e documentada (5+ padrões de UI repetidos em 4+ páginas, conforme SC-003 da spec).
- [x] **Professor opera sem suporte técnico?** Sim — interface e fluxos permanecem idênticos; US1 exige paridade funcional total.
- [x] **Dados do aluno consistentes?** Sim — `sessionStorage`/`imperialState` mantém o mesmo esquema; nenhuma migração ou transformação de dados ocorre.
- [x] **API segue envelope padrão e está documentada?** N/A nesta feature — Princípio IV (emendado) permite uso temporário de `sessionStorage` enquanto a integração com a API não é implementada por feature.
- [x] **MongoDB via driver oficial?** N/A — backend não é alterado por esta migração.

Sem violações — Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/015-adopt-angular-frontend/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas da migração
├── data-model.md         # Entidades existentes mapeadas para interfaces TypeScript
└── quickstart.md        # Como rodar a app Angular e validar paridade
```

(Sem `contracts/` — esta feature não introduz nem altera nenhuma interface externa: o
frontend continua consumindo apenas `sessionStorage`, sem chamadas de API novas.)

### Source Code (repository root)

```text
src/frontend/                  # Raiz da aplicação Angular (substitui as páginas HTML estáticas)
├── angular.json
├── package.json
├── tsconfig.json
└── src/
    ├── app/
    │   ├── pages/             # Um componente por página/rota
    │   │   ├── home/             # substitui index.html (001)
    │   │   ├── login/            # substitui login.html (001)
    │   │   ├── dashboard/        # substitui dashboard.html (006, 011, 012, 014)
    │   │   ├── games/            # substitui games.html (008, 013)
    │   │   ├── training/         # substitui training.html (009, 010)
    │   │   ├── students/         # substitui students.html (003, 005)
    │   │   └── student-eval/     # substitui student-eval.html (002, 004)
    │   ├── components/        # Compartilhados entre páginas (extraídos da duplicação atual)
    │   │   ├── category-selector/
    │   │   ├── metric-card/
    │   │   ├── evolution-chart/
    │   │   └── ...
    │   ├── services/
    │   │   └── state.service.ts   # Encapsula leitura/escrita de sessionStorage (imperialState)
    │   ├── models/
    │   │   ├── aluno.model.ts
    │   │   ├── avaliacao.model.ts
    │   │   ├── chamada.model.ts
    │   │   └── jogo.model.ts
    │   └── app.routes.ts
    ├── styles.css              # Diretivas Tailwind (@tailwind base/components/utilities)
    └── main.ts
```

**Structure Decision**: Estrutura padrão de projeto Angular CLI (`ng new`), alinhada à árvore já definida na constituição emendada (`Stack & Arquitetura → Estrutura de Projeto`). `src/frontend/` permanece o diretório raiz do frontend (mesmo nome usado hoje), mas passa a conter um projeto Angular completo em vez de arquivos HTML estáticos. As páginas HTML atuais (`pages/*.html`) são removidas conforme cada rota equivalente é migrada — durante a transição, páginas ainda não migradas continuam sendo servidas como arquivos estáticos ao lado da build Angular.

## Complexity Tracking

> Não se aplica — Constitution Check não identificou violações.
