# Data Model: Melhorias de UI, Dados Mocados e Fluxo de Acesso

**Feature**: 005-ui-improvements-mock-data  
**Date**: 2026-04-04

---

## Entidades (sem alterações de estrutura)

As entidades `Aluno` e `Avaliacao` permanecem inalteradas da feature 004. Esta feature adiciona apenas dados mocados que seguem a mesma estrutura.

```
Aluno {
  id:              string (UUID)
  nome:            string
  dataNascimento:  string (YYYY-MM-DD)
  categoria:       string  -- Sub09 | Sub10 | Sub11 | Sub12 | Sub13 | Sub14
}

Avaliacao {
  id:       string (UUID)
  alunoId:  string (UUID)
  data:     string (YYYY-MM-DD)
  tecnico:  number (2–5)
  tatico:   number (2–5)
  mental:   number (2–5)
}
```

---

## Novo Estado de UI (student-eval.html)

```
UIState {
  paginaAtual:       number  -- índice base-0 da página atual da lista; reset a 0 em toda mutação
  formVísivel:       boolean -- false por padrão; true após clicar "Nova Avaliação"
}
```

Estas variáveis são de estado local da página, **não** persistidas em `sessionStorage`.

---

## Dados Mocados — Parâmetros de Geração

```
MockConfig {
  totalAlunos:       number  = 40
  minAvaliacoes:     number  = 5
  maxAvaliacoes:     number  = 15
  dataInicio:        string  = "2025-01-01"
  dataFim:           string  = "2026-04-04"  -- data atual
  categorias:        string[] = ["Sub09","Sub10","Sub11","Sub12","Sub13","Sub14"]
  escalaMin:         number  = 2
  escalaMax:         number  = 5
}
```

---

## Paginação

```
PaginacaoConfig {
  tamanhoPagina:     number  = 10          -- fixo, não configurável
  ordenacao:         string  = "desc"      -- por data, mais recente primeiro
}
```

**Fórmula**:
- Total de páginas: `Math.ceil(avaliacoes.length / 10)`
- Slice da página atual: `avaliacoes.slice(paginaAtual * 10, (paginaAtual + 1) * 10)`
- Primeira página: índice 0
- Última página: índice `totalPaginas - 1`
