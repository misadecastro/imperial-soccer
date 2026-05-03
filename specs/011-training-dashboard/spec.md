# Feature Specification: Dashboard de Treinos

**Feature Branch**: `011-training-dashboard`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Vamos criar um dashboard para acompanhar o volume de conteúdo trabalhado nos treinos por categoria. Vamos fazer com dados mockados sem ainda atuar no backend. Utilize como guia o protótipo que está no diretório designer/dashboard-treino.png. Nessa página teremos a seleção de categoria. Teremos um resumo com a total de treinos, minutos de jogos, presença média de alunos e total de itens trabalhados. Gráfico de volume por momento do jogo. Gráfico de pizza de distribuição por categoria de conteúdo (Tático x Fundamentos). Lista com top princípios e fundamentos mais trabalhados. E no final lista de Sessões recentes (Data — Momento, Fundamento, Presentes x/x)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visão consolidada por categoria (Priority: P1)

Como treinador, quero abrir o "Dashboard de Treinos", escolher uma categoria (ex.: Sub 09) e ver imediatamente os indicadores-resumo daquela categoria — total de treinos, minutos acumulados, presença média e total de itens trabalhados — para entender em segundos o volume de trabalho realizado.

**Why this priority**: É o núcleo de valor do dashboard. Sem o filtro de categoria e os 4 cards de resumo, não há dashboard utilizável; todas as outras visualizações apenas detalham esses números.

**Independent Test**: Acessar a página do dashboard, alternar entre categorias na barra de seletores e verificar que os 4 cards atualizam para refletir os dados da categoria escolhida (incluindo categorias com zero treinos, que devem mostrar valores zerados sem quebrar a interface).

**Acceptance Scenarios**:

1. **Given** o usuário está na página do dashboard com a categoria padrão selecionada, **When** a página termina de carregar, **Then** vê o cabeçalho "Dashboard de Treinos", a barra de categorias com a categoria padrão destacada e os 4 cards (Treinos, Minutos, Presença média, Itens trabalhados) preenchidos com os valores agregados daquela categoria.
2. **Given** o usuário está visualizando os dados de uma categoria, **When** clica em outra categoria na barra de seleção, **Then** os 4 cards atualizam imediatamente (sem reload completo) para refletir os dados da nova categoria, e o destaque visual muda para o novo botão.
3. **Given** o usuário seleciona uma categoria sem nenhum treino registrado nos dados mockados, **When** os cards renderizam, **Then** todos exibem `0` (ou `0%` para presença média) sem mensagens de erro, e o restante da página exibe estados vazios apropriados.

---

### User Story 2 - Visualização do volume por momento do jogo (Priority: P2)

Como treinador, quero ver um gráfico de barras com a distribuição dos treinos pelos quatro momentos do jogo (Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva) da categoria selecionada, para identificar quais momentos estão sendo mais trabalhados e quais estão sendo negligenciados.

**Why this priority**: Complementa a visão de resumo respondendo a uma pergunta-chave do treinador ("estou equilibrando os momentos do jogo?"). É o gráfico mais informativo para decisões de planejamento.

**Independent Test**: Selecionar uma categoria com sessões cobrindo todos os momentos e verificar que o gráfico de barras exibe quatro colunas com altura proporcional à quantidade de sessões em cada momento, com os rótulos corretos no eixo X.

**Acceptance Scenarios**:

1. **Given** a categoria selecionada possui treinos cobrindo os quatro momentos do jogo, **When** o gráfico "Volume por momento do jogo" renderiza, **Then** mostra quatro barras nomeadas Org. Ofensiva, Org. Defensiva, Trans. Ofensiva e Trans. Defensiva, com alturas proporcionais ao número de sessões em cada momento, e o subtítulo "Quantas sessões trabalham cada momento" visível.
2. **Given** a categoria selecionada possui treinos em apenas dois momentos, **When** o gráfico renderiza, **Then** as barras dos dois momentos sem dados aparecem com altura zero (ou suprimidas), preservando a ordem fixa dos quatro momentos no eixo X.

---

### User Story 3 - Distribuição entre tático e fundamentos (Priority: P2)

