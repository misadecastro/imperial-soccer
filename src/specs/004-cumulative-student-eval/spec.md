# Feature Specification: Avaliação Acumulativa do Aluno com Histórico e Gráfico

**Feature Branch**: `004-cumulative-student-eval`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Melhorias na avaliação do aluno, as avaliações serão acumulativas. Ao clicar em avaliar, o professor será levado para tela de avaliação do aluno, nessa tela será exibido a lista de avaliações do aluno, os registros dessa lista poderão ser editados ou excluidos, o professor poderá registrar uma nova avaliação preenchendo a data de realização e a pontuação de cada aspecto avaliado (Tatico, Tecnico e Mental). Na tela de avaliação do aluno exiba um grafico para acompanhamento da evolução do aluno em cada aspecto."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Tela de Avaliação do Aluno (Priority: P1)

O professor clica no botão "Avaliar" de um aluno na lista de alunos e é redirecionado para a tela de avaliação daquele aluno. Nessa tela, ele visualiza o histórico completo de avaliações já registradas, com data e pontuações de cada aspecto (Tático, Técnico, Mental).

**Why this priority**: É o fluxo de entrada principal da funcionalidade — sem a tela de avaliação individual, nenhuma outra história pode ser realizada. Entrega imediatamente visibilidade do histórico acumulado do aluno.

**Independent Test**: Pode ser testada navegando da lista de alunos para a tela de avaliação de um aluno específico e verificando se o histórico de avaliações é exibido corretamente.

**Acceptance Scenarios**:

1. **Given** o professor está na lista de alunos, **When** clica em "Avaliar" de um aluno, **Then** é redirecionado para a tela de avaliação individual daquele aluno.
2. **Given** o aluno possui avaliações registradas, **When** a tela de avaliação é carregada, **Then** a lista de avaliações anteriores é exibida com data, pontuação Tática, Técnica e Mental de cada registro.
3. **Given** o aluno não possui avaliações registradas, **When** a tela de avaliação é carregada, **Then** uma mensagem informando que não há avaliações é exibida.

---

### User Story 2 - Registrar Nova Avaliação (Priority: P2)

O professor preenche um formulário na tela de avaliação do aluno informando a data de realização e a pontuação de cada aspecto (Tático, Técnico e Mental), e registra a avaliação. O registro é adicionado ao histórico acumulativo do aluno.

**Why this priority**: É a ação central da funcionalidade — permite construir o histórico acumulativo que dará sentido ao gráfico de evolução.

**Independent Test**: Pode ser testada preenchendo e submetendo o formulário de nova avaliação e verificando se o novo registro aparece na lista de histórico.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de avaliação do aluno, **When** preenche a data e as pontuações Tática, Técnica e Mental e confirma, **Then** a nova avaliação é adicionada ao histórico do aluno.
2. **Given** o professor não preenche todos os campos obrigatórios, **When** tenta salvar, **Then** uma mensagem de erro é exibida indicando os campos faltantes.
3. **Given** o professor preenche pontuações fora do intervalo permitido (0–10), **When** tenta salvar, **Then** uma mensagem de validação informa o intervalo aceito.

---

### User Story 3 - Editar ou Excluir Avaliação Existente (Priority: P3)

O professor pode corrigir ou remover uma avaliação já registrada na lista de histórico do aluno. Ao editar, os campos do registro ficam disponíveis para alteração. Ao excluir, o registro é removido do histórico após confirmação.

**Why this priority**: Garante integridade e correção dos dados — erros de digitação podem ser corrigidos e registros inválidos podem ser removidos.

**Independent Test**: Pode ser testada clicando em editar/excluir em um registro existente e verificando que a lista é atualizada corretamente.

**Acceptance Scenarios**:

1. **Given** há avaliações na lista, **When** o professor clica em "Editar" em um registro, **Then** os campos daquela avaliação ficam disponíveis para alteração.
2. **Given** o professor altera os dados de uma avaliação e confirma, **When** salva, **Then** o registro é atualizado na lista com os novos valores.
3. **Given** há avaliações na lista, **When** o professor clica em "Excluir" em um registro e confirma a ação, **Then** o registro é removido da lista.
4. **Given** o professor clica em "Excluir", **When** uma confirmação é solicitada e ele cancela, **Then** o registro permanece na lista sem alteração.

---

### User Story 4 - Visualizar Gráfico de Evolução do Aluno (Priority: P4)

O professor visualiza na tela de avaliação do aluno um gráfico que mostra a evolução das pontuações de cada aspecto (Tático, Técnico e Mental) ao longo do tempo, permitindo identificar tendências de desenvolvimento do aluno.

