# Feature Specification: Configuração de Treino com Persistência Real

**Feature Branch**: `020-training-config-api`  
**Created**: 2026-07-14  
**Status**: Draft  
**Input**: User description: "vamos agora implementar o backend para os itens de configuração do treino, Momento do Jogo, Fundamentos e Principios com os Item Trabalhado, vamos integrar tudo ao frontend"

## User Scenarios & Testing *(mandatory)*

<!--
  Esta feature migra a configuração de treino (Princípios/Fundamentos com Itens Trabalhados
  e Momentos do Jogo com seus vínculos) do armazenamento temporário em memória (serviço mock
  da feature 019, perdido ao recarregar) para o banco de dados real, tornando os dados
  permanentes e compartilhados entre todos os usuários. Segue o mesmo padrão de migração das
  features 017 (alunos) e 018 (avaliações).
-->

### User Story 1 - Gerenciar Princípios/Fundamentos e Itens Trabalhados com Persistência Real (Priority: P1)

O administrador acessa a tela de configuração do treino, cria/edita/remove Princípios e Fundamentos (ex.: "Princípios Táticos Ofensivos", "Fundamentos Técnicos") e, dentro de cada um, cria/edita/remove Itens Trabalhados (ex.: "Espaço com Bola", "Mobilidade", "Finalização"). Ao salvar, tudo é registrado de forma permanente — continua disponível após fechar o navegador, recarregar a página ou fazer logout e login novamente, e é visível para todos os usuários da escola.

**Why this priority**: É a base da configuração de treino. Os Momentos do Jogo dependem dos Princípios/Fundamentos para seus vínculos, portanto esta entidade precisa persistir primeiro. Sem persistência real, toda a configuração montada pelo administrador se perde a cada recarregamento (limitação explícita da feature 019).

**Independent Test**: Como administrador, criar um princípio com dois itens, fechar o navegador completamente, reabrir, fazer login e verificar que o princípio e seus itens continuam listados na tela de configuração.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado na tela de configuração, **When** ele cria um novo Princípio/Fundamento com nome válido, **Then** ele aparece imediatamente na lista e persiste após recarregar a página.
2. **Given** um Princípio/Fundamento existente, **When** o administrador adiciona, renomeia ou remove um Item Trabalhado, **Then** a alteração persiste após recarregar.
3. **Given** o administrador tenta criar um Princípio/Fundamento com nome vazio ou duplicado, **When** ele confirma, **Then** o sistema rejeita com mensagem de erro clara, sem criar registro.
4. **Given** o administrador remove um Princípio/Fundamento, **When** a operação é concluída, **Then** ele desaparece permanentemente e não retorna após reload, e todos os seus itens são removidos junto.
5. **Given** um usuário Professor autenticado, **When** ele tenta acessar a tela de configuração ou executar uma operação de escrita, **Then** o sistema nega o acesso (operação restrita ao Administrador).

---

### User Story 2 - Gerenciar Momentos do Jogo e seus Vínculos com Persistência Real (Priority: P1)

O administrador cria/edita/remove Momentos do Jogo (ex.: "Org. Ofensiva", "Org. Defensiva", "Trans. Ofensiva"), informando nome e descrição, e para cada momento vincula/desvincula um ou mais Princípios/Fundamentos e, por vínculo, seleciona os Itens Trabalhados. Ao salvar, tudo é registrado de forma permanente e continua disponível após recarregar ou reabrir a sessão.

**Why this priority**: É a segunda metade central da configuração e o que dá sentido à montagem de treino (cada momento agrega os princípios e itens trabalhados). Tão crítico quanto os princípios; depende deles para os vínculos.

**Independent Test**: Como administrador, criar um momento com descrição, vincular dois princípios e marcar itens em cada um, recarregar a página e confirmar que o momento, a descrição, os vínculos e os itens marcados continuam exatamente como salvos.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele cria um novo Momento do Jogo com nome e descrição, **Then** ele aparece na lista e persiste após recarregar.
2. **Given** um Momento existente e Princípios/Fundamentos cadastrados, **When** o administrador vincula um Princípio e seleciona itens trabalhados dele, **Then** os vínculos e itens persistem após recarregar.
3. **Given** um Momento com um Princípio vinculado, **When** o administrador desvincula esse Princípio, **Then** o vínculo é removido permanentemente e não retorna após reload.
4. **Given** o administrador tenta criar um Momento com nome vazio ou duplicado, **When** ele confirma, **Then** o sistema rejeita com mensagem de erro clara, sem criar registro.
5. **Given** o administrador edita o nome ou a descrição de um Momento, **When** ele salva, **Then** os novos valores persistem após recarregar.

