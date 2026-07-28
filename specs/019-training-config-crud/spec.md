# Feature Specification: CRUD de Configuração de Itens de Treino

**Feature Branch**: `019-training-config-crud`  
**Created**: 2026-07-13  
**Status**: Draft  
**Input**: User description: "Vamos implementar um crud para os itens do treino, para isso será exibido para o usuário administrador do lado direito do botão Novo Treino o botão configurações (Esse deve ter menor destaque), ao clicar nesse botão o usuário será levado para o cadastro de itens de configuração do treino, nessa tela ele poderá cadastrar Princípios e fundamentos (Exemplo: Princípios Táticos Ofensivos, Fundamentos Técnicos), para cada principio/fundamento ele cadastra um ou mais Item Trabalhado (Exemplo: Espaço com Bola, Mobilidade, Espaço sem Bola, Finalização etc). Ele poderá cadastrar também nessa tela Momentos do Jogo (Exemplo: Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, etc...), para cada momento ele deve vincular um ou mais Princípios e fundamentos, poderá ainda para cada um desses principios selecionar os Itens Trabalhados. Por enquanto todos os dados serão mocados, mock os dados que já estão fixos no sistema"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar a tela de configuração de treino (Priority: P1)

Como Administrador, ao acessar a lista de treinos, quero ver um botão **Configurações** ao lado do botão **Novo Treino** (com menor destaque visual) para entrar na tela de gerenciamento dos itens de configuração usados na montagem de um treino.

**Why this priority**: É o ponto de entrada de toda a funcionalidade. Sem ele, nenhuma das capacidades de gerenciamento é acessível. Também estabelece o controle de acesso (somente Administrador).

**Independent Test**: Fazer login como Administrador, abrir a lista de treinos e confirmar que o botão "Configurações" aparece à direita de "Novo Treino" com destaque secundário; clicar e chegar à tela de configuração. Fazer login como usuário não-Administrador e confirmar que o botão não aparece.

**Acceptance Scenarios**:

1. **Given** um Administrador na lista de treinos, **When** a tela é exibida, **Then** o botão "Configurações" aparece imediatamente à direita de "Novo Treino", com aparência de menor destaque (secundário) em relação a "Novo Treino".
2. **Given** um usuário sem papel de Administrador na lista de treinos, **When** a tela é exibida, **Then** o botão "Configurações" **não** é exibido.
3. **Given** um Administrador na lista de treinos, **When** clica em "Configurações", **Then** é levado à tela de configuração de itens de treino.

---

### User Story 2 - Gerenciar Princípios e Fundamentos com seus Itens Trabalhados (Priority: P1)

Como Administrador, na tela de configuração, quero cadastrar, editar e remover grupos de **Princípios e Fundamentos** (ex.: "Princípios Táticos Ofensivos", "Fundamentos Técnicos") e, dentro de cada grupo, cadastrar um ou mais **Itens Trabalhados** (ex.: "Espaço com Bola", "Mobilidade", "Finalização"), para manter a lista de opções usada na montagem de treinos.

**Why this priority**: É o núcleo do CRUD e a base para os Momentos do Jogo (US3), que dependem da existência desses itens. Entrega valor sozinha ao permitir personalizar o vocabulário técnico da escola.

**Independent Test**: Na tela de configuração, criar um novo grupo de Princípio/Fundamento, adicionar dois Itens Trabalhados, editar um item, remover outro e confirmar que a lista reflete cada operação. Reabrir a tela e confirmar que os dados permanecem durante a sessão.

**Acceptance Scenarios**:

1. **Given** a tela de configuração aberta, **When** o Administrador cadastra um novo grupo de Princípio/Fundamento com um nome, **Then** o grupo passa a aparecer na lista de Princípios e Fundamentos.
2. **Given** um grupo de Princípio/Fundamento existente, **When** o Administrador adiciona um novo Item Trabalhado com um nome, **Then** o item passa a constar dentro daquele grupo.
3. **Given** um grupo com Itens Trabalhados, **When** o Administrador edita o nome de um item, **Then** o novo nome é refletido na lista.
4. **Given** um grupo com Itens Trabalhados, **When** o Administrador remove um item, **Then** o item deixa de aparecer no grupo.
5. **Given** um grupo de Princípio/Fundamento, **When** o Administrador remove o grupo, **Then** o grupo e seus Itens Trabalhados deixam de aparecer na lista.
6. **Given** a tela de configuração recém-aberta pela primeira vez, **When** nenhum dado foi alterado, **Then** os grupos e itens já fixos no sistema aparecem pré-carregados (dados mockados: Princípios Táticos Defensivos, Princípios Táticos Ofensivos, Fundamentos Técnicos, com seus respectivos itens).