**Why this priority**: Complementa o histórico com inteligência visual — facilita a interpretação da evolução do aluno sem necessidade de analisar cada registro individualmente.

**Independent Test**: Pode ser testada verificando que o gráfico é exibido com séries distintas para cada aspecto e reflete corretamente os dados da lista de avaliações.

**Acceptance Scenarios**:

1. **Given** o aluno possui duas ou mais avaliações registradas, **When** a tela de avaliação é carregada, **Then** um gráfico é exibido com o eixo X representando datas e o eixo Y representando pontuações, com séries distintas para Tático, Técnico e Mental.
2. **Given** o aluno possui apenas uma avaliação, **When** a tela de avaliação é carregada, **Then** o gráfico exibe o ponto único de cada aspecto.
3. **Given** uma nova avaliação é registrada, editada ou excluída, **When** a ação é salva, **Then** o gráfico é atualizado automaticamente para refletir os dados atuais.

---

### Edge Cases

- O que acontece se o professor tentar registrar duas avaliações com a mesma data para o mesmo aluno?
- Como o gráfico se comporta se houver muitas avaliações (ex: mais de 20 registros)?
- O que acontece ao excluir a única avaliação existente de um aluno (lista e gráfico ficam vazios)?
- Como o sistema lida com pontuações iguais em todas as datas (linha plana no gráfico)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE redirecionar o professor para a tela de avaliação individual do aluno ao clicar em "Avaliar" na lista de alunos.
- **FR-002**: A tela de avaliação do aluno DEVE exibir a lista completa de avaliações registradas do aluno, incluindo data de realização e pontuação de cada aspecto (Tático, Técnico e Mental).
- **FR-003**: O professor DEVE poder registrar uma nova avaliação informando: data de realização, pontuação Tática, pontuação Técnica e pontuação Mental.
- **FR-004**: O sistema DEVE validar que todos os campos da nova avaliação estão preenchidos antes de salvar.
- **FR-005**: O sistema DEVE validar que as pontuações estão dentro do intervalo de 0 a 10.
- **FR-006**: O professor DEVE poder editar os dados de qualquer avaliação existente na lista do aluno.
- **FR-007**: O professor DEVE poder excluir qualquer avaliação existente na lista do aluno, com solicitação de confirmação antes da exclusão efetiva.
- **FR-008**: O sistema DEVE exibir um gráfico na tela de avaliação do aluno, mostrando a evolução temporal das pontuações Tática, Técnica e Mental com séries visualmente distintas.
- **FR-009**: O gráfico DEVE ser atualizado automaticamente sempre que avaliações forem adicionadas, editadas ou excluídas.
- **FR-010**: A lista de avaliações DEVE ser ordenada cronologicamente por data de realização (mais antiga primeiro), o que também define a ordem no eixo X do gráfico.

### Key Entities

- **Aluno**: Representa o atleta avaliado; possui identificador único e dados cadastrais.
- **Avaliação**: Representa um registro de avaliação de um aluno em uma data específica; atributos: data de realização, pontuação Tática (0–10), pontuação Técnica (0–10), pontuação Mental (0–10).
- **Aspecto de Avaliação**: Uma das três dimensões avaliadas (Tático, Técnico, Mental); cada aspecto possui uma pontuação por avaliação e é representado como uma série independente no gráfico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor acessa a tela de avaliação de um aluno a partir da lista em no máximo 1 clique.
- **SC-002**: O professor consegue registrar uma nova avaliação completa em menos de 1 minuto.
- **SC-003**: 100% das avaliações registradas são exibidas corretamente na lista e refletidas no gráfico sem necessidade de recarregar a página.
- **SC-004**: O professor consegue identificar a tendência de evolução do aluno em cada aspecto visualmente no gráfico, sem precisar comparar registros individualmente na lista.
- **SC-005**: Edições e exclusões de avaliações são refletidas imediatamente na lista e no gráfico, sem perda de outros registros do aluno.

## Assumptions

- A pontuação de cada aspecto (Tático, Técnico e Mental) segue uma escala numérica de 0 a 10.
- É permitido registrar mais de uma avaliação na mesma data; o sistema as trata como registros independentes.
- Os dados de avaliações são mantidos em memória (in-memory), consistente com a arquitetura atual do projeto, sem persistência entre recarregamentos de página.
- O gráfico exibe todas as avaliações existentes do aluno sem filtro de período por padrão.
- A funcionalidade é acessível apenas por usuários autenticados como professor, conforme o fluxo de login já existente.
- A tela de avaliação do aluno é uma nova view separada da lista de alunos, podendo ser uma nova página ou seção exibida dinamicamente.
- A ordenação padrão da lista de avaliações é cronológica (mais antiga primeiro), refletindo a mesma ordem no eixo X do gráfico.
