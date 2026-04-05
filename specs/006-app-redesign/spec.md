# Feature Specification: Redesign da Aplicação

**Feature Branch**: `006-app-redesign`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "vamos fazer um re design da aplicação, para isso, vamos usar como exemplo o css que está na pasta Novo-Design e a imagem de referencia Pagina-Exemplo.png"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar interface redesenhada ao acessar o app (Priority: P1)

O usuário (treinador/professor) acessa qualquer página da aplicação e visualiza a nova identidade visual: cabeçalho verde com logo e título, tipografia moderna, cartões com sombra suave e botões bem definidos, conforme a imagem de referência `Pagina-Exemplo.png`.

**Why this priority**: A identidade visual é o ponto de entrada de toda experiência. Sem ela aplicada, nenhuma outra melhoria de UX faz sentido. Este é o critério base do redesign.

**Independent Test**: Abrir qualquer página HTML da aplicação no navegador e confirmar que o cabeçalho verde, a tipografia e o layout geral correspondem ao design de referência.

**Acceptance Scenarios**:

1. **Given** o usuário acessa a página principal, **When** a página carrega, **Then** o cabeçalho exibe fundo verde escuro com logo e título em branco.
2. **Given** qualquer página da aplicação, **When** visualizada em dispositivo móvel (< 480 px), **Then** o layout se adapta sem overflow horizontal e todos os elementos permanecem legíveis.
3. **Given** a página de chamada, **When** o usuário visualiza a lista de alunos, **Then** cada aluno aparece em um cartão com avatar circular colorido, nome e botão de presença/falta claramente distinguíveis.

---

### User Story 2 - Selecionar categoria/turma por abas horizontais (Priority: P2)

O treinador seleciona a turma (Sub 07, Sub 08… Sub 17) através de um carrossel de abas horizontais com rolagem, onde a aba ativa fica destacada em verde.

**Why this priority**: A navegação por turmas é a ação mais frequente na jornada de chamada; uma UX clara aqui reduz erros de registro.

**Independent Test**: Clicar em diferentes abas e verificar que a aba selecionada fica destacada visualmente e o conteúdo de alunos é filtrado para a turma escolhida.

**Acceptance Scenarios**:

1. **Given** a página de chamada carregada, **When** o usuário clica em uma aba de categoria diferente, **Then** a aba clicada fica com fundo verde e texto branco e as demais ficam inativas.
2. **Given** múltiplas categorias disponíveis, **When** as abas ultrapassam a largura da tela, **Then** o usuário consegue rolar horizontalmente para acessar as demais sem que o layout quebre.

---

### User Story 3 - Registrar presença com resumo de contadores (Priority: P2)

O treinador marca cada aluno como Presente ou Falta através de botões no cartão. Um painel de resumo exibe os totais de Presentes, Faltas e Pendentes em tempo real.

**Why this priority**: Funcionalidade central do app; o redesign deve garantir que os controles de presença fiquem visualmente claros e os contadores sejam fáceis de ler.

**Independent Test**: Marcar um aluno como presente e verificar que o botão muda de cor e os contadores atualizam.

**Acceptance Scenarios**:

1. **Given** um aluno sem registro, **When** o treinador toca "Presente", **Then** o botão fica verde/ativo e o contador "Presentes" incrementa.
2. **Given** um aluno marcado como Presente, **When** o treinador toca "Falta", **Then** o botão de falta fica vermelho/ativo e o contador "Faltas" incrementa.
3. **Given** o painel de resumo, **When** qualquer marcação muda, **Then** os três contadores (Presentes, Faltas, Pendentes) atualizam imediatamente sem recarregar a página.

---

### User Story 4 - Marcar todos como presentes ou ausentes de uma vez (Priority: P3)

O treinador usa os controles "Todos presentes" e "Todos ausentes" para marcar toda a turma de uma só vez.

**Why this priority**: Funcionalidade de produtividade secundária; útil, mas não bloqueia o fluxo principal.

**Independent Test**: Clicar "Todos presentes" e verificar que todos os alunos da turma são marcados e o contador bate.

**Acceptance Scenarios**:

