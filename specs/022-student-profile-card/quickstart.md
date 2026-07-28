# Quickstart: Ficha do Aluno com Avaliações Dinâmicas

**Feature**: 022-student-profile-card | **Date**: 2026-07-27

Roteiro de validação. Requer MongoDB local, API (`dotnet run` em `Imperial.Api`) e frontend
(`ng serve`), autenticado. Um Administrador é necessário para gerir tipos.

## 1. Gates de build

```bash
cd backend && dotnet build Imperial.slnx        # 0 erros
cd src/frontend && ng build                     # 0 erros (strict)
cd backend && dotnet test Imperial.slnx         # testes de integração verdes (MongoDB local)
```

## 2. US1 — Ficha e dados do atleta

| # | Ação | Esperado |
|---|---|---|
| 1 | Na lista de **Alunos**, clicar em **Ficha** de um aluno | Abre a ficha do aluno |
| 2 | Observar o quadro **Aluno** | Foto (ou placeholder), nome, pé dominante, data de nascimento, **idade calculada**, massa corporal, estatura |
| 3 | Editar inline pé dominante/massa/estatura e enviar uma foto | Campos salvos; ao reabrir a ficha, persistem; foto exibida |
| 4 | Preencher o quadro **Avaliação Geral** e salvar | Texto persiste ao reabrir |
| 5 | Reduzir a janela para largura de celular | Layout colapsa de 3 colunas para 1, sem rolagem horizontal |

## 3. US2 — Gestão de tipos (Administrador)

| # | Ação | Esperado |
|---|---|---|
| 1 | Como admin, clicar na **engrenagem** no topo da ficha | Abre a gestão de tipos de avaliação |
| 2 | Ver a lista, o campo de **filtro por nome** e o botão **Novo** | Todos presentes; editar/excluir por linha |
| 3 | **Novo** → informar nome + adicionar itens → salvar | Tipo aparece na lista e vira quadro nas fichas |
| 4 | Filtrar por nome | Lista mostra só correspondências; estado vazio quando nenhuma |
| 5 | **Editar** nome/itens | Alterações refletidas na lista e nos quadros |
| 6 | **Excluir** um tipo com avaliações | Tipo some da gestão e dos quadros; **histórico preservado** (soft delete) |
| 7 | Como **não-admin**, abrir a ficha | Engrenagem/gestão de tipos indisponível; rota `/evaluation-types` negada |

## 4. US3 — Avaliar e visualizar evolução

| # | Ação | Esperado |
|---|---|---|
| 1 | Em um quadro de tipo **sem** avaliação | Título com o nome do tipo + botão **Avaliar** com ícone de prancheta |
| 2 | Clicar em **Avaliar** | Tela com campo de **data** e cada item pontuável de **1 a 5** |
| 3 | Pontuar e **salvar** | Avaliação registrada com a data e as notas |
| 4 | Voltar à ficha | Quadro passa a exibir **gráfico de radar**; botão **Avaliar** no canto superior direito (ícone + tooltip "Avaliar") |
| 5 | Reabrir **Avaliar** do tipo com histórico | **Gráfico de evolução por item** + **histórico** de avaliações |
| 6 | Com 2+ tipos cadastrados | Quadros distribuídos entre a 2ª e a 3ª coluna |

## 5. Verificações de API (Swagger `/swagger`)

- `PUT /students/{id}/profile` atualiza campos da ficha (autenticado).
- `GET/POST/PUT/DELETE /evaluation-types` — escrita só com token de Administrador (403 sem).
- `POST /evaluations` rejeita nota fora de 1–5 e tipo arquivado/inexistente.
- `GET /evaluations?alunoId=&tipoId=` retorna o histórico para radar/evolução.
