using Microsoft.EntityFrameworkCore;
using timeTracker.Models.DataModel;
using timeTracker.Services.Implementation;
using timeTracker.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Define a name for your CORS policy
var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Add services to the container.
builder.Services.AddControllers();

// 2. Configure CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins(
                                    "http://localhost:5173", // time-tracker (Vite) dev server
                                    "http://localhost:3000"  // time-tracker-frontend (Next.js) dev server
                                )
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// Configure Entity Framework with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Services
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IStateService, StateService>();

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. Enable CORS in the HTTP request pipeline
// CRITICAL: This must be placed after UseRouting() (if you have it) 
// and BEFORE UseAuthorization()
app.UseCors(myAllowSpecificOrigins);

app.UseAuthorization();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapControllers();
app.Run();