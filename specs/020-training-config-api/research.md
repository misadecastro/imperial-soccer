# Phase 0 — Research: Configuração de Treino com Persistência Real

Todas as incógnitas do Technical Context foram resolvidas por precedente direto nas features 016–019 do próprio projeto. Nenhum `NEEDS CLARIFICATION` permaneceu.

## Decisão 1 — Modelagem: duas coleções com filhos embutidos

**Decisão**: Duas coleções MongoDB: `training_principles` (raiz `PrincipioGrupo`, embutindo `ItemTrabalhado[]`) e `game_moments` (raiz `Momento`, embutindo `VinculoMomentoPrincipio[]`). Vínculos referenciam Princípios e Itens por `id` string.

**Rationale**: Princípio V da constituição — embeddings quando os dados são sempre acessados juntos. Um Item nunca é consultado fora do seu Princípio; um Vínculo nunca fora do seu Momento. Já Momentos e Princípios têm ciclo de vida independente (um pode existir sem o outro) → coleções separadas, ligadas por referência de id dentro do vínculo. Espelha o par "Aluno embute ficha / Avaliação em coleção própria" já adotado.

**Alternativas rejeitadas**:
- Coleção única com um documento "config" gigante: dificultaria updates concorrentes e cresce sem limite claro; menos idiomático para o driver.
- Itens/Vínculos em coleções próprias com referências: over-engineering (Princípio I) — nunca são acessados isoladamente.

## Decisão 2 — Identificadores: gerados pelo backend, mantendo os slugs do seed

**Decisão**: `Id` string gerado por `Guid.NewGuid().ToString()` para entidades criadas via API (padrão de `Avaliacao`/`Aluno`). Os documentos **semeados** mantêm os ids-slug atuais da feature 019 (`org_ofensiva`, `principios_ofensivos`, `espaco_com_bola`, etc.) para estabilidade e legibilidade.

**Rationale**: Consistência com o backend existente (ids string, não `ObjectId` exposto). Preservar os slugs no seed evita quebrar qualquer referência mental/documental e mantém o vínculo entre momentos e princípios semeados previsível.

**Alternativas rejeitadas**: `ObjectId` nativo exposto na API — o projeto padronizou `string` GUID em `Aluno`/`Avaliacao`; manter uniformidade.

## Decisão 3 — Granularidade dos endpoints

**Decisão**: Endpoints REST espelhando as operações da UI da feature 019, com sub-recursos embutidos:
- Princípios: `POST/PUT/DELETE /training-principles[/{id}]`; itens como sub-recurso `POST /training-principles/{id}/items`, `PUT/DELETE .../items/{itemId}`.
- Momentos: `POST/PUT/DELETE /game-moments[/{id}]`; vínculos por **substituição em bloco** `PUT /game-moments/{id}/vinculos` (recebe o array completo de vínculos).

**Rationale**: A UI de princípios/itens é fina (adicionar/renomear/remover item individual) → sub-recursos REST naturais. A UI de momentos usa **rascunho** (o form monta `formVinculos` e só grava no "Salvar") → um `PUT` que substitui todo o array de vínculos casa perfeitamente com esse fluxo e é atômico. Evita uma proliferação de endpoints de vincular/desvincular/toggle-item que o frontend não usa mais desde a refatoração para o padrão de rascunho.

**Alternativas rejeitadas**:
- Endpoints granulares `POST/DELETE .../vinculos/{grupoId}` e toggle de item: o frontend (form com rascunho) não precisa deles; adicionaria superfície sem uso (Princípio I).
- `PUT` do documento inteiro do princípio (com itens) para toda alteração de item: perde validação/erros específicos por item e complica o mapeamento de mensagens de erro na UI.

## Decisão 4 — Autorização: leitura autenticada, escrita admin-only

**Decisão**: Controllers com `[Authorize]` no GET (qualquer usuário autenticado) e `[Authorize(Roles = Roles.Administrador)]` nos POST/PUT/DELETE.