Como treinador, quero ver um gráfico de pizza/rosca mostrando a proporção do conteúdo trabalhado entre Princípios Táticos Defensivos, Princípios Táticos Ofensivos e Fundamentos Técnicos, para avaliar o equilíbrio entre dimensão tática e técnica do treinamento.

**Why this priority**: Resposta direta a uma pergunta estratégica (tático vs. fundamentos), mas em um nível agregado já parcialmente respondido pela User Story 4. Pode ser desenvolvido em paralelo à US2.

**Independent Test**: Carregar a página com uma categoria que tem itens das três famílias e verificar que a rosca exibe três fatias com proporções corretas, legenda visível e cores distintas para cada família.

**Acceptance Scenarios**:

1. **Given** a categoria selecionada tem itens trabalhados de Princípios Táticos Defensivos, Princípios Táticos Ofensivos e Fundamentos Técnicos, **When** o gráfico "Distribuição por categoria de conteúdo" renderiza, **Then** mostra três fatias proporcionais ao número de itens em cada família, com legenda exibindo o nome de cada família e suas cores correspondentes.
2. **Given** a categoria selecionada não trabalhou itens de uma das famílias, **When** o gráfico renderiza, **Then** apenas as famílias com dados aparecem no gráfico, e a legenda omite (ou mostra como zero) as famílias ausentes.

---

### User Story 4 - Top princípios e fundamentos mais trabalhados (Priority: P2)

Como treinador, quero ver uma lista dos 8 princípios e fundamentos mais trabalhados na categoria selecionada, com a contagem visual em barra horizontal, para identificar quais conteúdos específicos receberam mais atenção.

**Why this priority**: Detalhe acionável que complementa o gráfico de distribuição (US3). Junto com ele, fecha a visão "o que está sendo trabalhado".

**Independent Test**: Selecionar uma categoria e verificar que a lista exibe até 8 itens ordenados decrescentemente pela contagem, cada um com nome, barra horizontal proporcional e número de ocorrências.

**Acceptance Scenarios**:

1. **Given** a categoria selecionada tem 12 itens distintos trabalhados, **When** a lista "Princípios e fundamentos mais trabalhados" renderiza, **Then** exibe os 8 itens com maior contagem ordenados do maior para o menor, cada item mostrando nome, barra horizontal proporcional ao máximo e número de ocorrências à direita.
2. **Given** a categoria selecionada tem apenas 3 itens distintos trabalhados, **When** a lista renderiza, **Then** exibe somente os 3 itens existentes (sem placeholders vazios), preservando a ordenação por contagem.
3. **Given** dois itens têm a mesma contagem, **When** a lista renderiza, **Then** ambos aparecem em posições adjacentes (a ordem entre empates é estável e determinística — ex.: alfabética).

---

### User Story 5 - Sessões recentes (Priority: P3)

Como treinador, quero ver no final da página uma lista cronológica das sessões mais recentes da categoria selecionada, com data, momento, fundamentos trabalhados e presença (`x/x`), para acessar rapidamente o histórico recente sem sair do dashboard.

**Why this priority**: Complemento de drill-down útil, mas não bloqueante — se ausente, o resto do dashboard ainda entrega valor. Pode ser entregue após os blocos de visualização agregada.

**Independent Test**: Selecionar uma categoria e verificar que a lista mostra as sessões em ordem decrescente de data, cada linha com data formatada `DD/MM/AAAA`, momento, fundamentos como subtítulo e razão de presentes/total alinhada à direita.

**Acceptance Scenarios**:

1. **Given** a categoria selecionada tem 8 sessões registradas, **When** a lista "Sessões recentes" renderiza, **Then** exibe até as N mais recentes (ver Assumptions) ordenadas por data decrescente, cada uma com `DD/MM/AAAA — Momento`, lista de fundamentos abaixo e `Presentes X/Y` à direita.
2. **Given** uma sessão tem 6 fundamentos trabalhados, **When** o item da lista renderiza, **Then** os fundamentos aparecem listados (separados por bullets ou vírgulas), sem quebrar o layout da linha.
3. **Given** o usuário troca de categoria, **When** a categoria muda, **Then** a lista de sessões recentes é refiltrada para a nova categoria.

