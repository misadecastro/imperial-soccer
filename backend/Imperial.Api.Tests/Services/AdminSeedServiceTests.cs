using Imperial.Api.Identity;
using Imperial.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using MongoDB.Driver;
using Xunit;

namespace Imperial.Api.Tests.Services;

/// <summary>Valida FR-011 (sempre existe ao menos 1 Admin ativo) e a idempotência do seed.</summary>
public sealed class AdminSeedServiceTests : IAsyncLifetime
{
    private const string ConnectionString = "mongodb://localhost:27017";
    private const string DatabaseName = "imperial_soccer_test_seed";

    private IMongoDatabase _database = null!;
    private UserManager<ApplicationUser> _userManager = null!;
    private IConfiguration _configuration = null!;

    public async Task InitializeAsync()
    {
        var client = new MongoClient(ConnectionString);
        _database = client.GetDatabase(DatabaseName);
        await _database.DropCollectionAsync("users");

        var services = new ServiceCollection();
        services.AddSingleton(_database);
        services.AddSingleton<MongoUserStore>();
        services.AddSingleton<IUserStore<ApplicationUser>>(sp => sp.GetRequiredService<MongoUserStore>());
        services.AddLogging();
        services.AddIdentityCore<ApplicationUser>(options => options.User.RequireUniqueEmail = true);

        var provider = services.BuildServiceProvider();
        _userManager = provider.GetRequiredService<UserManager<ApplicationUser>>();

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AdminSeed:Email"] = "admin-teste@imperial.com",
                ["AdminSeed:Senha"] = "SenhaForte#2026",
                ["AdminSeed:Nome"] = "Admin de Teste",
            })
            .Build();
    }

    public async Task DisposeAsync()
    {
        await _database.DropCollectionAsync("users");
    }

    private AdminSeedService CriarServico() =>
        new(_database, _userManager, _configuration, NullLogger<AdminSeedService>.Instance);

    [Fact]
    public async Task SeedAsync_DeveCriarUmAdmin_QuandoNaoExisteNenhum()
    {
        var servico = CriarServico();

        await servico.SeedAsync();

        var users = _database.GetCollection<ApplicationUser>("users");
        var total = await users.CountDocumentsAsync(FilterDefinition<ApplicationUser>.Empty);
        Assert.Equal(1, total);

        var admin = await users.Find(u => u.Email == "admin-teste@imperial.com").FirstOrDefaultAsync();
        Assert.NotNull(admin);
        Assert.Equal(Roles.Administrador, admin!.Role);
        Assert.True(admin.Ativo);
    }

    [Fact]
    public async Task SeedAsync_NaoDeveDuplicar_QuandoExecutadoNovamente()
    {
        var servico = CriarServico();

        await servico.SeedAsync();
        await servico.SeedAsync();
        await servico.SeedAsync();

        var users = _database.GetCollection<ApplicationUser>("users");
        var total = await users.CountDocumentsAsync(FilterDefinition<ApplicationUser>.Empty);
        Assert.Equal(1, total);
    }

    [Fact]
    public async Task SeedAsync_NaoCriaNovoAdmin_QuandoJaExisteUmAdminAtivo()
    {
        var existente = new ApplicationUser
        {
            UserName = "outro-admin@imperial.com",
            Email = "outro-admin@imperial.com",
            Nome = "Outro Admin",
            Role = Roles.Administrador,
            Ativo = true,
        };
        await _userManager.CreateAsync(existente, "SenhaForte#2026");

        var servico = CriarServico();
        await servico.SeedAsync();

        var users = _database.GetCollection<ApplicationUser>("users");
        var total = await users.CountDocumentsAsync(FilterDefinition<ApplicationUser>.Empty);
        Assert.Equal(1, total);
    }
}
