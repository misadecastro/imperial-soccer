using Imperial.Api.Models;
using MongoDB.Driver;

namespace Imperial.Api.Services;

/// <summary>
/// Semeia idempotentemente a configuração de treino padrão (feature 020) — os mesmos dados
/// que antes ficavam fixos no frontend (feature 019). Insere apenas quando a coleção
/// correspondente está vazia; não sobrescreve edições feitas pelo administrador (FR-012/SC-006).
/// </summary>
public sealed class TrainingConfigSeedService
{
    private readonly IMongoCollection<PrincipioGrupo> _principios;
    private readonly IMongoCollection<Momento> _momentos;
    private readonly ILogger<TrainingConfigSeedService> _logger;

    public TrainingConfigSeedService(IMongoDatabase database, ILogger<TrainingConfigSeedService> logger)
    {
        _principios = database.GetCollection<PrincipioGrupo>("training_principles");
        _momentos = database.GetCollection<Momento>("game_moments");
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (!await _principios.Find(FilterDefinition<PrincipioGrupo>.Empty).AnyAsync())
        {
            await _principios.InsertManyAsync(SeedPrincipios());
            _logger.LogInformation("Configuração de treino: princípios/fundamentos padrão semeados.");
        }

        if (!await _momentos.Find(FilterDefinition<Momento>.Empty).AnyAsync())
        {
            await _momentos.InsertManyAsync(SeedMomentos());
            _logger.LogInformation("Configuração de treino: momentos do jogo padrão semeados.");
        }
    }

    private static IEnumerable<PrincipioGrupo> SeedPrincipios() =>
    [
        new()
        {
            Id = "principios_defensivos",
            Titulo = "Princípios Táticos Defensivos",
            Filtro = "defensivo",
            Itens =
            [
                new() { Id = "contencao", Label = "Contenção" },
                new() { Id = "cobertura_defensiva", Label = "Cobertura Defensiva" },
                new() { Id = "unidade_defensiva", Label = "Unidade Defensiva" },
                new() { Id = "concentracao", Label = "Concentração" },
                new() { Id = "equilibrio", Label = "Equilíbrio" },
            ],
        },
        new()
        {
            Id = "principios_ofensivos",
            Titulo = "Princípios Táticos Ofensivos",
            Filtro = "ofensivo",
            Itens =
            [
                new() { Id = "espaco_sem_bola", Label = "Espaço sem Bola" },
                new() { Id = "espaco_com_bola", Label = "Espaço com Bola" },
                new() { Id = "cobertura_ofensiva", Label = "Cobertura Ofensiva" },
                new() { Id = "unidade_ofensiva", Label = "Unidade Ofensiva" },
                new() { Id = "penetracao", Label = "Penetração" },
                new() { Id = "mobilidade", Label = "Mobilidade" },
            ],
        },
        new()
        {
            Id = "fundamentos_tecnicos",
            Titulo = "Fundamentos Técnicos",
            Filtro = "sempre",
            Itens =
            [
                new() { Id = "controle_chao", Label = "Controle de Bola no Chão" },
                new() { Id = "controle_alto", Label = "Controle de Bola no Alto" },
                new() { Id = "drible", Label = "Drible" },
                new() { Id = "passe", Label = "Passe" },
                new() { Id = "dominio", Label = "Domínio" },
                new() { Id = "finalizacao", Label = "Finalização" },
                new() { Id = "cabeceio", Label = "Cabeceio" },
            ],
        },
    ];

    private static IEnumerable<Momento> SeedMomentos() =>
    [
        new() { Id = "org_ofensiva", Label = "Org. Ofensiva", Desc = "Equipe com a posse, construindo jogadas", Tipo = "ofensivo" },
        new() { Id = "org_defensiva", Label = "Org. Defensiva", Desc = "Equipe sem a posse, organizada para defender", Tipo = "defensivo" },
        new() { Id = "trans_ofensiva", Label = "Trans. Ofensiva", Desc = "Momento da recuperação da posse de bola", Tipo = "ofensivo" },
        new() { Id = "trans_defensiva", Label = "Trans. Defensiva", Desc = "Momento da perda da posse de bola", Tipo = "defensivo" },
    ];
}
