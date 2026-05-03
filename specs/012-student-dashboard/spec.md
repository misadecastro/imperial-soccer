# Feature Specification: Dashboard do Aluno

**Feature Branch**: `012-student-dashboard`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Agora vamos criar o dashboard por aluno, podemos colocar no mesmo menu de dashboad, e colocamos no topo a opçao de selecionar o dashboard de treinos ou de alunos. Como modelo para esse dashboard vamos usar o prototipo em designer/dashboard-aluno.png. Esse dash board deve listar o volume de treino, minutagem em jogos. Filtro por categoria para localizar e selecionar o aluno, adicione tambem uma forma de filtrar o aluno pelo nome. Quando o aluno for selecionado exiba o nome do aluno e a categoria. Abaixo apresente o resumo dos treinos: Presenças, Percentual de frequencia, (Desconsidere Min Treinados do prototipo), Itens Trabalhados. Exiba um grafico de Volume de treino por momento. Grafico de barra de Principios e fundamentos absorvidos (Itens trabalhados nas sessões em que esteve presente). Resumo dos Jogos: Jogos disputados, Minutos em Jogo, Media por jogo, (desconsidere o item Como Titular do prototipo). Grafico Minutagem em jogos (minutos jogados por partida). Depois o Historico de Jogos: Lista de jogos: Data - Nome do Jogo - Minutos. Lembre-se que nesse momento os dados serão mockados e não teremos o backend por enquanto"

## Clarifications

### Session 2026-05-03

- Q: Como definir "Convocações" para o cálculo de Frequência? → A: Considerar apenas as chamadas (sessões de treino registradas) da categoria como denominador.
- Q: De onde vêm os dados mockados do Dashboard do Aluno? → A: Reusar somente o estado existente em `sessionStorage` (chave `imperialState`); sem mocks dedicados ou semeadura.
- Q: Comportamento da seleção ao alternar entre os dashboards Treinos e Alunos? → A: Estado totalmente independente por aba — cada dashboard mantém sua própria seleção; alternar não afeta o outro.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecionar aluno e ver resumo de treinos (Priority: P1)

Como treinador, ao acessar o menu "Dashboard", quero alternar entre o "Dashboard de Treinos" (já existente) e o novo "Dashboard do Aluno" através de um seletor no topo da página. No Dashboard do Aluno, quero filtrar por categoria, opcionalmente buscar pelo nome do aluno, selecionar o aluno desejado e ver imediatamente seu nome, sua categoria e os 3 cards de resumo de treinos (Presenças, Frequência, Itens Trabalhados).

**Why this priority**: É o núcleo do valor. Sem o toggle, sem a seleção do aluno e sem o cabeçalho de identificação + cards de resumo, não há dashboard utilizável. Todos os demais blocos só fazem sentido após um aluno ter sido selecionado.

**Independent Test**: Acessar a página de dashboard, alternar do "Treinos" para "Alunos", escolher uma categoria, buscar um aluno por nome, clicar no aluno na lista filtrada e verificar que (a) o cabeçalho do aluno exibe nome e categoria, e (b) os 3 cards de resumo de treinos exibem valores coerentes com os mocks.

**Acceptance Scenarios**:

