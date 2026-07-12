# Feature Specification: Cadastro de Alunos com Persistência Real

**Feature Branch**: `017-student-api`  
**Created**: 2026-07-12  
**Status**: Draft  
**Input**: User description: "Agora vamos fazer no backend a api de cadastro de aluno, integrar com o front"

## User Scenarios & Testing *(mandatory)*

<!--
  Esta feature migra o cadastro de alunos do armazenamento temporário em memória do
  browser (sessionStorage) para um banco de dados real no backend, tornando os dados
  permanentes e compartilháveis entre sessões e entre diferentes professores autenticados.
-->

### User Story 1 - Cadastrar Aluno com Persistência Real (Priority: P1)

O professor preenche o formulário de cadastro de aluno (nome, data de nascimento, categoria) e ao confirmar, o aluno é salvo no sistema de forma permanente — não se perde ao fechar o navegador, ao recarregar a página, ou ao fazer logout e login novamente.

**Why this priority**: É o núcleo da feature. Sem persistência real, nenhum dado de aluno tem valor operacional a longo prazo. Sem ela, as demais funcionalidades (avaliações, chamadas, minutagem em jogos) também perdem sentido.

**Independent Test**: Cadastrar um aluno, fechar o navegador completamente, abrir novamente, fazer login e verificar que o aluno continua na lista.

**Acceptance Scenarios**:

1. **Given** um professor autenticado no sistema, **When** ele preenche os dados do aluno e confirma o cadastro, **Then** o aluno aparece imediatamente na listagem e continua disponível após recarregar a página.
2. **Given** um aluno recém-cadastrado, **When** outro professor autenticado acessa o sistema em um navegador diferente, **Then** o aluno aparece na lista dele também (dados compartilhados entre usuários da mesma escola).
3. **Given** o professor tenta cadastrar um aluno com campos obrigatórios em branco, **When** ele confirma o formulário, **Then** o sistema rejeita o cadastro com mensagem de erro clara indicando o(s) campo(s) faltante(s), sem criar registro parcial.
4. **Given** o professor tenta cadastrar um aluno com data de nascimento futura, **When** ele confirma, **Then** o sistema rejeita com mensagem explicativa.

---

### User Story 2 - Listar e Filtrar Alunos do Backend (Priority: P1)

O professor acessa a tela de alunos e vê a lista carregada diretamente do backend, podendo filtrar por nome e por categoria — exatamente como hoje, mas com dados reais e persistentes no lugar dos dados temporários gerados automaticamente.

**Why this priority**: A listagem é o ponto de entrada de todo o fluxo operacional. Sem ela funcionando com dados reais, nenhuma outra tela do sistema tem utilidade.

**Independent Test**: Cadastrar alunos via tela, atualizar a página do navegador e confirmar que os filtros de nome e categoria funcionam sobre os dados reais carregados do servidor.

**Acceptance Scenarios**:

1. **Given** um professor autenticado com alunos já cadastrados, **When** ele acessa a tela de alunos, **Then** a lista exibe todos os alunos cadastrados no sistema, carregados do servidor.
2. **Given** a lista de alunos carregada, **When** o professor digita parte de um nome no campo de busca, **Then** a lista filtra em tempo real exibindo apenas os alunos cujo nome contém o texto digitado.
3. **Given** a lista de alunos carregada, **When** o professor seleciona uma categoria no filtro, **Then** apenas os alunos da categoria selecionada são exibidos.
4. **Given** nenhum aluno cadastrado no sistema, **When** o professor acessa a tela de alunos, **Then** é exibida uma mensagem amigável indicando que não há alunos cadastrados ainda (sem dados fictícios gerados automaticamente).

---

### User Story 3 - Excluir Aluno com Consistência de Dados (Priority: P2)

O professor solicita a exclusão de um aluno, e o sistema remove o aluno e todos os seus registros vinculados (avaliações) de forma permanente e consistente, sem deixar dados órfãos no sistema.

**Why this priority**: A exclusão com consistência é menos urgente que o cadastro e a listagem, mas é necessária para evitar acúmulo de dados incorretos e manter a integridade do sistema.

**Independent Test**: Cadastrar um aluno com avaliações, excluir o aluno, verificar que ele não aparece mais na lista e que suas avaliações também foram removidas.

**Acceptance Scenarios**:

1. **Given** um professor autenticado, **When** ele solicita a exclusão de um aluno e confirma, **Then** o aluno desaparece da lista e não retorna após recarregar a página.
2. **Given** um aluno com avaliações registradas, **When** ele é excluído, **Then** as avaliações associadas a ele também são removidas, sem deixar registros órfãos.
3. **Given** o professor cancela a confirmação de exclusão, **When** a operação é cancelada, **Then** o aluno permanece na lista sem nenhuma alteração.

