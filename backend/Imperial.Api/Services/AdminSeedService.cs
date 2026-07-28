using Imperial.Api.Identity;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;

namespace Imperial.Api.Services;

/// <summary>
/// Garante, na inicialização do backend, que existe ao menos um Administrador ativo
/// (spec FR-011) — sem isso, ninguém poderia cadastrar os demais usuários (sem autocadastro).
/// </summary>
public sealed class AdminSeedService
{
    private readonly IMongoCollection<ApplicationUser> _users;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminSeedService> _logger;

    public AdminSeedService(
        IMongoDatabase database,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger<AdminSeedService> logger)
    {
        _users = database.GetCollection<ApplicationUser>("users");
        _userManager = userManager;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var existeAdminAtivo = await _users
            .Find(u => u.Role == Roles.Administrador && u.Ativo)
            .AnyAsync();

        if (existeAdminAtivo)
        {
            return;
        }

        var email = _configuration["AdminSeed:Email"];
        var senha = _configuration["AdminSeed:Senha"];
        var nome = _configuration["AdminSeed:Nome"] ?? "Administrador";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(senha))
        {
            _logger.LogWarning(
                "Nenhum Administrador ativo encontrado e 'AdminSeed:Email'/'AdminSeed:Senha' não configurados. " +
                "Configure via 'dotnet user-secrets set AdminSeed:Email ...' antes de iniciar o backend.");
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = email,
            Email = email,
            Nome = nome,
            Role = Roles.Administrador,
            Ativo = true,
            EmailConfirmed = true,
        };

        var resultado = await _userManager.CreateAsync(admin, senha);
        if (resultado.Succeeded)
        {
            _logger.LogInformation("Administrador inicial criado: {Email}", email);
        }
        else
        {
            _logger.LogError(
                "Falha ao criar o Administrador inicial: {Erros}",
                string.Join("; ", resultado.Errors.Select(e => e.Description)));
        }
    }
}
