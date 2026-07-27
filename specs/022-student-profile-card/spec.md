# Feature Specification: Ficha do Aluno com Avaliações Dinâmicas

**Feature Branch**: `022-student-profile-card`  
**Created**: 2026-07-27  
**Status**: Draft  
**Input**: User description: "Vamos faz a ficha do aluno, vamos seguir o modelo designer/ficha-atleta.jpeg... (ficha em 3 colunas, quadro Aluno, quadro Avaliação Geral, tipos de avaliação dinâmicos geridos pelo administrador via engrenagem, quadros por tipo com botão Avaliar/prancheta, tela de avaliação com pontuação 1–5, gráfico de evolução por item, histórico e gráfico de radar quando há avaliações)"

Referências visuais: `designer/Ficha-Atleta.jpeg` (layout da ficha e radares) e
`designer/avaliacao.png` (tela de avaliação: data, itens pontuados, evolução, histórico).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acessar e visualizar a ficha do aluno (Priority: P1)

Como treinador, quero abrir a ficha de um aluno a partir da lista de alunos para ver, em um
só lugar, os dados do atleta (foto, nome, pé dominante, data de nascimento, idade calculada,
massa corporal, estatura) e registrar uma avaliação geral em texto livre.

**Why this priority**: É a porta de entrada e a base da feature — a página precisa existir,
ser acessível e mostrar a identidade do atleta antes de qualquer avaliação. Entrega valor
imediato (visão consolidada do aluno + anotação qualitativa) mesmo sem os tipos de avaliação.

**Independent Test**: Na lista de alunos, clicar em "Ficha" de um aluno e confirmar que a
página abre com o quadro "Aluno" preenchido (com idade calculada a partir da data de
nascimento) e o quadro "Avaliação Geral" com um campo de texto longo que pode ser preenchido
e salvo, persistindo ao reabrir a ficha.

**Acceptance Scenarios**:

1. **Given** a lista de alunos cadastrados, **When** o treinador clica no botão "Ficha" de um
   aluno, **Then** a página da ficha desse aluno é exibida.
2. **Given** a ficha aberta, **When** exibida, **Then** o quadro "Aluno" mostra foto, nome,
   pé dominante, data de nascimento, idade (calculada), massa corporal e estatura.
3. **Given** um aluno com data de nascimento conhecida, **When** a ficha é exibida, **Then** a
   idade apresentada corresponde à idade atual calculada a partir da data de nascimento.
4. **Given** o quadro "Avaliação Geral", **When** o treinador digita um texto e salva, **Then**
   o texto é persistido e reaparece ao reabrir a ficha.
5. **Given** a ficha em tela larga, **When** exibida, **Then** o conteúdo é organizado em 3
   colunas; **When** exibida em tela de celular, **Then** o conteúdo colapsa para 1 coluna.

---

### User Story 2 - Gerenciar tipos de avaliação (administrador) (Priority: P2)

Como administrador, quero criar, editar e excluir tipos de avaliação (cada um com um nome e
uma lista de itens a serem avaliados) para que esses tipos passem a aparecer como quadros de
avaliação nas fichas dos alunos.

**Why this priority**: Habilita o núcleo dinâmico da feature — sem tipos cadastrados não há
quadros de avaliação para preencher. Depende de US1 apenas para a ficha existir; a gestão em
si é independente e testável isoladamente.

**Independent Test**: Como administrador, acessar a área de tipos de avaliação pela
engrenagem, criar um novo tipo informando nome e itens, filtrar a lista por nome, editar e
excluir um tipo — confirmando que a lista reflete cada operação.

**Acceptance Scenarios**:

1. **Given** um administrador na ficha, **When** ele clica no botão de engrenagem no topo,
   **Then** é exibida a área de gestão de tipos de avaliação com a lista dos tipos cadastrados
   (nome + opções de editar e excluir), um campo de filtro por nome e um botão "Novo".
2. **Given** a área de tipos, **When** o administrador clica em "Novo", informa um nome e
   adiciona um ou mais itens a avaliar, e salva, **Then** o novo tipo aparece na lista.
