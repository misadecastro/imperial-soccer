# Quickstart: Configuração de Itens de Treino

**Branch**: `019-training-config-crud` | **Date**: 2026-07-13

## Pré-requisitos

1. Backend rodando (para login): `cd backend/Imperial.Api && dotnet run`
2. Frontend rodando: `cd src/frontend && ng serve`
3. Login como **Administrador** (`admin@imperial.com`). Para testar o gate, também um usuário Professor.

> Esta feature é **frontend-only com dados mockados** — não há endpoints novos nem MongoDB envolvidos. O backend é necessário apenas para o login/JWT que define o papel.

## Cenários de validação

| Cenário | Como reproduzir | Resultado esperado |
|---------|-----------------|--------------------|
| **Botão visível (admin)** | Logar como Administrador, abrir `/training` | Botão "Configurações" à direita de "Novo Treino", com menor destaque (secundário) |
| **Botão oculto (professor)** | Logar como Professor, abrir `/training` | Botão "Configurações" **não** aparece |
| **Gate de rota** | Como Professor, acessar `/training-config` pela URL | Redirecionado (ex.: `/students`) |
| **Seed pré-carregado** | Abrir `/training-config` como Admin | 4 momentos e 3 grupos de princípios com todos os itens já listados (FR-013) |
| **Criar grupo** | Cadastrar "Princípios Táticos Ofensivos 2" | Grupo aparece na lista |
| **Nome vazio** | Salvar grupo/item/momento sem nome | Bloqueado com aviso "nome obrigatório" (FR-010) |
| **Nome duplicado** | Cadastrar grupo com título já existente | Bloqueado com aviso de duplicidade (FR-011) |
| **Adicionar item** | Num grupo, adicionar "Cruzamento" | Item aparece dentro do grupo |
| **Editar item** | Renomear um item | Novo nome refletido |
| **Remover item** | Remover um item | Item some do grupo |
| **Criar momento** | Cadastrar "Bola Parada" | Momento aparece na lista |
| **Vincular princípio a momento** | Num momento, vincular um grupo | Grupo passa a constar no momento |
| **Selecionar itens do vínculo** | No grupo vinculado, marcar itens | Seleção registrada |
| **Cascata: remover grupo vinculado** | Remover um grupo que está vinculado a um momento | Vínculo some do momento (sem referência órfã) (FR-012) |
| **Cascata: remover item selecionado** | Remover item marcado num vínculo | Item some da seleção do vínculo (FR-012) |
| **Remover momento** | Remover um momento | Momento e seus vínculos somem |
| **Sem persistência (esperado)** | Recarregar a página (F5) | Dados voltam ao seed mockado — alterações perdidas (FR-014, comportamento aceito) |

## Reflexo imediato (SC-004)

Todas as operações devem aparecer na tela sem recarregar. Como o estado vive num serviço singleton em memória, navegar de `/training-config` para `/training` e voltar mantém as alterações **dentro da mesma sessão** (apenas F5/reload reseta ao seed).
