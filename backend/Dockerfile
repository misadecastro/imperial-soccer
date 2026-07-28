# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Imperial.Api — imagem para deploy no Render (feature 023).
# Contexto de build = backend/  →  docker build -f backend/Dockerfile backend
# Publica SOMENTE Imperial.Api (o projeto de testes exige MongoDB e não vai na imagem).
# Segredos e configuração vêm por variáveis de ambiente em runtime (ver data-model.md).
# ─────────────────────────────────────────────────────────────────────────────

# ── Estágio de build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore em camada separada para aproveitar cache
COPY Imperial.Api/Imperial.Api.csproj Imperial.Api/
RUN dotnet restore Imperial.Api/Imperial.Api.csproj

# Copia o código e publica em Release
COPY Imperial.Api/ Imperial.Api/
RUN dotnet publish Imperial.Api/Imperial.Api.csproj -c Release -o /app /p:UseAppHost=false

# ── Estágio de runtime ────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# Ambiente padrão (o Render pode sobrescrever). A porta real vem de PORT em runtime;
# 8080 é apenas o fallback documentado (o app lê PORT no Program.cs).
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "Imperial.Api.dll"]