---

### User Story 3 - Gerenciar Momentos do Jogo e seus vínculos (Priority: P2)

Como Administrador, na tela de configuração, quero cadastrar, editar e remover **Momentos do Jogo** (ex.: "Org. Ofensiva", "Org. Defensiva", "Trans. Ofensiva") e, para cada momento, vincular um ou mais **Princípios e Fundamentos** e, dentro de cada princípio vinculado, selecionar quais **Itens Trabalhados** se aplicam àquele momento.

**Why this priority**: Depende de US2 (os princípios/itens precisam existir para serem vinculados). Agrega valor ao permitir estruturar quais princípios e itens são relevantes em cada momento do jogo, mas não é pré-requisito para US2.

**Independent Test**: Com pelo menos um grupo de princípio e seus itens cadastrados (US2), criar um Momento do Jogo, vincular dois princípios, selecionar itens dentro de cada princípio vinculado, salvar e confirmar que os vínculos aparecem ao reabrir o momento; então editar e remover vínculos.

**Acceptance Scenarios**:

1. **Given** a tela de configuração aberta, **When** o Administrador cadastra um novo Momento do Jogo com um nome, **Then** o momento passa a aparecer na lista de Momentos do Jogo.
2. **Given** um Momento do Jogo existente e princípios cadastrados, **When** o Administrador vincula um ou mais Princípios e Fundamentos ao momento, **Then** os princípios vinculados passam a constar naquele momento.
3. **Given** um princípio vinculado a um momento, **When** o Administrador seleciona quais Itens Trabalhados daquele princípio se aplicam, **Then** a seleção de itens é registrada para aquele momento.
4. **Given** um Momento do Jogo com vínculos, **When** o Administrador edita o nome do momento ou altera os princípios/itens vinculados, **Then** as alterações são refletidas.
5. **Given** um Momento do Jogo, **When** o Administrador remove o momento, **Then** o momento e seus vínculos deixam de aparecer.
6. **Given** a tela de configuração recém-aberta pela primeira vez, **When** nenhum dado foi alterado, **Then** os Momentos do Jogo já fixos no sistema aparecem pré-carregados (dados mockados: Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva).

---

### Edge Cases

- **Nome vazio**: Ao tentar salvar um Princípio/Fundamento, Item Trabalhado ou Momento sem nome, o sistema impede a operação e sinaliza que o nome é obrigatório.
- **Nome duplicado**: Ao cadastrar um item com nome idêntico a outro no mesmo escopo (mesmo grupo, ou mesma lista de momentos/grupos), o sistema alerta e evita a duplicação.
- **Remoção de princípio/item vinculado a momento**: Se um Princípio/Fundamento (ou Item Trabalhado) que está vinculado a um ou mais Momentos do Jogo for removido, o sistema remove também o vínculo correspondente nesses momentos, evitando referências órfãs.
- **Momento sem princípios vinculados**: Um momento pode existir sem princípios vinculados; a seleção de itens só é possível após vincular ao menos um princípio.
- **Princípio sem itens**: Um grupo de Princípio/Fundamento pode existir sem nenhum Item Trabalhado; nesse caso não há itens a selecionar quando vinculado a um momento.
- **Perda de dados ao recarregar**: Como os dados são mockados/em memória apenas nesta fase, alterações não persistem após recarregar/fechar o navegador — comportamento aceito e esperado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir, na lista de treinos, um botão "Configurações" imediatamente à direita do botão "Novo Treino", **apenas** para usuários com papel de Administrador.
- **FR-002**: O botão "Configurações" MUST ter menor destaque visual (estilo secundário) do que o botão "Novo Treino".
- **FR-003**: Ao clicar em "Configurações", o sistema MUST levar o Administrador a uma tela dedicada de configuração de itens de treino.
- **FR-004**: A tela de configuração MUST ser acessível somente por Administradores; usuários sem esse papel não devem visualizar o botão nem acessar a tela.
- **FR-005**: O sistema MUST permitir ao Administrador cadastrar, editar e remover grupos de **Princípios e Fundamentos**, identificados por um nome.
- **FR-006**: O sistema MUST permitir ao Administrador cadastrar, editar e remover um ou mais **Itens Trabalhados** dentro de cada grupo de Princípio/Fundamento, cada um identificado por um nome.
- **FR-007**: O sistema MUST permitir ao Administrador cadastrar, editar e remover **Momentos do Jogo**, identificados por um nome.
- **FR-008**: O sistema MUST permitir, para cada Momento do Jogo, vincular um ou mais **Princípios e Fundamentos** já cadastrados.
- **FR-009**: O sistema MUST permitir, para cada Princípio/Fundamento vinculado a um Momento do Jogo, selecionar quais **Itens Trabalhados** daquele princípio se aplicam ao momento.
- **FR-010**: O sistema MUST validar que Princípios/Fundamentos, Itens Trabalhados e Momentos possuem nome não vazio antes de salvar.
- **FR-011**: O sistema MUST impedir nomes duplicados dentro do mesmo escopo (grupo de princípio para itens; lista global para grupos de princípio e para momentos).
- **FR-012**: Ao remover um Princípio/Fundamento ou um Item Trabalhado que esteja vinculado a Momentos do Jogo, o sistema MUST remover os vínculos correspondentes para não deixar referências órfãs.
- **FR-013**: O sistema MUST pré-carregar a tela de configuração com os dados já fixos no sistema (mockados), a saber: os quatro Momentos do Jogo (Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva) e os três grupos de Princípios/Fundamentos (Princípios Táticos Defensivos, Princípios Táticos Ofensivos, Fundamentos Técnicos) com seus respectivos Itens Trabalhados.
- **FR-014**: Nesta fase, o sistema MUST manter os dados apenas em memória (mockados), sem persistência em backend; a perda dos dados ao recarregar é comportamento aceito.
- **FR-015**: O sistema MUST fornecer feedback visual (confirmação de sucesso e mensagens de erro/validação) para as operações de criação, edição e remoção.

