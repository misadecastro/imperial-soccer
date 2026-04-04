# Feature Specification: Students Listing — Evaluation Display & Registration Toggle

**Feature Branch**: `003-students-eval-display`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "agora vamos fazer alguns ajustes em students, na listagem vamos exibir o resultado das ultimas avaliações, coloque um icone para cada aspecto Tecnico, Tatico e Mental. Oculte a seção de cadastro de aluno, exiba quando o professor clicar em um botão de novo aluno."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ver resultados da última avaliação na listagem (Priority: P1)

O professor abre a página de alunos e visualiza, diretamente nos cards da listagem, os resultados da última avaliação de cada aluno — representados por ícones e notas para os aspectos Técnico, Tático e Mental. Para alunos sem avaliação registrada, os ícones indicam estado sem avaliação.

**Why this priority**: É o ajuste de maior valor imediato: permite ao professor identificar rapidamente o desempenho de cada aluno sem abrir o modal de avaliação.

**Independent Test**: Pode ser testado cadastrando alunos com e sem avaliações e verificando se os indicadores corretos aparecem em cada card.

**Acceptance Scenarios**:

1. **Given** um aluno com avaliação registrada, **When** o professor visualiza a listagem, **Then** o card exibe três ícones (um por aspecto: Técnico, Tático, Mental) cada um com a nota da última avaliação ao lado ou abaixo.
2. **Given** um aluno sem nenhuma avaliação, **When** o professor visualiza a listagem, **Then** o card exibe os três ícones em estado inativo/vazio, indicando ausência de avaliação.
3. **Given** um aluno com múltiplas avaliações, **When** o professor visualiza a listagem, **Then** somente os dados da avaliação mais recente são exibidos no card.
4. **Given** a listagem com filtros aplicados, **When** os resultados filtrados são exibidos, **Then** os indicadores de avaliação permanecem visíveis e corretos para cada aluno filtrado.

---

### User Story 2 — Ocultar e exibir o formulário de cadastro sob demanda (Priority: P2)

O professor acessa a página de alunos e o formulário de cadastro está oculto por padrão. Um botão "Novo Aluno" visível na área de listagem permite revelar o formulário quando necessário.

**Why this priority**: Reduz o ruído visual na tela principal, focando o professor na listagem. O cadastro é uma ação menos frequente que a consulta.

**Independent Test**: Pode ser testado acessando a página e verificando que o formulário está oculto, depois clicando no botão e confirmando que o formulário aparece.

**Acceptance Scenarios**:

1. **Given** a página carregada, **When** o professor visualiza a tela inicial, **Then** a seção de cadastro de aluno está oculta e o botão "Novo Aluno" está visível.
2. **Given** a seção de cadastro oculta, **When** o professor clica no botão "Novo Aluno", **Then** a seção de cadastro é exibida.
3. **Given** a seção de cadastro visível, **When** o professor conclui ou cancela o cadastro, **Then** a seção de cadastro é ocultada novamente (comportamento pós-submit ou via botão de fechar/cancelar).
4. **Given** a seção de cadastro visível, **When** o professor clica novamente no botão (toggle), **Then** a seção é ocultada.

---

### Edge Cases

- O que acontece quando a nota de um aspecto na última avaliação tem valor nulo ou inválido? O ícone deve indicar estado sem avaliação para aquele aspecto específico.
- O que acontece se o professor submete o formulário de cadastro com erro? O formulário permanece visível com as mensagens de erro.
- Como o sistema se comporta com a listagem vazia (sem alunos)? Os ícones de avaliação não são exibidos — apenas a mensagem de lista vazia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir, em cada card de aluno na listagem, três indicadores visuais distintos — um para Técnico, um para Tático e um para Mental — com ícone identificador de cada aspecto.
- **FR-002**: Cada indicador DEVE exibir a nota da última avaliação registrada para aquele aspecto (valores: 2, 3, 4 ou 5).
- **FR-003**: Para alunos sem avaliação registrada, o sistema DEVE exibir os indicadores em estado "sem avaliação" (ícone esmaecido, traço ou texto "–").
- **FR-004**: A seção de cadastro de aluno DEVE estar oculta quando a página é carregada.
- **FR-005**: O sistema DEVE exibir um botão "Novo Aluno" acessível na página principal (acima ou próximo à listagem) para revelar a seção de cadastro.
- **FR-006**: O clique no botão "Novo Aluno" DEVE alternar a visibilidade da seção de cadastro (mostrar se oculta, ocultar se visível).
- **FR-007**: Após o cadastro bem-sucedido de um aluno, o sistema DEVE ocultar novamente a seção de cadastro automaticamente.
- **FR-008**: O indicador de avaliação DEVE refletir sempre a avaliação mais recente quando existirem múltiplas avaliações para um mesmo aluno.

### Key Entities

- **Avaliação**: Registro com notas para os três aspectos (Técnico, Tático, Mental), vinculado a um aluno e ordenável por data. Já existe no sistema.
- **Card de Aluno**: Componente visual na listagem que exibe dados do aluno e agora incluirá os indicadores de avaliação por aspecto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor identifica os resultados da última avaliação de um aluno sem nenhuma navegação adicional — direto na listagem em menos de 3 segundos de leitura.
- **SC-002**: 100% dos cards de alunos avaliados exibem os três indicadores com os valores corretos da avaliação mais recente.
- **SC-003**: 100% dos cards de alunos sem avaliação exibem indicadores no estado "sem avaliação" (sem valores numéricos incorretos ou ausentes).
- **SC-004**: A seção de cadastro está oculta em 100% dos carregamentos iniciais da página.
- **SC-005**: O professor consegue abrir o formulário de cadastro com um único clique, sem recarregar a página.

## Assumptions

- Os três aspectos de avaliação (Técnico, Tático, Mental) são fixos e já fazem parte do sistema atual.
- A escala de notas existente (2, 3, 4 e 5) é mantida sem alteração.
- O botão "Novo Aluno" será posicionado na área de título ou cabeçalho da seção de listagem ("Alunos Cadastrados"), substituindo ou complementando o título atual.
- Ícones para os aspectos serão escolhidos na implementação: assumem-se ícones SVG inline simples (ex.: bola para Técnico, campo/tática para Tático, cabeça/cérebro para Mental).
- O comportamento de toggle (ocultar ao clicar novamente) é desejado, mas ocultar apenas após submit também é aceitável — a implementação poderá decidir com base na melhor UX.
- Mobile responsiveness existente deve ser preservada.
