using Imperial.Api.DTOs;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

/// <summary>
/// Registros de avaliação de alunos em tipos dinâmicos (feature 022).
/// Autenticação obrigatória (professor ou administrador).
/// </summary>
[ApiController]
[Route("api/v1/evaluations")]
[Authorize]
public sealed class EvaluationsController : ControllerBase
{
    private readonly IMongoCollection<Evaluation> _avaliacoes;
    private readonly IMongoCollection<EvaluationType> _tipos;
    private readonly IMongoCollection<Aluno> _alunos;

    public EvaluationsController(IMongoDatabase database)
    {
        _avaliacoes = database.GetCollection<Evaluation>("evaluations");
        _tipos = database.GetCollection<EvaluationType>("evaluation_types");
        _alunos = database.GetCollection<Aluno>("students");
    }

    /// <summary>Lista as avaliações de um aluno (opcionalmente por tipo), ordenadas por data.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Evaluation>>>> GetByAluno(
        [FromQuery] string alunoId, [FromQuery] string? tipoId)
    {
        if (string.IsNullOrWhiteSpace(alunoId))
            return BadRequest(ApiResponse<IReadOnlyList<Evaluation>>.Fail("alunoId é obrigatório."));

        var filtro = Builders<Evaluation>.Filter.Eq(e => e.AlunoId, alunoId);
        if (!string.IsNullOrWhiteSpace(tipoId))
            filtro &= Builders<Evaluation>.Filter.Eq(e => e.TipoId, tipoId);

        var lista = await _avaliacoes.Find(filtro).SortBy(e => e.Data).ToListAsync();
        return Ok(ApiResponse<IReadOnlyList<Evaluation>>.Ok(lista));
    }

    /// <summary>Registra uma avaliação (data + notas 1–5 por item).</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Evaluation>>> Create([FromBody] CreateEvaluationRequest request)
    {
        var erros = new List<string>();
        if (string.IsNullOrWhiteSpace(request.AlunoId)) erros.Add("alunoId é obrigatório.");
        if (string.IsNullOrWhiteSpace(request.Data)) erros.Add("A data é obrigatória.");

        var aluno = string.IsNullOrWhiteSpace(request.AlunoId)
            ? null : await _alunos.Find(a => a.Id == request.AlunoId).FirstOrDefaultAsync();
        if (aluno is null) erros.Add("Aluno não encontrado.");

        var tipo = string.IsNullOrWhiteSpace(request.TipoId)
            ? null : await _tipos.Find(t => t.Id == request.TipoId && !t.Arquivado).FirstOrDefaultAsync();
        if (tipo is null) erros.Add("Tipo de avaliação não encontrado ou arquivado.");

        var pontuacoes = request.Pontuacoes ?? [];
        if (tipo is not null)
        {
            foreach (var p in pontuacoes)
            {
                if (p.Nota < 1 || p.Nota > 5) erros.Add($"A nota do item deve ser um inteiro de 1 a 5.");
                if (tipo.Itens.All(i => i.Id != p.ItemId)) erros.Add("Pontuação referencia item inexistente no tipo.");
            }
        }

        if (erros.Count > 0)
            return BadRequest(ApiResponse<Evaluation>.Fail("Dados inválidos.", erros.Distinct().ToList()));

        var avaliacao = new Evaluation
        {
            AlunoId = request.AlunoId,
            TipoId = request.TipoId,
            Data = request.Data,
            Pontuacoes = pontuacoes.Select(p => new Pontuacao { ItemId = p.ItemId, Nota = p.Nota }).ToList(),
        };
        await _avaliacoes.InsertOneAsync(avaliacao);
        return CreatedAtAction(nameof(GetByAluno), ApiResponse<Evaluation>.Ok(avaliacao, "Avaliação registrada."));
    }
}