---

### Edge Cases

- **Categoria sem dados**: ao selecionar uma categoria que não tem nenhum treino mockado, todos os cards exibem zero, os gráficos exibem estado vazio (mensagem "Sem dados") e as listas exibem mensagem amigável ("Nenhuma sessão registrada").
- **Sessão sem fundamentos registrados**: a sessão aparece na lista de "Sessões recentes" com a área de fundamentos exibindo "—" ou similar; não conta para "Itens trabalhados".
- **Sessão sem presença registrada**: o card "Presença média" considera apenas sessões com chamada registrada; o item da lista mostra "—/—" ou oculta a presença.
- **Empate na contagem do top 8**: ordenação secundária estável (ex.: alfabética) evita que itens "pulem" entre renderizações.
- **Sub-categoria vazia ou inexistente nos dados**: o seletor exibe a categoria mesmo sem dados; clicar nela não causa erro.
- **Tela estreita (mobile)**: a barra de categorias e os cards de resumo se reorganizam (wrap) sem quebrar; os gráficos mantêm legibilidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir uma página de dashboard com cabeçalho "Dashboard de Treinos" e subtítulo "Volume e conteúdo trabalhado por categoria".
- **FR-002**: O sistema MUST apresentar um seletor de categoria visível no topo, com botões para cada categoria disponível, indicando visualmente a categoria atualmente selecionada.
- **FR-003**: O sistema MUST permitir selecionar exatamente uma categoria por vez; trocar a seleção MUST atualizar todos os indicadores, gráficos e listas da página para refletir a categoria escolhida.
- **FR-004**: O sistema MUST exibir 4 cards de resumo da categoria selecionada: (a) total de treinos (sessões registradas), (b) total de minutos de treino acumulados, (c) presença média percentual dos alunos, (d) total de itens trabalhados (soma de princípios + fundamentos registrados, contando ocorrências).
- **FR-005**: O sistema MUST exibir um gráfico de barras "Volume por momento do jogo" mostrando a quantidade de sessões em cada um dos quatro momentos do jogo: Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva, na ordem fixa.
- **FR-006**: O sistema MUST exibir um gráfico de pizza/rosca "Distribuição por categoria de conteúdo" mostrando a proporção entre as três famílias de conteúdo: Princípios Táticos Defensivos, Princípios Táticos Ofensivos e Fundamentos Técnicos, com legenda nomeando cada fatia.
- **FR-007**: O sistema MUST exibir uma lista "Princípios e fundamentos mais trabalhados" com até 8 itens, ordenados por contagem decrescente, cada item mostrando nome, barra horizontal proporcional ao máximo e número de ocorrências.
- **FR-008**: O sistema MUST exibir uma lista "Sessões recentes" com sessões da categoria selecionada, ordenadas por data decrescente; cada item MUST mostrar data formatada `DD/MM/AAAA`, momento do jogo, fundamentos/princípios trabalhados e razão `Presentes X/Y`.
- **FR-009**: O sistema MUST utilizar dados mockados em memória nesta entrega; nenhuma chamada a backend é necessária ou esperada.
- **FR-010**: O sistema MUST exibir estados vazios amigáveis (textos como "Sem dados" ou "Nenhuma sessão registrada") quando a categoria selecionada não tem informação para algum bloco, sem mensagens de erro técnicas.
- **FR-011**: O sistema MUST garantir que a troca de categoria seja perceptivelmente instantânea (sem bloquear a interface).
- **FR-012**: O sistema MUST manter a página acessível diretamente pela navegação principal do app, sem fluxo de login adicional além do já existente.
- **FR-013**: O sistema MUST renderizar de forma utilizável em telas com largura entre ~360px (mobile) e ~1440px (desktop), reorganizando elementos sem quebrar layout.

### Key Entities