### Key Entities *(include if feature involves data)*

- **Princípio/Fundamento (Grupo)**: Categoria de conceitos táticos ou técnicos usada na montagem de treinos. Atributos: nome. Contém zero ou mais Itens Trabalhados. Exemplos fixos: "Princípios Táticos Defensivos", "Princípios Táticos Ofensivos", "Fundamentos Técnicos".
- **Item Trabalhado**: Item específico dentro de um grupo de Princípio/Fundamento. Atributos: nome. Pertence a exatamente um grupo. Exemplos: "Espaço com Bola", "Mobilidade", "Finalização".
- **Momento do Jogo**: Fase do jogo trabalhada em treino. Atributos: nome. Vincula-se a zero ou mais Princípios/Fundamentos e, por vínculo, a uma seleção de Itens Trabalhados daquele princípio. Exemplos fixos: "Org. Ofensiva", "Org. Defensiva", "Trans. Ofensiva", "Trans. Defensiva".
- **Vínculo Momento–Princípio**: Associação entre um Momento do Jogo e um Princípio/Fundamento, incluindo a seleção dos Itens Trabalhados aplicáveis àquele momento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um Administrador consegue acessar a tela de configuração a partir da lista de treinos em no máximo 2 cliques.
- **SC-002**: Um Administrador consegue cadastrar um novo grupo de Princípio/Fundamento com pelo menos um Item Trabalhado em menos de 1 minuto.
- **SC-003**: Um Administrador consegue criar um Momento do Jogo, vincular um princípio e selecionar itens em menos de 2 minutos.
- **SC-004**: 100% das operações de criação/edição/remoção refletem imediatamente na tela, sem necessidade de recarregar.
- **SC-005**: Usuários sem papel de Administrador não conseguem visualizar nem acessar a funcionalidade em 100% das tentativas.
- **SC-006**: Ao abrir a tela pela primeira vez, 100% dos itens fixos atuais do sistema (4 momentos, 3 grupos de princípios e todos os seus itens) aparecem pré-carregados.

## Assumptions

- A funcionalidade é **somente frontend** nesta fase; todos os dados são mockados/em memória, sem endpoints de backend, coleções MongoDB ou persistência entre sessões (instrução explícita do usuário: "Por enquanto todos os dados serão mocados").
- Os dados iniciais a serem mockados correspondem exatamente aos itens hoje fixos no código da tela de treinos (constantes de Momentos e de Princípios/Fundamentos), incluindo Princípios Táticos Defensivos, Princípios Táticos Ofensivos e Fundamentos Técnicos com todos os seus itens.
- O papel de Administrador já existe no sistema (feature de autenticação) e é a base para o controle de acesso; a verificação de papel reutiliza o mecanismo existente.
- A tela de configuração é uma nova rota/página, distinta da tela de montagem de treino, acessada pelo botão "Configurações".
- A relação atual entre "tipo ofensivo/defensivo" dos momentos e o filtro de grupos de princípios na montagem de treino não é requisito desta feature; o foco é o CRUD e os vínculos explícitos definidos pelo Administrador.
- Alterações feitas na configuração não precisam, nesta fase, refletir retroativamente em treinos já registrados.
