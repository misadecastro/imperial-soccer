# Feature Specification: Autenticação de Usuários com Perfil Admin

**Feature Branch**: `016-user-authentication`  
**Created**: 2026-06-27  
**Status**: Draft  
**Input**: User description: "agora vamos implementar a autenticação com AspNetCore.Identity, teremos uma conta com perfil admin que poderar cadastrar usuários"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login de Usuário Autorizado (Priority: P1)

Um usuário previamente cadastrado (treinador/professor ou administrador) acessa a tela de login, informa suas credenciais e, se válidas, ganha acesso ao sistema. Se inválidas, recebe uma mensagem de erro genérica e permanece na tela de login.

**Why this priority**: É a base de toda a feature — sem autenticação real funcionando, nenhuma outra capacidade (cadastro de usuários, controle de acesso) tem valor. Hoje o login é simulado (qualquer clique libera o acesso); este é o ponto que corrige isso.

**Independent Test**: Pode ser testado cadastrando uma conta (via seed inicial do Admin) e tentando logar com credenciais corretas (acesso concedido) e incorretas (acesso negado com mensagem apropriada).

**Acceptance Scenarios**:

1. **Given** um usuário cadastrado com credenciais válidas, **When** ele as informa na tela de login, **Then** o sistema concede acesso e o redireciona para a área principal da aplicação.
2. **Given** um usuário informando uma senha incorreta, **When** ele tenta logar, **Then** o sistema nega o acesso e exibe uma mensagem de erro que não revela se o problema foi o identificador ou a senha.
3. **Given** um usuário não autenticado, **When** ele tenta acessar diretamente qualquer tela da aplicação (dashboard, alunos, treinos, jogos, avaliações), **Then** o sistema o redireciona para a tela de login.
4. **Given** um usuário autenticado, **When** ele aciona a opção de sair, **Then** sua sessão é finalizada e ele é redirecionado para a tela de login, perdendo o acesso às telas protegidas até logar novamente.

---

### User Story 2 - Administrador Cadastra Novos Usuários (Priority: P1)

Um usuário com perfil Administrador acessa uma área de gestão de usuários, informa os dados de um novo usuário (nome, identificador de login, senha inicial, papel) e o cadastra. O novo usuário passa a poder fazer login com as credenciais definidas.

**Why this priority**: É o requisito central explicitamente solicitado — sem ele, não há forma de o sistema ganhar novos usuários além da conta inicial, tornando a autenticação inútil na prática. Compartilha a prioridade máxima com US1 porque uma depende funcionalmente da outra para entregar valor completo.

**Independent Test**: Pode ser testado logando como Admin, cadastrando um novo usuário com papel "Professor", e em seguida fazendo logout e login com as credenciais recém-criadas, confirmando acesso concedido.

**Acceptance Scenarios**:

1. **Given** um Administrador autenticado, **When** ele acessa a área de gestão de usuários, **Then** vê a lista de usuários já cadastrados e uma opção para cadastrar um novo usuário.
2. **Given** o Administrador preenchendo o formulário de novo usuário com dados válidos e um papel (Admin ou Professor), **When** ele confirma o cadastro, **Then** o novo usuário aparece na lista e consegue fazer login imediatamente com as credenciais definidas.
3. **Given** o Administrador tentando cadastrar um usuário com um identificador de login (e-mail) já existente, **When** ele confirma o cadastro, **Then** o sistema rejeita a operação e exibe uma mensagem indicando que o identificador já está em uso.
4. **Given** um usuário com perfil Professor autenticado, **When** ele tenta acessar a área de gestão de usuários, **Then** o sistema nega o acesso, pois essa área é exclusiva do perfil Administrador.

---

### User Story 3 - Proteção Contínua das Telas Existentes (Priority: P2)

Todas as telas hoje acessíveis sem nenhuma verificação (dashboard, alunos, treinos, jogos, avaliações) passam a exigir uma sessão autenticada válida, com o mesmo comportamento e dados de antes — a autenticação é uma camada de acesso, não uma mudança nas funcionalidades existentes.

**Why this priority**: Garante que a introdução da autenticação não deixe brechas (telas ainda acessíveis sem login) nem regrida nenhum comportamento já validado nas features anteriores. Depende de US1 estar funcionando, por isso fica em segundo lugar.

**Independent Test**: Pode ser testado tentando acessar diretamente a URL de cada tela existente sem estar logado e confirmando redirecionamento para o login em 100% dos casos; depois, logando e confirmando que cada tela funciona exatamente como antes.

**Acceptance Scenarios**:

1. **Given** um usuário não autenticado, **When** ele tenta acessar qualquer URL de tela protegida diretamente, **Then** é redirecionado ao login sem nenhum dado da aplicação ser exposto.
2. **Given** um usuário autenticado navegando pelas telas existentes, **When** ele realiza qualquer operação já existente (cadastrar aluno, registrar avaliação, lançar chamada, etc.), **Then** o comportamento é idêntico ao validado antes da introdução da autenticação.

---

### Edge Cases

