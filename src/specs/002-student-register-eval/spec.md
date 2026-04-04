# Feature Specification: Student Registration and Evaluation

**Feature Branch**: `002-student-register-eval`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Vamos criar a pagina mockada para validar essa funcionalidade, nessa feature o professor vai cadastrar o aluno, para isso ele vai preencher nome e data de nascimento e categoria (lista com as opções Sub 09, Sub 10, Sub 11, Sub 12, Sub 13 e Sub 14). Uma vez que o aluno é cadastrado ele será exibido em uma listagem que o professor poderá filtrar pela categoria e pelo nome do aluno. No aluno cadastrado ele pode lançar a avaliação, nessa avaliação ele pontua os aspectos Tecnico, Tatico e Mental. Ele pode receber as notas nas avaliações Excelente (5 pontos), Bom (4 pontos), Regular (3 pontos) e Precisa Melhorar (2 Pontos)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar Aluno (Priority: P1)

O professor preenche o nome, data de nascimento e categoria do aluno e confirma o cadastro. O aluno passa a fazer parte da listagem da turma.

**Why this priority**: Sem o cadastro do aluno, nenhuma outra funcionalidade pode ser exercitada. É o ponto de entrada obrigatório do fluxo.

**Independent Test**: Pode ser totalmente testado abrindo a página, preenchendo o formulário de cadastro e verificando que o aluno aparece na listagem logo abaixo.

**Acceptance Scenarios**:

1. **Given** o professor está na página de cadastro, **When** ele preenche nome, data de nascimento e seleciona uma categoria e confirma, **Then** o aluno aparece imediatamente na listagem com os dados informados.
2. **Given** o professor tenta confirmar o cadastro, **When** algum campo obrigatório está em branco, **Then** o sistema exibe uma mensagem de erro indicando o campo faltante e não realiza o cadastro.
3. **Given** o professor preenche o formulário corretamente, **When** o cadastro é confirmado, **Then** os campos do formulário são limpos, prontos para um novo cadastro.

---

### User Story 2 - Listar e Filtrar Alunos (Priority: P2)

O professor visualiza todos os alunos cadastrados em uma listagem e pode filtrar por nome e/ou categoria para localizar um aluno específico rapidamente.

**Why this priority**: A listagem é necessária para confirmar cadastros e para acessar o aluno antes de lançar avaliações. Tem dependência do cadastro (P1), mas pode ser testada com dados pré-populados.

**Independent Test**: Pode ser testado pré-carregando alunos mockados na lista e verificando que os filtros reduzem os resultados corretamente.

**Acceptance Scenarios**:

1. **Given** existem alunos cadastrados, **When** o professor acessa a listagem sem nenhum filtro ativo, **Then** todos os alunos são exibidos com nome, data de nascimento e categoria.
2. **Given** existem alunos de diferentes categorias, **When** o professor seleciona uma categoria no filtro, **Then** apenas os alunos daquela categoria são exibidos.
3. **Given** existem alunos com nomes distintos, **When** o professor digita parte do nome no filtro de busca, **Then** apenas os alunos cujo nome contém o texto digitado são exibidos.
4. **Given** os filtros de nome e categoria estão ativos simultaneamente, **When** há alunos que atendem a ambos os critérios, **Then** apenas os alunos que atendem aos dois filtros ao mesmo tempo são exibidos.
5. **Given** nenhum aluno corresponde aos filtros aplicados, **When** o resultado está vazio, **Then** o sistema exibe uma mensagem informando que nenhum aluno foi encontrado.

---

### User Story 3 - Lançar Avaliação do Aluno (Priority: P3)

O professor seleciona um aluno na listagem e registra a avaliação dos aspectos Técnico, Tático e Mental, atribuindo uma nota a cada um deles.

**Why this priority**: Depende do cadastro e da listagem, mas entrega o principal valor de negócio da feature — o registro de desempenho do aluno.

**Independent Test**: Pode ser testado selecionando um aluno mockado na lista e verificando que o formulário de avaliação aceita notas para os três aspectos e exibe confirmação após o lançamento.

**Acceptance Scenarios**:

1. **Given** o professor está na listagem com alunos cadastrados, **When** ele aciona a opção de avaliar em um aluno, **Then** um formulário de avaliação é exibido com os três aspectos (Técnico, Tático, Mental) e as opções de nota para cada um.
2. **Given** o formulário de avaliação está aberto, **When** o professor seleciona uma nota para cada aspecto e confirma, **Then** a avaliação é registrada e o professor vê uma confirmação do lançamento.
3. **Given** o professor abriu o formulário de avaliação, **When** ele tenta confirmar sem preencher todos os aspectos, **Then** o sistema indica quais aspectos estão sem nota e não permite o lançamento.
4. **Given** uma avaliação foi lançada com sucesso, **When** o professor retorna à listagem, **Then** o aluno avaliado indica visualmente que possui uma avaliação registrada.

