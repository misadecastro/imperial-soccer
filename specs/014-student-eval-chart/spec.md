# Feature Specification: Gráfico de Evolução do Aluno no Dashboard

**Feature Branch**: `014-student-eval-chart`  
**Created**: 2026-05-03  
**Status**: Draft  
**Input**: User description: "adicione ao dashboard do aluno o grafico de evolução com as 6 ultimas avaliações do aluno nas dimensões tatico, tecnico e mental"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Evolução nas Três Dimensões (Priority: P1)

O treinador ou o próprio aluno acessa o dashboard do aluno e visualiza um gráfico de linhas exibindo a evolução dos scores nas dimensões Tático, Técnico e Mental ao longo das últimas 6 avaliações registradas.

**Why this priority**: É o núcleo da funcionalidade. Sem o gráfico com as três dimensões, a feature não entrega valor algum.

**Independent Test**: Pode ser testado abrindo o dashboard de qualquer aluno que possua ao menos uma avaliação registrada e verificando se o gráfico aparece com as séries corretas.

**Acceptance Scenarios**:

1. **Given** um aluno com 6 ou mais avaliações registradas, **When** o treinador acessa o dashboard desse aluno, **Then** o gráfico exibe exatamente as 6 avaliações mais recentes, com três linhas distintas (Tático, Técnico, Mental) e os eixos devidamente rotulados.
2. **Given** um aluno com menos de 6 avaliações registradas (ex.: 3), **When** o treinador acessa o dashboard, **Then** o gráfico exibe apenas as avaliações existentes (3 pontos por dimensão), sem erros nem espaços em branco confusos.
3. **Given** um aluno sem nenhuma avaliação registrada, **When** o treinador acessa o dashboard, **Then** o gráfico não é exibido e uma mensagem amigável informa que ainda não há avaliações para esse aluno.

---

### User Story 2 - Identificar Tendência de Evolução ou Regressão (Priority: P2)

O treinador consegue identificar visualmente se o desempenho de um aluno em cada dimensão está melhorando, estagnado ou piorando ao longo do tempo, sem precisar comparar manualmente números de avaliações distintas.

**Why this priority**: Agrega interpretação ao gráfico. É possível operar sem isso (P1 já entrega o dado), mas essa capacidade é o principal motivo de negócio para ter o gráfico.

**Independent Test**: Pode ser testado criando um aluno com avaliações de valores decrescentes em uma dimensão e verificando se a linha correspondente no gráfico desce visivelmente.

**Acceptance Scenarios**:

1. **Given** avaliações com scores crescentes em Tático (ex.: 5, 6, 7, 8, 9, 10), **When** o treinador visualiza o gráfico, **Then** a linha "Tático" apresenta inclinação ascendente clara.
2. **Given** avaliações com scores variados em Mental, **When** o treinador passa o cursor (ou toca) sobre um ponto da linha, **Then** o valor exato daquele ponto é exibido junto com a data ou sequência da avaliação.

---

### User Story 3 - Acessar o Gráfico no Contexto do Dashboard Existente (Priority: P3)

O gráfico de evolução é integrado ao dashboard do aluno já existente, sem substituir ou deslocar as informações já presentes (dados pessoais, resumo de treinos, participação em jogos).

**Why this priority**: Garante que a nova funcionalidade não degrada a experiência atual do dashboard.

**Independent Test**: Pode ser testado carregando o dashboard de um aluno e verificando que todas as seções existentes continuam visíveis e funcionais, com o gráfico adicionado em posição lógica.

**Acceptance Scenarios**:

1. **Given** o dashboard do aluno com todas as seções existentes, **When** o treinador acessa a página, **Then** o gráfico de evolução aparece em uma nova seção abaixo das informações já existentes, sem sobrepor nenhum conteúdo anterior.
2. **Given** o dashboard em tela de dispositivo móvel, **When** o treinador acessa a página, **Then** o gráfico é responsivo e legível, sem transbordar a tela nem quebrar o layout.

---

