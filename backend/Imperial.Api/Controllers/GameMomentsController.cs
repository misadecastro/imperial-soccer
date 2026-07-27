using Imperial.Api.DTOs;
using Imperial.Api.Identity;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

/// <summary>
/// Momentos do Jogo e seus vínculos com Princípios/Fundamentos (feature 020).
/// Leitura: qualquer usuário autenticado. Escrita: apenas Administrador.
/// </summary>
[ApiController]
[Route("api/v1/game-moments")]
[Authorize]
public sealed class GameMomentsController : ControllerBase
{
    private static readonly string[] TiposValidos = ["ofensivo", "defensivo"];

    private readonly IMongoCollection<Momento> _momentos;
    private readonly IMongoCollection<PrincipioGrupo> _principios;

    public GameMomentsController(IMongoDatabase database)
    {
        _momentos = database.GetCollection<Momento>("game_moments");
        _principios = database.GetCollection<PrincipioGrupo>("training_principles");
    }

    /// <summary>FR-010 — lista todos os momentos com seus vínculos.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<Momento>>>> GetAll()
    {
        var lista = await _momentos.Find(FilterDefinition<Momento>.Empty).ToListAsync();
        return Ok(ApiResponse<IReadOnlyList<Momento>>.Ok(lista));
    }

    /// <summary>FR-003 — cria um novo momento (sem vínculos).</summary>
    [HttpPost]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<Momento>>> Create([FromBody] CreateMomentoRequest request)
    {
        var label = request.Label?.Trim() ?? string.Empty;
        var momentos = await _momentos.Find(FilterDefinition<Momento>.Empty).ToListAsync();

        var erro = ValidarLabel(label, momentos, ignorarId: null);
        if (erro is not null) return BadRequest(ApiResponse<Momento>.Fail("Dados inválidos.", [erro]));

        var momento = new Momento
        {
            Label = label,
            Desc = request.Desc?.Trim() ?? string.Empty,
            Tipo = NormalizarTipo(request.Tipo),
        };
        await _momentos.InsertOneAsync(momento);
        return CreatedAtAction(nameof(GetAll), ApiResponse<Momento>.Ok(momento, "Momento adicionado."));
    }

    /// <summary>FR-003 — atualiza label e descrição do momento.</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<Momento>>> Update(string id, [FromBody] UpdateMomentoRequest request)
    {
        var label = request.Label?.Trim() ?? string.Empty;
        var momentos = await _momentos.Find(FilterDefinition<Momento>.Empty).ToListAsync();
        var momento = momentos.FirstOrDefault(m => m.Id == id);
        if (momento is null) return NotFound(ApiResponse<Momento>.Fail("Momento não encontrado."));

        var erro = ValidarLabel(label, momentos, ignorarId: id);
        if (erro is not null) return BadRequest(ApiResponse<Momento>.Fail("Dados inválidos.", [erro]));

        momento.Label = label;
        momento.Desc = request.Desc?.Trim() ?? string.Empty;
        await _momentos.ReplaceOneAsync(m => m.Id == id, momento);
        return Ok(ApiResponse<Momento>.Ok(momento, "Momento atualizado."));
    }

    /// <summary>FR-008 — remove o momento (e seus vínculos embutidos).</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(string id)
    {
        var resultado = await _momentos.DeleteOneAsync(m => m.Id == id);
        if (resultado.DeletedCount == 0) return NotFound(ApiResponse<object?>.Fail("Momento não encontrado."));
        return Ok(ApiResponse<object?>.Ok(null, "Momento removido."));
    }

    /// <summary>
    /// FR-004/FR-005 — substitui em bloco os vínculos do momento, sanitizando (RI-5) grupos e
    /// itens inexistentes contra o estado atual de <c>training_principles</c>.
    /// </summary>
    [HttpPut("{id}/vinculos")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<Momento>>> SetVinculos(string id, [FromBody] SetVinculosRequest request)
    {
        var momento = await _momentos.Find(m => m.Id == id).FirstOrDefaultAsync();
        if (momento is null) return NotFound(ApiResponse<Momento>.Fail("Momento não encontrado."));

        var grupos = await _principios.Find(FilterDefinition<PrincipioGrupo>.Empty).ToListAsync();
        var grupoPorId = grupos.ToDictionary(g => g.Id);

        // RI-5: descarta grupoId inexistente e itemIds que não pertencem ao grupo; ignora vínculos vazios.
        var sanitizados = (request.Vinculos ?? [])
            .Where(v => v.GrupoId is not null && grupoPorId.ContainsKey(v.GrupoId))
            .Select(v =>
            {
                var validos = new HashSet<string>(grupoPorId[v.GrupoId].Itens.Select(i => i.Id));
                return new VinculoMomentoPrincipio
                {
                    GrupoId = v.GrupoId,
                    ItemIds = (v.ItemIds ?? []).Where(validos.Contains).Distinct().ToList(),
                };
            })
            .Where(v => v.ItemIds.Count > 0)
            .ToList();

        momento.Vinculos = sanitizados;
        await _momentos.ReplaceOneAsync(m => m.Id == id, momento);
        return Ok(ApiResponse<Momento>.Ok(momento, "Vínculos atualizados."));
    }

    private static string NormalizarTipo(string? tipo) =>
        tipo is not null && TiposValidos.Contains(tipo) ? tipo : "ofensivo";

    private static string? ValidarLabel(string label, List<Momento> momentos, string? ignorarId)
    {
        if (string.IsNullOrWhiteSpace(label)) return "O nome do momento é obrigatório.";
        if (momentos.Any(m => m.Id != ignorarId && m.Label.Trim().Equals(label, StringComparison.OrdinalIgnoreCase)))
            return "Já existe um momento com esse nome.";
        return null;
    }
}
