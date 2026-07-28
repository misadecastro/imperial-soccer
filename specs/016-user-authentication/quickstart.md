# Quickstart: Autenticação de Usuários com Perfil Admin

**Branch**: `016-user-authentication` | **Date**: 2026-06-27

## Pré-requisitos

- .NET 8 SDK instalado.
- MongoDB acessível localmente (ex.: `mongodb://localhost:27017`) ou via container Docker.
- Node.js + Angular CLI (já usados pelo frontend, feature 015).

## Rodar o backend (primeira vez)

```bash
cd backend/Imperial.Api
dotnet restore
dotnet user-secrets set "AdminSeed:Email" "admin@imperial.com"
dotnet user-secrets set "AdminSeed:Senha" "<senha-forte-inicial>"
dotnet run
```

Na primeira inicialização, o `AdminSeedService` cria as roles `Administrador`/`Professor` e
o usuário Admin inicial com as credenciais configuradas acima (FR-011).

Swagger disponível em `https://localhost:<porta>/swagger`.

## Rodar o frontend

```bash
cd src/frontend
ng serve
```

Configurar a URL base da API consumida pelo `AuthService` (ex.: via `environment.ts`) para
apontar para o backend local.

## Cenários de validação

| Cenário | Como reproduzir | Resultado esperado |
|---------|------------------|---------------------|
| Login com credenciais do Admin seedado | Acessar `/login`, informar e-mail/senha configurados no seed | Acesso concedido, redirecionado à área principal |
| Login com senha errada | Informar e-mail válido + senha incorreta | Mensagem genérica de erro, sem indicar qual campo está errado (FR-009) |
| Acesso direto sem login | Abrir `/students` (ou qualquer rota protegida) sem token válido | Redirecionado para `/login` (FR-002, US3) |
| Admin cadastra usuário | Logado como Admin, acessar gestão de usuários, cadastrar um Professor | Novo usuário aparece na lista; consegue logar imediatamente (US2) |
| E-mail duplicado | Tentar cadastrar usuário com e-mail já existente | Erro 409, cadastro rejeitado (FR-007) |
| Professor tenta gerenciar usuários | Logado como Professor, tentar acessar a tela de gestão de usuários | Acesso negado (403) (FR-004, US2 Acceptance Scenario 4) |
| Bloqueio por tentativas inválidas | Errar a senha repetidamente (> limite configurado) na mesma conta | Conta bloqueada temporariamente (FR-012) |
| Logout | Logado, acionar "Sair" | Sessão finalizada; tentativa de acessar rota protegida redireciona ao login |
| Último Admin não pode ser desativado | Tentar desativar/trocar o papel do único Admin ativo | Operação rejeitada (Edge Case) |
| Fluxos existentes preservados | Após login, executar fluxos das features 002–015 (cadastro de aluno, chamada, avaliação, jogo, dashboard) | Comportamento idêntico ao validado antes da autenticação (FR-015, US3) |

## Critério de "feature concluída"

1. Todos os cenários acima passam.
2. `dotnet build` (backend) e `ng build` (frontend) concluem sem erros.
3. Nenhuma senha aparece em texto plano em logs, respostas da API ou na UI.
4. Pelo menos um Administrador ativo existe em qualquer estado do sistema.
