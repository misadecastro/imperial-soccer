---
description: "Task list for CRUD de Configuração de Itens de Treino"
---

# Tasks: CRUD de Configuração de Itens de Treino

**Input**: Design documents from `/specs/019-training-config-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/training-config-service.md, quickstart.md

**Tests**: Não solicitados — consistente com o padrão frontend-only do projeto (validação manual via quickstart.md). Nenhuma task de teste automatizado incluída.

**Organization**: Tasks agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: US1, US2, US3
- Caminhos de arquivo absolutos a partir de `src/frontend/src/app/`

## Path Conventions

Frontend Angular existente em `src/frontend/`. Novos artefatos:
- Model: `src/frontend/src/app/models/training-config.model.ts`
- Service: `src/frontend/src/app/services/training-config.service.ts`
- Página: `src/frontend/src/app/pages/training-config/`
- Ajustes: `src/frontend/src/app/pages/training/`, `src/frontend/src/app/app.routes.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definir o contrato de dados que todo o restante depende

- [X] T001 [P] Criar interfaces TypeScript em `src/frontend/src/app/models/training-config.model.ts`: `ItemTrabalhado` (`id`, `label`), `PrincipioGrupo` (`id`, `titulo`, `filtro?`, `itens: ItemTrabalhado[]`), `VinculoMomentoPrincipio` (`grupoId`, `itemIds: string[]`), `Momento` (`id`, `label`, `desc?`, `tipo?`, `vinculos: VinculoMomentoPrincipio[]`), conforme data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Serviço singleton com estado seed em memória — fonte única para todas as user stories

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase

- [X] T002 Criar `TrainingConfigService` (`providedIn: 'root'`) em `src/frontend/src/app/services/training-config.service.ts` com estado em memória `grupos: PrincipioGrupo[]` e `momentos: Momento[]`, inicializado com o seed mockado (4 momentos + 3 grupos com todos os itens, ids = slugs atuais) extraído de `MOMENTOS`/`PRINCIPIOS_GRUPOS` de `pages/training/training.component.ts`; expor acesso somente-leitura à UI (FR-013, FR-014)
- [X] T003 Refatorar `src/frontend/src/app/pages/training/training.component.ts` para consumir `momentos`/`principiosGrupos` do `TrainingConfigService` (remover as constantes locais `MOMENTOS`/`PRINCIPIOS_GRUPOS`, injetar o serviço), preservando o comportamento atual da tela de montagem de treino (research Decisão 2)

**Checkpoint**: Serviço e model prontos; tela de treino existente continua funcionando lendo do serviço

---

## Phase 3: User Story 1 - Acessar a tela de configuração de treino (Priority: P1) 🎯 MVP

**Goal**: Administrador vê o botão "Configurações" (secundário) ao lado de "Novo Treino" e chega a uma tela que exibe os itens de configuração pré-carregados (seed)

**Independent Test**: Logar como Administrador → botão "Configurações" visível à direita de "Novo Treino" com menor destaque → clicar → tela `/training-config` abre com 4 momentos e 3 grupos listados. Logar como Professor → botão ausente e URL direta redireciona.

### Implementation for User Story 1

- [X] T004 [US1] Registrar rota `training-config` em `src/frontend/src/app/app.routes.ts` com `canActivate: [authGuard]` e `data: { papel: 'Administrador' }` (FR-004)
- [X] T005 [US1] Criar shell da página em `src/frontend/src/app/pages/training-config/training-config.component.ts` + `.html` + `.css` (standalone, `CommonModule`+`FormsModule`, injeta `TrainingConfigService` e `AuthService`), exibindo em modo leitura as duas seções (Princípios/Fundamentos com seus itens; Momentos do Jogo) a partir do seed — prova FR-013
- [X] T006 [US1] Adicionar botão secundário "Configurações" com `*ngIf="authService.isAdmin()"` imediatamente à direita de "Novo Treino" em `src/frontend/src/app/pages/training/training.component.html`, com `routerLink="/training-config"` e estilo de menor destaque (outline/neutro vs. verde sólido) — FR-001, FR-002, FR-003; garantir `RouterLink` importado no componente de treino

**Checkpoint**: US1 funcional — acesso admin-only e seed visível de forma independente

---

## Phase 4: User Story 2 - Gerenciar Princípios e Fundamentos com Itens Trabalhados (Priority: P1)

**Goal**: Administrador cria/edita/remove grupos de Princípios/Fundamentos e, dentro de cada, cria/edita/remove Itens Trabalhados

**Independent Test**: Na tela, criar grupo → adicionar 2 itens → renomear 1 item → remover 1 item → remover o grupo; validar nome vazio e duplicado; confirmar que cada operação reflete imediatamente.

### Implementation for User Story 2

- [X] T007 [US2] Adicionar ao `TrainingConfigService` os métodos de grupo `criarGrupo(titulo, filtro?)`, `renomearGrupo(grupoId, titulo)`, `removerGrupo(grupoId)` com validação de nome não vazio (RI-4/FR-010) e único entre grupos (RI-3/FR-011), gerando `id` via `crypto.randomUUID()`; `removerGrupo` também remove vínculos órfãos daquele `grupoId` em todos os momentos (RI-1/FR-012)
- [X] T008 [US2] Adicionar ao `TrainingConfigService` os métodos de item `adicionarItem(grupoId, label)`, `renomearItem(grupoId, itemId, label)`, `removerItem(grupoId, itemId)` com validação (não vazio, único no grupo); `removerItem` remove o `itemId` de todos os `itemIds` de vínculos (RI-2/FR-012)
- [X] T009 [US2] Construir a seção "Princípios e Fundamentos" em `pages/training-config/training-config.component.ts`/`.html`: formulário para novo grupo, lista de grupos com edição inline do título e exclusão, e por grupo o formulário/lista de Itens Trabalhados (adicionar/editar/remover), usando `window.confirm` nas exclusões
- [X] T010 [US2] Exibir feedback de sucesso (toast, padrão do TrainingComponent) e mensagens de erro de validação (nome vazio/duplicado) na seção de Princípios/Fundamentos (FR-015)