3. **Given** tipos cadastrados, **When** o administrador digita no campo de filtro, **Then** a
   lista mostra apenas os tipos cujo nome corresponde ao filtro.
4. **Given** um tipo existente, **When** o administrador edita seu nome/itens e salva, **Then**
   as alterações são refletidas na lista e nos quadros das fichas.
5. **Given** um tipo existente com avaliações registradas, **When** o administrador o exclui
   (arquiva), **Then** o tipo deixa de aparecer na lista de gestão e não é mais oferecido para
   novas avaliações, mas o histórico das avaliações já registradas é preservado e consultável.
6. **Given** um usuário sem papel de administrador, **When** ele visualiza a ficha, **Then** o
   botão de engrenagem/gestão de tipos não está disponível para ele.

---

### User Story 3 - Avaliar o aluno e visualizar evolução por tipo (Priority: P3)

Como treinador, quero, em cada quadro de tipo de avaliação na ficha, registrar uma avaliação
(data + pontuação de 1 a 5 por item) e visualizar a evolução do aluno naquele tipo (gráfico
de radar do estado atual, gráfico de evolução por item e histórico de avaliações).

**Why this priority**: É a entrega final de valor — transforma os tipos em medições reais e
acompanháveis ao longo do tempo. Depende de US1 (ficha) e US2 (existir ao menos um tipo).

**Independent Test**: Em uma ficha com ao menos um tipo cadastrado, usar o botão "Avaliar" de
um quadro, informar data e pontuar os itens de 1 a 5, salvar, e confirmar que o quadro passa a
exibir um gráfico de radar, que o botão "Avaliar" migra para o canto superior direito (apenas
ícone com tooltip "Avaliar"), e que a tela de avaliação mostra o gráfico de evolução por item
e o histórico de avaliações.

**Acceptance Scenarios**:

1. **Given** um quadro de tipo sem avaliações, **When** exibido, **Then** ele mostra o nome do
   tipo no título e um botão "Avaliar" com ícone de prancheta.
2. **Given** o botão "Avaliar", **When** o treinador o aciona, **Then** é exibida a tela de
   avaliação com um campo de data e cada item do tipo pontuável de 1 a 5.
3. **Given** a tela de avaliação preenchida, **When** o treinador salva, **Then** a avaliação é
   registrada com a data informada e as pontuações dos itens.
4. **Given** um tipo com ao menos uma avaliação registrada, **When** o quadro é exibido na
   ficha, **Then** ele mostra um gráfico de radar e o botão "Avaliar" aparece no canto superior
   direito apenas como ícone com tooltip "Avaliar".
5. **Given** a tela de avaliação de um tipo com histórico, **When** exibida, **Then** ela mostra
   um gráfico com a evolução do aluno por item ao longo das datas e a lista do histórico de
   avaliações.
6. **Given** os tipos cadastrados, **When** a ficha é exibida, **Then** os quadros dos tipos são
   distribuídos entre a 2ª e a 3ª coluna.

---

### Edge Cases

- **Aluno sem foto**: o quadro "Aluno" exibe um espaço reservado/placeholder no lugar da foto.
- **Aluno sem dados físicos** (massa corporal/estatura/pé dominante ainda não informados): os
  campos aparecem vazios ou com indicador de "não informado", sem quebrar a ficha.
- **Nenhum tipo de avaliação cadastrado**: as colunas 2 e 3 aparecem vazias (ou com mensagem
  orientando o administrador a cadastrar tipos).
- **Tipo com apenas 1 item**: o gráfico de radar exige múltiplos eixos para fazer sentido — com
  1 item, o quadro deve exibir a pontuação de forma legível (ex.: valor/lista) sem quebrar.
- **Exclusão de um tipo que já possui avaliações registradas**: a exclusão é um **arquivamento
  (soft delete)** — o tipo deixa de aparecer na lista de gestão e seus quadros deixam de ser
  oferecidos para novas avaliações, mas as avaliações já registradas são preservadas e seu
  histórico permanece consultável (ver FR-013).
- **Edição de itens de um tipo com avaliações existentes**: avaliações passadas preservam os
  itens/pontuações com que foram registradas; itens novos passam a valer para avaliações
  futuras (não retroagem).
