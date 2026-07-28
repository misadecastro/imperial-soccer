using Imperial.Api.DTOs;
using Imperial.Api.Identity;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

/// <summary>
/// Princípios/Fundamentos e seus Itens Trabalhados (feature 020).
/// Leitura: qualquer usuário autenticado. Escrita: apenas Administrador.
/// </summary>
[ApiController]
[Route("api/v1/training-principles")]
[Authorize]
public sealed class TrainingPrinciplesController : ControllerBase
{
    private static readonly string[] FiltrosValidos = ["defensivo", "ofensivo", "sempre"];

    private readonly IMongoCollection<PrincipioGrupo> _principios;
    private readonly IMongoCollection<Momento> _momentos;

    public TrainingPrinciplesController(IMongoDatabase database)
    {
        _principios = database.GetCollection<PrincipioGrupo>("training_principles");
        _momentos = database.GetCollection<Momento>("game_moments");
    }

    /// <summary>FR-009 — lista todos os princípios/fundamentos com seus itens.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PrincipioGrupo>>>> GetAll()
    {
        var lista = await _principios.Find(FilterDefinition<PrincipioGrupo>.Empty).ToListAsync();
        return Ok(ApiResponse<IReadOnlyList<PrincipioGrupo>>.Ok(lista));
    }

    /// <summary>FR-001 — cria um novo grupo (sem itens).</summary>
    [HttpPost]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<PrincipioGrupo>>> Create([FromBody] CreatePrincipioRequest request)
    {
        var titulo = request.Titulo?.Trim() ?? string.Empty;
        var grupos = await _principios.Find(FilterDefinition<PrincipioGrupo>.Empty).ToListAsync();

        var erro = ValidarTitulo(titulo, grupos, ignorarId: null);
        if (erro is not null) return BadRequest(ApiResponse<PrincipioGrupo>.Fail("Dados inválidos.", [erro]));

        var grupo = new PrincipioGrupo
        {
            Titulo = titulo,
            Filtro = NormalizarFiltro(request.Filtro),
        };
        await _principios.InsertOneAsync(grupo);
        return CreatedAtAction(nameof(GetAll),
            ApiResponse<PrincipioGrupo>.Ok(grupo, "Princípio/fundamento adicionado."));
    }

    /// <summary>FR-001 — renomeia/atualiza o grupo (título e filtro).</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<PrincipioGrupo>>> Update(string id, [FromBody] UpdatePrincipioRequest request)
    {
        var titulo = request.Titulo?.Trim() ?? string.Empty;
        var grupos = await _principios.Find(FilterDefinition<PrincipioGrupo>.Empty).ToListAsync();
        var grupo = grupos.FirstOrDefault(g => g.Id == id);
        if (grupo is null) return NotFound(ApiResponse<PrincipioGrupo>.Fail("Princípio/fundamento não encontrado."));

        var erro = ValidarTitulo(titulo, grupos, ignorarId: id);
        if (erro is not null) return BadRequest(ApiResponse<PrincipioGrupo>.Fail("Dados inválidos.", [erro]));

        grupo.Titulo = titulo;
        grupo.Filtro = NormalizarFiltro(request.Filtro);
        await _principios.ReplaceOneAsync(g => g.Id == id, grupo);
        return Ok(ApiResponse<PrincipioGrupo>.Ok(grupo, "Princípio/fundamento atualizado."));
    }

    /// <summary>FR-006 — remove o grupo e, em cascata (RI-1), os vínculos a ele em todos os momentos.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(string id)
    {
        var resultado = await _principios.DeleteOneAsync(g => g.Id == id);
        if (resultado.DeletedCount == 0) return NotFound(ApiResponse<object?>.Fail("Princípio/fundamento não encontrado."));

        // RI-1: remove vínculos órfãos daquele grupo em todos os momentos.
        await _momentos.UpdateManyAsync(
            Builders<Momento>.Filter.Empty,
            Builders<Momento>.Update.PullFilter(m => m.Vinculos, v => v.GrupoId == id));

        return Ok(ApiResponse<object?>.Ok(null, "Princípio/fundamento removido."));
    }

