# Data Model: Students Listing — Evaluation Display & Registration Toggle

**Feature**: `003-students-eval-display`  
**Date**: 2026-04-04

---

## Nota

Esta feature **não altera o modelo de dados**. As estruturas `aluno` e `avaliação` já existentes em memória são suficientes. Apenas a camada de renderização é modificada.

---

## Entidades existentes relevantes

### Aluno

```js
{
  id: string,           // crypto.randomUUID()
  nome: string,         // nome completo
  dataNascimento: string, // ISO date "YYYY-MM-DD"
  categoria: string,    // 'Sub09' | 'Sub10' | ... | 'Sub14'
}
```

### Avaliação

```js
{
  id: string,           // crypto.randomUUID()
  alunoId: string,      // referência ao Aluno.id
  tecnico: number,      // 2 | 3 | 4 | 5
  tatico: number,       // 2 | 3 | 4 | 5
  mental: number,       // 2 | 3 | 4 | 5
  data: string,         // ISO datetime (new Date().toISOString())
}
```

---

## Derivações para renderização (sem persistência)

### ÚltimaAvaliação por Aluno (computed)

Já computado por `getAvaliacaoByAlunoId(alunoId)` — retorna a avaliação com `data` mais recente ou `null`.

### Indicador por Aspecto (view model)

```js
// Gerado em renderAlunos() para cada aluno
{
  aspecto: 'tecnico' | 'tatico' | 'mental',
  label: 'Téc' | 'Tát' | 'Ment',
  nota: number | null,   // null = sem avaliação
  iconSvg: string,       // SVG inline como string HTML
}
```

---

## Estado de visibilidade do formulário

Controlado por classe CSS (`hidden`/visível) na `<section>` de cadastro.  
Não é parte do `state` JS — é estado puramente de UI mantido no DOM.