---

### User Story 3 - Consumir a Configuração Real na Montagem de Treino (Priority: P2)

Qualquer usuário autenticado (Professor ou Administrador), ao montar um treino, vê os Momentos do Jogo e os Princípios/Fundamentos com seus Itens Trabalhados carregados do backend — os mesmos que o administrador configurou — em vez dos dados fixos em código.

**Why this priority**: É o consumo que dá valor à configuração persistida: o esforço do administrador só se reflete no dia a dia se a tela de montagem de treino usar os dados reais. Depende de US1 e US2 já persistirem os dados, mas é independentemente testável.

**Independent Test**: Com um administrador tendo adicionado um novo Princípio e um novo Momento pelo backend, abrir a tela de montagem de treino com uma conta de Professor e confirmar que o novo Princípio e o novo Momento aparecem disponíveis para seleção.

**Acceptance Scenarios**:

1. **Given** a configuração cadastrada no backend, **When** um Professor abre a tela de montagem de treino, **Then** os Momentos do Jogo e Princípios/Fundamentos exibidos são os carregados do servidor.
2. **Given** o administrador altera a configuração (adiciona um item), **When** o Professor recarrega a tela de montagem de treino, **Then** a alteração aparece refletida.
3. **Given** um usuário não autenticado, **When** ele tenta obter a configuração, **Then** o sistema exige autenticação.

---

### Edge Cases

- O que acontece ao remover um Princípio/Fundamento que está vinculado a um ou mais Momentos? Os vínculos órfãos daquele Princípio devem ser removidos em cascata de todos os Momentos, mantendo a integridade referencial.
- O que acontece ao remover um Item Trabalhado que está selecionado em vínculos de Momentos? O identificador do item deve ser removido de todas as seleções de vínculo onde aparece.
- O que acontece quando o banco está vazio (primeira execução)? O sistema deve semear a configuração inicial (os mesmos dados que antes ficavam fixos em código) de forma idempotente, sem duplicar em execuções subsequentes.
- O que acontece se dois administradores editarem a mesma configuração simultaneamente? A última gravação prevalece (sem bloqueio otimista nesta versão).
- O que acontece se a conexão cair durante uma operação de escrita? A operação falha de forma segura, sem criar registros parciais; o formulário permanece preenchido para reenvio.
- O que acontece se um Momento referenciar um Princípio ou Item que não existe mais? Referências inválidas são ignoradas/descartadas na leitura, sem quebrar a exibição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um administrador autenticado crie, edite e remova Princípios/Fundamentos, persistindo-os de forma permanente.
- **FR-002**: O sistema MUST permitir que um administrador autenticado adicione, renomeie e remova Itens Trabalhados dentro de um Princípio/Fundamento, com persistência permanente.
- **FR-003**: O sistema MUST permitir que um administrador autenticado crie, edite e remova Momentos do Jogo (nome e descrição), com persistência permanente.
- **FR-004**: O sistema MUST permitir que um administrador autenticado vincule e desvincule Princípios/Fundamentos a um Momento e selecione/desmarque os Itens Trabalhados de cada vínculo, com persistência permanente.
- **FR-005**: O sistema MUST validar que o nome de um Princípio/Fundamento, Item Trabalhado ou Momento não é vazio e é único no seu escopo (Princípios/Fundamentos entre si; Itens dentro de um mesmo Princípio; Momentos entre si), rejeitando com mensagem clara em caso de violação.
- **FR-006**: O sistema MUST remover em cascata todos os Itens Trabalhados de um Princípio/Fundamento quando este for removido, e remover os vínculos órfãos daquele Princípio de todos os Momentos.
- **FR-007**: O sistema MUST remover o identificador de um Item Trabalhado de todas as seleções de vínculo em Momentos quando o Item for removido.
- **FR-008**: O sistema MUST persistir a configuração de forma compartilhada, de modo que as alterações feitas por um administrador sejam visíveis a todos os usuários autenticados.
- **FR-009**: O sistema MUST disponibilizar a configuração completa (Princípios/Fundamentos com Itens e Momentos com vínculos) para leitura por qualquer usuário autenticado, para consumo na tela de montagem de treino.
- **FR-010**: O sistema MUST restringir todas as operações de escrita (criar/editar/remover) da configuração ao papel Administrador.
- **FR-011**: O sistema MUST exigir autenticação em todas as operações (leitura e escrita) sobre a configuração de treino.
- **FR-012**: O sistema MUST semear a configuração inicial (os dados atualmente fixos: os Momentos e Princípios/Fundamentos padrão) na primeira execução, de forma idempotente.
- **FR-013**: O sistema MUST substituir o consumo dos dados fixos/mockados em memória (feature 019) pela leitura dos dados reais do backend, tanto na tela de configuração quanto na tela de montagem de treino.
- **FR-014**: O sistema MUST exibir feedback claro de sucesso e de erro de validação em cada operação da tela de configuração.

