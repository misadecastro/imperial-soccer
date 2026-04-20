# Feature Specification: Listagem e CRUD de Treinos com Filtro de Fundamentos

**Feature Branch**: `010-training-crud-list`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Ajustes na tela de treino: colocar lista de treinos exibida por data, quantidade de alunos presentes e princípios/fundamentos trabalhados. Adicionar opções de excluir, editar e adicionar treino. Na funcionalidade de adicionar treino, filtrar fundamentos conforme o momento trabalhado — momentos ofensivos exibem princípios ofensivos, momentos defensivos exibem princípios defensivos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar lista de treinos realizados (Priority: P1)

O professor acessa a tela "Treino" e vê uma lista de todos os treinos registrados em ordem decrescente de data. Cada item exibe a data do treino, a categoria, a quantidade de alunos presentes e os princípios/fundamentos trabalhados naquela sessão. Isso permite ao professor ter uma visão geral do histórico de treinos.

**Why this priority**: A lista é o ponto de entrada da funcionalidade — sem ela, o professor não tem visibilidade do que já foi registrado e não consegue navegar para editar ou excluir treinos.

**Independent Test**: Com 3 treinos registrados em datas diferentes, abrir a tela de Treino e verificar que os 3 aparecem em ordem decrescente de data, cada um com data formatada, categoria, quantidade de presentes e chips dos princípios/fundamentos.

**Acceptance Scenarios**:

1. **Given** existem treinos cadastrados, **When** o professor acessa a tela de Treino, **Then** a lista exibe todos os treinos em ordem decrescente de data de realização.
2. **Given** a lista está exibida, **When** o professor observa cada item, **Then** cada treino mostra a data formatada, a categoria, a quantidade de alunos presentes e os princípios/fundamentos trabalhados.
3. **Given** não há treinos cadastrados, **When** o professor acessa a tela de Treino, **Then** uma mensagem amigável informa que ainda não há treinos registrados.
4. **Given** um treino foi salvo sem princípios/fundamentos, **When** o professor vê o item na lista, **Then** a área de princípios/fundamentos aparece vazia ou com indicação "Nenhum".

---

### User Story 2 - Cadastrar novo treino com filtro de fundamentos por momento (Priority: P1)

O professor clica em "Novo Treino", preenche a data e a categoria, faz a chamada de presença, seleciona momentos do jogo e — com base nos momentos selecionados — o sistema filtra automaticamente os princípios e fundamentos disponíveis: momentos ofensivos (Org. Ofensiva, Trans. Ofensiva) exibem princípios táticos ofensivos, momentos defensivos (Org. Defensiva, Trans. Defensiva) exibem princípios táticos defensivos. Fundamentos técnicos são sempre exibidos independentemente do momento. Ao salvar, o treino aparece na lista.

**Why this priority**: O cadastro com filtro inteligente é o diferencial central desta feature — torna o preenchimento mais rápido e correto ao exibir apenas os princípios relevantes ao momento trabalhado.

**Independent Test**: Criar novo treino, selecionar "Org. Ofensiva" → verificar que apenas "Princípios Táticos Ofensivos" e "Fundamentos Técnicos" são exibidos (defensivos ocultos). Selecionar também "Trans. Defensiva" → verificar que agora ambos os grupos de princípios táticos aparecem. Salvar e confirmar que o treino aparece na lista.

**Acceptance Scenarios**:

1. **Given** o professor está na lista de treinos, **When** clica em "Novo Treino", **Then** o formulário de treino é exibido com campos de data, categoria, chamada e especificações.
2. **Given** o formulário está aberto e nenhum momento selecionado, **When** o professor observa a seção de princípios, **Then** apenas "Fundamentos Técnicos" é exibido (princípios táticos ocultos até que um momento seja selecionado).
3. **Given** o professor seleciona "Org. Ofensiva" (momento ofensivo), **When** observa os princípios, **Then** "Princípios Táticos Ofensivos" e "Fundamentos Técnicos" são exibidos; "Princípios Táticos Defensivos" permanece oculto.
4. **Given** o professor seleciona "Org. Defensiva" (momento defensivo), **When** observa os princípios, **Then** "Princípios Táticos Defensivos" e "Fundamentos Técnicos" são exibidos; "Princípios Táticos Ofensivos" permanece oculto.
5. **Given** o professor seleciona um momento ofensivo e um defensivo simultaneamente, **When** observa os princípios, **Then** ambos os grupos de princípios táticos e "Fundamentos Técnicos" são exibidos.
6. **Given** o professor desmarca todos os momentos, **When** observa os princípios, **Then** os grupos de princípios táticos são ocultos novamente e apenas "Fundamentos Técnicos" é exibido.
7. **Given** princípios táticos defensivos foram selecionados e o professor desmarca o momento defensivo, **When** os princípios defensivos desaparecem, **Then** os princípios anteriormente selecionados daquele grupo são automaticamente desmarcados e o contador atualizado.
8. **Given** treino preenchido com data, categoria, chamada e especificações, **When** o professor clica "Salvar Treino", **Then** o treino é salvo, toast de sucesso exibido e o treino aparece na lista.

---

### User Story 3 - Editar treino registrado (Priority: P2)

O professor pode editar um treino existente para corrigir a chamada, os momentos ou os princípios/fundamentos. Ao clicar "Editar" na lista, o formulário é exibido pré-preenchido com os dados salvos.

**Why this priority**: A edição é importante para correções, mas o professor pode excluir e recriar como alternativa. Portanto, secundária em relação ao cadastro e à listagem.

**Independent Test**: Editar um treino existente, alterar um princípio selecionado e salvar. Verificar que a alteração persiste na lista.

**Acceptance Scenarios**:

1. **Given** a lista de treinos, **When** o professor toca "Editar" em um treino, **Then** o formulário de edição é exibido com data, categoria, chamada e especificações pré-preenchidos.
2. **Given** o formulário de edição, **When** o professor altera princípios selecionados e salva, **Then** as alterações são persistidas e refletidas na lista.
3. **Given** o formulário de edição, **When** o professor clica "Cancelar", **Then** nenhuma alteração é salva e a lista é exibida novamente.

---

### User Story 4 - Excluir treino (Priority: P2)

O professor pode excluir um treino da lista após confirmação explícita.

**Why this priority**: Frequência baixa de uso, mas necessária para corrigir registros indevidos.

**Independent Test**: Clicar "Excluir" em um treino, confirmar o diálogo e verificar que o treino desaparece da lista.

**Acceptance Scenarios**:

1. **Given** a lista de treinos, **When** o professor toca "Excluir" em um treino, **Then** um diálogo de confirmação é exibido.
2. **Given** o diálogo de confirmação, **When** o professor confirma, **Then** o treino é removido da lista e um toast de sucesso é exibido.
3. **Given** o diálogo de confirmação, **When** o professor cancela, **Then** o treino permanece inalterado.

---

### Edge Cases

