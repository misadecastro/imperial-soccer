# Contrato: TrainingConfigService (frontend, em memória)

**Branch**: `019-training-config-crud` | **Date**: 2026-07-13

Não há API REST nesta feature (dados mockados). O "contrato" é a interface pública do serviço Angular `TrainingConfigService` (`providedIn: 'root'`), fonte única do estado de configuração de treino em memória. Todas as operações são síncronas e refletem imediatamente na UI (SC-004).

## Estado exposto

```ts
readonly grupos: PrincipioGrupo[];   // leitura para a UI (via getter/campo)
readonly momentos: Momento[];        // leitura para a UI (via getter/campo)
```

Inicializado com o seed mockado (ver data-model.md). Sem persistência entre reloads.

## Operações — Princípios e Fundamentos

| Método | Assinatura | Comportamento | Erros |
|--------|------------|---------------|-------|
| Criar grupo | `criarGrupo(titulo: string, filtro?): PrincipioGrupo` | Adiciona grupo com `itens: []`. | `titulo` vazio (RI-4) ou duplicado (RI-3) → lança erro / retorna resultado inválido. |
| Renomear grupo | `renomearGrupo(grupoId, titulo): void` | Atualiza `titulo`. | Vazio/duplicado. |
| Remover grupo | `removerGrupo(grupoId): void` | Remove grupo **e** todos os vínculos a ele nos momentos (RI-1). | Grupo inexistente ignorado. |
| Adicionar item | `adicionarItem(grupoId, label): ItemTrabalhado` | Adiciona item ao grupo. | `label` vazio ou duplicado no grupo. |
| Renomear item | `renomearItem(grupoId, itemId, label): void` | Atualiza `label`. | Vazio/duplicado. |
| Remover item | `removerItem(grupoId, itemId): void` | Remove item **e** seu `id` de todos os `itemIds` de vínculos (RI-2). | Item inexistente ignorado. |

## Operações — Momentos do Jogo

| Método | Assinatura | Comportamento | Erros |
|--------|------------|---------------|-------|
| Criar momento | `criarMomento(label: string, tipo?, desc?): Momento` | Adiciona momento com `vinculos: []`. | `label` vazio ou duplicado. |
| Renomear momento | `renomearMomento(momentoId, label): void` | Atualiza `label`. | Vazio/duplicado. |
| Remover momento | `removerMomento(momentoId): void` | Remove o momento e seus vínculos. | Inexistente ignorado. |
| Vincular princípio | `vincularPrincipio(momentoId, grupoId): void` | Adiciona `VinculoMomentoPrincipio` com `itemIds: []` se ainda não vinculado. | `grupoId` inexistente. |
| Desvincular princípio | `desvincularPrincipio(momentoId, grupoId): void` | Remove o vínculo do momento. | Inexistente ignorado. |
| Alternar item no vínculo | `toggleItemVinculo(momentoId, grupoId, itemId): void` | Adiciona/remove `itemId` de `itemIds` do vínculo. | Vínculo inexistente. |

## Contrato de UI

- **Botão "Configurações"** (`/training`): renderizado apenas quando `authService.isAdmin()` é verdadeiro; posicionado imediatamente à direita de "Novo Treino"; estilo **secundário** (menor destaque — ex.: outline/neutro vs. verde sólido preenchido). Navega para `/training-config`.
- **Rota `/training-config`**: protegida por `authGuard` com `data: { papel: 'Administrador' }`. Acesso direto por URL sem papel Administrador redireciona (comportamento do guard existente → `/students`).
- **Feedback**: sucesso via toast; erros de validação (nome vazio/duplicado) exibidos inline ou via toast de erro; exclusões confirmadas via `window.confirm`.

## Validações (mapeadas a FR)

- Nome não vazio → FR-010 (RI-4).
- Nome único no escopo → FR-011 (RI-3).
- Cascata na remoção → FR-012 (RI-1, RI-2).
- Seed mockado carregado na inicialização → FR-013.
- Sem persistência backend → FR-014.
