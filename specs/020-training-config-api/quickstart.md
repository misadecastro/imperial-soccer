# Quickstart — Validação Manual: Configuração de Treino com Persistência Real

Pré-requisitos: MongoDB local em `localhost:27017`; backend e frontend rodando.

```bash
# Backend
cd backend/Imperial.Api
dotnet run                     # http://localhost:5179, Swagger em /swagger

# Frontend (outro terminal)
cd src/frontend
ng serve                        # http://localhost:4200
```

Contas: um Administrador (seed) e, idealmente, um Professor (criado via tela de usuários) para os testes de papel.

## Cenários

### A. Seed inicial (FR-012 / SC-006)
1. Com o banco **sem** as coleções `training_principles`/`game_moments`, iniciar o backend.
2. `GET /api/v1/game-moments` e `GET /api/v1/training-principles` (autenticado) retornam os 4 momentos e 3 princípios padrão.
3. Reiniciar o backend → **não** há duplicação (continua 4 e 3).

### B. Princípios/Fundamentos persistem (US1 / FR-001,002)
4. Logado como **Admin**, abrir `/training-config` (aba Princípios e Fundamentos): os 3 grupos aparecem com seus itens.
5. Criar um grupo "Teste Tático" → aparece na lista.
6. Adicionar itens "Item A" e "Item B" ao grupo → aparecem.
7. Renomear "Item A" → "Item A2"; remover "Item B".
8. **Recarregar a página (F5)** → "Teste Tático" com "Item A2" persistem; "Item B" não retorna.
9. Fechar o navegador, reabrir, logar → dados continuam.

### C. Validações de Princípios/Itens (FR-005)
10. Criar grupo com nome vazio → erro; sem criação.
11. Criar grupo com nome duplicado ("Fundamentos Técnicos") → erro.
12. Adicionar item duplicado no mesmo grupo → erro.

### D. Momentos persistem (US2 / FR-003,004)
13. Aba "Momentos do Jogo": os 4 momentos aparecem.
14. "+ Novo momento": nome "Bola Parada", descrição "Faltas e escanteios" → salvar → aparece na lista com a descrição.
15. Editar "Bola Parada": vincular "Princípios Táticos Ofensivos", marcar 2 itens; vincular "Fundamentos Técnicos" sem itens → salvar.
16. **Recarregar (F5)** → o momento, a descrição, os 2 vínculos e os itens marcados persistem exatamente.
17. Editar de novo, **desvincular** "Fundamentos Técnicos" → salvar → recarregar → o vínculo não retorna.
18. Editar nome/descrição do momento → salvar → recarregar → novos valores persistem.

### E. Validações de Momentos (FR-005)
19. Criar momento com nome vazio → erro. 
20. Criar momento com nome duplicado ("Org. Ofensiva") → erro.

### F. Cascata / integridade (FR-006,007 / SC-005)
21. Garantir que "Org. Ofensiva" tem "Princípios Táticos Ofensivos" vinculado com o item "Espaço com Bola" marcado.
22. Na aba Princípios, **remover o item** "Espaço com Bola" → recarregar → em "Org. Ofensiva" o item some da seleção do vínculo (sem quebrar a tela).
23. **Remover o grupo** "Princípios Táticos Ofensivos" → recarregar → o vínculo inteiro some de todos os momentos.

### G. Gate de papel (US1 cenário 5 / FR-010 / SC-004)
24. Logar como **Professor**: o botão "Configurações" não aparece na tela de treino; acessar `/training-config` por URL redireciona/nega.
25. (API) `POST /api/v1/training-principles` com token de Professor → **403**. Com token de Admin → sucesso.
26. (API) `GET /api/v1/game-moments` com token de Professor → **200** (leitura permitida).

### H. Consumo na montagem de treino (US3 / FR-013)
27. Como Admin, adicionar um novo momento "Escanteio".
28. Logar como **Professor**, abrir a tela de **montagem de treino** → "Escanteio" e os princípios/itens reais do backend aparecem disponíveis (não os dados fixos antigos).
29. Admin adiciona um item a um princípio → Professor recarrega a montagem → item aparece.

## Critério de conclusão
Todos os 29 passos comportam-se conforme descrito, sem erros no console do navegador nem no log do backend; dados persistem entre reloads e reinícios; papéis respeitados.
