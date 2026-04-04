# Data Model: Student Registration and Evaluation

**Feature**: 002-student-register-eval  
**Date**: 2026-04-04

---

## Entities

### Aluno (Student)

Representa o estudante cadastrado pelo professor.

| Campo           | Tipo     | Obrigatório | Validação                                     |
|-----------------|----------|-------------|-----------------------------------------------|
| `id`            | string   | Sim (auto)  | UUID gerado no momento do cadastro            |
| `nome`          | string   | Sim         | Não vazio; min 2 caracteres                   |
| `dataNascimento` | date    | Sim         | Data válida; não pode ser data futura         |
| `categoria`     | enum     | Sim         | Um dos valores: Sub09, Sub10, Sub11, Sub12, Sub13, Sub14 |

**Soft delete**: campo `deletadoEm` (date/null) reservado para implementação futura; mock não implementa.

**State**: O aluno pode ou não ter uma avaliação registrada. Indicado pelo campo derivado `temAvaliacao`.

---

### Avaliação (Evaluation)

Registro de desempenho de um aluno em três dimensões.

| Campo      | Tipo   | Obrigatório | Validação                      |
|------------|--------|-------------|--------------------------------|
| `id`       | string | Sim (auto)  | UUID gerado no momento do lançamento |
| `alunoId`  | string | Sim         | Referência ao `id` do Aluno    |
| `tecnico`  | Nota   | Sim         | Um dos valores da escala Nota  |
| `tatico`   | Nota   | Sim         | Um dos valores da escala Nota  |
| `mental`   | Nota   | Sim         | Um dos valores da escala Nota  |
| `data`     | date   | Sim (auto)  | Data do lançamento             |

---

### Nota (Grade — value object)

Escala de avaliação aplicada a cada aspecto.

| Label             | Valor | Constante           |
|-------------------|-------|---------------------|
| Excelente         | 5     | `NOTA_EXCELENTE`    |
| Bom               | 4     | `NOTA_BOM`          |
| Regular           | 3     | `NOTA_REGULAR`      |
| Precisa Melhorar  | 2     | `NOTA_PRECISA_MELHORAR` |

---

### Categoria (Category — enum)

Faixa etária do aluno.

| Label  | Valor  |
|--------|--------|
| Sub 09 | Sub09  |
| Sub 10 | Sub10  |
| Sub 11 | Sub11  |
| Sub 12 | Sub12  |
| Sub 13 | Sub13  |
| Sub 14 | Sub14  |

---

## Relationships

```
Aluno (1) ──── (0..N) Avaliação
```

- Um aluno pode ter zero ou mais avaliações ao longo do tempo.
- Para o mock, apenas a avaliação mais recente é considerada para o indicador visual na listagem.
- O `alunoId` em Avaliação é uma referência lógica (ObjectId no MongoDB real; string UUID no mock).

---

## In-Memory Structure (Mock)

```javascript
// Estado global da aplicação mock
const state = {
  alunos: [
    // { id, nome, dataNascimento, categoria }
  ],
  avaliacoes: [
    // { id, alunoId, tecnico, tatico, mental, data }
  ]
};
```

---

## MongoDB Collections (Future)

| Coleção       | Documento principal | Embed ou Ref    |
|---------------|---------------------|-----------------|
| `students`    | Aluno               | —               |
| `evaluations` | Avaliação           | Ref → students  |

**Decisão de embedding vs. referência**: Avaliações são referenciadas (não embutidas) porque têm ciclo de vida independente e podem ser consultadas separadamente por período ou aspecto.