- **Filtro sem correspondência**: a lista de tipos mostra estado vazio quando nenhum nome
  corresponde ao filtro.
- **Duas avaliações na mesma data para o mesmo tipo**: ambas são mantidas no histórico (a data
  não é chave única), ordenadas cronologicamente.

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e layout da ficha**

- **FR-001**: O sistema MUST adicionar, na lista de alunos cadastrados, um botão "Ficha" que
  abre a página da ficha do aluno correspondente.
- **FR-002**: A ficha MUST ser organizada em 3 colunas em telas largas e colapsar para 1 coluna
  em telas de celular.

**Quadro Aluno e Avaliação Geral**

- **FR-003**: A ficha MUST exibir, na 1ª coluna, um quadro "Aluno" com: foto, nome, pé dominante
  (Direito, Esquerdo ou Ambidestro), data de nascimento, idade, massa corporal e estatura.
- **FR-004**: O sistema MUST calcular e exibir a idade do aluno automaticamente a partir da data
  de nascimento.
- **FR-005**: O sistema MUST permitir informar/atualizar os dados do atleta (foto, pé dominante,
  massa corporal, estatura) por **edição inline no próprio quadro "Aluno" da ficha**; o
  formulário de cadastro/edição de aluno na tela de Alunos permanece com nome, data de
  nascimento e categoria (sem esses campos novos).
- **FR-006**: A ficha MUST exibir, abaixo do quadro "Aluno", um quadro "Avaliação Geral" com um
  campo de texto longo que o treinador pode preencher e salvar, com o conteúdo persistido por
  aluno.

**Tipos de avaliação (dinâmicos)**

- **FR-007**: O sistema MUST permitir que o administrador acesse, por um botão de engrenagem no
  topo da ficha, a área de gestão dos tipos de avaliação.
- **FR-008**: A área de gestão MUST listar todos os tipos de avaliação cadastrados exibindo o
  nome de cada tipo e as opções de editar e excluir.
- **FR-009**: A área de gestão MUST oferecer um campo para filtrar os tipos de avaliação por nome.
- **FR-010**: A área de gestão MUST oferecer um botão "Novo" que permite cadastrar um tipo
  informando um nome e adicionando os itens a serem avaliados.
- **FR-011**: O sistema MUST exigir que um tipo de avaliação tenha um nome e ao menos um item.
- **FR-012**: O sistema MUST permitir editar o nome e os itens de um tipo existente.
- **FR-013**: O sistema MUST permitir excluir um tipo existente por **arquivamento (soft
  delete)**: o tipo é removido da lista de gestão e não é mais oferecido para novas avaliações,
  mas as avaliações já registradas com ele são preservadas e seu histórico permanece consultável.
- **FR-014**: O acesso à gestão de tipos de avaliação MUST ser restrito ao papel de
  administrador.
- **FR-015**: Ao cadastrar um tipo, o sistema MUST passar a exibi-lo como um quadro nas fichas
  dos alunos, distribuindo os quadros dos tipos entre a 2ª e a 3ª coluna.

**Quadros de tipo e fluxo de avaliação**

- **FR-016**: Cada quadro de tipo MUST exibir o nome do tipo no título.
- **FR-017**: Quando um tipo ainda não tiver avaliação para o aluno, o quadro MUST exibir um
  botão "Avaliar" com ícone de prancheta.
- **FR-018**: Ao acionar "Avaliar", o sistema MUST exibir uma tela de avaliação com um campo de
  data e cada item do tipo pontuável em uma escala de 1 a 5.
- **FR-019**: O sistema MUST registrar a avaliação com a data informada e as pontuações por item,
  associada ao aluno e ao tipo.
- **FR-020**: A tela de avaliação MUST exibir um gráfico com a evolução do aluno por item ao
  longo das datas e a lista do histórico de avaliações daquele tipo.
- **FR-021**: Quando um tipo já tiver ao menos uma avaliação para o aluno, o quadro na ficha MUST
  exibir um gráfico de radar e apresentar o acionador "Avaliar" no canto superior direito apenas
  como ícone, com tooltip "Avaliar".
