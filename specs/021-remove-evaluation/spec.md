# Feature Specification: Remoção da Avaliação de Alunos

**Feature Branch**: `021-remove-evaluation`  
**Created**: 2026-07-27  
**Status**: Draft  
**Input**: User description: "vamos remover a avaliação do sistema, tudo referente a avaliação deve ser removido"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remover o acesso à Avaliação de Alunos (Priority: P1)

Como usuário do sistema (professor/administrador), não quero mais ver, acessar ou
utilizar qualquer funcionalidade de avaliação de alunos, de modo que o sistema fique
focado apenas nas funcionalidades que continuam em uso (cadastro de alunos, frequência,
minutagem em jogos, configuração de treinos e gestão de usuários).

**Why this priority**: É o coração do pedido — a funcionalidade de avaliação deve deixar
de existir para o usuário. Sem isto, nada foi entregue.

**Independent Test**: Percorrer o sistema autenticado e confirmar que não existe nenhuma
tela, botão, link de navegação ou seção que permita criar, editar, visualizar ou excluir
avaliações; nenhuma rota de avaliação deve ser acessível nem por navegação nem por URL
direta.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** ele navega pela lista de alunos, **Then**
   não há botão "Avaliar" nem qualquer ação que leve a uma tela de avaliação.
2. **Given** um usuário autenticado, **When** ele acessa diretamente a URL da antiga tela
   de avaliação de aluno, **Then** o sistema não exibe a tela de avaliação (a rota não
   existe mais / redireciona para uma página válida).
3. **Given** a lista de alunos, **When** exibida, **Then** não são apresentadas notas
   técnica/tática/mental (que eram derivadas da avaliação).

---

### User Story 2 - Remover a avaliação do painel/dashboard (Priority: P2)

Como usuário que consulta o painel de indicadores, não quero mais ver gráficos ou
resumos baseados em avaliações, para que o painel apresente somente informações que
continuam sendo coletadas.

**Why this priority**: O painel agrega dados de várias fontes; remover somente a parte de
avaliação mantém o restante do painel funcionando e evita exibir seções vazias ou quebradas.

**Independent Test**: Abrir o painel de um aluno e confirmar que a seção/gráfico de
"Evolução Técnico-Tática-Mental" e qualquer resumo de avaliações recentes não aparecem,
enquanto os demais indicadores (frequência, minutagem) permanecem intactos.

**Acceptance Scenarios**:

1. **Given** o painel de um aluno, **When** carregado, **Then** não existe a seção de
   gráfico de evolução técnico-tática-mental.
2. **Given** o painel, **When** carregado, **Then** nenhum bloco de "avaliações recentes"
   é exibido.
3. **Given** o painel, **When** carregado, **Then** os indicadores de frequência e
   minutagem em jogos continuam sendo exibidos normalmente.

---

### User Story 3 - Remover os dados e o serviço de avaliação (Priority: P3)

Como responsável pela integridade do sistema, quero que os dados de avaliação e os pontos
de integração (armazenamento e serviços de dados) deixem de existir, para que não sobrem
dados órfãos nem endpoints acessíveis relacionados a avaliação.

**Why this priority**: Limpeza final. Garante que "tudo referente a avaliação" seja
removido, não apenas a interface, evitando dívida técnica e endpoints inativos.

**Independent Test**: Verificar que não há mais endpoint/serviço de dados de avaliação
respondendo e que a exclusão de um aluno não depende mais de remover avaliações vinculadas.

**Acceptance Scenarios**:

1. **Given** o sistema, **When** consultado por qualquer operação de avaliação (listar,
   criar, editar, excluir), **Then** nenhuma operação de avaliação está disponível.
2. **Given** um aluno existente, **When** ele é excluído, **Then** a exclusão ocorre com
   sucesso sem qualquer etapa de remoção de avaliações vinculadas.
3. **Given** o armazenamento de dados, **When** inspecionado, **Then** não há coleção/
   estrutura de avaliações em uso ativo pelo sistema.

---

### Edge Cases

- **Alunos com avaliações preexistentes**: a remoção da funcionalidade não deve impedir
  que o aluno continue sendo listado, editado, ter frequência e minutagem registradas.
