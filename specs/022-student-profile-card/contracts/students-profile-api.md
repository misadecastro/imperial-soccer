# Contrato: Students Profile API (campos da ficha)

**Feature**: 022-student-profile-card | Base: `/api/v1` | Envelope: `{ success, data, message, errors }`

Estende o `StudentsController` existente com a atualização dos campos da ficha (edição inline).
Autenticação obrigatória (professor ou administrador).

## PUT `/students/{id}/profile`

Atualiza os campos da ficha do aluno. Todos opcionais (edição incremental).

**Request body**:

```json
{
  "foto": "data:image/jpeg;base64,/9j/4AAQ...",
  "peDominante": "Direito",
  "massaCorporal": 75.6,
  "estatura": 1.90,
  "avaliacaoGeral": "Goleiro com bom jogo ofensivo..."
}
```

**Validação**:
- `peDominante` ∈ {"Direito","Esquerdo","Ambidestro"} quando presente.
- `massaCorporal` > 0 e `estatura` > 0 quando presentes.
- `foto` deve ser um data URI de imagem quando presente.

**Respostas**:
- `200` → `{ success: true, data: <StudentResponse estendido>, message: "Ficha atualizada." }`
- `400` → `{ success: false, message: "Dados inválidos.", errors: [...] }`
- `404` → aluno não encontrado.

## GET `/students/{id}` (resposta estendida)

O `StudentResponse` passa a incluir `foto`, `peDominante`, `massaCorporal`, `estatura`,
`avaliacaoGeral` (além de `id`, `nome`, `dataNascimento`, `categoria`). A idade **não** é
retornada (derivada no cliente).

> `GET /students` (lista) continua existente; a ficha é carregada por aluno (`GET /students/{id}`)
> ou reaproveitando o cache de `students.service`.