- **Categoria**: representa uma categoria etária do clube (ex.: "Sub 09"). Atributo principal: identificador/rótulo exibido. É a chave de filtro do dashboard.
- **Sessão de Treino**: representa um treino realizado em uma data específica para uma categoria. Atributos: data, categoria, momento do jogo, lista de princípios trabalhados, lista de fundamentos trabalhados, duração em minutos, registro de presença (presentes/total de convocados).
- **Momento do Jogo**: enum fixo de quatro valores — Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva — usado para classificar cada sessão.
- **Princípio/Fundamento**: item de conteúdo trabalhado, pertencente a uma das três famílias — Princípios Táticos Defensivos, Princípios Táticos Ofensivos ou Fundamentos Técnicos. Atributos: identificador, rótulo de exibição, família.
- **Registro de Presença**: par numérico (presentes, total) associado a uma sessão; alimenta o card "Presença média" e a coluna "Presentes X/Y" da lista de sessões recentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um treinador consegue identificar o volume agregado de uma categoria (4 cards) em até **10 segundos** após abrir a página.
- **SC-002**: A troca de categoria atualiza todos os blocos visuais em até **300 ms** percebidos pelo usuário (sem reload de página).
- **SC-003**: A página renderiza completamente (estrutura + dados mockados + gráficos) em até **2 segundos** em conexão típica.
- **SC-004**: 100% das categorias presentes no seletor podem ser selecionadas sem produzir erro de aplicação, mesmo quando não têm dados associados.
- **SC-005**: Em uma sessão de teste com 3 treinadores que nunca viram o dashboard, **pelo menos 2** identificam corretamente, sem ajuda, qual momento do jogo foi mais trabalhado em uma categoria de exemplo (validação da legibilidade do gráfico de barras).
- **SC-006**: A lista de sessões recentes ordena cronologicamente de forma correta para 100% dos casos verificados.

## Assumptions

- **Categorias disponíveis**: o seletor exibe as categorias mostradas no protótipo (Sub 07, Sub 09, Sub 10, Sub 11, Sub 12, Sub 13, Sub 14, Sub 15, Sub 17). A base atual do app utiliza Sub09–Sub14; categorias adicionais do protótipo serão tratadas como vazias caso não haja dados mockados — a lista exata pode ser refinada na fase de planejamento conforme o conjunto de mocks adotado.
- **Categoria padrão ao abrir**: a primeira categoria com dados mockados (ex.: Sub 09 conforme protótipo) é selecionada por default.
- **Métrica "Minutos"**: refere-se ao **total acumulado de minutos das sessões de treino** da categoria (somatório das durações das sessões), e não a minutos de partidas oficiais. O rótulo no card é simplesmente "Minutos".
- **Métrica "Itens trabalhados"**: contagem de **ocorrências** de princípios e fundamentos somadas em todas as sessões da categoria; um mesmo fundamento trabalhado em duas sessões conta como 2.
- **"Presença média"**: média ponderada simples do percentual de presentes (`presentes / total`) sobre as sessões com chamada registrada na categoria; sessões sem chamada são ignoradas no cálculo.
- **Top 8 do ranking**: o "Top 8 itens" do bloco de princípios/fundamentos é fixo. Se houver menos de 8 itens distintos trabalhados, a lista mostra apenas os existentes.
- **Sessões recentes — limite**: a lista mostra as N sessões mais recentes da categoria; valor inicial sugerido N = 6 (consistente com o protótipo). Se a categoria tiver menos sessões, mostra todas; sem paginação nesta entrega.
- **Famílias de conteúdo**: três famílias fixas — Princípios Táticos Defensivos, Princípios Táticos Ofensivos, Fundamentos Técnicos — alinhadas à taxonomia já existente no app (feature 009).
- **Dados mockados**: o conjunto de mocks é dimensionado para reproduzir, na categoria padrão, números próximos ao protótipo (≈6 treinos, ≈360 minutos, ≈88% de presença, ≈18 itens trabalhados) e ainda permitir comparação entre algumas categorias.
- **Sem persistência adicional**: o dashboard é leitura-somente; não cria nem altera dados. A origem dos dados (reutilizar o estado em memória já alimentado pelas features anteriores ou um conjunto dedicado de mocks) será decidida na fase de planejamento.
- **Acesso**: o dashboard é uma página adicional do app, alcançável a partir da navegação principal; não requer fluxo de autenticação além do já existente no app.
