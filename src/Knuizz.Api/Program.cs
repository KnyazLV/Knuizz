using System.Reflection;
using System.Text;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Infrastructure.Data;
using Knuizz.Api.Infrastructure.Data.Seeding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Services Registration ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString)) throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

builder.Services.AddDbContext<KnuizzDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddProblemDetails();
builder.Services.AddControllers();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

if (allowedOrigins == null || allowedOrigins.Length == 0) {
    throw new InvalidOperationException("AllowedOrigins for CORS is not configured.");
}

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policyBuilder => {
        policyBuilder.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString,
        name: "PostgreSQL Database",
        failureStatus: HealthStatus.Unhealthy,
        tags: new[] { "database" });

// Configuration of Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new OpenApiInfo {
        Version = "v1",
        Title = "Knuizz API",
        Description = "API for quizzes \"Knuizz\""
    });

    // --- START: Add JWT Authentication to Swagger ---

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description =
            "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });

    // --- END: Add JWT Authentication to Swagger ---

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

builder.Services.AddScoped<OpenTriviaService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IQuizService, QuizService>();

builder.Services.AddSingleton<ITriviaQuestionBuffer, TriviaQuestionBuffer>();
builder.Services.AddHostedService(provider => (TriviaQuestionBuffer)provider.GetRequiredService<ITriviaQuestionBuffer>());
builder.Services.AddHttpClient("OpenTriviaClient", client => { client.BaseAddress = new Uri("https://opentdb.com/"); });

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(jwtKey)) throw new InvalidOperationException("JWT Key 'Jwt:Key' is not configured.");

builder.Services.AddAuthentication(options => {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// --- 2. BUILD ---
var app = builder.Build();


// --- 3. HTTP-REQUESTS ---
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI(options => { options.EnablePersistAuthorization(); });
    app.UseReDoc(options =>
    {
        // to open ReDoc follow this path: http://<URL>/api-docs
        options.DocumentTitle = "Knuizz API Docs";
        options.SpecUrl = "/swagger/v1/swagger.json";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.MapHealthChecks("/health");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// --- Seeding the database ---
using (var scope = app.Services.CreateScope()) {
    var services = scope.ServiceProvider;
    try {
        var context = services.GetRequiredService<KnuizzDbContext>();
        var logger = services.GetRequiredService<ILogger<DataSeeder>>();

        var seeder = new DataSeeder(context, logger);
        await seeder.SeedAsync();
    }
    catch (Exception ex) {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database seeding.");
    }
}

// --- 4. RUN APP---
app.Run();