### Key Entities

- **Princípio/Fundamento**: Agrupamento de aspectos táticos ou técnicos trabalhados no treino. Atributos: identificador único, título, filtro de aplicação (defensivo, ofensivo ou sempre), e uma coleção de Itens Trabalhados.
- **Item Trabalhado**: Aspecto específico trabalhado dentro de um Princípio/Fundamento (ex.: "Finalização"). Atributos: identificador único (no escopo do Princípio), rótulo. Pertence a exatamente um Princípio/Fundamento.
- **Momento do Jogo**: Fase do jogo trabalhada no treino (ex.: "Org. Ofensiva"). Atributos: identificador único, nome (rótulo), descrição, tipo (ofensivo ou defensivo), e uma coleção de Vínculos.
- **Vínculo (Momento ↔ Princípio)**: Associação entre um Momento e um Princípio/Fundamento, contendo a seleção de Itens Trabalhados daquele Princípio aplicáveis ao Momento. Atributos: referência ao Princípio, lista de referências a Itens Trabalhados selecionados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das alterações na configuração (Princípios/Fundamentos, Itens, Momentos, vínculos) persistem e continuam disponíveis após fechar e reabrir o navegador.
- **SC-002**: A configuração completa carrega e é exibida corretamente na tela de configuração e na de montagem de treino em no máximo 3 segundos.
- **SC-003**: Alterações feitas por um administrador são imediatamente visíveis a qualquer outro usuário autenticado ao recarregar as telas que consomem a configuração.
- **SC-004**: 100% das tentativas de escrita por usuários não-administradores são bloqueadas.
- **SC-005**: A remoção de um Princípio/Fundamento ou Item Trabalhado não deixa vínculos ou seleções órfãas em nenhum Momento em 100% dos casos.
- **SC-006**: Em uma instalação nova (banco vazio), a configuração inicial padrão está disponível automaticamente após a primeira execução, sem intervenção manual.

## Assumptions

- Esta feature segue o mesmo padrão de migração das features 017 (alunos) e 018 (avaliações): a configuração de treino, antes mantida em um serviço em memória (feature 019, perdida ao recarregar), passa a ser persistida no backend real; o estado em memória deixa de ser a fonte da verdade.
- A configuração de treino é **global/compartilhada** para toda a escola — não há configuração por usuário ou por categoria de time nesta versão.
- **Leitura** da configuração é permitida a qualquer usuário autenticado (Professor e Administrador), pois a tela de montagem de treino é usada por professores; **escrita** é restrita ao Administrador, mantendo o gate da feature 019.
- Os dados semeados na primeira execução são exatamente os que hoje estão fixos no sistema (4 Momentos padrão e 3 Princípios/Fundamentos com seus Itens), reaproveitando o seed já definido na feature 019.
- O backend de autenticação já existe (feature 016); todos os endpoints reutilizam a infraestrutura de JWT e autorização por papel existente.
- Os identificadores das entidades passam a ser gerados pelo backend (não mais GUIDs locais do frontend); os vínculos e seleções de itens referenciam esses identificadores reais.
- Momentos e Princípios/Fundamentos são conjuntos independentes; a exclusão de um não implica a exclusão do outro, apenas a limpeza dos vínculos entre eles (integridade referencial).
- Não há funcionalidade de exportação/importação da configuração nem histórico de versões nesta versão.
