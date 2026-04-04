# Research: Student Registration and Evaluation (Mock)

**Feature**: 002-student-register-eval  
**Date**: 2026-04-04  
**Status**: Complete — no NEEDS CLARIFICATION items remaining

---

## Decision 1: Scope da implementação (Mock vs. Full Stack)

**Decision**: Implementar como página frontend mock (sem backend real).

**Rationale**: A spec define explicitamente "página mockada para validar essa funcionalidade". O objetivo é validação do fluxo com o professor antes de construir a integração real com .NET backend + MongoDB.

**Alternatives considered**:
- Full stack desde o início — rejeitado; aumenta o custo de ciclos de feedback antes da validação do UX.
- Storybook/componentes isolados — rejeitado; a stack não usa frameworks e o projeto é simples o suficiente para uma página HTML direta.

---

## Decision 2: Persistência dos dados no mock

**Decision**: Dados armazenados em array JavaScript em memória (`window`-scoped), sem localStorage.

**Rationale**: Os dados de validação são efêmeros por definição. Usar `localStorage` adicionaria complexidade desnecessária sem valor para o objetivo de validação. A perda dos dados ao recarregar a página é comportamento aceitável e esperado no mock.

**Alternatives considered**:
- `localStorage` para persistência entre sessões — rejeitado; fora do escopo do mock.
- `IndexedDB` — rejeitado; complexidade incompatível com o objetivo de simplicidade (Princípio I da Constituição).

---

## Decision 3: Estrutura da página mock

**Decision**: Página única (`frontend/pages/students.html`) com três seções: formulário de cadastro, área de filtros + listagem, e modal de avaliação.

**Rationale**: O professor precisa de acesso imediato aos três fluxos sem navegação adicional. Uma única página minimiza cliques (Princípio II da Constituição). A separação por seções mantém o layout claro e testável.

**Alternatives considered**:
- Múltiplas páginas (cadastro / listagem / avaliação) — rejeitado; aumenta navegação sem benefício.
- SPA com roteamento — rejeitado; não é necessário e adiciona complexidade proibida pela Constituição.

---

## Decision 4: UI pattern para seleção de nota

**Decision**: Radio buttons estilizados com Tailwind CSS para cada aspecto (Técnico, Tático, Mental), agrupados visualmente com as quatro opções de nota.

**Rationale**: Radio buttons garantem seleção exclusiva por aspecto (apenas uma nota por dimensão), são nativamente acessíveis, e exigem zero JavaScript para controle de estado. Tailwind permite estilização visual clara.

**Alternatives considered**:
- `<select>` dropdown — rejeitado; radio buttons são mais rápidos de usar em campo (menos cliques, visibilidade imediata das opções).
- Cards clicáveis com JS toggle — rejeitado; complexidade maior, semântica de formulário inferior.

---

## Decision 5: Filtros em tempo real vs. botão de busca

**Decision**: Filtros aplicados em tempo real (`input` + `change` events), sem botão de confirmar.

**Rationale**: SC-005 define que "os filtros respondem imediatamente à interação". Tempo real é a implementação direta desse critério e elimina um clique desnecessário.

**Alternatives considered**:
- Botão "Filtrar" — rejeitado; contrário ao critério de sucesso SC-005.

---

## Decision 6: Contratos de API para futura integração

**Decision**: Documentar os contratos REST planejados em `/contracts/` usando o padrão da Constituição (envelope `{ success, data, message, errors }`, versionamento `/api/v1/`), mesmo que não implementados no mock.

**Rationale**: Definir os contratos agora evita retrabalho de design quando o backend .NET for implementado. O mock pode ser refatorado para consumir a API real com mudanças mínimas.

**Alternatives considered**:
- Adiar contratos até a feature de backend — rejeitado; o modelo de dados é estável o suficiente para documentar agora.
