# Implementation Plan: CRUD de Configuração de Itens de Treino

**Branch**: `019-training-config-crud` | **Date**: 2026-07-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-training-config-crud/spec.md`

## Summary

Adicionar um botão **"Configurações"** (estilo secundário, menor destaque) ao lado de "Novo Treino" na lista de treinos, visível apenas para Administradores, que leva a uma **nova página de configuração** onde o Administrador gerencia (CRUD) **Princípios e Fundamentos** com seus **Itens Trabalhados**, e **Momentos do Jogo** com vínculos a princípios e seleção de itens por vínculo.

Nesta fase toda a persistência é **mockada/em memória** — sem backend, sem MongoDB, sem `HttpClient`. Os dados iniciais espelham exatamente as constantes hoje fixas em [training.component.ts](../../src/frontend/src/app/pages/training/training.component.ts) (`MOMENTOS` e `PRINCIPIOS_GRUPOS`). A abordagem: extrair esses dados fixos para um **serviço Angular de configuração** (`TrainingConfigService`, `providedIn: 'root'`, estado em memória) que passa a ser a fonte única tanto da nova tela de configuração quanto — opcionalmente numa feature futura — da montagem de treino.

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 18 (standalone components, sem NgModules)  
**Primary Dependencies**: Angular Router, `@angular/forms` (FormsModule), Tailwind CSS v3 (via build). Sem Chart.js, sem HttpClient nesta feature.  
**Storage**: Em memória (estado de um serviço Angular singleton `providedIn: 'root'`). Sem `sessionStorage`, sem backend, sem MongoDB — dados mockados perdidos ao recarregar (FR-014, decisão explícita do usuário).  
**Testing**: Validação manual do fluxo (quickstart.md). Sem testes automatizados nesta fase (consistente com o padrão frontend do projeto).  
**Target Platform**: Navegadores modernos (2023+), SPA Angular servida por `ng serve` / build de produção.  
**Project Type**: Web (frontend Angular existente) — **frontend-only nesta feature**.  
**Performance Goals**: Operações CRUD refletem imediatamente na UI, sem reload (SC-004); interações < 100ms (dados em memória).  
**Constraints**: Reutilizar `AuthService.isAdmin()` para gate de UI e `authGuard` com `data: { papel: 'Administrador' }` para gate de rota. Não duplicar HTML/lógica — extrair componentes reutilizáveis quando o padrão repetir.  
**Scale/Scope**: 1 nova rota/página, 1 novo serviço, novos models TypeScript, ajuste no cabeçalho da lista de treinos. Escopo: 4 momentos + 3 grupos de princípios com ~18 itens iniciais mockados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Simplicidade Funcional (I)**: Solução mínima — um serviço em memória + uma página; sem backend/abstração desnecessária. A persistência real fica para uma feature futura, conforme instrução do usuário. ✅
- [x] **Professor como Ator Central (II)**: Fluxo otimizado para o operador (Administrador é um Usuário do sistema); CRUD direto, poucos cliques, sem exigir conhecimento técnico. ✅
- [x] **Aluno como Núcleo do Domínio (III)**: Feature não toca em dados de aluno; nenhuma exclusão física de aluno envolvida. ✅
- [x] **API-First com Frontend Desacoplado (IV)**: A constituição permite `sessionStorage`/estado local como **camada de transição** enquanto a API não é implementada para a página. Aqui o estado é em memória (mock), explicitamente temporário, a ser substituído por API numa feature futura. Nenhuma regra de negócio definitiva reside no frontend além da orquestração mock. ✅ (ver Complexity Tracking)
- [x] **Persistência Orientada a Documentos (V)**: Nenhuma persistência nesta feature; quando migrar para backend, seguirá MongoDB.Driver. Sem violação. ✅
- [x] **Restrições de Arquitetura**: Sem EF/ORM (não há backend); sem lógica em controllers (não há controllers); serviço via injeção de dependência (sem singleton mutable manual); Tailwind via build; componentes reutilizáveis extraídos em vez de duplicar HTML. ✅

**Resultado**: PASS. Única nota registrada em Complexity Tracking (estado mock em memória vs. API-first).

## Project Structure

### Documentation (this feature)

```text
specs/019-training-config-crud/
├── plan.md              # Este arquivo
├── spec.md              # Especificação da feature
├── research.md          # Phase 0 — decisões técnicas
├── data-model.md        # Phase 1 — modelo de entidades (frontend)
├── quickstart.md        # Phase 1 — roteiro de validação manual
├── contracts/
│   └── training-config-service.md  # Contrato do serviço/UI (não há API REST)
└── checklists/
    └── requirements.md  # Checklist de qualidade da spec
```

### Source Code (repository root)

```text
src/frontend/src/app/
├── pages/
│   ├── training/                        # EXISTENTE — adicionar botão "Configurações"
│   │   ├── training.component.ts        # extrair MOMENTOS/PRINCIPIOS_GRUPOS p/ serviço
│   │   └── training.component.html      # botão secundário ao lado de "Novo Treino"
│   └── training-config/                 # NOVO — página de configuração (admin-only)
│       ├── training-config.component.ts
│       ├── training-config.component.html
│       └── training-config.component.css
├── services/
│   └── training-config.service.ts       # NOVO — estado mock em memória (fonte única)
├── models/
│   └── training-config.model.ts         # NOVO — Momento, PrincipioGrupo, ItemTrabalhado, VinculoMomentoPrincipio
└── app.routes.ts                        # NOVO rota /training-config (authGuard + papel Administrador)
```

**Structure Decision**: Web app — frontend Angular existente em `src/frontend/`. A feature adiciona uma página (`pages/training-config/`), um serviço (`services/training-config.service.ts`) e um model (`models/training-config.model.ts`), além de ajustar `pages/training/` e `app.routes.ts`. Segue a nomenclatura da constituição (kebab-case component/service/model). Nenhuma mudança no `backend/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Estado em memória no frontend (mock) em vez de API-first (Princípio IV) | Instrução explícita do usuário: "Por enquanto todos os dados serão mocados". Entrega a UI/UX completa do CRUD antes de investir no backend. | Implementar backend agora contrariaria a instrução do usuário e adiaria a validação de UX. A constituição já prevê estado local como camada de transição temporária, a ser substituída por API em feature futura. |
