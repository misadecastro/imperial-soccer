# Data Model: Autenticação de Usuários com Perfil Admin

**Branch**: `016-user-authentication` | **Date**: 2026-06-27 (revisado durante implementação)

Uma única nova coleção MongoDB (`users`), conforme nomenclatura da constituição
(snake_case plural em inglês). Nenhuma entidade de domínio existente (Aluno, Avaliação,
Chamada, Jogo) é alterada por esta feature.

> **Simplificação feita durante a implementação**: a versão original deste documento
> previa uma coleção `roles` separada (`IRoleStore`/`RoleManager`). Na prática, a
> autorização desta feature é decidida pela claim `role` do **token JWT**, não pelo
> mecanismo de roles do Identity (`UserManager.GetRolesAsync`) — então uma coleção `roles`
> seria uma entidade sem necessidade real (Princípio I: "complexidade só é justificada
> quando existe uma necessidade real e documentada"). Como há exatamente 2 papéis fixos,
> o papel passou a ser um campo simples embutido no documento do usuário, consistente com
> "Embeddings são preferidos sobre referências quando os dados são sempre acessados juntos"
> (Princípio V). `IRoleStore`/`ApplicationRole`/`MongoRoleStore` foram eliminados do plano.

## Usuário (coleção `users`)

| Campo | Tipo | Restrições | Origem |
|-------|------|-------------|--------|
| `_id` | string (GUID) | identificador único, gerado na criação | — |
| `userName` / `normalizedUserName` | string | igual ao e-mail nesta feature; `normalizedUserName` em UPPER (padrão Identity, busca case-insensitive) | FR-005, FR-007 |
| `email` / `normalizedEmail` | string | único; usado como identificador de login | FR-005, FR-007 |
| `passwordHash` | string | gerado por `PasswordHasher<ApplicationUser>`; nunca texto plano | FR-008 |
| `nome` | string | nome de exibição do usuário | FR-005, FR-013 |
| `role` | string | `"Administrador"` \| `"Professor"` — papel único, embutido (ver nota acima) | FR-003, FR-004 |
| `ativo` | bool | `false` = login bloqueado mesmo com credenciais corretas | Edge Case (desativação) |
| `accessFailedCount` | int | contador de tentativas inválidas | FR-012 |
| `lockoutEnd` | DateTimeOffset? | timestamp até quando a conta está bloqueada | FR-012 |
| `lockoutEnabled` | bool | sempre `true` nesta feature | FR-012 |
| `concurrencyStamp` / `securityStamp` | string | campos exigidos pela interface `IUserStore` do Identity | — |

```ts
// Equivalente conceitual no frontend (Usuário não é persistido em sessionStorage;
// é consumido via API REST) — src/frontend/src/app/models/user.model.ts
interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: 'Administrador' | 'Professor';
  ativo: boolean;
}
```

## Sessão (autenticação) — não persistida

Não há coleção `sessions` — a "Sessão" descrita na spec é representada por um **token JWT
stateless**, emitido no login e validado em cada requisição via assinatura/expiração.
Não há estado de sessão armazenado no servidor (consistente com "PROIBIDO estado global ou
singleton mutable nos serviços"). A claim `role` do token (não `IUserRoleStore`/`RoleManager`)
é o que `[Authorize(Roles = "Administrador")]` valida no backend.

| Claim do token | Conteúdo |
|-----------------|----------|
| `sub` | id do usuário |
| `name` | nome de exibição |
| `role` | `Administrador` \| `Professor` |
| `exp` | expiração (configurável; default 8h) |

## Relacionamentos

Nenhuma relação com as entidades de domínio existentes (Aluno, Avaliação, Chamada, Jogo) —
Usuário é quem opera o sistema; Aluno é quem é gerido. Não há segregação de dados de domínio
por usuário nesta versão (Edge Case da spec). `role` é um valor embutido, não uma referência.

## Validações

- `userName`/`email` únicos (FR-007) — índice único na coleção `users`.
- `role` restrito aos dois valores válidos (`Administrador`, `Professor`) — validado na camada
  de serviço/controller (`CreateUserRequest`/`UpdateUserRequest`), não no banco.
- `passwordHash` nunca nulo nem em texto plano (FR-008).
- Sempre ≥ 1 usuário com `role = "Administrador"` e `ativo = true` (FR-011) — verificado pelo
  `AdminSeedService` na inicialização e reforçado na lógica de desativação/edição (Edge Case:
  impedir desativar ou trocar o papel do último Admin ativo).
- `accessFailedCount` resetado a 0 em login bem-sucedido; `lockoutEnd` aplicado após exceder o
  limite configurado (FR-012).