1. **Given** uma turma com alunos pendentes, **When** o treinador clica "Todos presentes", **Then** todos os alunos da turma são marcados como Presente e os contadores refletem isso.
2. **Given** uma turma com alunos presentes, **When** o treinador clica "Todos ausentes", **Then** todos os alunos são marcados como Falta.

---

### Edge Cases

- O que acontece quando uma turma não possui alunos cadastrados? → Exibir mensagem amigável de lista vazia dentro do painel de conteúdo.
- O que acontece em telas muito pequenas (< 320 px)? → Layout deve ser funcional mesmo que levemente comprimido.
- O que acontece se o usuário girar o dispositivo (landscape)? → Layout não deve quebrar; as abas de categoria podem ampliar horizontalmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE aplicar a paleta de cores da referência visual: verde primário como cor dominante, branco para textos em fundo escuro, cinza claro para fundo de página.
- **FR-002**: O sistema DEVE exibir um cabeçalho fixo no topo com fundo verde, logo da aplicação e título da página em branco.
- **FR-003**: O sistema DEVE exibir as categorias de turma como abas horizontais roláveis, destacando a aba ativa com fundo verde e texto branco.
- **FR-004**: Cada aluno DEVE ser exibido em um cartão com: avatar circular com inicial do nome em cor de destaque, nome completo e botões "Presente" / "Falta" com estados visuais distintos.
- **FR-005**: O sistema DEVE exibir um painel de resumo com contadores de Presentes, Faltas e Pendentes, atualizados em tempo real a cada marcação.
- **FR-006**: O sistema DEVE oferecer controles "Todos presentes" e "Todos ausentes" visíveis acima da lista de alunos.
- **FR-007**: O sistema DEVE exibir um botão de ação principal ("Salvar Presença") bem destacado e sempre acessível na parte inferior da tela.
- **FR-008**: O layout DEVE ser responsivo e priorizar dispositivos móveis, com suporte correto a larguras de 320 px a 480 px.
- **FR-009**: Todas as páginas existentes (home/login, cadastro de alunos, avaliação, exibição de resultados) DEVEM receber a nova identidade visual de forma consistente.
- **FR-010**: O estilo visual DEVE ser guiado pelo CSS de referência da pasta `Novo-Design` e pela imagem `Pagina-Exemplo.png`, adaptados ao HTML existente.

### Key Entities

- **Página**: Cada arquivo HTML da aplicação que receberá o novo estilo (home, login, students, student-eval).
- **Cartão de Aluno**: Componente visual que representa um aluno na lista de chamada, com avatar, nome e controles de presença.
- **Aba de Categoria**: Elemento de navegação para selecionar a turma ativa na lista de chamada.
- **Painel de Resumo**: Área com contadores de status de presença da turma selecionada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todas as páginas da aplicação apresentam a nova identidade visual sem regressões visuais visíveis — 100% de cobertura de páginas.
- **SC-002**: O layout funciona corretamente em dispositivos com largura entre 320 px e 1280 px, sem overflow horizontal ou elementos sobrepostos.
- **SC-003**: O treinador consegue realizar a chamada completa de uma turma (selecionar aba → marcar alunos → salvar) em menos de 2 minutos.
- **SC-004**: Os contadores de resumo (Presentes, Faltas, Pendentes) refletem o estado correto imediatamente após cada interação, sem atraso perceptível.
- **SC-005**: Nenhuma página da aplicação permanece com o visual antigo após a conclusão do redesign.

## Assumptions

- O redesign é puramente visual (estilos CSS e estrutura HTML); a lógica JavaScript existente será preservada sem reescrita.
- O arquivo `Novo-Design/App.css` serve como referência de paleta e tipografia, mas será adaptado ao contexto HTML/Tailwind da aplicação — não é um CSS direto para React.
- A imagem `Novo-Design/Pagina-Exemplo.png` representa a tela de chamada como página de maior prioridade visual; as demais páginas seguirão o mesmo sistema de design.
- O projeto continuará usando Tailwind CSS v3 via CDN como mecanismo principal de estilo, complementado por CSS customizado quando necessário.
- Mobile-first é a prioridade de design; suporte a desktop é desejável mas secundário.
- Não há alteração de funcionalidade ou regras de negócio — apenas apresentação visual.
