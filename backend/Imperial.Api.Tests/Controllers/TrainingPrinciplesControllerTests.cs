using Imperial.Api.Controllers;
using Imperial.Api.DTOs;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Xunit;

namespace Imperial.Api.Tests.Controllers;

/// <summary>Valida CRUD de princípios/itens e cascatas RI-1/RI-2 (feature 020).</summary>
public sealed class TrainingPrinciplesControllerTests : IAsyncLifetime
{
    private const string ConnectionString = "mongodb://localhost:27017";
    private const string DatabaseName = "imperial_soccer_test_principles";

    private IMongoDatabase _database = null!;
    private IMongoCollection<PrincipioGrupo> _principios = null!;
    private IMongoCollection<Momento> _momentos = null!;

    public async Task InitializeAsync()
    {
        _database = new MongoClient(ConnectionString).GetDatabase(DatabaseName);
        await _database.DropCollectionAsync("training_principles");
        await _database.DropCollectionAsync("game_moments");
        _principios = _database.GetCollection<PrincipioGrupo>("training_principles");
        _momentos = _database.GetCollection<Momento>("game_moments");
    }

    public async Task DisposeAsync()
    {
        await _database.DropCollectionAsync("training_principles");
        await _database.DropCollectionAsync("game_moments");
    }

    private TrainingPrinciplesController Controller() => new(_database);

    private static T Value<T>(ActionResult<ApiResponse<T>> result)
    {
        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result.Result);
        var envelope = Assert.IsType<ApiResponse<T>>(objectResult.Value);
        Assert.True(envelope.Success);
        Assert.NotNull(envelope.Data);
        return envelope.Data!;
    }

    [Fact]
    public async Task Create_AdicionaGrupo_ComItensVazios()
    {
        var grupo = Value(await Controller().Create(new CreatePrincipioRequest("Transições", "ofensivo")));

        Assert.Equal("Transições", grupo.Titulo);
        Assert.Equal("ofensivo", grupo.Filtro);
        Assert.Empty(grupo.Itens);
        Assert.Equal(1, await _principios.CountDocumentsAsync(FilterDefinition<PrincipioGrupo>.Empty));
    }

    [Fact]
    public async Task Create_RejeitaTituloDuplicado_CaseInsensitive()
    {
        await Controller().Create(new CreatePrincipioRequest("Fundamentos", null));

        var result = await Controller().Create(new CreatePrincipioRequest("fundamentos", null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal(1, await _principios.CountDocumentsAsync(FilterDefinition<PrincipioGrupo>.Empty));
    }

    [Fact]
    public async Task Create_RejeitaTituloVazio()
    {
        var result = await Controller().Create(new CreatePrincipioRequest("   ", null));
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddItem_AnexaItemAoGrupo()
    {
        var grupo = Value(await Controller().Create(new CreatePrincipioRequest("Fundamentos", null)));

        var atualizado = Value(await Controller().AddItem(grupo.Id, new ItemRequest("Passe")));

        Assert.Single(atualizado.Itens);
        Assert.Equal("Passe", atualizado.Itens[0].Label);
    }

    [Fact]
    public async Task Delete_RemoveGrupo_ECascateiaVinculosNosMomentos()
    {
        var grupo = Value(await Controller().Create(new CreatePrincipioRequest("Fundamentos", null)));
        await _momentos.InsertOneAsync(new Momento
        {
            Id = "m1",
            Label = "Org. Ofensiva",
            Vinculos = [new VinculoMomentoPrincipio { GrupoId = grupo.Id, ItemIds = [] }],
        });

        var result = await Controller().Delete(grupo.Id);

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(0, await _principios.CountDocumentsAsync(FilterDefinition<PrincipioGrupo>.Empty));
        var momento = await _momentos.Find(m => m.Id == "m1").FirstAsync();
        Assert.Empty(momento.Vinculos); // RI-1
    }

    [Fact]
    public async Task DeleteItem_RemoveItem_ECascateiaItemIdNosVinculos()
    {
        var grupo = Value(await Controller().Create(new CreatePrincipioRequest("Fundamentos", null)));
        var comItem = Value(await Controller().AddItem(grupo.Id, new ItemRequest("Passe")));
        var itemId = comItem.Itens[0].Id;
        await _momentos.InsertOneAsync(new Momento
        {
            Id = "m1",
            Label = "Org. Ofensiva",
            Vinculos = [new VinculoMomentoPrincipio { GrupoId = grupo.Id, ItemIds = [itemId] }],
        });

        await Controller().DeleteItem(grupo.Id, itemId);

        var grupoFinal = await _principios.Find(g => g.Id == grupo.Id).FirstAsync();
        Assert.Empty(grupoFinal.Itens);
        var momento = await _momentos.Find(m => m.Id == "m1").FirstAsync();
        Assert.Empty(momento.Vinculos[0].ItemIds); // RI-2
    }
}