1. **Given** o usuário está em qualquer página do app, **When** acessa o item "Dashboard" do menu principal, **Then** vê no topo da página um seletor com duas opções — "Treinos" e "Alunos" — onde "Treinos" é a opção ativa por padrão (preserva o comportamento atual).
2. **Given** o usuário está no Dashboard de Treinos, **When** clica em "Alunos" no seletor, **Then** o conteúdo da página alterna para o Dashboard do Aluno sem que ele precise navegar para outra rota; o destaque visual passa para "Alunos".
3. **Given** o Dashboard do Aluno é exibido sem aluno selecionado, **When** o usuário olha a tela, **Then** vê (a) a barra de seleção de categoria, (b) o campo de busca por nome, (c) a lista de alunos da categoria padrão, e (d) um estado vazio amigável no lugar dos blocos de métricas (ex.: "Selecione um aluno para visualizar seus dados").
4. **Given** o usuário está no Dashboard do Aluno com uma categoria selecionada, **When** digita parte do nome de um aluno no campo de busca, **Then** a lista de alunos é filtrada em tempo real para mostrar apenas os que contêm o termo digitado (busca case-insensitive, em qualquer posição do nome).
5. **Given** a lista de alunos filtrada está visível, **When** o usuário clica em um aluno, **Then** (a) um cabeçalho destacado exibe o nome do aluno e a categoria, (b) os 3 cards de resumo de treinos — Presenças, % de Frequência e Itens Trabalhados — são preenchidos com os valores do aluno selecionado.
6. **Given** o usuário troca a categoria, **When** a categoria muda, **Then** a lista de alunos é refiltrada para a nova categoria e a seleção atual de aluno é limpa (a página volta ao estado "selecione um aluno").

---

### User Story 2 - Visualizar gráficos de treino do aluno (Priority: P2)

Como treinador, após selecionar um aluno, quero visualizar dois gráficos: (a) o **Volume de treino por momento** — barras com a quantidade de sessões em que o aluno esteve presente para cada um dos quatro momentos do jogo; e (b) os **Princípios e fundamentos absorvidos** — barras horizontais ranqueando os itens mais trabalhados nas sessões em que o aluno esteve presente.

**Why this priority**: Detalhamento essencial sobre o desenvolvimento técnico-tático do aluno, complementando os cards de resumo. Não é bloqueante para o MVP da US1, mas adiciona valor analítico significativo logo na sequência.

**Independent Test**: Selecionar um aluno com presenças em sessões cobrindo diferentes momentos e fundamentos, verificar que (a) o gráfico de barras de momentos mostra contagens proporcionais para Org. Ofensiva, Org. Defensiva, Trans. Ofensiva e Trans. Defensiva, e (b) a barra horizontal lista os fundamentos/princípios absorvidos ordenados por contagem decrescente.

**Acceptance Scenarios**:

1. **Given** um aluno com presenças em sessões cobrindo os quatro momentos do jogo está selecionado, **When** o bloco "Volume de treino por momento" renderiza, **Then** exibe quatro barras nomeadas Org. Ofensiva, Org. Defensiva, Trans. Ofensiva e Trans. Defensiva, com altura proporcional ao número de sessões em que o aluno esteve presente em cada momento.
2. **Given** o aluno selecionado esteve presente em sessões trabalhando 7 itens distintos, **When** o bloco "Princípios e fundamentos absorvidos" renderiza, **Then** exibe esses itens em barras horizontais, ordenados por contagem decrescente, cada item mostrando rótulo, barra proporcional e número de ocorrências.
3. **Given** o aluno selecionado não tem nenhuma presença registrada, **When** os blocos de gráficos renderizam, **Then** ambos exibem estado vazio amigável ("Sem treinos registrados" ou similar), sem produzir erro.
4. **Given** um aluno está selecionado e o usuário troca para outro aluno (mesma categoria ou outra), **When** a seleção muda, **Then** os dois gráficos recalculam e renderizam para o novo aluno.

---

### User Story 3 - Resumo de jogos e minutagem por partida (Priority: P2)

Como treinador, após selecionar um aluno, quero ver os 3 cards de resumo de jogos (Jogos disputados, Minutos em Jogo, Média por jogo) e um gráfico de "Minutagem em jogos" mostrando os minutos jogados pelo aluno em cada partida em ordem cronológica, para acompanhar a evolução da participação dele nos jogos.

**Why this priority**: Junto com a US2, completa a visão analítica do aluno (treinos + jogos). Independentemente da US2 (gráficos de treino), este bloco já entrega valor próprio — o usuário pode ver os números de jogos mesmo sem ter visto os gráficos de treino.

