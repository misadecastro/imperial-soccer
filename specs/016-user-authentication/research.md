# Research: Autenticação de Usuários com Perfil Admin

**Branch**: `016-user-authentication` | **Date**: 2026-06-27

## Decisões

### 1. Stores customizados do Identity sobre MongoDB.Driver (sem EF Core)

**Decision**: Implementar `IUserStore<ApplicationUser>`, `IUserPasswordStore<ApplicationUser>`, `IUserRoleStore<ApplicationUser>` e `IRoleStore<ApplicationRole>` diretamente sobre `MongoDB.Driver`, registrados manualmente no contêiner de DI (`AddIdentityCore<ApplicationUser>().AddRoles<ApplicationRole>()` + stores customizados, sem `AddEntityFrameworkStores`).

**Rationale**: A constituição (Princípio V + Restrições de Arquitetura, emenda v2.1.0) proíbe EF/ORM. As interfaces de store do Identity são propositalmente pequenas — implementá-las diretamente é o caminho de menor complexidade que ainda satisfaz Princípio I (Simplicidade Funcional), evitando tanto EF Core quanto uma dependência externa de terceiros com ciclo de manutenção fora do controle do time.

**Alternatives considered**:
- `AspNetCore.Identity.MongoDB` / `AspNetCore.Identity.MongoDbCore` (pacotes da comunidade) — rejeitados: introduzem uma dependência de terceiros não essencial quando as interfaces a implementar são pequenas; o projeto já segue o padrão de acesso direto ao MongoDB.Driver para todas as demais entidades, então manter o mesmo padrão para Identity é mais consistente.
- Entity Framework Core com provedor MongoDB (`MongoDB.EntityFrameworkCore`) — rejeitado: viola diretamente a proibição de ORM da constituição.

---

### 2. Autenticação via JWT Bearer (não cookies)

**Decision**: O backend emite um token JWT no login (`POST /api/v1/auth/login`), validado via `Microsoft.AspNetCore.Authentication.JwtBearer` em cada requisição subsequente. O Angular armazena o token em `sessionStorage` (chave própria, separada de `imperialState`) e o envia via header `Authorization: Bearer <token>` através de um `HttpInterceptor`.

**Rationale**: O frontend é uma SPA Angular separada do backend (Princípio IV — API-First com Frontend Desacoplado); JWT é o padrão de mercado para esse modelo, evita estado de sessão no servidor (alinhado a "PROIBIDO estado global ou singleton mutable nos serviços") e integra-se naturalmente com um `HttpInterceptor` Angular.

**Alternatives considered**: Cookies de sessão com `Microsoft.AspNetCore.Identity` cookie-based auth — rejeitado: presume same-origin ou configuração CORS mais complexa para cookies cross-site, e acopla estado de sessão ao servidor, menos natural para uma API stateless consumida por SPA.

---

### 3. Armazenamento do token no frontend: `sessionStorage`, chave dedicada

**Decision**: Token JWT guardado em `sessionStorage` sob uma chave dedicada (ex.: `imperialAuthToken`), distinta de `imperialState`.

**Rationale**: Mantém consistência com o padrão de persistência já estabelecido no projeto (`sessionStorage`, perdido ao fechar a aba — postura de segurança razoável para um app de uso em campo/escritório). Uma chave separada evita acoplar o token de autenticação ao blob de dados de domínio, que tem um ciclo de vida e formato diferentes.

**Alternatives considered**: `localStorage` — rejeitado nesta fase: persistência entre sessões do navegador aumenta a superfície de exposição do token sem necessidade explícita na spec (nenhum requisito de "lembrar-me").

---

### 4. Seed automático da conta Admin inicial

**Decision**: Um `AdminSeedService`, executado na inicialização do backend (`IHostedService` ou chamada direta em `Program.cs`), verifica se existe ao menos um usuário com papel Administrador; se não, cria um com credenciais vindas de configuração (`appsettings`/variável de ambiente), nunca hardcoded no código-fonte.

**Rationale**: Atende FR-011 (sempre existir ao menos 1 Admin) e resolve o problema do "primeiro acesso" (não há autocadastro, então alguém precisa existir para cadastrar os demais). Usar configuração/variável de ambiente para as credenciais iniciais evita expor uma senha fixa no repositório.

**Alternatives considered**: Migration/script manual executado por um operador — rejeitado: adiciona um passo manual de deploy para algo que pode e deve ser automático e idempotente.

---

### 5. Política de bloqueio por tentativas inválidas (lockout)

**Decision**: Usar o suporte nativo de lockout do ASP.NET Core Identity (`Options.Lockout`: `MaxFailedAccessAttempts`, `DefaultLockoutTimeSpan`), com valores razoáveis (ex.: 5 tentativas, 5 minutos de bloqueio) configuráveis via `appsettings`.

**Rationale**: Atende FR-012 sem reimplementar lógica de contagem de tentativas — o Identity já resolve isso de forma testada e integrada ao `SignInManager`.

**Alternatives considered**: Implementação manual de contador de tentativas na coleção `users` — rejeitado: duplicaria uma capacidade que o Identity já oferece nativamente, violando Princípio I.

---

### 6. Hashing de senha

**Decision**: Usar o `PasswordHasher<ApplicationUser>` padrão do Identity (PBKDF2 com salt, parametrizado pela própria biblioteca).

**Rationale**: Atende FR-008 (senha nunca em texto plano/reversível) com a implementação de referência do próprio framework — não há motivo de negócio para customizar o algoritmo de hashing.

**Alternatives considered**: Nenhuma — customizar hashing de senha sem necessidade documentada seria complexidade não justificada (Princípio I).

---

### 7. Contratos de API documentados em `contracts/`

**Decision**: Esta é a primeira feature do projeto a expor uma API real — `contracts/auth-api.md` documenta os endpoints de autenticação e gestão de usuários (rotas, payloads, envelope de resposta), servindo de referência para o time de frontend e para os testes de integração do backend.

**Rationale**: Diferente da migração Angular (015), que não introduzia nenhuma interface nova, esta feature cria a primeira superfície de API do sistema — documentar o contrato é o ponto de partida natural para qualquer integração futura (já antecipado no Princípio IV: "API DEVE ser completa e autodocumentada via Swagger/OpenAPI").

---

### 8. Sem suíte de testes E2E automatizada no frontend

**Decision**: Validação do fluxo de login/gestão de usuários no Angular é manual via `quickstart.md`, consistente com a decisão já tomada nas features 014/015. Testes automatizados (xUnit) cobrem apenas o backend (stores customizados, `AdminSeedService`, lockout).

**Rationale**: Mantém o escopo focado na entrega funcional; testes de backend são mais críticos aqui porque é código novo e de segurança (stores customizados de Identity), enquanto o frontend já tem o padrão estabelecido de validação manual nas features anteriores.
