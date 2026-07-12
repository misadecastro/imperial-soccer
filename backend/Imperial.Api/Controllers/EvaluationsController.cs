using Imperial.Api.DTOs;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

[ApiController]
[Route("api/v1/evaluations")]
[Authorize]
public sealed class EvaluationsController : ControllerBase
{
    private static readonly int[] NotasValidas = [2, 3, 4, 5];

    private readonly IMongoCollection<Avaliacao> _avaliacoes;

    public EvaluationsController(IMongoDatabase database)
    {
        _avaliacoes = database.GetCollection<Avaliacao>("evaluations");
    }

    /// <summary>FR-003 — lista avaliações de um aluno específico (lazy por alunoId).</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<EvaluationResponse>>>> GetByAluno([FromQuery] string? alunoId)
    {
        if (string.IsNullOrWhiteSpace(alunoId))
            return BadRequest(ApiResponse<IReadOnlyList<EvaluationResponse>>.Fail("O parâmetro alunoId é obrigatório."));

        var lista = await _avaliacoes.Find(a => a.AlunoId == alunoId).ToListAsync();
        return Ok(ApiResponse<IReadOnlyList<EvaluationResponse>>.Ok(lista.Select(Map).ToList()));
    }

    /// <summary>FR-001, FR-004, FR-005, FR-006 — registra nova avaliação com validação.</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<EvaluationResponse>>> Create([FromBody] CreateEvaluationRequest request)
    {
        var erros = Validar(request.Data, request.Tatico, request.Tecnico, request.Mental);
        if (string.IsNullOrWhiteSpace(request.AlunoId)) erros.Add("O alunoId é obrigatório.");
        if (erros.Count > 0) return BadRequest(ApiResponse<EvaluationResponse>.Fail("Dados inválidos.", erros));

        var avaliacao = new Avaliacao
        {
            AlunoId = request.AlunoId,
            Data = request.Data,
            Tatico = request.Tatico,
            Tecnico = request.Tecnico,
            Mental = request.Mental,
        };
        await _avaliacoes.InsertOneAsync(avaliacao);
        return CreatedAtAction(nameof(GetByAluno),
            ApiResponse<EvaluationResponse>.Ok(Map(avaliacao), "Avaliação registrada com sucesso."));
    }

    /// <summary>FR-007 — edita avaliação existente.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EvaluationResponse>>> Update(string id, [FromBody] UpdateEvaluationRequest request)
    {
        var erros = Validar(request.Data, request.Tatico, request.Tecnico, request.Mental);
        if (erros.Count > 0) return BadRequest(ApiResponse<EvaluationResponse>.Fail("Dados inválidos.", erros));

        var avaliacao = await _avaliacoes.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (avaliacao is null) return NotFound(ApiResponse<EvaluationResponse>.Fail("Avaliação não encontrada."));

        avaliacao.Data = request.Data;
        avaliacao.Tatico = request.Tatico;
        avaliacao.Tecnico = request.Tecnico;
        avaliacao.Mental = request.Mental;
        await _avaliacoes.ReplaceOneAsync(a => a.Id == id, avaliacao);
        return Ok(ApiResponse<EvaluationResponse>.Ok(Map(avaliacao), "Avaliação atualizada com sucesso."));
    }

    /// <summary>FR-008 — exclui avaliação.</summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(string id)
    {
        var resultado = await _avaliacoes.DeleteOneAsync(a => a.Id == id);
        if (resultado.DeletedCount == 0) return NotFound(ApiResponse<object?>.Fail("Avaliação não encontrada."));
        return Ok(ApiResponse<object?>.Ok(null, "Avaliação excluída com sucesso."));
    }

    private static EvaluationResponse Map(Avaliacao a) =>
        new(a.Id, a.AlunoId, a.Data, a.Tatico, a.Tecnico, a.Mental);

    private static List<string> Validar(string data, int tatico, int tecnico, int mental)
    {
        var erros = new List<string>();
        if (string.IsNullOrWhiteSpace(data))
        {
            erros.Add("A data é obrigatória.");
        }
        else if (!DateOnly.TryParse(data, out var d) || d >= DateOnly.FromDateTime(DateTime.Today))
        {
            erros.Add("A data deve ser válida e não pode ser uma data futura.");
        }
        if (!NotasValidas.Contains(tatico)) erros.Add("A nota de Tático deve ser 2, 3, 4 ou 5.");
        if (!NotasValidas.Contains(tecnico)) erros.Add("A nota de Técnico deve ser 2, 3, 4 ou 5.");
        if (!NotasValidas.Contains(mental)) erros.Add("A nota de Mental deve ser 2, 3, 4 ou 5.");
        return erros;
    }
}