**Independent Test**: Selecionar um aluno com 3 jogos registrados, com minutagens distintas, e verificar que (a) o card "Jogos disputados" exibe 3, (b) "Minutos em Jogo" exibe a soma dos minutos, (c) "Média por jogo" exibe o cálculo correto, e (d) o gráfico "Minutagem em jogos" mostra três pontos/barras na ordem cronológica das partidas.

**Acceptance Scenarios**:

1. **Given** o aluno selecionado participou de 3 jogos com minutagens 30, 25 e 45, **When** os cards de resumo de jogos renderizam, **Then** exibem `Jogos disputados: 3`, `Minutos em Jogo: 100`, `Média por jogo: 33` (arredondamento padrão a definir nas Assumptions).
2. **Given** o aluno selecionado participou de N jogos, **When** o gráfico "Minutagem em jogos" renderiza, **Then** mostra N pontos/barras dispostos em ordem cronológica de data do jogo, com o eixo Y representando os minutos jogados.
3. **Given** o aluno selecionado participou de jogos com 0 minutos (entrou mas não jogou), **When** o gráfico renderiza, **Then** o ponto correspondente é exibido em zero, sem ser omitido nem produzir erro.
4. **Given** o aluno selecionado não participou de nenhum jogo, **When** os cards e o gráfico renderizam, **Then** os cards exibem `0`, `0`, `0 min` (ou `—` para média), e o gráfico exibe estado vazio amigável.

---

### User Story 4 - Histórico de jogos do aluno (Priority: P3)

Como treinador, após selecionar um aluno, quero ver no final da página uma lista cronológica dos jogos em que o aluno participou — cada item exibindo a data, o nome do jogo e os minutos jogados — para consultar rapidamente o histórico de partidas sem sair do dashboard.

**Why this priority**: Detalhe acionável complementar; permite drill-down nos números agregados. Não é bloqueante: os números já estão nos cards e no gráfico da US3.

**Independent Test**: Selecionar um aluno com 4 jogos em datas distintas e verificar que a lista mostra os 4 jogos em ordem decrescente de data, com `DD/MM/AAAA — Nome do Jogo` e os minutos jogados à direita.

**Acceptance Scenarios**:

1. **Given** o aluno selecionado tem 4 jogos registrados, **When** a lista "Histórico de Jogos" renderiza, **Then** exibe 4 linhas em ordem decrescente de data, cada uma com `DD/MM/AAAA — Nome do Jogo` e os minutos jogados.
2. **Given** o aluno selecionado tem dois jogos na mesma data, **When** a lista renderiza, **Then** ambos aparecem em posições adjacentes, com ordenação secundária estável (por exemplo, ordem em que foram cadastrados).
3. **Given** o aluno selecionado não tem jogos, **When** a lista renderiza, **Then** exibe mensagem amigável ("Nenhum jogo registrado") sem produzir erro.

---

### Edge Cases

