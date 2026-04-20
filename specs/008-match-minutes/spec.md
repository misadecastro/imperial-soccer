# Feature Specification: Minutagem de Jogos

**Feature Branch**: `008-match-minutes`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "vamos criar a funcionalidade de minutagem, ainda somente mock sem backend, para isso adicone uma terceira opção entre alunos e treino, no menu horizontal inferior, essa opção tera o nome de jogos. Ao clicar em jogos traga a lista de jogos cadastrados por ordem de data de realização. A lista deve exibir a data do jogo, o nome e a quantidade de alunos. terá também nessa funcionalidade a opção de adicionar um novo jogo, para isso ele deve clicar em novo jogo, depois preencher a data de realização, o nome, e ao clicar na opção adicionar alunos traga a lista de alunos com opção de filtrar por nome e categoria, na lista ele seleciona um ou mais alunos para adicionar ao jogo, ao adicionar o aluno ao jogo exiba o nome e a categoria, permita também que na lista o usuário possa preencher no registro de cada aluno a minutagem (minutos que ele jogou). Depois o usuário salva o jogo, adicione também a funcionalidade de editar e excluir jogos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar novo jogo com minutagem (Priority: P1)

O professor acessa a tela "Jogos", clica em "Novo Jogo", preenche a data de realização e o nome do jogo (ex.: "vs. América"), adiciona alunos filtrando por nome ou categoria, registra os minutos jogados de cada aluno e salva o jogo.

**Why this priority**: É o fluxo principal da feature — sem poder cadastrar jogos, nenhuma outra funcionalidade tem valor. Registrar a minutagem de cada aluno é o objetivo central do módulo.

**Independent Test**: Criar um jogo com data, nome "vs. América", 3 alunos de categorias diferentes e minutagem distinta para cada um, salvar e verificar que o jogo aparece na lista com data, nome e "3 alunos".

**Acceptance Scenarios**:

1. **Given** o professor está na tela Jogos, **When** clica em "Novo Jogo", **Then** um formulário é exibido com campos de data de realização e nome do jogo.
2. **Given** o formulário de novo jogo está aberto, **When** o professor clica em "Adicionar Alunos", **Then** a lista completa de alunos é exibida com campo de busca por nome e filtro por categoria.
3. **Given** a lista de seleção de alunos está exibida, **When** o professor seleciona um ou mais alunos e confirma, **Then** os alunos aparecem no formulário do jogo com nome, categoria e campo para minutagem.
4. **Given** alunos adicionados ao jogo com minutagem preenchida, **When** o professor clica "Salvar", **Then** o jogo é registrado e aparece na lista com data, nome e contagem de alunos correta.
5. **Given** o professor tenta salvar o jogo, **When** a data ou o nome estão em branco, **Then** uma mensagem de erro indica os campos obrigatórios pendentes.

---

### User Story 2 - Consultar lista de jogos (Priority: P1)

O professor acessa a tela "Jogos" e vê todos os jogos cadastrados listados em ordem cronológica decrescente (mais recente primeiro), com data formatada, nome e quantidade de alunos participantes.

**Why this priority**: A lista é o ponto de entrada da funcionalidade. O professor precisa visualizar o histórico de partidas para gerenciar registros e verificar o que já foi salvo.

**Independent Test**: Com 3 jogos cadastrados em datas diferentes, abrir a tela Jogos e verificar que os 3 aparecem em ordem decrescente de data, cada um com data, nome e número de alunos.

**Acceptance Scenarios**:

1. **Given** existem jogos cadastrados, **When** o professor acessa a tela Jogos, **Then** a lista exibe todos os jogos em ordem decrescente de data de realização.
2. **Given** a lista está exibida, **When** o professor observa cada item, **Then** cada jogo mostra a data formatada, o nome e a quantidade de alunos participantes.
3. **Given** não há jogos cadastrados, **When** o professor acessa a tela Jogos, **Then** uma mensagem amigável informa que ainda não há jogos registrados.