    /// <summary>FR-002 — adiciona um Item Trabalhado ao grupo.</summary>
    [HttpPost("{id}/items")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<PrincipioGrupo>>> AddItem(string id, [FromBody] ItemRequest request)
    {
        var grupo = await _principios.Find(g => g.Id == id).FirstOrDefaultAsync();
        if (grupo is null) return NotFound(ApiResponse<PrincipioGrupo>.Fail("Princípio/fundamento não encontrado."));

        var label = request.Label?.Trim() ?? string.Empty;
        var erro = ValidarItem(label, grupo, ignorarId: null);
        if (erro is not null) return BadRequest(ApiResponse<PrincipioGrupo>.Fail("Dados inválidos.", [erro]));

        grupo.Itens.Add(new ItemTrabalhado { Label = label });
        await _principios.ReplaceOneAsync(g => g.Id == id, grupo);
        return CreatedAtAction(nameof(GetAll), ApiResponse<PrincipioGrupo>.Ok(grupo, "Item adicionado."));
    }

    /// <summary>FR-002 — renomeia um Item Trabalhado.</summary>
    [HttpPut("{id}/items/{itemId}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<PrincipioGrupo>>> UpdateItem(string id, string itemId, [FromBody] ItemRequest request)
    {
        var grupo = await _principios.Find(g => g.Id == id).FirstOrDefaultAsync();
        if (grupo is null) return NotFound(ApiResponse<PrincipioGrupo>.Fail("Princípio/fundamento não encontrado."));

        var item = grupo.Itens.FirstOrDefault(i => i.Id == itemId);
        if (item is null) return NotFound(ApiResponse<PrincipioGrupo>.Fail("Item não encontrado."));

        var label = request.Label?.Trim() ?? string.Empty;
        var erro = ValidarItem(label, grupo, ignorarId: itemId);
        if (erro is not null) return BadRequest(ApiResponse<PrincipioGrupo>.Fail("Dados inválidos.", [erro]));

        item.Label = label;
        await _principios.ReplaceOneAsync(g => g.Id == id, grupo);
        return Ok(ApiResponse<PrincipioGrupo>.Ok(grupo, "Item atualizado."));
    }

    /// <summary>FR-007 — remove um Item e, em cascata (RI-2), seu id das seleções de vínculo.</summary>
    [HttpDelete("{id}/items/{itemId}")]
    [Authorize(Roles = Roles.Administrador)]
    public async Task<ActionResult<ApiResponse<PrincipioGrupo>>> DeleteItem(string id, string itemId)
    {
        var grupo = await _principios.Find(g => g.Id == id).FirstOrDefaultAsync();
        if (grupo is null) return NotFound(ApiResponse<PrincipioGrupo>.Fail("Princípio/fundamento não encontrado."));
        if (grupo.Itens.All(i => i.Id != itemId))
            return NotFound(ApiResponse<PrincipioGrupo>.Fail("Item não encontrado."));

        grupo.Itens.RemoveAll(i => i.Id == itemId);
        await _principios.ReplaceOneAsync(g => g.Id == id, grupo);

        // RI-2: remove o itemId dos vínculos daquele grupo em todos os momentos.
        // ($pull não atravessa caminhos com filtro posicional $[]; itera-se os poucos afetados.)
        var afetados = await _momentos
            .Find(Builders<Momento>.Filter.ElemMatch(m => m.Vinculos, v => v.GrupoId == id))
            .ToListAsync();
        foreach (var momento in afetados)
        {
            var mudou = false;
            foreach (var vinculo in momento.Vinculos.Where(v => v.GrupoId == id))
            {
                if (vinculo.ItemIds.Remove(itemId)) mudou = true;
            }
            if (mudou) await _momentos.ReplaceOneAsync(m => m.Id == momento.Id, momento);
        }

        return Ok(ApiResponse<PrincipioGrupo>.Ok(grupo, "Item removido."));
    }

    private static string NormalizarFiltro(string? filtro) =>
        filtro is not null && FiltrosValidos.Contains(filtro) ? filtro : "sempre";

    private static string? ValidarTitulo(string titulo, List<PrincipioGrupo> grupos, string? ignorarId)
    {
        if (string.IsNullOrWhiteSpace(titulo)) return "O nome do princípio/fundamento é obrigatório.";
        if (grupos.Any(g => g.Id != ignorarId && g.Titulo.Trim().Equals(titulo, StringComparison.OrdinalIgnoreCase)))
            return "Já existe um princípio/fundamento com esse nome.";
        return null;
    }

    private static string? ValidarItem(string label, PrincipioGrupo grupo, string? ignorarId)
    {
        if (string.IsNullOrWhiteSpace(label)) return "O nome do item trabalhado é obrigatório.";
        if (grupo.Itens.Any(i => i.Id != ignorarId && i.Label.Trim().Equals(label, StringComparison.OrdinalIgnoreCase)))
            return "Já existe um item com esse nome neste princípio/fundamento.";
        return null;
    }
}