- **URLs/marcadores antigos**: acessar um link antigo de avaliação não deve gerar erro
  visível ao usuário — deve levar a uma página válida (ex.: lista de alunos ou home).
- **Exclusão de aluno**: deve permanecer funcional e não deve falhar por causa da ausência
  do fluxo de cascata de avaliações.
- **Textos residuais**: menções à "avaliação" em textos descritivos de outras telas (ex.:
  descrição na home) devem ser revistas para não prometer uma funcionalidade inexistente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST remover a tela dedicada de avaliação de aluno (criar/editar/
  listar/excluir avaliações), de forma que ela não seja mais acessível por navegação nem
  por URL direta.
- **FR-002**: O sistema MUST remover, da lista de alunos, o botão/ação "Avaliar" e qualquer
  navegação para a tela de avaliação.
- **FR-003**: O sistema MUST remover da lista de alunos as notas técnica/tática/mental que
  eram derivadas de avaliações.
- **FR-004**: O sistema MUST remover do painel/dashboard o gráfico de evolução
  técnico-tática-mental e qualquer resumo de avaliações recentes, preservando os demais
  indicadores (frequência e minutagem em jogos).
- **FR-005**: O sistema MUST descontinuar qualquer operação de dados de avaliação (listar,
  criar, editar, excluir), de modo que nenhuma dessas operações fique acessível.
- **FR-006**: O sistema MUST manter a exclusão de aluno funcional sem depender de uma etapa
  de remoção em cascata de avaliações vinculadas.
- **FR-007**: O sistema MUST remover o estado/armazenamento de avaliações que era mantido
  para uso da aplicação, de forma que não restem dados de avaliação em uso ativo.
- **FR-008**: O sistema MUST revisar textos e rótulos remanescentes que mencionam
  "avaliação" em telas que permanecem, para que não referenciem a funcionalidade removida.
- **FR-009**: As demais funcionalidades (cadastro de alunos, frequência, minutagem em
  jogos, configuração de treinos, gestão de usuários, autenticação) MUST continuar
  funcionando sem regressão após a remoção.

### Key Entities *(include if feature involves data)*

- **Avaliação (a ser removida)**: entidade que representava uma medição em uma data com
  notas nas dimensões técnica, tática e mental, vinculada a um aluno. Esta entidade e todas
  as suas referências devem ser eliminadas do sistema.
- **Aluno (afetado)**: permanece no sistema; perde apenas o vínculo e as ações relacionadas
  a avaliação (botão avaliar, notas derivadas, cascata de exclusão).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 (zero) pontos de acesso à avaliação permanecem na interface — nenhum menu,
  botão, link ou rota leva a qualquer tela ou ação de avaliação.
- **SC-002**: 100% das telas que permanecem (alunos, painel, frequência, jogos, treinos,
  usuários, home) carregam sem erros e sem seções vazias/quebradas relacionadas a avaliação.
- **SC-003**: A exclusão de um aluno é concluída com sucesso em 100% das tentativas sem
  qualquer etapa relacionada a avaliações.
- **SC-004**: Nenhuma operação de dados de avaliação responde — 0 endpoints/serviços de
  avaliação disponíveis após a remoção.
- **SC-005**: Nenhuma menção à funcionalidade de avaliação permanece em textos visíveis das
  telas que continuam em uso.

## Assumptions

- "Tudo referente a avaliação" abrange interface (tela dedicada, botões, notas derivadas,
  seção do painel), integrações de dados (serviço/endpoint), estado/armazenamento e textos
  residuais — ou seja, remoção completa, não apenas ocultação visual.
- Dados históricos de avaliação já existentes no armazenamento podem ser descartados junto
  com a remoção da funcionalidade, pois deixarão de ter qualquer uso no sistema; não há
  requisito de exportação ou retenção informado pelo usuário.
- As demais features (frequência/chamadas, jogos/minutagem, configuração de treinos,
  usuários, autenticação) permanecem inalteradas e são a linha de base de "sem regressão".
- Links antigos apontando para a antiga rota de avaliação devem resolver para uma página
  válida existente, sem exibir erro ao usuário.
- A remoção não introduz nenhuma nova funcionalidade — é exclusivamente uma exclusão de
  escopo.
