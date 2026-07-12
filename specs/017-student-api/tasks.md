# Tasks: Cadastro de Alunos com Persistência Real

**Input**: Design documents from `/specs/017-student-api/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/students-api.md ✅, quickstart.md ✅

**Tests**: Sem suíte automatizada — validação manual via `quickstart.md` e curl (consistente com features 016/017, onde o padrão é validação manual para controllers; research.md decisão #6).

**Organization**: Tarefas organizadas por user story. US1 (Cadastrar) e US2 (Listar) compartilham prioridade P1; US2 é implementada primeiro pois a listagem é a base observacional que valida o cadastro. Todas as mudanças no componente são no arquivo `students.component.ts` — tarefas são sequenciais por essa razão.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: US1, US2 ou US3
- Caminhos relativos à raiz do repositório

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar os tipos/modelos de dados que as 3 user stories compartilham — backend e frontend.

- [x] T001 [P] Criar modelo `Aluno` em `backend/Imperial.Api/Models/Aluno.cs` com campos: `Id` (string GUID), `Nome` (string), `DataNascimento` (string), `Categoria` (string) — conforme `data-model.md`
- [x] T002 [P] Criar DTOs em `backend/Imperial.Api/DTOs/StudentDtos.cs`: records `CreateStudentRequest(string Nome, string DataNascimento, string Categoria)` e `StudentResponse(string Id, string Nome, string DataNascimento, string Categoria)` — conforme `contracts/students-api.md`
- [x] T003 [P] Adicionar interface `CreateStudentRequest` (nome, dataNascimento, categoria) em `src/frontend/src/app/models/aluno.model.ts` (existente) — mantendo a interface `Aluno` inalterada

**Checkpoint**: Sem erros de compilação em backend e frontend após as adições.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend controller com os 3 endpoints + Angular service que encapsula as chamadas HTTP. Base para todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story pode ser implementada até esta fase estar completa.

- [x] T004 Implementar `StudentsController` em `backend/Imperial.Api/Controllers/StudentsController.cs` com os 3 endpoints abaixo, todos com `[Authorize]` e respostas no envelope padrão `ApiResponse<T>` (depende de T001, T002):
  - `GET /api/v1/students` → lista todos os alunos da coleção `students` via `IMongoDatabase`
  - `POST /api/v1/students` → valida `CreateStudentRequest` (nome ≥ 2 chars, dataNascimento não futura, categoria na lista válida), cria documento `Aluno` e retorna 201 com `StudentResponse`
  - `DELETE /api/v1/students/{id}` → busca por Id, deleta ou retorna 404

- [x] T005 Implementar `StudentsService` em `src/frontend/src/app/services/students.service.ts` com os 3 métodos (depende de T003):
  - `listar()`: GET → substitui `stateService.state.alunos` pelo resultado; **não** chama `stateService.save()`
  - `criar(request: CreateStudentRequest)`: POST → adiciona o novo aluno a `stateService.state.alunos`; **não** chama `stateService.save()`
  - `excluir(id: string)`: DELETE → remove de `stateService.state.alunos` e também de `stateService.state.avaliacoes` (cascade local — FR-009); **não** chama `stateService.save()`

**Checkpoint**: `dotnet build` compila sem erros; `ng build` compila sem erros; `GET /api/v1/students` retorna `[]` via curl com token válido.

---

## Phase 3: User Story 2 - Listar e Filtrar Alunos do Backend (Priority: P1) 🎯 MVP parcial

**Goal**: A tela de alunos carrega do backend em vez de usar sessionStorage; mock data automático é eliminado.

**Independent Test**: Acessar `/students` após login → lista vazia exibida (sem dados fictícios); filtros de nome e categoria funcionam sobre os dados vindos da API.

- [x] T006 [US2] Atualizar `StudentsComponent` em `src/frontend/src/app/pages/students/students.component.ts`:
  - Injetar `StudentsService` no construtor
  - Adicionar `ngOnInit()` que chama `studentsService.listar()`
  - **Remover** o bloco do construtor que verifica `state.alunos.length === 0` e chama `gerarMockData()` (FR-012)
  - **Remover** os métodos `gerarMockData()`, `gerarNomeAleatorio()`, `gerarDataAleatoria()` e as constantes `NOMES`, `SOBRENOMES`, `CATEGORIAS_MOCK` (código morto após a remoção do mock)
  - O getter `alunosFiltrados` continua lendo de `stateService.state.alunos` (cache populado pelo serviço) — sem mudança
- [x] T007 [US2] Validado via curl: GET inicial → lista vazia `[]` sem mock data (FR-012); POST dois alunos → 201 com dados corretos; GET após cadastros → ambos na lista; filtros client-side inalterados (getter `alunosFiltrados` usa cache `state.alunos`)

**Checkpoint**: Lista carregada do backend na inicialização; sem mock data automático; filtros funcionam.

---

## Phase 4: User Story 1 - Cadastrar Aluno com Persistência Real (Priority: P1)

**Goal**: O formulário de cadastro persiste os dados no backend; o aluno continua disponível após fechar o navegador.

**Independent Test**: Cadastrar um aluno pelo formulário, fechar o navegador, reabrir, fazer login → aluno ainda está na lista.

- [x] T008 [US1] Atualizar `StudentsComponent.onSubmitCadastro()` em `src/frontend/src/app/pages/students/students.component.ts` para chamar `studentsService.criar({nome, dataNascimento, categoria})` em vez de fazer push direto em `stateService.state.alunos` — tratando erros (ex.: 400 de validação do backend) com exibição de mensagem adequada
- [x] T009 [US1] Validado via curl: POST com dados válidos → 201 + aluno com ID MongoDB; POST com nome curto → 400 + mensagem customizada (FR-007); POST com data futura → 400; POST com categoria inválida → 400 com lista de valores aceitos (FR-006)

**Checkpoint**: Cadastro via formulário persiste no MongoDB; persistência entre sessões do navegador confirmada.

---

## Phase 5: User Story 3 - Excluir Aluno com Consistência de Dados (Priority: P2)

**Goal**: A exclusão persiste no backend; avaliações vinculadas são limpas do sessionStorage.

**Independent Test**: Cadastrar aluno com avaliações (via `student-eval`), excluir o aluno → desaparece da lista após reload; avaliações daquele aluno não aparecem mais no dashboard.

- [x] T010 [US3] Atualizar `StudentsComponent.excluirAluno()` em `src/frontend/src/app/pages/students/students.component.ts` para chamar `studentsService.excluir(id)` em vez de filtrar diretamente `stateService.state.alunos` — tratando 404 e outros erros com mensagem adequada
- [x] T011 [US3] Validado via curl: DELETE aluno existente → 200 + mensagem; GET após delete → lista sem o aluno excluído; cascade de avaliacoes implementado no `StudentsService.excluir()` via filtro local no `state.avaliacoes`

**Checkpoint**: Exclusão persiste no backend; cascata local de avaliações funciona.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Build final, validação cruzada com outros componentes e cenários do quickstart.

- [x] T012 [P] `dotnet build` ✓ (0 warnings, 0 erros); `ng build` ✓ (698 kB, dentro do orçamento)
- [x] T013 [P] Confirmado por revisão de código: `DashboardComponent.computeAlunoData()` e `initAlunoTab()` leem `stateService.state.alunos` sem mudança — serão populados pelo cache do `StudentsService.listar()` quando o usuário visitar `/students` antes
- [x] T014 [P] Confirmado por revisão de código: `GamesComponent` e `TrainingComponent` leem `stateService.state.alunos` sem mudança — mesma estratégia de cache
- [x] T015 Validação via curl cobre 8 dos 10 cenários do `quickstart.md`: lista vazia, POST válido×2, GET com alunos, DELETE, GET após delete, validação nome curto, validação categoria inválida. Persistência entre sessões e visibilidade entre usuários requerem teste em browser real (validação manual pendente)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — T001/T002/T003 são paralelos entre si.
- **Foundational (Phase 2)**: Depende do Setup — T004 depende de T001+T002; T005 depende de T003. T004 e T005 são paralelos entre si (backend vs frontend).
- **US2 (Phase 3)**: Depende do Foundational completo (T004+T005).
- **US1 (Phase 4)**: Depende de US2 (o `StudentsComponent` já foi atualizado para usar `StudentsService` em T006; T008 só adiciona a chamada ao criar — ambos editam o mesmo arquivo, então precisam ser sequenciais).
- **US3 (Phase 5)**: Depende de US1 (mesmo motivo — mesmo arquivo).
- **Polish**: Depende de US1+US2+US3.

### Parallelismo

```
# Fase 1 (tudo em paralelo):
T001 (Aluno.cs)  ||  T002 (StudentDtos.cs)  ||  T003 (aluno.model.ts)

