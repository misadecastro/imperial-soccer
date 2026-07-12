namespace Imperial.Api.DTOs;

public sealed record CreateEvaluationRequest(
    string AlunoId,
    string Data,
    int Tatico,
    int Tecnico,
    int Mental);

public sealed record UpdateEvaluationRequest(
    string Data,
    int Tatico,
    int Tecnico,
    int Mental);

public sealed record EvaluationResponse(
    string Id,
    string AlunoId,
    string Data,
    int Tatico,
    int Tecnico,
    int Mental);
