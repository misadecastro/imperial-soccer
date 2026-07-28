# Feature Specification: Selecionar Todos os Alunos no Cadastro de Jogo

**Feature Branch**: `013-select-all-students`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Vamos fazer uma melhoria na página Games, na opção de adicionar alunos, adicione uma opção de selecionar todos na lista de alunos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecionar todos os alunos visíveis de uma vez (Priority: P1)

Ao cadastrar ou editar um jogo, o treinador abre o painel "Adicionar Alunos" e precisa marcar rapidamente um conjunto grande de alunos (por exemplo, toda uma categoria) sem ter que clicar em cada checkbox individualmente. Com uma opção de "Selecionar todos", o treinador marca de uma só vez todos os alunos elegíveis exibidos na lista no momento, considerando os filtros de nome e categoria já aplicados.

**Why this priority**: É o núcleo do pedido do usuário e o ganho de produtividade mais imediato — convocações típicas envolvem selecionar a maioria dos alunos de uma categoria, o que hoje exige um clique por aluno e gera atrito significativo no fluxo de cadastro.

**Independent Test**: Pode ser totalmente testado abrindo o formulário de novo jogo, clicando em "Adicionar Alunos", marcando "Selecionar todos" e confirmando que todos os alunos elegíveis da lista são adicionados como participantes ao confirmar a seleção. Entrega valor isolado mesmo sem as histórias seguintes.

**Acceptance Scenarios**:

1. **Given** o painel "Adicionar Alunos" está aberto e existem alunos cadastrados que ainda não foram adicionados ao jogo, **When** o usuário ativa a opção "Selecionar todos", **Then** todos os alunos elegíveis (não-desabilitados) exibidos na lista são marcados.
2. **Given** "Selecionar todos" está ativado e todos os alunos elegíveis estão marcados, **When** o usuário desativa a opção "Selecionar todos", **Then** todos os alunos visíveis na lista são desmarcados.
3. **Given** o usuário ativou "Selecionar todos" e em seguida confirmou a seleção, **When** o painel é fechado, **Then** todos os alunos marcados aparecem na lista de participações do jogo, prontos para ter os minutos preenchidos.

---

### User Story 2 - Selecionar todos respeitando os filtros aplicados (Priority: P2)

Ao usar a opção "Selecionar todos" em conjunto com os filtros existentes (busca por nome e filtro por categoria), o treinador consegue selecionar rapidamente apenas o subconjunto de alunos visíveis — por exemplo, "todos os Sub11" — sem afetar alunos que estão fora do filtro corrente.

**Why this priority**: Maximiza a utilidade da seleção em massa para o caso comum de convocar uma categoria específica, mantendo o controle e evitando que o usuário marque inadvertidamente alunos de outras categorias.

**Independent Test**: Pode ser testado aplicando um filtro de categoria, ativando "Selecionar todos" e verificando que apenas os alunos visíveis após o filtro são marcados; ao limpar o filtro, alunos de outras categorias permanecem desmarcados.

**Acceptance Scenarios**:

1. **Given** o usuário aplicou um filtro de categoria que reduziu a lista visível, **When** ativa "Selecionar todos", **Then** apenas os alunos atualmente visíveis são marcados; alunos ocultos pelo filtro permanecem desmarcados.
2. **Given** "Selecionar todos" foi ativado com um filtro aplicado e todos os alunos visíveis estão marcados, **When** o usuário altera o filtro de modo que aparecem novos alunos não marcados, **Then** o estado do controle "Selecionar todos" reflete que a seleção não cobre toda a lista visível atual (deixa de aparecer como totalmente marcado).

---

### User Story 3 - Indicação clara de seleção parcial e exclusão de alunos já adicionados (Priority: P3)

Para evitar ambiguidade, o controle "Selecionar todos" deve refletir visualmente o estado da lista (nenhum, alguns ou todos marcados) e nunca incluir alunos que já foram adicionados anteriormente ao jogo (atualmente exibidos como desabilitados na lista).

**Why this priority**: Refinamento de UX que evita confusão, mas não é estritamente necessário para o valor mínimo da feature; pode ser entregue após as histórias P1 e P2.

**Independent Test**: Pode ser testado verificando que (a) com seleção parcial o controle exibe um estado intermediário visualmente distinto de "todos" e "nenhum", e (b) alunos já adicionados ao jogo permanecem desmarcados/desabilitados mesmo após "Selecionar todos".

**Acceptance Scenarios**:

1. **Given** alguns alunos visíveis estão marcados e outros não, **When** o usuário olha o controle "Selecionar todos", **Then** ele exibe um estado de seleção parcial (indeterminado), claramente diferente dos estados "todos marcados" e "nenhum marcado".
2. **Given** existem alunos visíveis na lista que já foram adicionados ao jogo (desabilitados), **When** o usuário ativa "Selecionar todos", **Then** apenas os alunos elegíveis são marcados; os alunos já adicionados permanecem como estão e não são duplicados.
3. **Given** todos os alunos visíveis na lista já foram previamente adicionados ao jogo, **When** o usuário ativa "Selecionar todos", **Then** nenhuma nova seleção é feita e o controle não causa erro.