### Edge Cases

- O que acontece quando o aluno tem exatamente 1 avaliação? O gráfico exibe um único ponto por dimensão, sem linha conectando pontos.
- O que acontece quando uma avaliação não possui score em uma das dimensões (valor nulo ou ausente)? O ponto correspondente é omitido nessa dimensão e a linha é interrompida naquele trecho, sem causar erro.
- O que acontece quando todas as avaliações possuem o mesmo score em uma dimensão? O gráfico exibe uma linha reta horizontal, o que é um resultado válido e esperado.
- O que acontece quando o aluno selecionado não existe no estado da aplicação? O dashboard exibe estado de erro ou redireciona adequadamente, sem tentar renderizar o gráfico.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O dashboard do aluno DEVE exibir uma seção de gráfico de evolução contendo as últimas 6 avaliações do aluno selecionado.
- **FR-002**: O gráfico DEVE apresentar três séries de dados distintas, identificadas visualmente, correspondentes às dimensões Tático, Técnico e Mental.
- **FR-003**: O eixo horizontal do gráfico DEVE representar a sequência temporal das avaliações (da mais antiga para a mais recente das 6 selecionadas), exibindo a data ou número de ordem de cada avaliação.
- **FR-004**: O eixo vertical do gráfico DEVE representar a escala de scores das avaliações.
- **FR-005**: Quando o aluno possuir mais de 6 avaliações registradas, o sistema DEVE exibir apenas as 6 mais recentes.
- **FR-006**: Quando o aluno possuir menos de 6 avaliações, o sistema DEVE exibir todas as avaliações disponíveis sem erro.
- **FR-007**: Quando o aluno não possuir nenhuma avaliação, o sistema DEVE ocultar o gráfico e exibir uma mensagem informativa no lugar.
- **FR-008**: O gráfico DEVE ser responsivo, ajustando-se ao tamanho da tela sem perda de legibilidade.
- **FR-009**: Cada ponto do gráfico DEVE exibir o valor do score ao ser destacado (hover ou toque), permitindo leitura precisa.

### Key Entities

- **Avaliação**: Registro de desempenho de um aluno em uma data específica, contendo scores nas dimensões Tático, Técnico e Mental, além de identificador do aluno e data de registro.
- **Aluno**: Entidade principal do dashboard; o gráfico é filtrado para exibir apenas avaliações do aluno atualmente selecionado.
- **Dimensão de Avaliação**: Uma das três categorias de medição (Tático, Técnico, Mental) que compõem cada avaliação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O treinador consegue visualizar a evolução de um aluno em todas as três dimensões em menos de 5 segundos após abrir o dashboard desse aluno.
- **SC-002**: 100% dos alunos com avaliações registradas exibem o gráfico corretamente ao ter seu dashboard acessado, sem erros visíveis.
- **SC-003**: O gráfico permanece legível e funcional em telas com largura mínima de 320px (smartphones compactos).
- **SC-004**: O dashboard existente não perde nenhuma funcionalidade após a adição do gráfico — todas as seções anteriores continuam presentes e operacionais.
- **SC-005**: O treinador consegue identificar qual dimensão cada linha representa sem consultar documentação externa (legenda visível e clara).

## Assumptions

- Os dados de avaliação já estão disponíveis no estado da aplicação (`state.avaliacoes[]`) com campos de score para as dimensões Tático, Técnico e Mental, conforme definido nas features 002/003.
- A escala de scores já está estabelecida e é uniforme entre todas as avaliações (o gráfico não precisa normalizar escalas diferentes).
- "Últimas 6 avaliações" refere-se às 6 avaliações com data de registro mais recente para o aluno em questão.
- O dashboard do aluno (feature 012) já existe e está funcional; esta feature apenas adiciona uma nova seção ao final da página.
- O componente de gráfico (Chart.js v4) já está disponível no projeto via CDN e é suficiente para renderizar gráficos de linha com múltiplas séries.
- Não há requisito de exportar ou compartilhar o gráfico nesta versão.
