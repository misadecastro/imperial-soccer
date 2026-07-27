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

    /// <summary>FR-008 — exclui um aluno.</summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(string id)
    {
        var resultado = await _alunos.DeleteOneAsync(a => a.Id == id);
        if (resultado.DeletedCount == 0)
            return NotFound(ApiResponse<object?>.Fail("Aluno não encontrado."));

        return Ok(ApiResponse<object?>.Ok(null, "Aluno excluído com sucesso."));
    }

    private static readonly string[] PesValidos = ["Direito", "Esquerdo", "Ambidestro"];

    /// <summary>Feature 022 — atualiza os campos da ficha do aluno (edição inline). Campos opcionais.</summary>
    [HttpPut("{id}/profile")]
    public async Task<ActionResult<ApiResponse<StudentResponse>>> UpdateProfile(string id, [FromBody] UpdateStudentProfileRequest request)
    {
        var aluno = await _alunos.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (aluno is null) return NotFound(ApiResponse<StudentResponse>.Fail("Aluno não encontrado."));

        var erros = new List<string>();
        if (request.PeDominante is not null && !PesValidos.Contains(request.PeDominante))
            erros.Add("Pé dominante inválido. Valores aceitos: Direito, Esquerdo, Ambidestro.");
        if (request.MassaCorporal is <= 0)
            erros.Add("A massa corporal deve ser maior que zero.");
        if (request.Estatura is <= 0)
            erros.Add("A estatura deve ser maior que zero.");
        if (request.Foto is { Length: > 0 } && !request.Foto.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            erros.Add("A foto deve ser uma imagem (data URI).");
        if (erros.Count > 0)
            return BadRequest(ApiResponse<StudentResponse>.Fail("Dados inválidos.", erros));

        aluno.Foto = string.IsNullOrEmpty(request.Foto) ? aluno.Foto : request.Foto;
        aluno.PeDominante = request.PeDominante ?? aluno.PeDominante;
        aluno.MassaCorporal = request.MassaCorporal ?? aluno.MassaCorporal;
        aluno.Estatura = request.Estatura ?? aluno.Estatura;
        aluno.AvaliacaoGeral = request.AvaliacaoGeral ?? aluno.AvaliacaoGeral;

        await _alunos.ReplaceOneAsync(a => a.Id == id, aluno);
        return Ok(ApiResponse<StudentResponse>.Ok(Map(aluno), "Ficha atualizada."));
    }

    private static StudentResponse Map(Aluno a) =>
        new(a.Id, a.Nome, a.DataNascimento, a.Categoria, a.Foto, a.PeDominante, a.MassaCorporal, a.Estatura, a.AvaliacaoGeral);

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
