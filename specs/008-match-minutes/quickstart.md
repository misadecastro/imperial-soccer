# Quickstart: Minutagem de Jogos

**Branch**: `008-match-minutes`

## Como testar localmente

### 1. Verificar branch

```bash
git checkout 008-match-minutes
```

### 2. Abrir no navegador

```bash
# Opção A — Live Server (VS Code)
# Clique com botão direito em src/frontend/index.html → Open with Live Server

# Opção B — Python
cd src/frontend
python -m http.server 8080
# Acesse: http://localhost:8080
```

### 3. Fluxo de teste principal

1. **Login** → `index.html` → "Entrar no Sistema" → `login.html` → submeter → `students.html`
2. Verificar que o **menu inferior** agora tem **3 itens**: "Alunos", "Treino" e "Jogos"
3. Clicar em **"Jogos"** no menu → deve abrir `games.html`
4. Verificar a **mensagem de lista vazia** ("Nenhum jogo registrado ainda")
5. Clicar **"Novo Jogo"** → formulário deve aparecer com campos de data e nome
6. Preencher **data** (ex.: 2026-04-20) e **nome** (ex.: "vs. América")
7. Clicar **"Adicionar Alunos"** → painel de seleção de alunos deve aparecer
8. Usar **filtro por categoria** (ex.: Sub 09) → lista deve exibir apenas alunos da Sub 09
9. Usar **busca por nome** → lista deve filtrar em tempo real
10. **Selecionar 3 alunos** → clicar "Adicionar Selecionados"
11. Verificar que os 3 alunos aparecem no formulário com **nome, categoria e campo de minutos**
12. Preencher minutagem: **45, 90, 0** para os 3 alunos
13. Clicar **"Salvar Jogo"** → toast de sucesso deve aparecer; lista deve exibir o jogo
14. Verificar que o jogo na lista mostra **data formatada, nome e "3 alunos"**
15. **Criar mais 2 jogos** em datas diferentes → verificar que a lista fica em ordem **decrescente de data**

### 4. Testar edição

1. Clicar **"Editar"** em um jogo da lista → formulário deve aparecer preenchido com os dados do jogo
2. **Alterar o nome** do jogo
3. **Alterar a minutagem** de um aluno
4. **Remover um aluno** da lista de participantes (botão "×")
5. Clicar **"Salvar"** → verificar que alterações aparecem na lista

### 5. Testar exclusão

1. Clicar **"Excluir"** em um jogo → diálogo de confirmação deve aparecer
2. Clicar **"Cancelar"** → jogo permanece na lista
3. Clicar **"Excluir"** novamente → confirmar a exclusão → jogo deve sumir da lista

### 6. Testar menu nas demais páginas

1. Ir para `students.html` → menu deve ter 3 itens com "Alunos" ativo
2. Ir para `training.html` → menu deve ter 3 itens com "Treino" ativo
3. Ir para `student-eval.html` (clicar "Avaliar" em algum aluno) → menu deve ter 3 itens com "Alunos" ativo
4. Navegar entre as 3 seções via menu → dados de cada seção devem ser preservados

### 7. Validações a confirmar

- Tentar salvar jogo sem data → mensagem de erro "Data é obrigatória"
- Tentar salvar jogo sem nome → mensagem de erro "Nome é obrigatório"
- Salvar jogo sem alunos → permitido; lista exibe "0 alunos"
- Tentar adicionar o mesmo aluno duas vezes → aluno não é duplicado
- Campo minutos em branco ao salvar → salvo como 0

### 8. Testar em mobile

No DevTools do Chrome/Firefox (`Ctrl+Shift+M`):
- Preset "iPhone SE" (375 × 667) ou "Galaxy S5" (360 × 640)
- Verificar: menu com 3 itens cabe na largura sem overflow
- Verificar: painel de seleção de alunos utilizável em tela estreita
- Verificar: campos de minutos acessíveis sem zoom involuntário
- Verificar: lista de jogos legível; botões Editar/Excluir acessíveis

## Estrutura de arquivos criados nesta feature

```text
src/frontend/
└── pages/
    └── games.html           ← NOVO: gestão de jogos e minutagem
```

## Páginas modificadas

| Página | Modificação |
|---|---|
| `src/frontend/pages/students.html` | Menu inferior: 2 → 3 itens (adicionar "Jogos") |
| `src/frontend/pages/student-eval.html` | Menu inferior: 2 → 3 itens (adicionar "Jogos") |
| `src/frontend/pages/training.html` | Menu inferior: 2 → 3 itens (adicionar "Jogos") |
| `src/frontend/pages/games.html` | Nova página completa |
