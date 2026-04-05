# Quickstart: Chamada de Treino

**Branch**: `007-attendance-tracking`

## Como testar localmente

### 1. Verificar branch

```bash
git checkout 007-attendance-tracking
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

1. **Login** → `index.html` → clicar "Entrar no Sistema" → `login.html` → submeter formulário → `students.html`
2. Verificar que o **menu de navegação** aparece na parte inferior com "Alunos" e "Treino"
3. Clicar em **"Treino"** no menu → deve abrir `training.html`
4. Selecionar a **data de hoje** no campo de data
5. Selecionar a categoria **Sub 09** nas abas
6. Verificar que a **lista de alunos** da Sub 09 aparece
7. Verificar o **painel de resumo** (Presentes: 0, Faltas: 0, Pendentes: N)
8. Marcar 2 alunos como **Presente** → confirmar que botões ficam verdes e contador atualiza
9. Marcar 1 aluno como **Falta** → confirmar que botão fica vermelho e contador atualiza
10. Clicar **"Todos Presentes"** → confirmar que todos os alunos ficam presentes
11. Clicar **"Salvar Presença"** → confirmar toast de sucesso
12. Trocar para a categoria **Sub 10** e repetir o processo
13. Voltar para **Sub 09** → confirmar que a chamada salva é carregada

### 4. Testar em mobile

No DevTools do Chrome/Firefox (`Ctrl+Shift+M`):
- Preset "iPhone SE" (375 × 667) ou "Galaxy S5" (360 × 640)
- Verificar: abas roláveis horizontalmente sem overflow
- Verificar: botão "Salvar Presença" visível acima da barra de navegação
- Verificar: cartões de aluno legíveis com botões Presente/Falta acessíveis

### 5. Testar histórico

Após registrar chamadas para pelo menos 2 datas:
- Verificar que chamadas anteriores são recuperadas ao selecionar a mesma data + categoria
- Verificar que mudar a data gera uma nova chamada vazia (ou carrega existente)

### 6. Validações a confirmar

- Tentar salvar sem selecionar data → mensagem de erro
- Tentar selecionar data futura → campo bloqueado ou mensagem
- Selecionar categoria sem alunos → mensagem amigável
- Navegar para "Alunos" e voltar para "Treino" → estado da chamada deve ser preservado

## Estrutura de arquivos criados nesta feature

```text
src/frontend/
├── pages/
│   └── training.html      ← NOVO: tela de chamada de treino
└── css/
    └── imperial.css       ← sem alteração
```

## Páginas modificadas

| Página | Modificação |
|---|---|
| `src/frontend/index.html` | Sem menu (pré-autenticação) |
| `src/frontend/pages/login.html` | Sem menu (pré-autenticação) |
| `src/frontend/pages/students.html` | Menu de navegação adicionado |
| `src/frontend/pages/student-eval.html` | Menu de navegação adicionado |
| `src/frontend/pages/training.html` | Nova página com menu |
