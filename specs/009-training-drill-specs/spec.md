# Feature Specification: Especificações do Treino

**Feature Branch**: `009-training-drill-specs`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Ajustar a tela de lançamento de treino, colocar a chamada em um botão recolhível e abaixo adicionar a parte de especificações do treino. O professor informa 4 momentos do jogo (Organização Ofensiva, Organização Defensiva, Transição Ofensiva, Transição Defensiva) e seleciona princípios/fundamentos trabalhados: Táticos Defensivos, Táticos Ofensivos e Fundamentos Técnicos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar especificações do treino (Priority: P1)

O professor acessa a tela "Treino", seleciona a data e a categoria, e abaixo da chamada (agora recolhível) encontra a seção de "Especificações do Treino". Nela, seleciona um ou mais momentos do jogo (ex.: Organização Ofensiva e Transição Defensiva) e marca os princípios e fundamentos trabalhados naquela sessão (ex.: Contenção, Passe, Mobilidade). Ao salvar o treino, todos esses dados são persistidos junto com a chamada.

**Why this priority**: As especificações do treino são o objetivo central desta feature. Sem poder registrar momentos e princípios/fundamentos, a feature não entrega valor. A chamada já existe e funciona.

**Independent Test**: Abrir a tela de Treino, selecionar data e categoria, expandir a seção de especificações, selecionar "Org. Ofensiva" como momento, marcar "Contenção" e "Passe" como princípios/fundamentos, salvar — verificar que os dados persistem e aparecem ao reabrir o treino na mesma data/categoria.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de Treino com data e categoria selecionadas, **When** ele visualiza a seção de especificações, **Then** quatro cards de momentos do jogo são exibidos: Org. Ofensiva, Org. Defensiva, Trans. Ofensiva e Trans. Defensiva, cada um com ícone e descrição breve.
2. **Given** os momentos do jogo estão visíveis, **When** o professor toca em "Org. Ofensiva", **Then** o card é destacado com borda verde e fundo diferenciado, indicando seleção ativa.
3. **Given** um ou mais momentos selecionados, **When** o professor observa a seção de princípios e fundamentos, **Then** três grupos são exibidos: "Princípios Táticos Defensivos" (5 itens), "Princípios Táticos Ofensivos" (6 itens) e "Fundamentos Técnicos" (7 itens), cada um com chips/tags selecionáveis.
4. **Given** os chips de princípios/fundamentos exibidos, **When** o professor toca em um chip (ex.: "Contenção"), **Then** o chip é destacado visualmente como selecionado e um contador de "X selecionado(s)" é atualizado.
5. **Given** momentos e princípios/fundamentos selecionados, **When** o professor clica "Salvar Treino", **Then** todos os dados (momentos, princípios, fundamentos) são persistidos junto com a chamada daquele treino e um toast de sucesso é exibido.
6. **Given** um treino salvo com especificações, **When** o professor reabre a mesma data e categoria, **Then** os momentos e princípios/fundamentos previamente selecionados aparecem destacados.

---

### User Story 2 - Chamada em seção recolhível (Priority: P1)

A chamada de presença existente é reorganizada dentro de um painel recolhível (accordion/collapsible) para que a tela de treino comporte tanto a chamada quanto as especificações sem ficar excessivamente longa. O professor pode expandir ou recolher a chamada com um toque.

**Why this priority**: A reorganização da chamada é pré-requisito visual para que as especificações caibam na tela sem degradar a experiência. Sem isso, a tela ficaria excessivamente longa e confusa.

**Independent Test**: Abrir a tela de Treino com data e categoria selecionadas — a chamada deve aparecer dentro de um painel recolhível. Clicar no cabeçalho do painel para recolher/expandir e verificar que a lista de alunos e controles são ocultados/exibidos corretamente.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de Treino com categoria selecionada, **When** a tela carrega, **Then** a seção de chamada é exibida dentro de um painel com cabeçalho clicável contendo título "Chamada" e indicador de expandir/recolher (chevron).
2. **Given** a chamada está expandida, **When** o professor toca no cabeçalho do painel, **Then** a lista de alunos e os controles (Todos Presentes/Ausentes) são recolhidos e o chevron indica estado recolhido.
3. **Given** a chamada está recolhida, **When** o professor toca no cabeçalho, **Then** a chamada é expandida novamente com todos os dados preservados.
4. **Given** a chamada recolhida, **When** o professor olha para a tela, **Then** a seção de especificações do treino é visível abaixo sem necessidade de scroll excessivo.

---

### User Story 3 - Desmarcar seleções de especificações (Priority: P2)

O professor pode desmarcar momentos e princípios/fundamentos previamente selecionados, caso tenha selecionado por engano ou queira ajustar o registro antes de salvar.

**Why this priority**: Permite correção de erros durante o preenchimento. Sem esta funcionalidade o professor teria que salvar com dados incorretos. É secundária porque o fluxo principal (selecionar e salvar) já funciona com US1.

**Independent Test**: Selecionar "Org. Ofensiva" e "Contenção", depois tocar novamente em cada um — ambos devem voltar ao estado não-selecionado e o contador deve atualizar para 0.

**Acceptance Scenarios**:

1. **Given** um momento do jogo está selecionado (destacado), **When** o professor toca novamente nele, **Then** o momento é desmarcado e volta ao estado visual neutro.
2. **Given** um chip de princípio/fundamento está selecionado, **When** o professor toca novamente nele, **Then** o chip é desmarcado e o contador de selecionados é decrementado.

---

### Edge Cases