---

### Edge Cases

- O que acontece se a conexão com o servidor cair durante o cadastro? O sistema deve exibir uma mensagem de erro sem criar um registro incompleto; o formulário permanece preenchido para reenvio.
- O que acontece se dois professores cadastrarem um aluno com o mesmo nome e data de nascimento simultaneamente? O sistema permite — nome idêntico não é critério de unicidade; cada cadastro gera um aluno independente.
- O que acontece se o professor tentar carregar a lista de alunos sem conexão com o servidor? O sistema exibe uma mensagem de erro informando que não foi possível carregar os dados; não exibe dados desatualizados em cache.
- O que acontece quando há muitos alunos (ex.: 200+)? A listagem deve permanecer responsiva; a filtragem por nome e categoria deve continuar funcionando sem degradação perceptível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um professor autenticado cadastre um aluno informando nome, data de nascimento e categoria.
- **FR-002**: O sistema MUST persistir os dados do aluno de forma permanente, garantindo que permaneçam disponíveis após encerramento e reabertura de sessão.
- **FR-003**: O sistema MUST exibir todos os alunos cadastrados ao professor ao acessar a tela de alunos, carregados de forma centralizada e compartilhada entre todos os professores autenticados.
- **FR-004**: O sistema MUST permitir filtragem da lista de alunos por nome (busca parcial, sem diferença de maiúsculas/minúsculas) e por categoria.
- **FR-005**: O sistema MUST validar que os campos obrigatórios (nome, data de nascimento, categoria) estão preenchidos antes de confirmar o cadastro.
- **FR-006**: O sistema MUST validar que a data de nascimento não é uma data futura.
- **FR-007**: O sistema MUST rejeitar o cadastro de aluno com nome com menos de 2 caracteres.
- **FR-008**: O sistema MUST permitir que um professor autenticado exclua um aluno, com solicitação de confirmação antes de efetivar a operação.
- **FR-009**: O sistema MUST remover todos os registros de avaliação vinculados a um aluno quando o aluno for excluído.
- **FR-010**: O sistema MUST exibir mensagens de erro claras e acionáveis quando uma operação falhar (cadastro, listagem ou exclusão).
- **FR-011**: O sistema MUST exigir que o professor esteja autenticado para realizar qualquer operação sobre alunos (cadastrar, listar, excluir).
- **FR-012**: O sistema MUST eliminar a geração automática de dados fictícios de alunos que atualmente ocorre quando a lista está vazia — a lista real vazia deve ser exibida como tal.

### Key Entities

- **Aluno**: O aprendiz gerido pela escola. Atributos: nome completo, data de nascimento, categoria (ex.: Sub-09, Sub-10, …, Sub-17 Fem). Cada aluno pertence à escola como um todo, não a um professor individual.
- **Categoria**: Agrupamento de alunos por faixa etária/gênero. Valores fixos definidos no sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dados de alunos cadastrados persistem e estão disponíveis após fechar e reabrir o navegador em 100% dos casos.
- **SC-002**: O professor consegue cadastrar um novo aluno em menos de 1 minuto a partir de uma lista vazia.
- **SC-003**: A listagem de alunos carrega e exibe os dados corretamente em no máximo 3 segundos sob condições normais de rede.
- **SC-004**: 100% dos alunos excluídos desaparecem da listagem e têm suas avaliações associadas removidas, sem dados órfãos remanescentes.
- **SC-005**: Os dados de alunos cadastrados por um professor autenticado são imediatamente visíveis a qualquer outro professor autenticado ao atualizar a lista.

## Assumptions

- Esta feature substitui o uso de `sessionStorage` para os dados de alunos. O `sessionStorage` atual para alunos (`imperialState.alunos`) será descontinuado após a integração com o backend.
- As avaliações (`imperialState.avaliacoes`) ainda permanecem em `sessionStorage` nesta feature — a migração de avaliações para o backend é uma feature futura. A exclusão de avaliações vinculadas ao aluno excluído (FR-009) opera sobre os dados de avaliações onde eles estiverem disponíveis.
- As categorias de alunos são um conjunto fixo já definido no sistema (Sub-09 a Sub-14, Sub-15 Fem, Sub-17 Fem) e não são gerenciadas por esta feature.
- Não há limitação de quantos alunos podem ser cadastrados por escola nesta versão.
- A feature não inclui edição de dados de aluno já cadastrado (alterar nome, data de nascimento ou categoria) — isso é escopo de uma feature futura.
- O backend de autenticação já existe (feature 016). Todos os endpoints de alunos requerem autenticação via JWT, reutilizando a infraestrutura existente.
- Os dados de alunos são globais para a escola — não há segregação por professor ou turma nesta versão.