- **Categoria sem alunos**: ao selecionar uma categoria que não tem alunos cadastrados nos mocks, a lista de alunos exibe estado vazio ("Nenhum aluno nesta categoria").
- **Busca sem resultados**: ao digitar um termo que não corresponde a nenhum aluno da categoria atual, a lista exibe "Nenhum aluno encontrado para '<termo>'", sem ocultar o campo de busca.
- **Aluno sem presenças**: cards mostram `0` presenças, `—` ou `0%` em frequência, `0` em itens trabalhados; gráficos de treino exibem estado vazio.
- **Aluno sem jogos**: cards mostram `0` em jogos disputados e em minutos; média por jogo exibe `—`; gráfico de minutagem exibe estado vazio; histórico de jogos exibe "Nenhum jogo registrado".
- **Toggle preserva contexto independente**: cada dashboard mantém seu próprio estado de seleção; alternar Treinos↔Alunos não propaga categoria nem reseta seleções. Ex.: se o usuário está em Treinos com Sub 09 selecionado e alterna para Alunos, o Dashboard do Aluno abre na sua categoria default (não em Sub 09); ao voltar para Treinos, Sub 09 ainda está selecionado.
- **Tela estreita (mobile)**: o seletor de toggle, a barra de categorias, o campo de busca e os blocos se reorganizam (wrap) sem quebrar o layout; os gráficos mantêm legibilidade.
- **Aluno com nome igual em categorias diferentes**: a busca filtra apenas dentro da categoria selecionada; se duas categorias diferentes possuem alunos com mesmo nome, só o da categoria atual aparece.
- **Frequência indefinida**: se o total de convocações do aluno é zero (não houve sessão alguma na categoria), o percentual é exibido como `—%` em vez de `NaN%` ou divisão por zero.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST adicionar ao menu principal (ou rota de Dashboard existente) um seletor visível no topo da página com duas opções — "Treinos" e "Alunos" — permitindo alternar entre o Dashboard de Treinos (existente) e o novo Dashboard do Aluno.
- **FR-002**: O sistema MUST exibir um cabeçalho intitulado "Dashboard do Aluno" com subtítulo descritivo (ex.: "Volume de treino e minutagem em jogos") quando o modo "Alunos" está ativo.
- **FR-003**: O sistema MUST apresentar uma barra de seleção de categoria com botões para cada categoria disponível, indicando visualmente a categoria atualmente selecionada.
- **FR-004**: O sistema MUST apresentar um campo de busca por nome do aluno que filtra, em tempo real e de forma case-insensitive, a lista de alunos exibida; a busca deve casar com o termo em qualquer posição do nome.
- **FR-005**: O sistema MUST exibir a lista dos alunos da categoria atual (e possivelmente filtrada pela busca), permitindo ao usuário selecionar exatamente um aluno por vez através de clique/toque no item da lista.
- **FR-006**: Ao selecionar um aluno, o sistema MUST exibir um cabeçalho de identificação com o nome completo do aluno e o rótulo da categoria.
- **FR-007**: Ao selecionar um aluno, o sistema MUST exibir 3 cards de resumo de treinos: (a) **Presenças** (número de sessões da categoria em que o aluno esteve presente, podendo ser apresentado como `presenças/convocações`), (b) **Frequência** (percentual = presenças ÷ convocações × 100, onde "convocações" = total de chamadas/sessões de treino registradas da categoria), (c) **Itens Trabalhados** (total de ocorrências de princípios e fundamentos registrados nas sessões em que o aluno esteve presente).
- **FR-008**: O sistema MUST exibir um gráfico "Volume de treino por momento" — barras com a quantidade de sessões em que o aluno esteve presente para cada um dos quatro momentos do jogo (Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva), em ordem fixa.
- **FR-009**: O sistema MUST exibir um bloco "Princípios e fundamentos absorvidos" em barras horizontais, listando os itens trabalhados **somente nas sessões em que o aluno esteve presente**, ordenados por contagem decrescente, cada item mostrando rótulo, barra proporcional ao máximo e número de ocorrências.
- **FR-010**: Ao selecionar um aluno, o sistema MUST exibir 3 cards de resumo de jogos: (a) **Jogos disputados** (número de jogos em que o aluno foi registrado), (b) **Minutos em Jogo** (somatório dos minutos jogados pelo aluno nesses jogos), (c) **Média por jogo** (Minutos em Jogo ÷ Jogos disputados, formatado em minutos inteiros).
- **FR-011**: O sistema MUST exibir um gráfico "Minutagem em jogos" mostrando os minutos jogados pelo aluno em cada partida em ordem cronológica crescente, permitindo identificar a evolução ao longo do tempo.
- **FR-012**: O sistema MUST exibir uma lista "Histórico de Jogos" do aluno selecionado, em ordem decrescente de data, cada item contendo `DD/MM/AAAA — Nome do Jogo` e os minutos jogados.
- **FR-013**: O sistema MUST exibir estados vazios amigáveis (textos como "Selecione um aluno", "Sem treinos registrados", "Nenhum jogo registrado", "Nenhum aluno encontrado") sem mensagens técnicas de erro.
- **FR-014**: O sistema MUST utilizar como única fonte de dados o estado em memória já existente em `sessionStorage` sob a chave `imperialState` (alunos em `state.alunos`, chamadas em `state.chamadas`, jogos em `state.jogos`); nenhuma chamada a backend é necessária ou esperada nesta entrega, e o dashboard NÃO deve embutir, semear nem sobrescrever esse estado com mocks dedicados. Cenários demo que exigem dados ricos devem ser construídos pelo usuário através das telas existentes (Alunos, Treino, Jogos) antes de abrir o dashboard.
- **FR-015**: O sistema MUST garantir que a troca de aluno, categoria, busca ou toggle Treinos/Alunos seja perceptivelmente instantânea, sem reload da página.
- **FR-015a**: O sistema MUST manter a seleção (categoria e aluno) de cada dashboard de forma independente; alternar entre Treinos e Alunos NÃO MUST sobrescrever, propagar nem resetar a seleção do outro dashboard durante a mesma sessão.
- **FR-016**: O sistema MUST renderizar de forma utilizável em telas com largura entre ~360px (mobile) e ~1440px (desktop), reorganizando elementos sem quebrar o layout.
- **FR-017**: O sistema MUST DESCONSIDERAR (não exibir) os indicadores presentes no protótipo que foram explicitamente excluídos: "Min Treinados" no resumo de treinos e "Como Titular" no resumo de jogos.
- **FR-018**: O sistema MUST NOT alterar dados; o Dashboard do Aluno é leitura-somente e não cria, edita ou exclui registros.

