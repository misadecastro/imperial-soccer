using System.Text;
using Imperial.Api.Configuration;
using Imperial.Api.Identity;
using Imperial.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ─── CORS (frontend Angular em origem distinta — Princípio IV, API-First) ─────
const string FrontendCorsPolicy = "FrontendCorsPolicy";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200"];
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    var client = new MongoClient(settings.ConnectionString);
    return client.GetDatabase(settings.DatabaseName);
});

// ─── Identity (stores customizados sobre MongoDB.Driver — sem EF Core) ─────────
builder.Services.AddSingleton<MongoUserStore>();
builder.Services.AddSingleton<IUserStore<ApplicationUser>>(sp => sp.GetRequiredService<MongoUserStore>());

builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.AllowedForNewUsers = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
    .AddSignInManager();

// ─── JWT Bearer ─────────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Configuração 'Jwt:Key' não definida (configure via 'dotnet user-secrets').");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Sem isso, o JwtSecurityTokenHandler remapeia automaticamente claims curtas
        // ("role", "name") para as URIs longas de ClaimTypes.*, e RoleClaimType="role"
        // abaixo deixaria de encontrar qualquer claim (causa de 403 mesmo com token válido).
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1),
            // Claims curtas no token ("role"/"name") — sem isso, [Authorize(Roles=...)] não
            // reconheceria a claim "role" (o padrão é a URI longa de ClaimTypes.Role).
            RoleClaimType = "role",
            NameClaimType = "name",
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<AdminSeedService>();

var app = builder.Build();

// ─── Seed do Administrador inicial (FR-011) ────────────────────────────────
using (var seedScope = app.Services.CreateScope())
{
    var seeder = seedScope.ServiceProvider.GetRequiredService<AdminSeedService>();
    await seeder.SeedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