---

### User Story 3 - Navegar para Jogos pelo menu (Priority: P1)

O menu de navegação inferior exibe três opções — "Alunos", "Treino" e "Jogos" — em todas as telas pós-autenticação. O professor alterna entre seções com um único toque.

**Why this priority**: Sem o menu, o professor não tem como acessar a nova tela de Jogos a partir das demais telas. A navegação é pré-requisito para que a funcionalidade seja utilizável no dia a dia.

**Independent Test**: Estando na tela de Alunos, clicar em "Jogos" no menu e confirmar que a tela de Jogos é exibida com o item "Jogos" destacado como ativo.

**Acceptance Scenarios**:

1. **Given** o professor está em qualquer tela pós-login, **When** olha para o menu inferior, **Then** três itens — "Alunos", "Treino" e "Jogos" — são visíveis.
2. **Given** o professor está em qualquer tela, **When** toca "Jogos" no menu, **Then** a tela de Jogos é exibida e o item "Jogos" aparece destacado como ativo.
3. **Given** o professor está na tela Jogos, **When** toca "Alunos" ou "Treino", **Then** navega para a tela correspondente sem perda de dados não salvos.

---

### User Story 4 - Editar jogo registrado (Priority: P2)

O professor pode editar um jogo já salvo para corrigir a data, o nome, os alunos participantes ou as minutagens individuais.

**Why this priority**: Erros de digitação e convocações imprevistas são comuns. A edição evita que registros incorretos permaneçam, mas a feature já tem valor sem ela — pode-se excluir e recriar.

**Independent Test**: Editar o nome e a minutagem de um aluno de um jogo existente, salvar e confirmar que as alterações aparecem na lista e nos detalhes do jogo.

**Acceptance Scenarios**:

1. **Given** a lista de jogos, **When** o professor toca "Editar" em um jogo, **Then** o formulário de edição é exibido preenchido com os dados atuais.
2. **Given** o formulário de edição aberto, **When** o professor altera o nome do jogo e a minutagem de um aluno e salva, **Then** as alterações ficam registradas e visíveis na lista.
3. **Given** o formulário de edição, **When** o professor remove um aluno da lista de participantes e salva, **Then** esse aluno não aparece mais nesse jogo.

---

### User Story 5 - Excluir jogo (Priority: P2)

O professor pode excluir um jogo da lista após confirmação, removendo permanentemente todos os seus dados.

**Why this priority**: Permite corrigir registros criados por engano. Frequência baixa comparada ao cadastro; por isso P2.

**Independent Test**: Excluir um jogo da lista, confirmar o diálogo de confirmação e verificar que o jogo não aparece mais na tela.

**Acceptance Scenarios**:

1. **Given** a lista de jogos, **When** o professor toca "Excluir" em um jogo, **Then** um diálogo de confirmação pergunta se deseja realmente excluir.
2. **Given** o diálogo de confirmação aberto, **When** o professor confirma, **Then** o jogo é removido da lista e uma mensagem de sucesso é exibida.
3. **Given** o diálogo de confirmação aberto, **When** o professor cancela, **Then** o jogo permanece inalterado.

---

### Edge Cases

