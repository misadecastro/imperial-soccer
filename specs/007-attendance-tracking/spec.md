# Feature Specification: Chamada de Treino

**Feature Branch**: `007-attendance-tracking`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "essa funcionalidade vai permitir que o professor registre a presença dos alunos em um treino. O treino é realizado dos alunos por categoria (Sub 09, Sub 10...), precisa de uma forma facil de lançar a presença dos alunos de um treino realizado em uma determinada data. Como referencia use a pagina na imagem Novo-Design/Pagian-Exemplo.png. Crie o menu para que o professor possa navegar entre Alunos e Treino."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar chamada de um treino (Priority: P1)

O professor acessa a tela "Chamada do Treino", seleciona a data do treino e a categoria (ex.: Sub 09), vê a lista dos alunos daquela categoria e marca cada um como Presente ou Falta. Ao terminar, salva a chamada.

**Why this priority**: É a funcionalidade central desta feature. Sem ela, nenhum dado de presença pode ser registrado. Todas as demais histórias dependem de chamadas existentes.

**Independent Test**: Abrir a tela de chamada, selecionar uma data e categoria, marcar 3 alunos como Presente e 1 como Falta e clicar "Salvar" — verificar que os registros aparecem no histórico.

**Acceptance Scenarios**:

1. **Given** o professor está na tela de Chamada, **When** seleciona a data de hoje e a categoria "Sub 09", **Then** a lista de alunos da Sub 09 é exibida, cada um com status "Pendente".
2. **Given** a lista de alunos está exibida, **When** o professor toca "Presente" em um aluno, **Then** o botão fica verde/ativo e o contador "Presentes" incrementa imediatamente.
3. **Given** a lista de alunos está exibida, **When** o professor toca "Falta" em um aluno, **Then** o botão fica vermelho/ativo e o contador "Faltas" incrementa imediatamente.
4. **Given** a chamada preenchida, **When** o professor toca "Salvar Presença", **Then** os dados são salvos, uma confirmação é exibida e a chamada fica acessível no histórico.
5. **Given** uma data e categoria já com chamada salva, **When** o professor acessa essa mesma combinação novamente, **Then** a chamada anterior é carregada com os status já registrados.

---

### User Story 2 - Marcar todos os alunos de uma vez (Priority: P2)

O professor usa os controles "Todos Presentes" ou "Todos Ausentes" para marcar toda a turma de uma só vez, depois ajusta individualmente os alunos que foram exceção.

**Why this priority**: Reduz o tempo de registro em turmas onde a maioria tem o mesmo status (ex.: treino com quase todos presentes).

**Independent Test**: Clicar "Todos Presentes" em uma turma de 10 alunos e verificar que todos ficam marcados como Presente e o contador exibe 10.

**Acceptance Scenarios**:

1. **Given** a lista de alunos exibida, **When** o professor toca "Todos Presentes", **Then** todos os alunos da categoria selecionada ficam marcados como Presente e o contador atualiza.
2. **Given** a lista de alunos exibida, **When** o professor toca "Todos Ausentes", **Then** todos os alunos ficam marcados como Falta.
3. **Given** o professor clicou "Todos Presentes", **When** toca "Falta" em um aluno individual, **Then** apenas aquele aluno muda para Falta e os contadores atualizam corretamente.

---

### User Story 3 - Navegar entre seções via menu (Priority: P2)

O professor pode alternar entre as seções "Alunos" e "Treino" através de um menu de navegação fixo, acessível de qualquer página do aplicativo.

**Why this priority**: Sem navegação integrada, o professor precisa usar o botão Voltar e recarregar páginas — fluxo ineficiente em campo.

**Independent Test**: Estando na tela de Alunos, clicar no item "Treino" do menu e confirmar que a tela de Chamada de Treino é exibida sem perda de dados.

**Acceptance Scenarios**:

1. **Given** o professor está em qualquer tela, **When** toca o item "Treino" no menu, **Then** a tela de Chamada de Treino é exibida.
2. **Given** o professor está em qualquer tela, **When** toca o item "Alunos" no menu, **Then** a tela de listagem de alunos é exibida.
3. **Given** o menu está visível, **When** o professor olha para ele, **Then** o item ativo é destacado visualmente para indicar a seção atual.

---

### User Story 4 - Consultar histórico de chamadas (Priority: P3)

O professor pode ver o histórico de chamadas registradas para uma categoria, saber quantos treinos foram realizados e qual foi a frequência de cada aluno.

**Why this priority**: Informação valiosa, mas secundária ao registro diário. O professor precisa primeiro registrar chamadas antes de consultar histórico.

**Independent Test**: Após registrar 3 chamadas para a Sub 10, acessar o histórico da Sub 10 e verificar que os 3 treinos aparecem listados com data e resumo de presença.

**Acceptance Scenarios**:

