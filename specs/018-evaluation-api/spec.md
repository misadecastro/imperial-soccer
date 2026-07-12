# Feature Specification: Avaliações com Persistência Real

**Feature Branch**: `018-evaluation-api`  
**Created**: 2026-07-12  
**Status**: Draft  
**Input**: User description: "vamos implementar o backend para registrar a avaliação e integrar tudo com o front end"

## User Scenarios & Testing *(mandatory)*

<!--
  Esta feature migra o registro de avaliações técnico-tático-mentais do armazenamento
  temporário em sessionStorage para o banco de dados real, tornando os dados permanentes.
  Segue o mesmo padrão da feature 017 (alunos), porém para a entidade Avaliação.
-->

### User Story 1 - Registrar Nova Avaliação com Persistência Real (Priority: P1)

O professor acessa a tela de avaliação de um aluno, preenche a data e as notas dos três aspectos (Tático, Técnico, Mental) e ao salvar, a avaliação é registrada de forma permanente — continua disponível após fechar o navegador, recarregar a página ou fazer logout e login novamente.

**Why this priority**: É o núcleo da feature. Sem persistência real, os dados de avaliação acumulados pelo professor se perdem a cada sessão, tornando o histórico de evolução do aluno inútil a longo prazo.

**Independent Test**: Registrar uma avaliação, fechar o navegador completamente, abrir novamente, fazer login, acessar o aluno e verificar que a avaliação consta no histórico.

**Acceptance Scenarios**:

1. **Given** um professor autenticado na tela de avaliação de um aluno, **When** ele preenche a data, as notas de Tático, Técnico e Mental e salva, **Then** a avaliação aparece imediatamente no histórico e persiste após recarregar a página.
2. **Given** o professor tenta salvar uma avaliação sem preencher todos os campos obrigatórios, **When** ele confirma, **Then** o sistema rejeita com mensagem de erro clara sem criar registro parcial.
3. **Given** o professor tenta registrar uma avaliação com data futura, **When** ele confirma, **Then** o sistema rejeita com mensagem explicativa.
4. **Given** o professor tenta registrar uma avaliação com nota fora do intervalo permitido (valores válidos: 2, 3, 4 ou 5), **When** ele confirma, **Then** o sistema rejeita com mensagem explicativa.

---

### User Story 2 - Visualizar Histórico de Avaliações do Backend (Priority: P1)

O professor acessa a tela de avaliação de um aluno e vê o histórico completo de avaliações carregado do backend, incluindo todas as avaliações já registradas por qualquer professor da escola — com paginação funcional e gráfico de evolução atualizado.

**Why this priority**: Sem o histórico real, a tela de avaliação perde seu propósito principal (acompanhar a evolução do aluno no tempo). Tão crítico quanto o registro.

**Independent Test**: Registrar avaliações em um browser, abrir outro browser com outra conta de professor e verificar que o histórico do mesmo aluno está disponível e completo.

**Acceptance Scenarios**:

1. **Given** um aluno com avaliações registradas, **When** o professor acessa a tela de avaliação, **Then** o histórico completo é exibido em ordem decrescente de data (mais recente primeiro), carregado do servidor.
2. **Given** um aluno sem avaliações, **When** o professor acessa a tela de avaliação, **Then** a lista exibe mensagem "Nenhuma avaliação registrada ainda" (sem dados fictícios gerados automaticamente).
3. **Given** o histórico carregado, **When** há mais de 10 avaliações, **Then** a paginação (10 por página) funciona com os dados reais do backend.
4. **Given** o histórico carregado, **When** o professor visualiza o gráfico de evolução, **Then** o gráfico exibe as avaliações reais ordenadas cronologicamente.

---

### User Story 3 - Editar Avaliação Existente com Persistência Real (Priority: P2)

O professor identifica um erro em uma avaliação já registrada, clica em "Editar", corrige a data ou as notas, e ao salvar, a correção é persistida permanentemente no backend.

**Why this priority**: Errors ocorrem; a capacidade de correção garante a integridade do histórico. Menos urgente que registro e listagem, mas necessária para manutenção dos dados.

**Independent Test**: Editar uma avaliação, recarregar a página e confirmar que a versão editada é a que aparece no histórico.

**Acceptance Scenarios**:

1. **Given** o professor editando uma avaliação, **When** ele altera os valores e salva, **Then** a avaliação atualizada aparece no histórico e persiste após recarregar.
2. **Given** o professor tentando salvar uma edição com data futura, **When** ele confirma, **Then** o sistema rejeita com mensagem de erro.
3. **Given** o professor tentando salvar uma edição com nota inválida, **When** ele confirma, **Then** o sistema rejeita com mensagem de erro.

---

### User Story 4 - Excluir Avaliação com Persistência Real (Priority: P2)

O professor remove uma avaliação incorreta do histórico, confirmando a operação, e a avaliação é excluída permanentemente do backend — não retorna após reload.

