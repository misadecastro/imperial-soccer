namespace Imperial.Api.DTOs;

public sealed record CreateStudentRequest(string Nome, string DataNascimento, string Categoria);

public sealed record StudentResponse(string Id, string Nome, string DataNascimento, string Categoria);