- O que acontece se o professor tentar salvar um treino sem data? — Exibir erro: data é obrigatória.
- O que acontece se o professor tentar salvar sem categoria? — Exibir erro: categoria é obrigatória.
- O que acontece se o professor salvar sem selecionar momentos ou princípios? — Permitir. Especificações são opcionais.
- O que acontece se o professor salvar sem fazer a chamada? — Permitir. A chamada é opcional — o treino pode registrar apenas especificações.
- O que acontece se princípios de um grupo foram selecionados e o momento correspondente é desmarcado? — Os princípios daquele grupo devem ser automaticamente desmarcados.
- O que acontece se existirem treinos registrados no formato antigo (feature 009) sem os novos campos de listagem? — Os treinos existentes devem ser exibidos normalmente na lista, com os dados disponíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma lista de treinos registrados em ordem decrescente de data na tela principal de Treino.
- **FR-002**: Cada item da lista DEVE exibir: data formatada, categoria, quantidade de alunos presentes e os princípios/fundamentos trabalhados.
- **FR-003**: O sistema DEVE exibir uma mensagem amigável quando não há treinos cadastrados.
- **FR-004**: O sistema DEVE oferecer um botão "Novo Treino" que abre o formulário de cadastro.
- **FR-005**: O formulário de treino DEVE conter: seleção de data (obrigatória), seleção de categoria (obrigatória), seção de chamada (collapsible, opcional), seção de especificações (momentos + princípios/fundamentos).
- **FR-006**: Quando um momento ofensivo (Org. Ofensiva ou Trans. Ofensiva) for selecionado, o sistema DEVE exibir o grupo "Princípios Táticos Ofensivos".
- **FR-007**: Quando um momento defensivo (Org. Defensiva ou Trans. Defensiva) for selecionado, o sistema DEVE exibir o grupo "Princípios Táticos Defensivos".
- **FR-008**: O grupo "Fundamentos Técnicos" DEVE ser exibido sempre, independentemente dos momentos selecionados.
- **FR-009**: Quando nenhum momento estiver selecionado, apenas "Fundamentos Técnicos" DEVE ser visível na seção de princípios.
- **FR-010**: Quando um momento é desmarcado e seu grupo de princípios correspondente deixa de ser exibido, os princípios daquele grupo que estavam selecionados DEVEM ser automaticamente desmarcados.
- **FR-011**: O sistema DEVE permitir editar um treino existente — o formulário pré-preenchido com todos os dados salvos.
- **FR-012**: O sistema DEVE permitir excluir um treino após confirmação explícita do professor.
- **FR-013**: O botão "Salvar Treino" DEVE persistir todos os dados (chamada + especificações) em uma operação única.
- **FR-014**: A lista de treinos DEVE identificar a categoria de cada treino para diferenciar treinos na mesma data.

### Key Entities

- **Treino (evolução da Chamada existente)**: Sessão de treino identificada por data + categoria. Contém registros de presença, momentos do jogo selecionados e princípios/fundamentos trabalhados. Suporta operações CRUD completas.
- **Momento do Jogo**: Um dos 4 momentos táticos, classificado como ofensivo (Org. Ofensiva, Trans. Ofensiva) ou defensivo (Org. Defensiva, Trans. Defensiva). A classificação determina quais princípios são exibidos.
- **Princípio/Fundamento**: Item de uma das 3 categorias. Princípios Táticos Ofensivos e Defensivos são condicionais (dependem do momento selecionado). Fundamentos Técnicos são sempre visíveis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor visualiza o histórico completo de treinos em menos de 2 segundos ao acessar a tela.
- **SC-002**: O cadastro de um novo treino completo (data + categoria + chamada + especificações) requer no máximo 3 minutos para até 20 alunos.
- **SC-003**: 100% dos treinos salvos são exibidos corretamente na lista com data, presentes e princípios/fundamentos.
- **SC-004**: O filtro de princípios por momento responde instantaneamente — ao selecionar/desmarcar um momento, os grupos correspondentes aparecem/desaparecem sem atraso perceptível.
- **SC-005**: A exclusão de um treino requer exatamente 2 interações (clicar Excluir + confirmar).
- **SC-006**: A edição de um treino preserva 100% dos dados originais ao abrir o formulário.

## Assumptions

- A estrutura de dados existente (`state.chamadas`) será reutilizada — cada chamada já representa um treino com data, categoria, registros de presença, momentos e princípios/fundamentos.
- A tela de Treino passa de um fluxo de "formulário direto" para um fluxo de "lista + formulário" (semelhante ao padrão já usado em `games.html`).
- A classificação dos momentos é fixa: Org. Ofensiva e Trans. Ofensiva = ofensivos; Org. Defensiva e Trans. Defensiva = defensivos.
- Fundamentos Técnicos são sempre exibidos independentemente dos momentos, pois são aplicáveis a qualquer contexto tático.
- A lista exibe todos os treinos de todas as categorias, não apenas de uma categoria específica. A categoria é mostrada como informação no item da lista.
- A chamada de presença dentro do formulário permanece opcional — o professor pode registrar um treino apenas com especificações.
- A navegação entre lista e formulário segue o padrão de `games.html`: seções alternadas com show/hide.
- Treinos registrados pela feature anterior (009) são compatíveis — os campos `momentos` e `principiosFundamentos` já existem no modelo de dados.
