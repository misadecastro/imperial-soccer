# Feature Specification: Melhorias de UI, Dados Mocados e Fluxo de Acesso

**Feature Branch**: `005-ui-improvements-mock-data`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Melhorias de layout em student-eval.html: ocultar painel de cadastro, botão Nova Avaliação, ordenar por mais recente, paginação 10/10, botão Voltar no final, dados mocados 40 alunos jan/2025–abr/2026, fluxo de login → students.html"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Painel de Nova Avaliação Ocultável (Priority: P1)

O professor acessa a tela de avaliação de um aluno e vê apenas o histórico de avaliações e o gráfico, sem o formulário de nova avaliação em tela cheia. Quando decide registrar uma nova avaliação, clica no botão "Nova Avaliação" e o painel se expande. Após salvar ou cancelar, o painel volta a ficar oculto.

**Why this priority**: Reduz a carga visual na tela de avaliação, que é a tela mais usada pelo professor. O formulário deve aparecer somente quando necessário.

**Independent Test**: Acessar `student-eval.html` e confirmar que o formulário está oculto por padrão. Clicar em "Nova Avaliação" → formulário aparece. Salvar ou cancelar → formulário oculta novamente.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de avaliação do aluno, **When** a página carrega, **Then** o formulário de nova avaliação está oculto e apenas o histórico e o gráfico são exibidos.
2. **Given** o formulário está oculto, **When** o professor clica em "Nova Avaliação", **Then** o formulário aparece na tela.
3. **Given** o formulário está visível e o professor preenche e salva, **When** a avaliação é registrada com sucesso, **Then** o formulário volta a ficar oculto automaticamente.
4. **Given** o formulário está visível, **When** o professor clica em "Cancelar", **Then** o formulário é ocultado sem salvar dados.

---

### User Story 2 - Lista Ordenada por Mais Recente com Paginação (Priority: P2)

O professor visualiza a lista de avaliações do aluno com a avaliação mais recente no topo. Se o aluno tiver mais de 10 avaliações, a lista exibe 10 por página com controles de navegação para páginas anteriores e seguintes.

**Why this priority**: Professores consultam avaliações recentes com mais frequência; mostrar as mais antigas primeiro aumenta o esforço de navegação. A paginação garante boa legibilidade mesmo com muitas avaliações.

**Independent Test**: Com 15 avaliações registradas, confirmar que a 1ª página exibe as 10 mais recentes (ordem decrescente) e a 2ª página exibe as 5 mais antigas. Navegar entre páginas e verificar que os controles de paginação funcionam corretamente.

**Acceptance Scenarios**:

1. **Given** o aluno tem avaliações registradas, **When** a lista é exibida, **Then** as avaliações aparecem ordenadas da mais recente para a mais antiga.
2. **Given** o aluno tem mais de 10 avaliações, **When** a lista é exibida, **Then** apenas 10 registros são exibidos por vez com controles de navegação (anterior / próximo / indicador de página).
3. **Given** o professor está na 1ª página de avaliações, **When** clica em "Próxima", **Then** os próximos 10 registros são exibidos.
4. **Given** o professor está na última página, **When** tenta avançar, **Then** o botão "Próxima" está desabilitado ou não aparece.
5. **Given** uma nova avaliação é adicionada, **When** a lista re-renderiza, **Then** o professor é levado de volta à 1ª página onde o novo registro aparece no topo.

---

### User Story 3 - Botão Voltar no Final da Lista (Priority: P3)

Um botão "Voltar" visível no final da lista de avaliações permite ao professor retornar à lista de alunos sem precisar rolar a página até o topo para usar o botão do header.

**Why this priority**: Melhoria ergonômica para telas com muitas avaliações, onde o header com o botão Voltar original fica fora da área visível após o scroll.

**Independent Test**: Com o professor na tela de avaliação após rolar para o final da lista, clicar no botão "Voltar" ao final da lista e confirmar que navega de volta para `students.html` com estado preservado.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de avaliação, **When** rola até o final da lista de avaliações, **Then** um botão "Voltar" está visível abaixo da lista.
2. **Given** o professor clica no botão "Voltar" ao final da lista, **When** confirmado, **Then** retorna para a lista de alunos com o estado preservado (mesmos alunos e avaliações visíveis).

---

### User Story 4 - Dados Mocados de Alunos e Avaliações (Priority: P4)

Ao abrir a aplicação pela primeira vez (sem dados no `sessionStorage`), um conjunto pré-populado de aproximadamente 40 alunos com avaliações distribuídas entre janeiro de 2025 e abril de 2026 é carregado automaticamente, permitindo demonstrar e testar a aplicação sem cadastro manual.

**Why this priority**: Facilita demonstrações e testes da interface com dados realistas, especialmente o gráfico de evolução e a paginação, sem necessidade de cadastrar alunos manualmente.

**Independent Test**: Abrir a aplicação em uma aba anônima (sem `sessionStorage`), navegar para a lista de alunos e confirmar que aproximadamente 40 alunos aparecem com avaliações já registradas. Acessar a tela de um aluno e verificar que o gráfico exibe evolução ao longo do tempo.

**Acceptance Scenarios**:

1. **Given** não há dados salvos na sessão, **When** a aplicação é carregada, **Then** aproximadamente 40 alunos aparecem na lista com nomes aleatórios e distribuídos entre as categorias disponíveis.
2. **Given** os dados mocados foram carregados, **When** o professor acessa a tela de avaliação de qualquer aluno, **Then** o aluno possui avaliações distribuídas entre janeiro de 2025 e abril de 2026.
3. **Given** dados reais já existem na sessão, **When** a aplicação é carregada, **Then** os dados mocados NÃO substituem os dados existentes.

---

### User Story 5 - Fluxo de Acesso: Login Navega para Lista de Alunos (Priority: P5)

Ao clicar no botão de login na tela inicial, o professor é redirecionado para a lista de alunos (`students.html`), completando o fluxo de acesso da aplicação.

**Why this priority**: Atualmente o fluxo de login não está conectado à lista de alunos, tornando a aplicação inutilizável sem navegar manualmente. Este é um requisito básico de usabilidade.

**Independent Test**: Abrir `index.html` ou `login.html`, preencher as credenciais e clicar em "Entrar" → confirmar redirecionamento para `students.html`.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de login, **When** clica no botão de login (com ou sem credenciais), **Then** é redirecionado para a lista de alunos (`students.html`).
2. **Given** o professor está na tela de login, **When** a navegação para `students.html` ocorre, **Then** a lista de alunos é exibida corretamente (com dados mocados ou dados da sessão).

---

### Edge Cases

- O que acontece quando o aluno tem exatamente 10 avaliações (limite de uma página)?
- O que acontece ao adicionar uma avaliação enquanto está na página 2 — a paginação vai para a página 1?
- Se `sessionStorage` tiver dados parcialmente corrompidos, os dados mocados são carregados como fallback?
- O botão "Voltar" do final da lista e o do header devem ter o mesmo comportamento?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE ocultar o formulário de nova avaliação por padrão ao carregar a tela de avaliação do aluno.
- **FR-002**: O sistema DEVE exibir um botão "Nova Avaliação" na tela de avaliação que, ao ser clicado, torna o formulário visível.
- **FR-003**: O formulário de nova avaliação DEVE ser ocultado automaticamente após salvar com sucesso ou ao clicar em "Cancelar".
- **FR-004**: A lista de avaliações DEVE ser exibida em ordem decrescente de data (mais recente primeiro).
- **FR-005**: A lista de avaliações DEVE exibir no máximo 10 registros por página.
- **FR-006**: O sistema DEVE exibir controles de paginação (anterior / próximo / indicador de página atual) quando houver mais de 10 avaliações.
- **FR-007**: Ao adicionar, editar ou excluir uma avaliação, a lista DEVE retornar à primeira página.
- **FR-008**: O sistema DEVE exibir um botão "Voltar" ao final da lista de avaliações que navega para a lista de alunos com estado preservado.
- **FR-009**: O sistema DEVE carregar automaticamente dados mocados de aproximadamente 40 alunos com avaliações distribuídas entre janeiro de 2025 e abril de 2026, apenas quando não houver dados existentes na sessão.
- **FR-010**: O botão de login DEVE redirecionar o professor para a lista de alunos ao ser acionado.

### Key Entities

- **Aluno Mocado**: Aluno gerado automaticamente com nome, data de nascimento, categoria e avaliações pré-definidas para demonstração.
- **Avaliação Mocada**: Avaliação com data aleatória entre jan/2025 e abr/2026 e pontuações aleatórias dentro da escala válida.
- **Página de Avaliações**: Subconjunto de 10 avaliações de um aluno, ordenadas por data decrescente, para exibição paginada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor acessa a tela de avaliação de qualquer aluno e vê apenas o histórico e gráfico imediatamente, sem o formulário ocupando espaço na tela inicial.
- **SC-002**: O professor consegue registrar uma nova avaliação com no máximo 2 cliques adicionais em relação ao fluxo atual (botão "Nova Avaliação" + preencher + salvar).
- **SC-003**: Com 40+ avaliações registradas, o professor consegue navegar entre páginas em menos de 1 segundo por ação de clique.
- **SC-004**: 100% dos alunos mocados possuem pelo menos 3 avaliações distribuídas no período jan/2025–abr/2026, permitindo visualizar evolução no gráfico.
- **SC-005**: O professor consegue realizar o fluxo completo login → lista de alunos → avaliação individual sem nenhuma etapa de navegação manual.

## Assumptions

- O formulário de nova avaliação abre/fecha com toggle — clicar em "Nova Avaliação" quando o formulário já está visível não o fecha (o botão "Cancelar" fecha).
- A paginação é client-side, sem chamadas a servidor.
- Os dados mocados usam nomes brasileiros fictícios e categorias distribuídas entre Sub09 e Sub14.
- Cada aluno mocado terá entre 5 e 15 avaliações distribuídas aleatoriamente no período especificado.
- O fluxo de login não valida credenciais nesta fase (MVP sem autenticação real) — qualquer clique no botão de login redireciona para `students.html`.
- O botão "Voltar" ao final da lista tem comportamento idêntico ao botão "Voltar" do header.
- A paginação exibe no máximo 10 registros por página; este valor não é configurável pelo usuário.