1. **Given** chamadas registradas para a Sub 09, **When** o professor acessa o histórico da Sub 09, **Then** os treinos aparecem listados em ordem cronológica decrescente (mais recente primeiro) com data e contagem de presentes/faltas.
2. **Given** nenhuma chamada registrada para uma categoria, **When** o professor acessa o histórico dessa categoria, **Then** uma mensagem amigável informa que não há chamadas registradas ainda.

---

### Edge Cases

- O que acontece se o professor tentar salvar uma chamada sem selecionar data? → Exibir mensagem de erro informando que a data é obrigatória.
- O que acontece se uma categoria não tiver alunos cadastrados? → Exibir mensagem amigável indicando que não há alunos nessa categoria.
- O que acontece se o professor tentar salvar uma chamada com todos os alunos ainda como "Pendente"? → Permitir salvar; o estado "Pendente" é tratado como ausência não registrada (assumida como dado incompleto).
- O que acontece ao tentar registrar chamada para data futura? → Exibir aviso informando que a data não pode ser no futuro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma tela dedicada de "Chamada do Treino" acessível pelo menu de navegação.
- **FR-002**: O sistema DEVE permitir ao professor selecionar a data do treino (hoje ou data passada; datas futuras são bloqueadas).
- **FR-003**: O sistema DEVE exibir as categorias disponíveis (Sub 07 a Sub 17) como abas horizontais roláveis, com a categoria ativa destacada.
- **FR-004**: O sistema DEVE listar todos os alunos da categoria selecionada, cada um com botões "Presente" e "Falta".
- **FR-005**: O sistema DEVE exibir um painel de resumo com os contadores de Presentes, Faltas e Pendentes, atualizados em tempo real a cada marcação.
- **FR-006**: O sistema DEVE oferecer controles "Todos Presentes" e "Todos Ausentes" para marcar toda a turma de uma vez.
- **FR-007**: O sistema DEVE oferecer um botão "Salvar Presença" que persiste o registro da chamada e exibe confirmação ao professor.
- **FR-008**: O sistema DEVE carregar automaticamente uma chamada já salva quando o professor selecionar uma data e categoria que já possuem registro.
- **FR-009**: O sistema DEVE exibir um menu de navegação fixo com os itens "Alunos" e "Treino", destacando o item da seção ativa.
- **FR-010**: O sistema DEVE permitir ao professor consultar o histórico de chamadas de uma categoria, exibindo treinos em ordem decrescente de data.
- **FR-011**: O sistema DEVE validar a data selecionada e bloquear datas futuras com mensagem explicativa.
- **FR-012**: O sistema DEVE exibir mensagem amigável quando uma categoria não tiver alunos cadastrados.

### Key Entities

- **Chamada de Treino**: Registro de presença referente a um treino específico — identificado pela combinação de data e categoria; contém o status de cada aluno.
- **Registro de Presença**: Vincula um aluno a uma chamada com o status: Presente, Falta ou Pendente.
- **Aluno**: Entidade existente (nome, data de nascimento, categoria) reutilizada desta feature.
- **Categoria**: Classificação etária dos alunos (Sub 07 a Sub 17) que agrupa alunos e chamadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor consegue registrar a chamada completa de uma turma (selecionar data + categoria → marcar alunos → salvar) em menos de 2 minutos para turmas de até 20 alunos.
- **SC-002**: Os contadores de resumo (Presentes, Faltas, Pendentes) refletem cada marcação imediatamente, sem atraso perceptível.
- **SC-003**: 100% dos registros salvos são recuperados corretamente ao reabrir a mesma data e categoria.
- **SC-004**: O professor consegue navegar entre as seções "Alunos" e "Treino" com no máximo 1 toque, sem perder dados não salvos na tela atual.
- **SC-005**: O histórico de chamadas de qualquer categoria exibe todos os treinos registrados em ordem cronológica correta.

## Assumptions

- Os alunos já estão cadastrados no sistema (funcionalidade existente em `students.html`); a chamada consome essa lista.
- Cada combinação data + categoria representa um único treino — não é possível ter duas chamadas para a mesma data e categoria.
- O status "Pendente" significa que o aluno ainda não foi marcado; é considerado dado incompleto, não ausência confirmada.
- A persistência é feita via `sessionStorage` com a chave `"imperialState"` (padrão do projeto), portanto os dados são perdidos ao fechar o navegador — sem backend nesta fase.
- As categorias disponíveis são as mesmas já utilizadas na feature de alunos: Sub 09, Sub 10, Sub 11, Sub 12, Sub 13, Sub 14 (expansível futuramente).
- O design visual segue o sistema de design implementado na feature 006 (tema claro, cabeçalho verde, cartões brancos), conforme a imagem de referência `Novo-Design/Pagina-Exemplo.png`.
- O menu de navegação (Alunos / Treino) é adicionado a todas as páginas existentes, substituindo ou complementando os links de navegação atuais.
