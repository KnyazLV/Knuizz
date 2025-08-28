using knuizz_api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace knuizz_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase {
    private readonly KnuizzDbContext _context;

    public TestController(KnuizzDbContext context) {
        _context = context;
    }

    [HttpGet("db-connection")]
    public async Task<IActionResult> CheckDbConnection() {
        // This method remains for basic connection checking.
        try {
            var canConnect = await _context.Database.CanConnectAsync();
            if (canConnect) return Ok("Database connection successful.");
            return StatusCode(500, "Database connection failed.");
        }
        catch (Exception ex) {
            return StatusCode(500, $"Database connection failed: {ex.Message}");
        }
    }

    // --- NEW METHOD FOR TESTING SEEDED DATA ---
    [HttpGet("random-questions")]
    public async Task<IActionResult> GetRandomQuestions([FromQuery] int count = 5) {
        try {
            // We request 'count' random questions from the database.
            // This query uses a PostgreSQL-specific function for randomness.
            var questions = await _context.Questions
                .OrderBy(q => EF.Functions.Random())
                .Take(count)
                .ToListAsync();

            if (questions.Count == 0) return NotFound("No questions found in the database. Did the seeding run correctly?");

            // If questions are found, we return them as a JSON array.
            return Ok(questions);
        }
        catch (Exception ex) {
            // This will catch any errors related to database queries.
            return StatusCode(500, $"An error occurred while fetching questions: {ex.Message}");
        }
    }
}