- **FR-022**: O sistema MUST persistir os dados da ficha (dados do atleta, avaliação geral, tipos
  de avaliação e avaliações registradas) de forma que permaneçam disponíveis entre sessões.

### Key Entities *(include if feature involves data)*

- **Aluno (estendido)**: além dos dados já existentes (nome, data de nascimento, categoria),
  passa a ter foto, pé dominante (Direito/Esquerdo/Ambidestro), massa corporal e estatura. A
  idade é derivada da data de nascimento (não armazenada).
- **Avaliação Geral**: texto qualitativo livre associado a um aluno (um por aluno, editável).
- **Tipo de Avaliação**: definição reutilizável criada dinamicamente pelo administrador; possui
  nome e uma lista de itens a avaliar. Compartilhada por todos os alunos.
- **Item de Avaliação**: elemento avaliável pertencente a um tipo (identificado por nome).
- **Avaliação (registro)**: medição de um aluno em um tipo, em uma data, contendo a pontuação
  (1 a 5) de cada item do tipo. Um aluno pode ter várias avaliações por tipo ao longo do tempo,
  formando o histórico e a evolução.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir da lista de alunos, o treinador abre a ficha de um aluno em no máximo 2
  cliques.
- **SC-002**: 100% das fichas exibem a idade correta calculada a partir da data de nascimento.
- **SC-003**: O administrador consegue cadastrar um novo tipo de avaliação (nome + itens) e vê o
  quadro correspondente aparecer nas fichas em menos de 1 minuto, sem suporte técnico.
- **SC-004**: Após salvar uma avaliação, o quadro do tipo passa a exibir o gráfico de radar e o
  acionador "Avaliar" no canto superior direito, refletindo a mudança imediatamente.
- **SC-005**: Em tela de celular, a ficha é totalmente utilizável em coluna única, sem perda de
  informação nem rolagem horizontal.
- **SC-006**: Dados do atleta, avaliação geral e avaliações registradas permanecem disponíveis
  após recarregar a página ou reabrir a ficha em uma nova sessão.
- **SC-007**: O acesso à gestão de tipos de avaliação é negado a usuários não administradores em
  100% das tentativas.

## Assumptions

- **Papéis**: gerir tipos de avaliação é exclusivo do administrador (botão de engrenagem);
  visualizar a ficha, preencher a "Avaliação Geral" e registrar avaliações são ações
  operacionais disponíveis ao professor (e também ao administrador).
- **Persistência**: a feature substitui o antigo modelo de avaliação técnico-tático-mental
  (removido na feature 021) por um modelo dinâmico e persistente, seguindo a arquitetura
  API-first do projeto (dados no backend), não mais fixo em três dimensões.
- **Escopo dos campos do atleta**: seguem o pedido explícito do usuário (foto, nome, pé
  dominante, data de nascimento, idade, massa corporal, estatura). Os campos adicionais que
  aparecem na imagem de referência (`% Gordura`, `Estágio Maturacional`, `Posição`,
  filtros de topo, "Desempenho x Projeção") são considerados fora do escopo desta feature.
- **Unidades**: massa corporal em quilogramas e estatura em metros; a idade é exibida em anos.
- **Escala de pontuação**: inteiros de 1 a 5 por item (conforme o pedido), sem casas decimais.
- **Radar**: o gráfico de radar de um quadro reflete as pontuações por item da avaliação mais
  recente do aluno naquele tipo.
- **Avaliação Geral**: é um único texto editável por aluno (não versionado por data).
- **Tipos compartilhados**: os tipos de avaliação são globais (valem para todos os alunos), não
  específicos por aluno ou por categoria.
- **Foto**: fornecida por upload de imagem pelo usuário; exibição com placeholder quando ausente.
- **Edição dos dados do atleta**: feita inline no quadro "Aluno" da ficha (decisão do usuário); o
  cadastro de aluno na tela de Alunos não muda.
- **Exclusão de tipos = soft delete**: alinhado à obrigação de soft delete da constituição para
  dados de domínio; nenhum registro de avaliação é apagado fisicamente ao excluir um tipo.
- Esta feature reaproveita a autenticação e o cadastro de alunos existentes.