**Why this priority**: Complementa o CRUD completo. Necessário para manter a integridade do histórico eliminando registros indevidos.

**Independent Test**: Excluir uma avaliação, recarregar a página e confirmar que não está mais no histórico.

**Acceptance Scenarios**:

1. **Given** o professor confirma a exclusão de uma avaliação, **When** a operação é concluída, **Then** a avaliação desaparece do histórico e não retorna após recarregar.
2. **Given** o professor cancela a exclusão, **When** a operação é cancelada, **Then** a avaliação permanece no histórico sem alteração.

---

### Edge Cases

- O que acontece se o professor tentar registrar uma avaliação para um aluno que não existe mais no sistema? O sistema deve rejeitar a operação com mensagem informativa.
- O que acontece se dois professores editarem a mesma avaliação simultaneamente? A última gravação prevalece (comportamento padrão de banco sem bloqueio otimista nesta versão).
- O que acontece se a conexão cair durante o registro de uma avaliação? A operação deve falhar de forma segura, sem criar registros parciais; o formulário permanece preenchido para reenvio.
- O que acontece ao excluir um aluno (feature 017) que tem avaliações registradas no backend? As avaliações associadas devem ser excluídas em cascata no backend — este edge case estende o endpoint de exclusão de aluno da feature 017.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um professor autenticado registre uma avaliação para um aluno informando data, nota de Tático, nota de Técnico e nota de Mental.
- **FR-002**: O sistema MUST persistir as avaliações de forma permanente, garantindo disponibilidade após encerramento e reabertura de sessão.
- **FR-003**: O sistema MUST exibir o histórico completo de avaliações de um aluno ao professor, ordenado do mais recente para o mais antigo, carregado do servidor.
- **FR-004**: O sistema MUST validar que os campos obrigatórios (data, as três notas) estão preenchidos antes de confirmar o registro.
- **FR-005**: O sistema MUST validar que a data de avaliação não é uma data futura.
- **FR-006**: O sistema MUST validar que as notas estão dentro dos valores permitidos (2, 3, 4 ou 5).
- **FR-007**: O sistema MUST permitir que um professor autenticado edite uma avaliação já registrada, alterando data e/ou notas.
- **FR-008**: O sistema MUST permitir que um professor autenticado exclua uma avaliação com confirmação prévia.
- **FR-009**: O sistema MUST exibir o gráfico de evolução do aluno com os dados reais carregados do backend.
- **FR-010**: O sistema MUST paginar o histórico de avaliações (10 por página), navegação funcional com dados reais.
- **FR-011**: O sistema MUST exigir autenticação em todas as operações sobre avaliações.
- **FR-012**: O sistema MUST eliminar a geração automática de dados fictícios de avaliações que atualmente ocorre com os dados mock de alunos.
- **FR-013**: O sistema MUST excluir em cascata todas as avaliações de um aluno quando o aluno for excluído via backend.

### Key Entities

- **Avaliação**: Registro de desempenho de um aluno em uma data específica. Atributos: identificador único, referência ao aluno (por identificador), data da avaliação, nota de Tático (2–5), nota de Técnico (2–5), nota de Mental (2–5).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Avaliações registradas persistem e estão disponíveis após fechar e reabrir o navegador em 100% dos casos.
- **SC-002**: O histórico completo de avaliações de um aluno carrega e exibe corretamente em no máximo 3 segundos.
- **SC-003**: 100% das avaliações excluídas desaparecem permanentemente do histórico sem retornar após recarregar.
- **SC-004**: O gráfico de evolução reflete com precisão todos os dados de avaliações reais cadastrados no sistema.
- **SC-005**: As avaliações registradas por um professor são imediatamente visíveis a qualquer outro professor autenticado ao carregar o histórico do mesmo aluno.

## Assumptions

- Esta feature segue o mesmo padrão de migração da feature 017 (alunos): as avaliações (`avaliacoes` em sessionStorage) são substituídas por dados reais do backend; o `sessionStorage` para avaliações é descontinuado.
- As notas de avaliação têm exatamente 4 valores possíveis (2, 3, 4, 5), correspondendo a "Precisa Melhorar", "Regular", "Bom" e "Excelente" — sem valores intermediários.
- A paginação (10 por página) e ordenação (data decrescente) seguem o comportamento já existente na tela de avaliação; a lógica é mantida intacta, apenas alimentada por dados reais.
- O backend de alunos já existe (feature 017); cada avaliação referencia um aluno pelo seu identificador real (gerado pelo backend, não um GUID local).
- O backend de autenticação já existe (feature 016); todos os endpoints de avaliação requerem autenticação via JWT, reutilizando a infraestrutura existente.
- FR-013 (cascata na exclusão de aluno) estende o `DELETE /api/v1/students/{id}` da feature 017 — o backend passa a deletar também as avaliações daquele aluno ao excluí-lo.
- Não há funcionalidade de "exportar avaliações" ou "relatório PDF" nesta versão.