---

### Edge Cases

- O que acontece quando o professor cadastra dois alunos com o mesmo nome na mesma categoria?
- O que acontece quando a listagem de alunos está vazia e o professor tenta aplicar filtros?
- O que acontece quando o professor abre o formulário de avaliação e cancela sem preencher nada?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o professor preencha nome, data de nascimento e categoria para cadastrar um novo aluno.
- **FR-002**: O sistema DEVE disponibilizar as categorias Sub 09, Sub 10, Sub 11, Sub 12, Sub 13 e Sub 14 como opções de seleção no cadastro.
- **FR-003**: O sistema DEVE validar que nome, data de nascimento e categoria estão preenchidos antes de confirmar o cadastro.
- **FR-004**: O sistema DEVE exibir os alunos cadastrados em uma listagem contendo nome, data de nascimento e categoria.
- **FR-005**: O sistema DEVE permitir filtrar a listagem de alunos pelo nome (busca parcial por texto).
- **FR-006**: O sistema DEVE permitir filtrar a listagem de alunos pela categoria.
- **FR-007**: O sistema DEVE permitir que os filtros de nome e categoria sejam aplicados simultaneamente.
- **FR-008**: O sistema DEVE permitir ao professor lançar uma avaliação para qualquer aluno da listagem.
- **FR-009**: O formulário de avaliação DEVE conter os três aspectos: Técnico, Tático e Mental.
- **FR-010**: Cada aspecto da avaliação DEVE oferecer exatamente quatro opções de nota: Excelente (5 pontos), Bom (4 pontos), Regular (3 pontos) e Precisa Melhorar (2 pontos).
- **FR-011**: O sistema DEVE validar que todos os três aspectos foram pontuados antes de confirmar o lançamento da avaliação.
- **FR-012**: O sistema DEVE fornecer feedback visual de confirmação após o lançamento bem-sucedido de uma avaliação.
- **FR-013**: O sistema DEVE indicar visualmente na listagem quais alunos já possuem avaliação registrada.

### Key Entities

- **Aluno**: Representa o estudante cadastrado. Atributos: nome completo, data de nascimento, categoria.
- **Categoria**: Classificação etária do aluno. Valores possíveis: Sub 09, Sub 10, Sub 11, Sub 12, Sub 13, Sub 14.
- **Avaliação**: Registro de desempenho de um aluno. Contém as pontuações dos aspectos Técnico, Tático e Mental.
- **Aspecto de Avaliação**: Dimensão de desempenho avaliada (Técnico, Tático, Mental). Recebe uma nota de acordo com a escala definida.
- **Nota**: Valor atribuído a um aspecto. Opções: Excelente (5), Bom (4), Regular (3), Precisa Melhorar (2).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor consegue cadastrar um aluno em menos de 1 minuto preenchendo o formulário.
- **SC-002**: O professor consegue localizar um aluno específico na listagem em menos de 30 segundos usando os filtros disponíveis.
- **SC-003**: O professor consegue lançar a avaliação completa de um aluno em menos de 2 minutos.
- **SC-004**: 100% dos campos obrigatórios possuem validação que impede o envio incompleto.
- **SC-005**: Os filtros de nome e categoria respondem imediatamente à interação do professor, sem necessidade de ações adicionais de confirmação.
- **SC-006**: Após o lançamento da avaliação, 100% das avaliações registradas ficam visualmente identificadas na listagem.

## Assumptions

- A página é uma implementação mockada (sem backend real), com dados persistidos apenas em memória durante a sessão do navegador.
- Apenas o perfil de professor utiliza esta página; controle de acesso por perfil está fora do escopo desta feature.
- Um aluno pode receber múltiplas avaliações ao longo do tempo, mas para esta versão mockada apenas a avaliação mais recente ou a primeira lançada precisa ser exibida.
- A listagem não requer paginação para o volume de dados esperado nesta validação mockada.
- O campo de busca por nome filtra de forma case-insensitive (ignora diferença entre maiúsculas e minúsculas).
- A data de nascimento é informada pelo professor manualmente (campo de data); não há cálculo automático de categoria baseado na idade.