- O que acontece se o Administrador tentar excluir ou desativar a própria conta, ou a única conta Admin restante? O sistema deve impedir essa ação para garantir que sempre exista ao menos um Administrador ativo.
- O que acontece se um usuário tentar logar repetidamente com senha incorreta? O sistema deve aplicar um bloqueio temporário após um número razoável de tentativas, para mitigar ataques de força bruta.
- O que acontece com a sessão de um usuário que estava autenticado e teve sua conta desativada ou removida pelo Administrador enquanto usava o sistema? Na próxima ação que exigir verificação de sessão, o acesso deve ser negado e o usuário redirecionado ao login.
- O que acontece se o Administrador cadastrar um usuário e depois precisar corrigir um dado (nome, papel, redefinir senha)? Deve haver uma forma de editar um usuário já cadastrado.
- O que acontece com os dados já existentes em `sessionStorage` (alunos, treinos, jogos, avaliações) quando a autenticação é introduzida? Eles continuam acessíveis a qualquer usuário autenticado, sem segregação por usuário — a autenticação controla apenas quem entra no sistema, não qual subconjunto de dados cada usuário vê.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exigir que todo usuário se autentique (identificador + senha) antes de acessar qualquer tela funcional da aplicação.
- **FR-002**: O sistema MUST negar acesso e redirecionar ao login qualquer tentativa de acessar uma tela protegida sem uma sessão autenticada válida.
- **FR-003**: O sistema MUST oferecer dois papéis de usuário: Administrador e Professor.
- **FR-004**: O sistema MUST restringir a área de gestão de usuários (cadastro, listagem, edição) exclusivamente a usuários com papel Administrador.
- **FR-005**: O sistema MUST permitir que um Administrador cadastre um novo usuário informando nome, identificador de login, senha inicial e papel.
- **FR-006**: O sistema MUST impedir o autocadastro — novas contas só podem ser criadas por um Administrador autenticado.
- **FR-007**: O sistema MUST impedir o cadastro de dois usuários com o mesmo identificador de login.
- **FR-008**: O sistema MUST armazenar senhas de forma segura, nunca em texto plano nem reversível.
- **FR-009**: O sistema MUST exibir uma mensagem de erro genérica em tentativas de login inválidas, sem indicar se o identificador ou a senha estava incorreto.
- **FR-010**: O sistema MUST oferecer uma ação de logout que finalize a sessão do usuário corrente.
- **FR-011**: O sistema MUST garantir, a qualquer momento, a existência de pelo menos uma conta com papel Administrador ativa.
- **FR-012**: O sistema MUST aplicar um bloqueio temporário após um número configurável de tentativas de login inválidas consecutivas para a mesma conta.
- **FR-013**: O sistema MUST permitir que um Administrador visualize a lista de usuários cadastrados, incluindo nome, identificador e papel.
- **FR-014**: O sistema MUST permitir que um Administrador edite os dados de um usuário existente (nome, papel, redefinição de senha).
- **FR-015**: O sistema MUST preservar integralmente o comportamento funcional das telas e fluxos já existentes (alunos, treinos, jogos, avaliações, dashboard) após a introdução da autenticação — a única mudança é a exigência de login prévio.

### Key Entities

- **Usuário**: Pessoa com acesso ao sistema. Atributos: nome, identificador de login (e-mail), senha (armazenada com hashing seguro), papel (Administrador ou Professor), status (ativo/inativo).
- **Papel**: Define o nível de permissão de um usuário. Valores: Administrador (acesso total, incluindo gestão de usuários) e Professor (acesso às funcionalidades operacionais existentes, sem gestão de usuários).
- **Sessão**: Representa um período de acesso autenticado de um Usuário, criada no login e finalizada no logout ou por expiração.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas funcionais da aplicação exigem uma sessão autenticada válida — nenhuma tela expõe dados sem login prévio.
- **SC-002**: Um Administrador consegue cadastrar um novo usuário funcional (capaz de logar) em menos de 1 minuto.
- **SC-003**: 100% das tentativas de login com credenciais inválidas são rejeitadas, sem revelar qual campo especificamente está incorreto.
- **SC-004**: Senhas nunca aparecem em texto plano em nenhuma tela, log ou resposta do sistema.
- **SC-005**: 100% das tentativas de um usuário com papel Professor de acessar a área de gestão de usuários são bloqueadas.
- **SC-006**: Após a introdução da autenticação, 100% dos fluxos existentes (cadastro de aluno, chamada, avaliação, jogo, dashboard) continuam funcionando sem nenhuma regressão de comportamento.

## Assumptions

- **Resolução do conflito com a constituição vigente**: a constituição proíbe uso de Entity Framework/ORM e exige acesso direto via MongoDB.Driver. Esta feature assume que a autenticação será implementada com armazenamento de usuários e papéis sobre MongoDB.Driver direto (sem Entity Framework Core), conforme decisão do usuário — uma emenda de esclarecimento na constituição pode ser necessária antes do `/speckit.plan` para formalizar esse padrão de implementação de autenticação.
- Este é o primeiro trabalho de backend do projeto — atualmente não existe nenhum projeto de API; esta feature assume a criação inicial do backend (.NET) como parte de seu escopo.
- O escopo inclui também a integração do fluxo de login do frontend Angular (hoje simulado, sem validação real de credenciais) com a nova API de autenticação real, substituindo o comportamento atual de "qualquer clique libera acesso".
- Os dados de domínio (alunos, avaliações, chamadas, jogos) continuam em `sessionStorage` no frontend nesta feature — a autenticação não migra esses dados para o backend; ela apenas controla o acesso ao sistema.
- Existem apenas dois papéis nesta versão (Administrador e Professor); ambos têm acesso idêntico às funcionalidades operacionais existentes — a única diferença de permissão é o acesso à gestão de usuários, exclusiva do Administrador.
- Uma conta Administrador inicial deve ser criada automaticamente na primeira inicialização do sistema (seed), para permitir o primeiro acesso e o cadastro das demais contas.
- Recuperação de senha autônoma (“esqueci minha senha”) está fora do escopo desta versão — redefinição de senha de um usuário é feita pelo Administrador, conforme FR-014.
- Regras de complexidade de senha seguem práticas padrão de mercado (tamanho mínimo e combinação de caracteres), sem exigências regulatórias específicas informadas.
