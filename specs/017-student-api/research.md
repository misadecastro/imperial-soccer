# Research: Cadastro de Alunos com Persistência Real

**Branch**: `017-student-api` | **Date**: 2026-07-12

## Decisões

### 1. Cache em memória via `StateService` (não exposição direta da API para todos os componentes)

**Decision**: O `StudentsService` usa `stateService.state.alunos` como cache em memória local, populado a cada operação. Os demais componentes (Dashboard, Games, Training) continuam lendo `state.alunos` sem modificação.

**Rationale**: Trocar todas as referências a `state.alunos` nos demais componentes simultaneamente seria escopo excessivo para esta feature. O padrão de cache é uma transição progressiva limpa: `StudentsService` é a única fonte de escrita de `state.alunos`; os leitores atuais não precisam mudar.

**Alternatives considered**: Injetar `StudentsService` em todos os componentes que usam alunos — rejeitado por ampliar desnecessariamente o escopo desta feature (Princípio I).

---

### 2. Limpeza de avaliações em cascata via sessionStorage (não via backend)

**Decision**: Quando um aluno é excluído via `DELETE /api/v1/students/{id}`, o `StudentsService` também remove as avaliações vinculadas de `stateService.state.avaliacoes` (sessionStorage) — operação puramente local no frontend.

**Rationale**: Avaliações ainda vivem no frontend (`sessionStorage`) nesta feature. A limpeza em cascada no backend só fará sentido quando avaliações migrarem para o backend (feature futura). Por ora, a operação de cascata é responsabilidade do cliente, como já ocorria na lógica existente de `excluirAluno()` do `StudentsComponent`.

**Alternatives considered**: Endpoint backend que exclui aluno e avaliações em uma transação — rejeitado porque avaliações no backend não existem ainda; criar infraestrutura para elas agora seria antecipação desnecessária.

---

### 3. Listagem sem filtros no backend (filtragem client-side)

**Decision**: `GET /api/v1/students` retorna todos os alunos da escola sem parâmetros de query; a filtragem por nome e categoria ocorre no Angular (como hoje no `StudentsComponent.alunosFiltrados`).

**Rationale**: Escala de uma escola (~200 alunos máx.) torna filtragem server-side desnecessária neste momento. Adicionar parâmetros opcionais de query implicaria mais código no backend e na camada de mapeamento sem benefício real para o usuário. A spec não requer busca full-text avançada.

**Alternatives considered**: `GET /api/v1/students?nome=...&categoria=...` com filtro no MongoDB — rejeitado como otimização prematura para esta escala.

---

### 4. Validação de `categoria` no backend via lista fixa

**Decision**: O `StudentsController` valida que a `categoria` informada em `CreateStudentRequest` é um dos valores válidos (`Sub09`, `Sub10`, …, `Sub17F`), usando uma lista de constantes — mesma lista de `CATEGORIAS` do frontend.

**Rationale**: Sem validação no backend, é possível criar alunos com categorias inválidas via API direta, quebrando o filtro de categoria no frontend. A lista de categorias é estável e pequena — centralizar em uma constante no backend é suficiente.

**Alternatives considered**: Uma coleção `categories` no MongoDB — rejeitado: categorias são fixas do domínio da escola, não configuráveis; uma coleção separada seria sobreengenharada.

---

### 5. Migração de dados mock existentes (sessionStorage)

**Decision**: No primeiro uso após deploy desta feature, o `StudentsComponent` descarta os dados de alunos do `sessionStorage` (substituídos pela lista real do MongoDB, inicialmente vazia) e **não** migra os mocks gerados automaticamente para o MongoDB.

**Rationale**: Dados mock nunca foram reais — não há valor em migrá-los. Avaliações que referenciam IDs de alunos mock se tornam órfãs em sessionStorage, mas isso é aceitável: são dados fictícios, e a migração de avaliações para o backend (feature futura) incluirá lógica de limpeza adequada.

---

### 6. Sem suíte de testes automatizados para StudentsController (validação manual)

**Decision**: Nenhum teste xUnit é adicionado para o `StudentsController` nesta feature; validação via `quickstart.md` (curl + tela Angular).

**Rationale**: Consistente com o padrão estabelecido para `AuthController`/`UsersController` (validados via curl, não xUnit). O `StudentsController` segue os mesmos padrões já testados em features anteriores; o risco de regressão é baixo.

---

### 7. Sem soft delete

**Decision**: Exclusão física (hard delete) do documento na coleção `students`.

**Rationale**: A spec não requer recuperação de alunos excluídos. A constituição (Princípio III) menciona soft delete para alunos, mas na prática desta feature em `sessionStorage` nunca houve soft delete — a migração para um soft delete completo é uma melhoria futura quando avaliações/chamadas também estiverem no backend (para manter referências válidas).

**Alternatives considered**: `ativo: false` (soft delete) — decidido postergar: sem avaliações/chamadas no backend, a vantagem do soft delete ainda não se materializa e adicionaria complexidade sem benefício imediato.
