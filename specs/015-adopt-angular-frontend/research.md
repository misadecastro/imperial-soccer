# Research: Migração do Frontend para Angular

**Branch**: `015-adopt-angular-frontend` | **Date**: 2026-06-27

## Decisões

### 1. Standalone components em vez de NgModules

**Decision**: Usar exclusivamente Angular standalone components (sem `NgModule`).

**Rationale**: É o padrão recomendado pelo Angular desde a v17+ e reduz boilerplate. Alinha-se ao Princípio I (Simplicidade Funcional) da constituição — menos arquivos de configuração para um projeto deste porte (7 páginas).

**Alternatives considered**: Estrutura clássica com `AppModule` + feature modules. Rejeitada — adiciona uma camada de organização sem benefício real no tamanho atual do projeto.

---

### 2. Angular Router para navegação entre páginas

**Decision**: Substituir os links `<a href="pages/x.html">` por rotas Angular (`/`, `/login`, `/dashboard`, `/games`, `/training`, `/students`, `/student-eval`).

**Rationale**: Navegação sem reload completo da página, com compartilhamento natural de serviços singleton (`StateService`) entre rotas — hoje cada HTML lê `sessionStorage` do zero ao carregar.

**Alternatives considered**: Manter múltiplos pontos de entrada HTML, cada um bootando uma mini-app Angular isolada. Rejeitada — contraria o modelo de SPA do Angular e duplicaria a inicialização do `StateService` por página.

---

### 3. Tailwind CSS via build do Angular (não mais via CDN)

**Decision**: Integrar Tailwind como dependência de build (PostCSS via Angular CLI), com `tailwind.config.js` único na raiz do projeto Angular contendo a paleta `imperial` hoje duplicada em cada `<script>` inline de cada página.

**Rationale**: A emenda à constituição (v2.0.0) já formaliza essa mudança. Centralizar a configuração elimina a duplicação do objeto `tailwind.config` presente hoje em 7 arquivos HTML diferentes.

**Alternatives considered**: Manter `<script src="https://cdn.tailwindcss.com">` dentro do `index.html` do Angular. Rejeitada — funciona tecnicamente mas perde tree-shaking de classes não usadas e não é compatível com builds de produção otimizados.

---

### 4. `StateService` único encapsulando `sessionStorage`

**Decision**: Criar um serviço Angular `providedIn: 'root'` (`state.service.ts`) que centraliza leitura/escrita da chave `imperialState`, expondo os arrays `alunos`, `avaliacoes`, `chamadas`, `jogos` com o mesmo formato atual.

**Rationale**: Hoje cada página HTML reimplementa a função `loadState()`/`saveState()` de forma quase idêntica (confirmado em `dashboard.html`, `games.html`, `students.html`, `training.html`, `student-eval.html`). Centralizar em um serviço elimina essa duplicação e é a base para a futura troca por chamadas de API (Princípio IV emendado já prevê essa transição).

**Alternatives considered**: Cada componente de página acessar `sessionStorage` diretamente. Rejeitada — perpetua a duplicação que esta migração busca eliminar (US2).

---

### 5. Chart.js usado diretamente, sem biblioteca wrapper

**Decision**: Manter Chart.js v4 importado diretamente e encapsulado em componentes finos (`evolution-chart`, `bar-chart`, `doughnut-chart`), sem adotar `ng2-charts` ou similar.

**Rationale**: A API do Chart.js já está validada e em uso (features 008, 011, 012, 014). Uma lib wrapper adicionaria uma dependência e uma camada de abstração sem necessidade real — viola Princípio I se adotada sem justificativa.

**Alternatives considered**: `ng2-charts`. Rejeitada — dependência extra para um ganho marginal (binding declarativo) quando o uso direto já é simples e conhecido pela equipe.

---

### 6. Migração incremental, página por página

**Decision**: Cada página é migrada e validada individualmente; páginas Angular e páginas HTML estáticas coexistem durante a transição, ambas lendo/escrevendo o mesmo `sessionStorage`.

**Rationale**: Decisão explícita do usuário na spec (FR-007, Assumptions). Reduz risco de regressão em comparação com um big-bang rewrite das 7 páginas simultaneamente, dado que US1 exige zero regressão.

**Alternatives considered**: Migrar tudo de uma vez em uma única entrega. Rejeitada pela spec — aumenta o raio de impacto de qualquer bug introduzido e dificulta validação incremental.

---

### 7. Modelos TypeScript espelham o esquema atual sem renomear campos

**Decision**: Interfaces em `models/` usam exatamente os mesmos nomes de campo já gravados em `sessionStorage` (ex.: `tatico`, `tecnico`, `mental`, `alunoId`, `categoria`), em português, sem conversão para inglês/camelCase.

**Rationale**: FR-002 exige que o esquema de dados permaneça idêntico. Renomear campos exigiria uma rotina de migração de dados, fora do escopo desta feature.

**Alternatives considered**: Padronizar nomes em inglês nas interfaces (ex.: `tactical`, `technical`) mantendo um mapeamento de serialização. Rejeitada — complexidade desnecessária (Princípio I) para nenhum benefício funcional nesta etapa.

---

### 8. Sem suíte de testes automatizados nesta feature

**Decision**: Validação de paridade é manual, via `quickstart.md`, repetindo os roteiros de teste das specs 002–014 na versão Angular.

**Rationale**: Consistente com a decisão já tomada na feature 014. A spec não solicita TDD nem testes automatizados; introduzir Jasmine/Karma como gate obrigatório nesta migração ampliaria o escopo além da paridade funcional pedida.

**Alternatives considered**: Adicionar testes unitários Angular (Jasmine/Karma) para os novos componentes. Considerado valioso como trabalho futuro, mas fora do escopo desta feature para não adiar a entrega da paridade funcional (US1).

---

### 9. Sem `contracts/` nesta feature

**Decision**: Nenhum arquivo de contrato de interface é gerado.

**Rationale**: A migração não expõe nem consome nenhuma interface nova — o frontend continua falando apenas com `sessionStorage`. Quando uma página migrar para consumir a API .NET (trabalho futuro, fora de escopo), o contrato REST correspondente será documentado naquele momento.
