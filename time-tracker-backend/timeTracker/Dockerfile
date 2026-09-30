FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY timeTracker.csproj nuget.config ./
RUN dotnet restore timeTracker.csproj
COPY . .
RUN dotnet publish timeTracker.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8000
EXPOSE 8000
ENTRYPOINT ["dotnet", "timeTracker.dll"]
