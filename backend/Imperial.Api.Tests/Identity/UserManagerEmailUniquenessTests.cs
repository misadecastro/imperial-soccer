using Imperial.Api.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Xunit;

namespace Imperial.Api.Tests.Identity;

/// <summary>
/// Valida FR-007 (e-mail único) na mesma composição de DI usada em Program.cs
/// (AddIdentityCore + MongoUserStore + RequireUniqueEmail), sem precisar de HTTP.
/// </summary>
public sealed class UserManagerEmailUniquenessTests : IAsyncLifetime
{
    private const string ConnectionString = "mongodb://localhost:27017";
    private const string DatabaseName = "imperial_soccer_test_usermanager";

    private IMongoDatabase _database = null!;
    private UserManager<ApplicationUser> _userManager = null!;

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
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.User.RequireUniqueEmail = true;
            options.Password.RequiredLength = 8;
        });

        var provider = services.BuildServiceProvider();
        _userManager = provider.GetRequiredService<UserManager<ApplicationUser>>();
    }

    public async Task DisposeAsync()
    {
        await _database.DropCollectionAsync("users");
    }

    [Fact]
    public async Task CreateAsync_DeveRejeitar_EmailDuplicado()
    {
        const string email = "duplicado@imperial.com";
        var primeiro = new ApplicationUser { UserName = email, Email = email, Nome = "Primeiro", Role = Roles.Professor };
        var segundo = new ApplicationUser { UserName = email, Email = email, Nome = "Segundo", Role = Roles.Professor };

        var resultado1 = await _userManager.CreateAsync(primeiro, "SenhaForte#123");
        var resultado2 = await _userManager.CreateAsync(segundo, "OutraSenha#456");

        Assert.True(resultado1.Succeeded);
        Assert.False(resultado2.Succeeded);
        Assert.Contains(resultado2.Errors, e => e.Code == "DuplicateEmail" || e.Code == "DuplicateUserName");
    }

    [Fact]
    public async Task CreateAsync_PermiteEmailsDiferentes()
    {
        var user1 = new ApplicationUser { UserName = "a@imperial.com", Email = "a@imperial.com", Nome = "A", Role = Roles.Professor };
        var user2 = new ApplicationUser { UserName = "b@imperial.com", Email = "b@imperial.com", Nome = "B", Role = Roles.Administrador };

        var resultado1 = await _userManager.CreateAsync(user1, "SenhaForte#123");
        var resultado2 = await _userManager.CreateAsync(user2, "OutraSenha#456");

        Assert.True(resultado1.Succeeded);
        Assert.True(resultado2.Succeeded);
    }
}