- O que acontece se o professor tentar salvar um jogo sem data? → Exibir mensagem de erro — data é obrigatória.
- O que acontece se o professor tentar salvar um jogo sem nome? → Exibir mensagem de erro — nome é obrigatório.
- O que acontece se o professor tentar salvar sem adicionar alunos? → Permitir — jogo sem participantes é um registro incompleto válido.
- O que acontece se o professor tentar adicionar o mesmo aluno duas vezes ao mesmo jogo? → O sistema ignora a segunda adição (aluno já presente na lista do jogo).
- O que acontece se a minutagem de um aluno for deixada em branco ao salvar? → Tratar como 0 minutos — campo em branco não bloqueia o salvamento.
- O que acontece se não houver alunos cadastrados ao tentar adicionar ao jogo? → Exibir mensagem amigável informando que não há alunos cadastrados no sistema.
- O que acontece se o professor tentar cadastrar um jogo com data futura? → Permitir — jogos podem ser registrados com antecedência.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma tela dedicada de "Jogos" acessível pelo menu de navegação inferior.
- **FR-002**: O sistema DEVE listar todos os jogos cadastrados em ordem cronológica decrescente (mais recente primeiro).
- **FR-003**: Cada item da lista DEVE exibir a data do jogo formatada, o nome do jogo e a quantidade de alunos participantes.
- **FR-004**: O sistema DEVE oferecer um botão "Novo Jogo" que abre formulário com campos de data de realização (obrigatória) e nome (obrigatório).
- **FR-005**: O formulário de jogo DEVE oferecer a opção "Adicionar Alunos", que exibe a lista completa de alunos cadastrados.
- **FR-006**: A lista de seleção de alunos DEVE permitir filtrar por nome e por categoria.
- **FR-007**: O sistema DEVE permitir selecionar um ou mais alunos para adicionar ao jogo em uma única operação de seleção.
- **FR-008**: Para cada aluno adicionado ao jogo, o sistema DEVE exibir o nome e a categoria do aluno, e um campo para registro da minutagem (inteiro ≥ 0).
- **FR-009**: O sistema DEVE impedir que o mesmo aluno seja adicionado duas vezes ao mesmo jogo.
- **FR-010**: O sistema DEVE persistir o jogo com todos os dados ao clicar "Salvar" e exibir confirmação de sucesso.
- **FR-011**: O sistema DEVE permitir editar um jogo existente — alterando data, nome, participantes e minutagem.
- **FR-012**: O sistema DEVE permitir excluir um jogo após confirmação explícita do professor.
- **FR-013**: O menu de navegação inferior DEVE exibir três itens — "Alunos", "Treino" e "Jogos" — com o item da seção ativa destacado.
- **FR-014**: O sistema DEVE exibir mensagem amigável quando não há jogos cadastrados.

### Key Entities

- **Jogo**: Partida realizada — identificado por ID único; possui data de realização, nome e uma lista de participações.
- **Participação**: Vínculo entre jogo e aluno — referência ao aluno por ID e quantidade de minutos jogados (inteiro, padrão 0).
- **Aluno**: Entidade existente (nome, data de nascimento, categoria) — reutilizada sem alteração.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor cadastra um jogo completo (data + nome + alunos + minutagem) em menos de 3 minutos para até 20 alunos.
- **SC-002**: A lista de jogos exibe todos os registros cadastrados em ordem cronológica correta.
- **SC-003**: 100% dos dados de jogos salvos (minutagem, participantes, data, nome) são recuperados corretamente ao acessar a tela novamente na mesma sessão.
- **SC-004**: O professor acessa a tela de Jogos com no máximo 1 toque a partir de qualquer tela do aplicativo.
- **SC-005**: Editar ou excluir um jogo requer no máximo 2 interações (selecionar ação + confirmar/salvar).

## Assumptions

- Os alunos já estão cadastrados no sistema (funcionalidade existente em `students.html`); a seleção consome essa lista.
- A minutagem aceita valores de 0 a 120 minutos; valores fora desse intervalo são aceitos sem bloqueio — o professor é responsável pela consistência.
- Jogos sem participantes podem ser salvos; a contagem de alunos na lista exibirá 0.
- Não há controle de duplicidade de jogos por data — o professor pode registrar mais de um jogo na mesma data.
- O jogo não tem vinculação com chamadas de treino — são entidades independentes.
- O menu de navegação passa de 2 para 3 itens; as páginas existentes (`students.html`, `student-eval.html`, `training.html`) precisarão ser atualizadas.
- A persistência usa o mesmo armazenamento de sessão do projeto; dados são perdidos ao fechar o navegador — sem backend nesta fase.
- A ordem dos itens no menu é: "Alunos" (esquerda), "Treino" (centro), "Jogos" (direita).