- O que acontece se o professor salvar o treino sem selecionar nenhum momento? — Permitir. Especificações são opcionais; a chamada pode ser salva independentemente.
- O que acontece se o professor salvar sem selecionar princípios/fundamentos mas com momentos selecionados? — Permitir. Os momentos são salvos sem princípios/fundamentos associados.
- O que acontece se o professor selecionar todos os 4 momentos simultaneamente? — Permitir. A seleção de momentos é múltipla (multi-select).
- O que acontece se o professor trocar de categoria após selecionar especificações? — As especificações são vinculadas à combinação data+categoria. Ao trocar de categoria, carregar as especificações daquela nova combinação (vazias se não existirem).
- O que acontece se não houver alunos cadastrados na categoria selecionada? — A chamada exibe mensagem de "Nenhum aluno", mas as especificações ainda devem ser acessíveis e funcionais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE reorganizar a chamada de presença dentro de um painel recolhível (collapsible) com cabeçalho clicável.
- **FR-002**: O painel de chamada DEVE manter a funcionalidade completa existente (lista de alunos, botões Presente/Falta, Todos Presentes/Todos Ausentes, contadores) ao ser expandido.
- **FR-003**: O sistema DEVE exibir uma seção "Especificações do Treino" abaixo do painel de chamada.
- **FR-004**: A seção de especificações DEVE apresentar 4 cards de "Momento do Jogo" em grid 2x2: Organização Ofensiva, Organização Defensiva, Transição Ofensiva, Transição Defensiva.
- **FR-005**: Cada card de momento DEVE exibir um ícone, o nome abreviado e uma descrição curta do momento.
- **FR-006**: Os momentos do jogo DEVEM ser multi-selecionáveis (toggle on/off ao tocar).
- **FR-007**: O momento selecionado DEVE ser visualmente diferenciado (borda verde, fundo destacado) conforme o protótipo.
- **FR-008**: Abaixo dos momentos, o sistema DEVE exibir a seção "Princípios e fundamentos trabalhados" com um contador de "X selecionado(s)".
- **FR-009**: Os princípios e fundamentos DEVEM ser organizados em 3 grupos com chips/tags selecionáveis:
  - **Princípios Táticos Defensivos**: Contenção, Cobertura Defensiva, Unidade Defensiva, Concentração, Equilíbrio (5 itens).
  - **Princípios Táticos Ofensivos**: Espaço sem Bola, Espaço com Bola, Cobertura Ofensiva, Unidade Ofensiva, Penetração, Mobilidade (6 itens).
  - **Fundamentos Técnicos**: Controle de Bola no Chão, Controle de Bola no Alto, Drible, Passe, Domínio, Finalização, Cabeceio (7 itens).
- **FR-010**: Cada chip DEVE funcionar como toggle (selecionar/desselecionar ao tocar).
- **FR-011**: O sistema DEVE persistir as especificações (momentos + princípios/fundamentos selecionados) junto com os dados do treino ao salvar.
- **FR-012**: Ao recarregar um treino existente (mesma data + categoria), as especificações salvas DEVEM ser restauradas visualmente.
- **FR-013**: As especificações DEVEM ser independentes da chamada — o professor pode salvar especificações mesmo sem ter feito a chamada, e vice-versa.
- **FR-014**: O botão "Salvar Treino" DEVE substituir o atual "Salvar Presença" e persistir tanto a chamada quanto as especificações em uma única operação.

### Key Entities

- **Treino (extensão da Chamada existente)**: Sessão de treino identificada por data + categoria. Além dos registros de presença existentes, agora inclui momentos do jogo selecionados e princípios/fundamentos trabalhados.
- **Momento do Jogo**: Um dos 4 momentos táticos de uma partida (Organização Ofensiva, Organização Defensiva, Transição Ofensiva, Transição Defensiva). Seleção binária por treino.
- **Princípio/Fundamento**: Item de uma das 3 categorias (Táticos Defensivos, Táticos Ofensivos, Fundamentos Técnicos). Seleção binária por treino. Lista fixa de 18 itens no total.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor registra as especificações completas de um treino (momentos + princípios/fundamentos) em menos de 1 minuto.
- **SC-002**: A chamada recolhível funciona com um único toque para expandir e outro para recolher, sem perda de dados.
- **SC-003**: 100% das especificações salvas são recuperadas corretamente ao revisitar o treino na mesma sessão.
- **SC-004**: A tela de treino com chamada recolhida e especificações visíveis é utilizável sem scroll horizontal em dispositivos de 375 px de largura.
- **SC-005**: O fluxo de salvar presença + especificações requer no máximo 1 interação de salvamento (botão único "Salvar Treino").

## Assumptions

- A estrutura existente de chamadas (`state.chamadas`) será estendida com novos campos para momentos e princípios/fundamentos, sem alterar os campos de presença existentes.
- A lista de momentos do jogo é fixa (4 itens) e não será editável pelo professor.
- A lista de princípios/fundamentos é fixa (18 itens no total) e não será editável pelo professor.
- Os momentos e princípios/fundamentos não possuem relação hierárquica entre si — o professor pode selecionar qualquer combinação livremente.
- A chamada inicia expandida ao carregar a tela, para manter o comportamento familiar ao professor.
- O botão "Salvar Treino" persiste tudo (presença + especificações) em uma operação única, substituindo o botão "Salvar Presença" atual.
- O protótipo visual de referência (`Design/prototipo.png`) define o layout esperado: grid 2x2 para momentos e chips/tags com wrap para princípios/fundamentos.
- As especificações são vinculadas à mesma chave data+categoria da chamada existente.