# Fase 2 (paralelo backend vs frontend):
T004 (StudentsController)  ||  T005 (StudentsService)

# Fases 3, 4, 5 são sequenciais (editam o mesmo arquivo: students.component.ts)
T006 → T007 → T008 → T009 → T010 → T011

# Polish em paralelo:
T012  ||  T013  ||  T014  →  T015
```

---

## Implementation Strategy

### MVP (US2 + US1 = lista real + cadastro persistente)

1. Completar Phase 1: Setup (T001–T003)
2. Completar Phase 2: Foundational (T004–T005) — **crítico**
3. Completar Phase 3: US2 (T006–T007) — lista carregando do backend, sem mock
4. Completar Phase 4: US1 (T008–T009) — cadastro persistente
5. **PARAR E VALIDAR**: cadastro + listagem reais funcionando, exclusão ainda usa sessionStorage
6. MVP entregue: dados de alunos persistidos no MongoDB

### Incremental Delivery

1. Setup + Foundational → base pronta (endpoints no ar, serviço Angular criado)
2. US2 → lista real, sem mock data → **visualmente a maior mudança para o professor**
3. US1 → cadastro real → **persistência confirmada**
4. US3 → exclusão real → feature completa

### Notas de implementação

- `StudentsController` segue exatamente o mesmo padrão de `UsersController` (já validado na feature 016) — usa `IMongoDatabase` no construtor, retorna `ApiResponse<T>`, tem `[Authorize]`.
- `StudentsService` segue o mesmo padrão de `UsersService` já existente no frontend.
- As constantes de categoria válidas no backend podem ser colocadas em `backend/Imperial.Api/Identity/Roles.cs` análogo, ou simplesmente como constante inline no controller/DTO — dado Princípio I, constante inline no controller é suficiente.
- A lista de categorias válidas no backend deve ser a mesma que `CATEGORIAS` do frontend: `["Sub09","Sub10","Sub11","Sub12","Sub13","Sub14","Sub15F","Sub17F"]`.
