using Imperial.Api.Controllers;
using Imperial.Api.DTOs;
using Imperial.Api.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Xunit;

namespace Imperial.Api.Tests.Controllers;

/// <summary>Valida CRUD de momentos e a sanitização de vínculos RI-5 (feature 020).</summary>
public sealed class GameMomentsControllerTests : IAsyncLifetime
{
    private const string ConnectionString = "mongodb://localhost:27017";
    private const string DatabaseName = "imperial_soccer_test_moments";

    private IMongoDatabase _database = null!;
    private IMongoCollection<Momento> _momentos = null!;
    private IMongoCollection<PrincipioGrupo> _principios = null!;

    public async Task InitializeAsync()
    {
        _database = new MongoClient(ConnectionString).GetDatabase(DatabaseName);
        await _database.DropCollectionAsync("game_moments");
        await _database.DropCollectionAsync("training_principles");
        _momentos = _database.GetCollection<Momento>("game_moments");
        _principios = _database.GetCollection<PrincipioGrupo>("training_principles");
    }

    public async Task DisposeAsync()
    {
        await _database.DropCollectionAsync("game_moments");
        await _database.DropCollectionAsync("training_principles");
    }

    private GameMomentsController Controller() => new(_database);

    private static T Value<T>(ActionResult<ApiResponse<T>> result)
    {
        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result.Result);
        var envelope = Assert.IsType<ApiResponse<T>>(objectResult.Value);
        Assert.True(envelope.Success);
        Assert.NotNull(envelope.Data);
        return envelope.Data!;
    }

    [Fact]
    public async Task Create_AdicionaMomento_SemVinculos()
    {
        var momento = Value(await Controller().Create(new CreateMomentoRequest("Bola Parada", "Escanteios e faltas", "ofensivo")));

        Assert.Equal("Bola Parada", momento.Label);
        Assert.Equal("Escanteios e faltas", momento.Desc);
        Assert.Equal("ofensivo", momento.Tipo);
        Assert.Empty(momento.Vinculos);
    }

    [Fact]
    public async Task Create_RejeitaLabelDuplicado()
    {
        await Controller().Create(new CreateMomentoRequest("Org. Ofensiva", null, null));

        var result = await Controller().Create(new CreateMomentoRequest("org. ofensiva", null, null));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SetVinculos_SanitizaGrupoEItensInexistentes_RI5()
    {
        await _principios.InsertOneAsync(new PrincipioGrupo
        {
            Id = "g1",
            Titulo = "Fundamentos",
            Filtro = "sempre",
            Itens = [new ItemTrabalhado { Id = "i1", Label = "Passe" }],
        });
        var momento = Value(await Controller().Create(new CreateMomentoRequest("Org. Ofensiva", null, null)));

        var request = new SetVinculosRequest([
            new VinculoDto("g1", ["i1", "item_inexistente"]),  // item inválido é descartado
            new VinculoDto("grupo_inexistente", ["x"]),        // grupo inválido é descartado
        ]);
        var atualizado = Value(await Controller().SetVinculos(momento.Id, request));

        var vinculo = Assert.Single(atualizado.Vinculos);
        Assert.Equal("g1", vinculo.GrupoId);
        Assert.Equal(["i1"], vinculo.ItemIds);
    }

    [Fact]
    public async Task SetVinculos_DescartaVinculoSemItensValidos()
    {
        await _principios.InsertOneAsync(new PrincipioGrupo
        {
            Id = "g1",
            Titulo = "Fundamentos",
            Filtro = "sempre",
            Itens = [new ItemTrabalhado { Id = "i1", Label = "Passe" }],
        });
        var momento = Value(await Controller().Create(new CreateMomentoRequest("Org. Ofensiva", null, null)));

        var request = new SetVinculosRequest([new VinculoDto("g1", ["nao_existe"])]);
        var atualizado = Value(await Controller().SetVinculos(momento.Id, request));

        Assert.Empty(atualizado.Vinculos);
    }
}
