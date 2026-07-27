using Imperial.Api.Models;
using Imperial.Api.Services;
using Microsoft.Extensions.Logging.Abstractions;
using MongoDB.Driver;
using Xunit;

namespace Imperial.Api.Tests.Services;

/// <summary>Valida o seed idempotente da configuração de treino (feature 020, FR-012/SC-006).</summary>
public sealed class TrainingConfigSeedServiceTests : IAsyncLifetime
{
    private const string ConnectionString = "mongodb://localhost:27017";
    private const string DatabaseName = "imperial_soccer_test_config_seed";

    private IMongoDatabase _database = null!;

    public async Task InitializeAsync()
    {
        var client = new MongoClient(ConnectionString);
        _database = client.GetDatabase(DatabaseName);
        await _database.DropCollectionAsync("training_principles");
        await _database.DropCollectionAsync("game_moments");
    }

    public async Task DisposeAsync()
    {
        await _database.DropCollectionAsync("training_principles");
        await _database.DropCollectionAsync("game_moments");
    }

    private TrainingConfigSeedService CriarServico() =>
        new(_database, NullLogger<TrainingConfigSeedService>.Instance);

    [Fact]
    public async Task SeedAsync_PopulaColecoesVazias_ComOsSlugsPadrao()
    {
        await CriarServico().SeedAsync();

        var grupos = await _database.GetCollection<PrincipioGrupo>("training_principles")
            .Find(FilterDefinition<PrincipioGrupo>.Empty).ToListAsync();
        var momentos = await _database.GetCollection<Momento>("game_moments")
            .Find(FilterDefinition<Momento>.Empty).ToListAsync();

        Assert.Equal(3, grupos.Count);
        Assert.Equal(4, momentos.Count);
        Assert.Contains(grupos, g => g.Id == "principios_defensivos");
        Assert.Contains(grupos, g => g.Id == "fundamentos_tecnicos");
        Assert.Contains(momentos, m => m.Id == "org_ofensiva");
        // ids dos itens preservados (usados em vínculos existentes).
        var defensivos = grupos.Single(g => g.Id == "principios_defensivos");
        Assert.Contains(defensivos.Itens, i => i.Id == "contencao");
    }

    [Fact]
    public async Task SeedAsync_EIdempotente_NaoDuplicaNemSobrescreve()
    {
        var servico = CriarServico();
        await servico.SeedAsync();

        // simula edição do administrador antes do segundo seed.
        var principios = _database.GetCollection<PrincipioGrupo>("training_principles");
        await principios.UpdateOneAsync(
            g => g.Id == "principios_defensivos",
            Builders<PrincipioGrupo>.Update.Set(g => g.Titulo, "Editado pelo Admin"));

        await servico.SeedAsync();
        await servico.SeedAsync();

        var grupos = await principios.Find(FilterDefinition<PrincipioGrupo>.Empty).ToListAsync();
        Assert.Equal(3, grupos.Count);
        Assert.Equal("Editado pelo Admin", grupos.Single(g => g.Id == "principios_defensivos").Titulo);
    }
}
