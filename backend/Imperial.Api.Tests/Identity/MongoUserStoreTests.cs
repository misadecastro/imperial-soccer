using Imperial.Api.Identity;
using MongoDB.Driver;
using Xunit;

namespace Imperial.Api.Tests.Identity;

/// <summary>
/// Testes de integração contra uma instância MongoDB real (banco dedicado de teste,
/// limpo a cada execução) — consistente com o padrão de acesso direto via MongoDB.Driver
/// usado em todo o projeto (sem mocks de driver, sem ORM).
/// </summary>
public sealed class MongoUserStoreTests : IAsyncLifetime
{
    private const string ConnectionString = "mongodb://localhost:27017";
    private const string DatabaseName = "imperial_soccer_test";

    private MongoUserStore _store = null!;
    private IMongoDatabase _database = null!;

    public async Task InitializeAsync()
    {
        var client = new MongoClient(ConnectionString);
        _database = client.GetDatabase(DatabaseName);
        await _database.DropCollectionAsync("users");
        _store = new MongoUserStore(_database);
    }

    public async Task DisposeAsync()
    {
        await _database.DropCollectionAsync("users");
    }

    private static ApplicationUser CriarUsuario(string email, string role = Roles.Professor) => new()
    {
        UserName = email,
        NormalizedUserName = email.ToUpperInvariant(),
        Email = email,
        NormalizedEmail = email.ToUpperInvariant(),
        Nome = "Usuário de Teste",
        Role = role,
    };

    [Fact]
    public async Task CreateAsync_DevePersistirUsuario_RecuperavelPorId()
    {
        var usuario = CriarUsuario("treinador@imperial.com");

        var resultado = await _store.CreateAsync(usuario, CancellationToken.None);

        Assert.True(resultado.Succeeded);
        var encontrado = await _store.FindByIdAsync(usuario.Id, CancellationToken.None);
        Assert.NotNull(encontrado);
        Assert.Equal(usuario.Email, encontrado!.Email);
    }

    [Fact]
    public async Task FindByEmailAsync_DeveEncontrarPorEmailNormalizado()
    {
        var usuario = CriarUsuario("maria@imperial.com");
        await _store.CreateAsync(usuario, CancellationToken.None);

        var encontrado = await _store.FindByEmailAsync("MARIA@IMPERIAL.COM", CancellationToken.None);

        Assert.NotNull(encontrado);
        Assert.Equal(usuario.Id, encontrado!.Id);
    }

    [Fact]
    public async Task FindByEmailAsync_DeveRetornarNulo_QuandoNaoExiste()
    {
        var encontrado = await _store.FindByEmailAsync("naoexiste@imperial.com", CancellationToken.None);

        Assert.Null(encontrado);
    }

    [Fact]
    public async Task SetPasswordHash_E_GetPasswordHash_DevemPersistirAposUpdate()
    {
        var usuario = CriarUsuario("senha@imperial.com");
        await _store.CreateAsync(usuario, CancellationToken.None);

        await _store.SetPasswordHashAsync(usuario, "hash-fake-nao-texto-plano", CancellationToken.None);
        await _store.UpdateAsync(usuario, CancellationToken.None);

        var recarregado = await _store.FindByIdAsync(usuario.Id, CancellationToken.None);
        var hash = await _store.GetPasswordHashAsync(recarregado!, CancellationToken.None);

        Assert.Equal("hash-fake-nao-texto-plano", hash);
        Assert.NotEqual("senha-em-texto-plano", hash);
    }

    [Fact]
    public async Task IncrementAccessFailedCountAsync_DeveIncrementarAPartirDeZero()
    {
        var usuario = CriarUsuario("lockout@imperial.com");
        await _store.CreateAsync(usuario, CancellationToken.None);

        var count1 = await _store.IncrementAccessFailedCountAsync(usuario, CancellationToken.None);
        var count2 = await _store.IncrementAccessFailedCountAsync(usuario, CancellationToken.None);

        Assert.Equal(1, count1);
        Assert.Equal(2, count2);
    }

    [Fact]
    public async Task ResetAccessFailedCountAsync_DeveZerarContador()
    {
        var usuario = CriarUsuario("reset@imperial.com");
        await _store.IncrementAccessFailedCountAsync(usuario, CancellationToken.None);
        await _store.IncrementAccessFailedCountAsync(usuario, CancellationToken.None);

        await _store.ResetAccessFailedCountAsync(usuario, CancellationToken.None);

        var count = await _store.GetAccessFailedCountAsync(usuario, CancellationToken.None);
        Assert.Equal(0, count);
    }
}
