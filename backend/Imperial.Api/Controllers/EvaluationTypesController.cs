using Imperial.Api.DTOs;
using Imperial.Api.Identity;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

/// <summary>
/// Tipos de avaliação dinâmicos (feature 022). Leitura: qualquer autenticado.
/// Escrita: apenas Administrador. Exclusão é soft delete (Arquivado = true).
/// </summary>
[ApiController]
[Route("api/v1/evaluation-types")]
[Authorize]
public sealed class EvaluationTypesController : ControllerBase
{
    private readonly IMongoCollection<EvaluationType> _tipos;

    public EvaluationTypesController(IMongoDatabase database)
    {
        _tipos = database.GetCollection<EvaluationType>("evaluation_types");
    }

    /// <summary>Lista os tipos ativos (não arquivados) com seus itens.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<EvaluationType>>>> GetAll()
    {
        var lista = await _tipos.Find(t => !t.Arquivado).ToListAsync();
        return Ok(ApiResponse<IReadOnlyList<EvaluationType>>.Ok(lista));
    }

    /// <summary>Cria um tipo com nome e itens.</summary>
    [HttpPost]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<EvaluationType>>> Create([FromBody] CreateEvaluationTypeRequest request)
    {
        var nome = request.Nome?.Trim() ?? string.Empty;
        var itens = (request.Itens ?? []).Select(i => i?.Trim() ?? string.Empty).ToList();
        var ativos = await _tipos.Find(t => !t.Arquivado).ToListAsync();

        var erros = ValidarTipo(nome, itens, ativos, ignorarId: null);
        if (erros.Count > 0) return BadRequest(ApiResponse<EvaluationType>.Fail("Dados inválidos.", erros));

        var tipo = new EvaluationType
        {
            Nome = nome,
            Itens = itens.Select(n => new EvaluationItem { Nome = n }).ToList(),
        };
        await _tipos.InsertOneAsync(tipo);
        return CreatedAtAction(nameof(GetAll), ApiResponse<EvaluationType>.Ok(tipo, "Tipo de avaliação criado."));
    }

    /// <summary>Atualiza nome e itens (reconciliação por id — itens preexistentes mantêm o id).</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<EvaluationType>>> Update(string id, [FromBody] UpdateEvaluationTypeRequest request)
    {
        var tipo = await _tipos.Find(t => t.Id == id && !t.Arquivado).FirstOrDefaultAsync();
        if (tipo is null) return NotFound(ApiResponse<EvaluationType>.Fail("Tipo de avaliação não encontrado."));

        var nome = request.Nome?.Trim() ?? string.Empty;
        var itensDto = (request.Itens ?? []).Select(i => new EvaluationItemDto(i.Id, i.Nome?.Trim() ?? string.Empty)).ToList();
        var ativos = await _tipos.Find(t => !t.Arquivado).ToListAsync();

        var erros = ValidarTipo(nome, itensDto.Select(i => i.Nome).ToList(), ativos, ignorarId: id);
        if (erros.Count > 0) return BadRequest(ApiResponse<EvaluationType>.Fail("Dados inválidos.", erros));

        tipo.Nome = nome;
        // Reconciliação: preserva id dos itens preexistentes; cria novos; remove ausentes.
        tipo.Itens = itensDto.Select(dto =>
        {
            var existente = dto.Id is not null ? tipo.Itens.FirstOrDefault(i => i.Id == dto.Id) : null;
            return existente is not null
                ? new EvaluationItem { Id = existente.Id, Nome = dto.Nome }
                : new EvaluationItem { Nome = dto.Nome };
        }).ToList();

        await _tipos.ReplaceOneAsync(t => t.Id == id, tipo);
        return Ok(ApiResponse<EvaluationType>.Ok(tipo, "Tipo de avaliação atualizado."));
    }

    /// <summary>Soft delete — marca Arquivado = true; preserva o histórico de avaliações.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(string id)
    {
        var resultado = await _tipos.UpdateOneAsync(
            t => t.Id == id && !t.Arquivado,
            Builders<EvaluationType>.Update.Set(t => t.Arquivado, true));
        if (resultado.MatchedCount == 0)
            return NotFound(ApiResponse<object?>.Fail("Tipo de avaliação não encontrado."));

        return Ok(ApiResponse<object?>.Ok(null, "Tipo de avaliação arquivado."));
    }

    private static List<string> ValidarTipo(string nome, List<string> itens, List<EvaluationType> ativos, string? ignorarId)
    {
        var erros = new List<string>();
        if (string.IsNullOrWhiteSpace(nome))
            erros.Add("O nome do tipo de avaliação é obrigatório.");
        else if (ativos.Any(t => t.Id != ignorarId && t.Nome.Trim().Equals(nome, StringComparison.OrdinalIgnoreCase)))
            erros.Add("Já existe um tipo de avaliação com esse nome.");

        var validos = itens.Where(n => !string.IsNullOrWhiteSpace(n)).ToList();
        if (validos.Count == 0)
            erros.Add("Informe ao menos um item a avaliar.");
        if (validos.Select(n => n.ToLowerInvariant()).Distinct().Count() != validos.Count)
            erros.Add("Há itens com nomes duplicados.");

        return erros;
    }
}