### Key Entities

- **Aluno**: representa um aluno cadastrado no sistema. Atributos relevantes: identificador, nome completo, categoria. É o sujeito central do dashboard.
- **Categoria**: agrupa alunos por faixa etária (ex.: "Sub 09"). Filtra a lista de alunos disponíveis para seleção.
- **Sessão de Treino**: treino de uma categoria em uma data, com momento do jogo, lista de princípios/fundamentos trabalhados, duração, e registro de presença por aluno (presente/ausente).
- **Registro de Presença**: vínculo entre Aluno e Sessão de Treino indicando se o aluno esteve presente; alimenta os cards de Presenças/Frequência e os gráficos de treino.
- **Jogo**: partida em uma data com nome (ex.: "vs. América") e lista de alunos participantes com minutagem individual (já existente nas features 008/009).
- **Minutagem do Aluno em Jogo**: par (Aluno, Jogo) com a quantidade de minutos jogados; alimenta os cards de resumo de jogos, o gráfico de minutagem e o histórico.
- **Momento do Jogo**: enum fixo de quatro valores — Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva — usado para classificar cada sessão.
- **Princípio/Fundamento**: item de conteúdo trabalhado em uma sessão; agrega-se na lista "Princípios e fundamentos absorvidos" considerando apenas sessões em que o aluno esteve presente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um treinador consegue alternar para o Dashboard do Aluno, escolher uma categoria, encontrar um aluno (via lista ou busca por nome) e visualizar seus indicadores em até **15 segundos** após abrir a página.
- **SC-002**: A seleção de um aluno (ou troca de aluno) atualiza todos os blocos da página em até **300 ms** percebidos pelo usuário, sem reload.
- **SC-003**: A busca por nome filtra a lista de alunos em até **150 ms** percebidos pelo usuário a cada caractere digitado.
- **SC-004**: 100% dos alunos presentes no mock podem ser selecionados sem produzir erro de aplicação, mesmo aqueles sem presenças e/ou sem jogos registrados.
- **SC-005**: O cálculo de Frequência e Média por jogo é correto em 100% dos casos verificados, incluindo o tratamento de divisão por zero (exibido como `—%` ou `—`).
- **SC-006**: O gráfico de Minutagem em jogos exibe os pontos em ordem cronológica correta para 100% dos casos verificados; o Histórico de Jogos exibe em ordem decrescente correta para 100% dos casos verificados.
- **SC-007**: Em uma sessão de teste com 3 treinadores que nunca viram o dashboard, **pelo menos 2** identificam corretamente, sem ajuda, qual momento do jogo o aluno mais treinou (legibilidade do gráfico de barras de momentos).

