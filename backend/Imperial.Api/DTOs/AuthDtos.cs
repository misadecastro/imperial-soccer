namespace Imperial.Api.DTOs;

public sealed record LoginRequest(string Email, string Senha);

public sealed record LoginResponse(string Token, DateTimeOffset ExpiraEm, UserResponse Usuario);

public sealed record UserResponse(string Id, string Nome, string Email, string Papel, bool Ativo);

public sealed record CreateUserRequest(string Nome, string Email, string Senha, string Papel);

public sealed record UpdateUserRequest(string? Nome, string? Papel, string? NovaSenha, bool? Ativo);