---

### Edge Cases

- O que acontece quando não há nenhum aluno cadastrado no sistema? O controle "Selecionar todos" deve estar oculto ou desabilitado, seguindo o mesmo padrão do botão "Adicionar Selecionados" hoje.
- O que acontece quando o filtro retorna lista vazia? O controle deve estar desabilitado ou oculto, pois não há nada para selecionar.
- E se o usuário marca "Selecionar todos", desmarca um aluno individualmente e depois muda o filtro? O estado do controle deve recalcular com base na nova lista visível.
- E se o usuário ativa "Selecionar todos" e fecha o painel sem confirmar? Nenhum aluno deve ser adicionado às participações do jogo (consistente com o comportamento atual de cancelamento).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel de seleção de alunos no formulário de jogo MUST oferecer um controle único "Selecionar todos" posicionado de forma visível acima ou junto à lista de alunos.
- **FR-002**: Ao acionar "Selecionar todos", o sistema MUST marcar todos os alunos atualmente visíveis na lista que estejam elegíveis (ou seja, ainda não adicionados como participantes do jogo).
- **FR-003**: Ao desativar "Selecionar todos" quando todos os alunos visíveis estão marcados, o sistema MUST desmarcar todos os alunos visíveis.
- **FR-004**: O controle "Selecionar todos" MUST operar apenas sobre o conjunto de alunos visíveis após a aplicação dos filtros de nome e categoria, sem afetar alunos ocultos pelos filtros.
- **FR-005**: O controle "Selecionar todos" MUST nunca marcar alunos que já foram adicionados ao jogo (atualmente exibidos como desabilitados na lista).
- **FR-006**: O sistema MUST refletir visualmente o estado do controle "Selecionar todos" em três modos: nenhum aluno visível marcado, todos os alunos visíveis elegíveis marcados, e seleção parcial (indeterminado).
- **FR-007**: Quando os filtros mudam ou o usuário altera seleções individuais, o sistema MUST recalcular e atualizar o estado visual do controle "Selecionar todos" automaticamente.
- **FR-008**: O sistema MUST esconder ou desabilitar o controle "Selecionar todos" quando não houver alunos cadastrados ou quando o filtro corrente resultar em lista vazia.
- **FR-009**: A confirmação da seleção (botão "Adicionar Selecionados") MUST continuar funcionando exatamente como hoje, agregando todos os alunos marcados — independentemente de terem sido marcados individualmente ou via "Selecionar todos" — à lista de participações.
- **FR-010**: A funcionalidade MUST estar disponível tanto na criação de um novo jogo quanto na edição de um jogo existente.

### Key Entities *(include if feature involves data)*

Esta funcionalidade não introduz novas entidades nem altera o esquema de dados existente. Ela atua apenas sobre o estado transitório de seleção da UI (alunos marcados no painel antes da confirmação) e reaproveita as entidades já modeladas: `Aluno` (cadastro existente) e `Participação` (vínculo `alunoId` + `minutos` dentro do `Jogo`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo médio para o treinador adicionar 10 ou mais alunos ao formulário de um jogo é reduzido em pelo menos 70% em comparação com a seleção individual.
- **SC-002**: Em 100% dos casos em que o usuário aciona "Selecionar todos", o conjunto de alunos resultante após a confirmação corresponde exatamente ao subconjunto visível elegível no momento da ação — sem falsos positivos (alunos fora do filtro) nem falsos negativos (alunos visíveis ignorados).
- **SC-003**: Em uma tarefa-teste de "convocar todos os alunos da categoria Sub11", pelo menos 95% dos usuários completam a ação no primeiro acesso, sem instrução adicional.
- **SC-004**: Zero ocorrências de duplicação de participantes em jogos criados após o uso de "Selecionar todos".

## Assumptions

- A funcionalidade reutiliza o painel de seleção existente em [games.html](src/frontend/pages/games.html) e os filtros já implementados (nome e categoria); nenhum redesign mais amplo do formulário de jogo está em escopo.
- O comportamento padrão é "operar sobre os itens visíveis após filtros" — interpretação consistente com convenções de interfaces de seleção em massa em listas filtráveis e com o caso de uso principal (selecionar uma categoria).
- O modelo de dados em `sessionStorage` (chave `imperialState`, campo `jogos[]`) permanece inalterado; trata-se de melhoria puramente de UX no fluxo de cadastro.
- A feature aplica-se apenas ao painel de seleção de alunos do formulário de Jogos; outras telas com listas de alunos (chamadas, avaliações etc.) não fazem parte deste escopo.
- O controle "Selecionar todos" é exibido somente quando o painel de seleção de alunos está aberto — não há atalhos de teclado ou seleção em massa fora desse contexto neste escopo.