## Assumptions

- **Toggle Treinos/Alunos**: o seletor no topo é visualmente similar a abas (tabs); a opção padrão ao abrir o Dashboard é "Treinos" para preservar o comportamento atual da feature 011. A escolha entre implementar como duas páginas distintas ou uma única página com troca de conteúdo é decisão da fase de planejamento.
- **Categorias e fonte de dados** (resolvido na Clarification 2026-05-03): o dashboard consome exclusivamente o estado em memória existente em `sessionStorage` sob a chave `imperialState`, alimentado pelas features anteriores (002/003/006 para alunos, 007/009/010 para chamadas/presenças, 008 para jogos). Não há mocks dedicados nem semeadura automática: se o usuário abre o dashboard sem ter passado pelas outras telas, o estado vazio é exibido sem dados (vide US1 cenário 3 e Edge Cases). Para reproduzir cenários ricos do protótipo (~6 presenças, ~100% de frequência, ~18 itens trabalhados, ~2 jogos, ~58 min), o usuário deve previamente cadastrar alunos, lançar chamadas e registrar jogos pelas telas existentes.
- **Categoria padrão ao abrir o Dashboard do Aluno**: a primeira categoria com alunos mockados (ex.: Sub 09 conforme protótipo) é selecionada por default; nenhum aluno é selecionado inicialmente.
- **Estado inicial sem aluno**: ao abrir o Dashboard do Aluno, os blocos de métricas (cards, gráficos, histórico) exibem um estado vazio guiado ("Selecione um aluno para visualizar seus dados") em vez de zeros, para deixar claro que ainda não há contexto.
- **Busca por nome**: filtragem case-insensitive, sem normalização de acentos nesta entrega (ex.: "joao" não casa com "João"); pode ser refinada futuramente.
- **Itens Trabalhados (card)**: contagem de **ocorrências** de princípios e fundamentos somadas sobre as sessões em que o aluno esteve presente; um mesmo fundamento contado em duas sessões com presença soma 2.
- **Princípios e fundamentos absorvidos (gráfico)**: lista os itens trabalhados nas sessões com presença do aluno, ordenados por contagem decrescente, exibindo todos os itens absorvidos (sem corte fixo em 8 nesta entrega; pode ser ajustado se a lista exceder ~10–12 itens).
- **Presenças vs. Convocações** (resolvido na Clarification 2026-05-03): "Presenças" = sessões da categoria em que o aluno foi marcado como presente na chamada; "Convocações" = total de chamadas (sessões de treino registradas) da categoria — somente sessões que possuem chamada registrada entram no denominador. Sessões sem chamada são ignoradas no cálculo. A frequência exibida é `presenças ÷ convocações × 100`, arredondada para inteiro.
- **Média por jogo**: calculada como `total de minutos ÷ jogos disputados`, arredondada para inteiro (minutos). Quando `jogos disputados = 0`, exibe `—`.
- **Gráfico de Minutagem em jogos**: linha ou barra (decisão de planejamento), com eixo X em ordem cronológica crescente das datas dos jogos e eixo Y em minutos jogados; jogos com 0 minutos são plotados em zero, não omitidos.
- **Histórico de Jogos**: lista todos os jogos em que o aluno aparece registrado (com qualquer minutagem, incluindo 0); sem paginação nesta entrega.
- **Sem persistência adicional**: o dashboard é leitura-somente; não cria nem altera dados. A origem de dados (estado em memória existente vs. mocks dedicados) é decisão de planejamento.
- **Acesso**: o Dashboard do Aluno é parte do mesmo item de menu "Dashboard" (já existente para Treinos), sem requisito adicional de autenticação além do já existente no app.
- **Itens explicitamente excluídos**: "Min Treinados" (do resumo de treinos do protótipo) e "Como Titular" (do resumo de jogos do protótipo) NÃO são exibidos nesta entrega, conforme solicitado pelo usuário.
