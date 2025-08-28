using knuizz_api.Infrastructure.Data;
using knuizz_api.Infrastructure.Data.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Services Registration ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KnuizzDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddControllers();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp",
        policyBuilder => {
            // React-app URL (localhost:3000 in dev)
            policyBuilder.WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Configuration of Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new OpenApiInfo {
        Version = "v1",
        Title = "Knuizz API",
        Description = "API for quizzes \"Knuizz\""
    });

    // Put here configuration for JWT auth in Swagger
});

// --- 2. BUILD ---
var app = builder.Build();


// --- 3. HTTP-REQUESTS ---

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// Put here middleware for auth
// app.UseAuthentication();
// app.UseAuthorization();

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