**Checkpoint**: US1 + US2 funcionais de forma independente

---

## Phase 5: User Story 3 - Gerenciar Momentos do Jogo e seus vínculos (Priority: P2)

**Goal**: Administrador cria/edita/remove Momentos do Jogo e, por momento, vincula Princípios/Fundamentos e seleciona os Itens Trabalhados de cada vínculo

**Independent Test**: Com grupos/itens existentes, criar momento → vincular 2 princípios → marcar itens em cada vínculo → editar nome do momento → desvincular um princípio → remover o momento; validar nome vazio/duplicado; verificar cascata ao remover um grupo/item que estava vinculado.

### Implementation for User Story 3

- [X] T011 [US3] Adicionar ao `TrainingConfigService` os métodos de momento `criarMomento(label, tipo?, desc?)`, `renomearMomento(momentoId, label)`, `removerMomento(momentoId)` com validação (não vazio, único entre momentos — RI-3/RI-4), gerando `id` via `crypto.randomUUID()`, iniciando `vinculos: []`
- [X] T012 [US3] Adicionar ao `TrainingConfigService` os métodos de vínculo `vincularPrincipio(momentoId, grupoId)` (idempotente, `itemIds: []`), `desvincularPrincipio(momentoId, grupoId)` e `toggleItemVinculo(momentoId, grupoId, itemId)` (FR-008, FR-009)
- [X] T013 [US3] Construir a seção "Momentos do Jogo" em `pages/training-config/training-config.component.ts`/`.html`: formulário para novo momento, lista com edição inline/exclusão, e por momento a UI de vincular Princípios/Fundamentos (multi-seleção) e, por vínculo, seleção (checkboxes) dos Itens Trabalhados do grupo
- [X] T014 [US3] Exibir feedback de sucesso e mensagens de validação na seção de Momentos (FR-015); confirmar visualmente que a cascata (T007/T008) remove vínculos/itens órfãos da UI dos momentos

**Checkpoint**: Todas as user stories funcionais e independentes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação final e consistência

- [X] T015 [P] Verificar responsividade/consistência visual da tela com o restante do app (Tailwind, cabeçalho/nav) e ajustar estilos em `pages/training-config/training-config.component.css` se necessário
- [X] T016 Rodar `cd src/frontend && ng build` e corrigir eventuais erros de tipo (tsconfig `strict: true`)
- [ ] T017 Executar o roteiro de validação manual de `specs/019-training-config-crud/quickstart.md` (17 cenários, incluindo gate admin, seed, CRUD, cascata e reset ao recarregar)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode iniciar imediatamente
- **Foundational (Phase 2)**: depende do Setup — **BLOQUEIA** todas as user stories
- **User Stories (Phase 3–5)**: dependem do Foundational
  - US1 é o MVP (acesso + seed)
  - US2 e US3 dependem do serviço (Phase 2); US3 é mais valiosa com US2 já feita (precisa de grupos para vincular), mas ambas são independentemente testáveis
- **Polish (Phase 6)**: depende das user stories desejadas concluídas

### User Story Dependencies

- **US1 (P1)**: após Foundational — sem dependência de outras stories
- **US2 (P1)**: após Foundational — usa a página criada em US1 (T005); os métodos de serviço (T007/T008) são independentes
- **US3 (P2)**: após Foundational — usa a página (US1); funcionalmente mais rica com grupos de US2, mas testável isolada

### Within Each User Story

- Métodos de serviço antes da UI que os consome
- Um bloco de UI antes do feedback/validação visual desse bloco

### Parallel Opportunities

- T001 (model) é [P] no Setup
- Dentro de US2: T007 e T008 tocam o mesmo arquivo de serviço → **não** paralelizar entre si; a UI (T009) vem depois
- Dentro de US3: T011 e T012 tocam o mesmo serviço → sequenciais
- T015 (polish visual) é [P]
- Com múltiplos desenvolvedores: após Phase 2, US1/US2/US3 podem ser divididas (US2 e US3 compartilham o arquivo de serviço e o componente da página — coordenar edições)

---

## Parallel Example: Setup

```bash
# T001 pode rodar isolado; é o único [P] antes do serviço
Task: "Criar interfaces em models/training-config.model.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (model)
2. Phase 2: Foundational (serviço + seed + refactor da tela de treino)
3. Phase 3: US1 (botão + rota + shell com seed)
4. **PARAR e VALIDAR**: acesso admin-only + seed visível
5. Demo do MVP

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → testar → demo (MVP)
3. US2 → testar → demo (CRUD de princípios/itens)
4. US3 → testar → demo (momentos + vínculos)
5. Polish → build + quickstart

---

## Notes

- [P] = arquivos diferentes, sem dependências
- Feature **frontend-only, dados mockados** — sem backend, sem MongoDB, sem HttpClient
- US2 e US3 editam o mesmo `training-config.service.ts` e `training-config.component` → evitar conflitos de edição no mesmo arquivo
- Commit após cada task ou grupo lógico
- Parar em qualquer checkpoint para validar a story isolada