**Rationale**: A tela de montagem de treino é usada por professores (Princípio II) → precisam **ler** a config. A edição da config é privilégio do Administrador (gate já estabelecido na feature 019, tanto na UI quanto na rota). O atributo por-método reproduz o mesmo modelo já usado (`UsersController` inteiro é admin-only; aqui é misto por método).

**Alternativas rejeitadas**: Controller inteiro admin-only — quebraria a leitura pelo professor. Leitura anônima — viola FR-011 (autenticação em todas as operações).

## Decisão 5 — Cascata / integridade referencial no backend

**Decisão**: No `DELETE /training-principles/{id}`, após remover o princípio, atualizar todos os `game_moments` removendo vínculos cujo `grupoId` == id (FR-006). No `DELETE .../items/{itemId}`, remover esse `itemId` de todos os `itemIds` de vínculos daquele grupo em todos os momentos (FR-007). Na leitura de momentos, ignorar vínculos a princípios/itens inexistentes (robustez).

**Rationale**: Move para o servidor a mesma lógica de integridade que a feature 019 fazia em memória (RI-1/RI-2), agora como fonte da verdade compartilhada. Operações `UpdateMany` do driver resolvem em uma chamada.

**Alternativas rejeitadas**: Deixar a limpeza para o frontend — inconsistente entre clientes e viola SC-005. Bloquear a remoção enquanto houver vínculos — pior UX; a UI da 019 já assume cascata.

## Decisão 6 — Seed idempotente no startup

**Decisão**: `TrainingConfigSeedService` registrado como `Scoped` e executado em um escopo no startup (igual a `AdminSeedService`). Se `training_principles` estiver vazia, insere os 3 princípios padrão com itens; se `game_moments` estiver vazia, insere os 4 momentos padrão. Verificações independentes por coleção.

**Rationale**: FR-012/SC-006 — instalação nova precisa da config padrão sem intervenção. Idempotência por checagem de coleção vazia evita duplicar em reinícios, exatamente como o seed do admin.

**Alternativas rejeitadas**: Seed via script externo/migração — o projeto não tem infraestrutura de migração; o padrão estabelecido é seed no startup. Semear sempre (upsert por id) — aceitável, mas "inserir só se vazia" é mais simples e não sobrescreve edições do admin.

## Decisão 7 — Integração frontend: HttpClient + cache em memória

**Decisão**: Refatorar `TrainingConfigService` para injetar `HttpClient`, manter `_grupos`/`_momentos` como **cache** populado por um método `carregar(): Observable<void>` (dois GETs), expor os getters `grupos`/`momentos` já existentes (templates inalterados) e transformar cada mutação em método que retorna `Observable`, atualizando o cache no `tap`. Componentes (`training-config` e `training`) chamam `carregar()` no `ngOnInit` e assinam as mutações, exibindo toast no sucesso/erro.

**Rationale**: Espelha `evaluations.service.ts` (cache em memória alimentado pela API, sem `sessionStorage`). Preservar os getters minimiza mudanças de template. O fluxo de rascunho de vínculos do form de momento mapeia para o `PUT .../vinculos` em bloco.

**Alternativas rejeitadas**: Signals/Store dedicado — o projeto não usa; adicionaria conceito novo sem necessidade (Princípio I). Manter métodos síncronos e disparar HTTP "fire-and-forget" — perderia tratamento de erro e consistência do cache.

## Decisão 8 — Escopo de testes

**Decisão**: Testes de backend xUnit focados nas regras não triviais: validação (nome vazio/duplicado) e cascata (remoção de princípio/item limpando vínculos), no padrão dos testes existentes (contra MongoDB real, banco dedicado). Validação de integração ponta-a-ponta via quickstart.md manual. Sem testes de frontend (não há suíte de testes Angular no projeto).

**Rationale**: Alinha ao que já existe (`AdminSeedServiceTests`, testes de store) — cobrir a lógica de maior risco (cascata) sem introduzir framework de teste de UI inexistente.

**Alternativas rejeitadas**: Suíte de testes E2E/Angular — fora do padrão atual do projeto; custo desproporcional (Princípio I).
