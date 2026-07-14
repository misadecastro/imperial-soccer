# Research: CRUD de Configuração de Itens de Treino

**Branch**: `019-training-config-crud` | **Date**: 2026-07-13

## Decisão 1 — Persistência: estado mock em memória via serviço singleton

- **Decision**: Manter os dados de configuração em um serviço Angular `TrainingConfigService` (`providedIn: 'root'`), com o estado inicial mockado a partir das constantes hoje fixas. **Sem** `sessionStorage`, **sem** backend, **sem** `HttpClient`.
- **Rationale**: Instrução explícita do usuário ("Por enquanto todos os dados serão mocados"). Um singleton `providedIn: 'root'` mantém os dados vivos durante a navegação entre `/training` e `/training-config` dentro da mesma sessão do SPA, sem exigir serialização. A perda ao recarregar é aceita (FR-014).
- **Alternatives considered**:
  - `sessionStorage` (chave `imperialState`): rejeitado — adicionaria persistência entre reloads que o usuário não pediu e misturaria dados de configuração ao `imperialState` de domínio, sem ganho nesta fase.
  - Backend + MongoDB agora: rejeitado — contraria a instrução do usuário e adia a validação da UX.

## Decisão 2 — Fonte única dos dados fixos: extrair constantes para o serviço

- **Decision**: Mover os dados `MOMENTOS` e `PRINCIPIOS_GRUPOS` de [training.component.ts](../../src/frontend/src/app/pages/training/training.component.ts) para o `TrainingConfigService` como estado inicial (seed). O `TrainingComponent` passa a ler do serviço.
- **Rationale**: Evita duplicação (Restrição de Arquitetura: proibido duplicar lógica quando dá para reutilizar). Torna o serviço a fonte única, preparando terreno para uma futura migração a API sem novo refactor grande.
- **Alternatives considered**:
  - Copiar as constantes para a nova tela e deixar o `TrainingComponent` intocado: rejeitado — duplicação de dados, divergência futura garantida.
  - Manter as constantes no componente e a nova tela importá-las: rejeitado — o CRUD precisa de estado mutável compartilhado, não de constantes `readonly`.

## Decisão 3 — Controle de acesso (admin-only)

- **Decision**: Gate duplo, reutilizando o mecanismo existente: (a) botão "Configurações" visível só com `*ngIf="authService.isAdmin()"` no `TrainingComponent`; (b) rota `/training-config` protegida por `authGuard` com `data: { papel: 'Administrador' }` (mesmo padrão de `/users`).
- **Rationale**: Reutiliza infraestrutura testada da feature 016. Gate de UI melhora UX; gate de rota impede acesso direto por URL.
- **Alternatives considered**: Só gate de UI: rejeitado — usuário não-admin poderia navegar direto para `/training-config` pela URL.

## Decisão 4 — Modelo de dados: estrutura estendida a partir das constantes atuais

- **Decision**: Reaproveitar a forma atual (`Momento` com `id/label/desc/tipo`; `PrincipioGrupo` com `titulo/filtro/itens[]`; `PrincipioItem` com `id/label`) e estender o `Momento` com uma lista de **vínculos** (`vinculos: VinculoMomentoPrincipio[]`), cada vínculo referenciando um `grupoId` (princípio) e a seleção de `itemIds[]`.
- **Rationale**: Minimiza divergência do que já existe e cobre o requisito de "para cada momento vincular princípios e, por princípio, selecionar itens" (FR-008, FR-009). IDs gerados via `crypto.randomUUID()` para novos itens criados pelo Administrador (o mesmo já usado em `getOrCreateChamada`).
- **Alternatives considered**: Tabela de junção separada (lista global de vínculos): rejeitado — mais complexo que embutir os vínculos no próprio momento, e o acesso é sempre "momento → seus vínculos" (embedding preferido, Princípio V por analogia).

## Decisão 5 — Integridade referencial (remoção em cascata no mock)

- **Decision**: Ao remover um grupo de princípio ou um item, o serviço percorre os momentos e remove vínculos/itens órfãos correspondentes (FR-012), tudo em memória.
- **Rationale**: Evita referências quebradas na UI de momentos. Barato em memória; garante consistência visual (SC-004).
- **Alternatives considered**: Bloquear remoção enquanto houver vínculo: rejeitado — mais atrito para o Administrador; a cascata é o comportamento esperado descrito nos edge cases da spec.

## Decisão 6 — UI: página única com duas seções + componentes reutilizáveis

- **Decision**: Uma página `TrainingConfigComponent` com duas seções (Princípios/Fundamentos e Momentos do Jogo). Formulários inline com `FormsModule` (ngModel), toasts de feedback e `window.confirm` para exclusões — reaproveitando os padrões visuais já usados no `TrainingComponent`. Extrair componente reutilizável apenas se um bloco repetir (ex.: editor de item inline).
- **Rationale**: Consistência com o restante do app; menor curva para o operador (Princípio II). Evita superengenharia (Princípio I).
- **Alternatives considered**: Duas rotas separadas (uma por seção): rejeitado — o usuário descreveu "nessa tela" (uma tela) para ambas as capacidades.

## Resumo

Nenhum item `NEEDS CLARIFICATION` permanece. Feature 100% frontend, estado mock em memória num serviço singleton, gate admin duplo reutilizando infra existente, dados iniciais extraídos das constantes atuais de treino.
