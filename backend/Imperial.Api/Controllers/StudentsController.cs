using Imperial.Api.DTOs;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

[ApiController]
[Route("api/v1/students")]
[Authorize]
public sealed class StudentsController : ControllerBase
{
    private static readonly string[] CategoriasValidas =
        ["Sub09", "Sub10", "Sub11", "Sub12", "Sub13", "Sub14", "Sub15F", "Sub17F"];

    private readonly IMongoCollection<Aluno> _alunos;

    public StudentsController(IMongoDatabase database)
    {
        _alunos = database.GetCollection<Aluno>("students");
    }

    /// <summary>FR-003 — lista todos os alunos da escola.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StudentResponse>>>> GetAll()
    {
        var alunos = await _alunos.Find(FilterDefinition<Aluno>.Empty).ToListAsync();
        var resposta = alunos.Select(Map).ToList();
        return Ok(ApiResponse<IReadOnlyList<StudentResponse>>.Ok(resposta));
    }

    /// <summary>FR-001, FR-005, FR-006, FR-007 — cadastra um novo aluno com validação.</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<StudentResponse>>> Create([FromBody] CreateStudentRequest request)
    {
        var erros = Validar(request);
        if (erros.Count > 0)
            return BadRequest(ApiResponse<StudentResponse>.Fail("Dados inválidos.", erros));

        var aluno = new Aluno
        {
            Nome = request.Nome.Trim(),
            DataNascimento = request.DataNascimento,
            Categoria = request.Categoria,
        };

        await _alunos.InsertOneAsync(aluno);
        return CreatedAtAction(nameof(GetAll), ApiResponse<StudentResponse>.Ok(Map(aluno), "Aluno cadastrado com sucesso."));
    }

    /// <summary>FR-008 — exclui aluno pelo Id (hard delete; cascade de avaliações é responsabilidade do cliente — research.md decisão #2).</summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(string id)
    {
        var resultado = await _alunos.DeleteOneAsync(a => a.Id == id);
        if (resultado.DeletedCount == 0)
            return NotFound(ApiResponse<object?>.Fail("Aluno não encontrado."));

        return Ok(ApiResponse<object?>.Ok(null, "Aluno excluído com sucesso."));
    }

    private static StudentResponse Map(Aluno a) =>
        new(a.Id, a.Nome, a.DataNascimento, a.Categoria);

    private static List<string> Validar(CreateStudentRequest r)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(r.Nome) || r.Nome.Trim().Length < 2)
            erros.Add("O nome deve ter pelo menos 2 caracteres.");

        if (string.IsNullOrWhiteSpace(r.DataNascimento))
        {
            erros.Add("A data de nascimento é obrigatória.");
        }
        else if (!DateOnly.TryParse(r.DataNascimento, out var data) || data >= DateOnly.FromDateTime(DateTime.Today))
        {
            erros.Add("A data de nascimento deve ser válida e não pode ser uma data futura.");
        }

        if (string.IsNullOrWhiteSpace(r.Categoria) || !CategoriasValidas.Contains(r.Categoria))
            erros.Add($"Categoria inválida. Valores aceitos: {string.Join(", ", CategoriasValidas)}.");

        return erros;
    }
}
