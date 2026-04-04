# Data Model: Avaliação Acumulativa do Aluno com Histórico e Gráfico

**Feature**: 004-cumulative-student-eval  
**Date**: 2026-04-04

---

## Entidades

### Aluno (existente — sem alterações)

```
Aluno {
  id:              string (UUID)          -- gerado via crypto.randomUUID()
  nome:            string                 -- nome completo
  dataNascimento:  string (YYYY-MM-DD)    -- ISO date string
  categoria:       string                 -- enum: Sub09..Sub14
}
```

### Avaliação (existente — campo `data` já existe; estrutura mantida)

```
Avaliacao {
  id:       string (UUID)          -- gerado via crypto.randomUUID()
  alunoId:  string (UUID)          -- referência ao Aluno
  data:     string (ISO 8601)      -- data de realização (editável pelo professor)
  tecnico:  number (2–5)           -- pontuação Técnico
  tatico:   number (2–5)           -- pontuação Tático
  mental:   number (2–5)           -- pontuação Mental
}
```

**Mudanças em relação ao modelo atual**:
- O campo `data` já existe no modelo atual, mas é gerado automaticamente como `new Date().toISOString()` (data/hora atual). Nesta feature, `data` passa a ser informada pelo professor via `<input type="date">` e armazenada no formato `YYYY-MM-DD`.
- Múltiplas avaliações por aluno são suportadas (já era o caso estruturalmente, mas a UI só mostrava a mais recente).

---

## Estado Compartilhado (sessionStorage)

```
AppState {
  alunos:     Aluno[]
  avaliacoes: Avaliacao[]
}
```

**Chave sessionStorage**: `"imperialState"`

**Contratos de serialização**:
- Gravado em `students.html` antes de navegar: `sessionStorage.setItem('imperialState', JSON.stringify(state))`
- Lido em `student-eval.html` ao carregar: `JSON.parse(sessionStorage.getItem('imperialState'))`
- Gravado em `student-eval.html` ao voltar/após mutação: `sessionStorage.setItem('imperialState', JSON.stringify(state))`
- Lido em `students.html` ao retornar: na inicialização, tenta ler do `sessionStorage` antes de usar array vazio

---

## Validações

### Nova Avaliação / Edição
- `data`: obrigatório; não pode ser data futura (relativo a hoje).
- `tecnico`, `tatico`, `mental`: obrigatório; um dos valores {2, 3, 4, 5}.

---

## Ordenação

- Lista de avaliações na `student-eval.html`: ordenada por `data` ASC (mais antiga primeiro → mais recente no final).
- Eixo X do gráfico: segue a mesma ordem ASC.

---

## Gráfico

```
ChartConfig {
  type:     'line'
  labels:   string[]           -- datas formatadas (DD/MM/YYYY), ordenadas ASC
  datasets: [
    { label: 'Tático',  data: number[], borderColor: '#facc15' },  -- amarelo
    { label: 'Técnico', data: number[], borderColor: '#4ade80' },  -- verde (imperial-green-light)
    { label: 'Mental',  data: number[], borderColor: '#60a5fa' },  -- azul
  ]
  scales: {
    y: { min: 2, max: 5, ticks: { stepSize: 1 } }
  }
}
```
