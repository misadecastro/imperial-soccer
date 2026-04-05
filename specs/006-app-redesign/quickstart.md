# Quickstart: Redesign da Aplicação

**Branch**: `006-app-redesign`

## Como visualizar o redesign localmente

Nenhum passo de build é necessário. O projeto usa Tailwind via CDN.

### 1. Verificar branch

```bash
git checkout 006-app-redesign
```

### 2. Abrir no navegador

Abra qualquer arquivo HTML diretamente no navegador (duplo clique) ou use uma extensão de servidor estático:

```bash
# Opção A — extensão VS Code "Live Server" (recomendado)
# Clique com botão direito em src/frontend/index.html → Open with Live Server

# Opção B — Python http.server
cd src/frontend
python -m http.server 8080
# Acesse: http://localhost:8080
```

### 3. Páginas a validar

| Página | Arquivo | O que verificar |
|---|---|---|
| Home/Landing | `src/frontend/index.html` | Fundo claro, cabeçalho verde, CTA verde |
| Login | `src/frontend/pages/login.html` | Card centralizado, botão verde |
| Alunos / Chamada | `src/frontend/pages/students.html` | Abas de turma, cartões de aluno, avatars coloridos, contadores |
| Avaliação | `src/frontend/pages/student-eval.html` | Gráfico Chart.js adaptado ao tema claro |

### 4. Testar responsividade

No DevTools do Chrome/Firefox:
- `Ctrl+Shift+M` (Chrome) → selecionar preset "iPhone SE" (375 × 667)
- Verificar que nenhum elemento ultrapassa a largura da tela
- Testar também com 320 px de largura mínima

### 5. CSS customizado

O arquivo `src/frontend/css/imperial.css` deve ser incluído em todos os HTMLs:

```html
<link rel="stylesheet" href="../css/imperial.css" />
<!-- ou, para index.html na raiz: -->
<link rel="stylesheet" href="css/imperial.css" />
```

## Paleta de referência rápida

```
Verde header/aba ativa:  #2a7a3d
Verde botão Presente:    #16a34a
Vermelho botão Falta:    #dc2626
Fundo da página:         #f0f4f1
Fundo do cartão:         #ffffff
Texto principal:         #111827
```

## Não fazer

- Não alterar lógica JavaScript existente
- Não modificar a estrutura de `sessionStorage`
- Não remover o Chart.js CDN de `student-eval.html`
