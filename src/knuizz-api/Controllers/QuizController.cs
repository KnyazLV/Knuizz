using System.Security.Claims;
using knuizz_api.Application.DTOs.Quiz;
using Microsoft.AspNetCore.Mvc;
using knuizz_api.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace knuizz_api.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuizController : ControllerBase {
    private readonly IQuizService _quizService;

    public QuizController(IQuizService quizService) {
        _quizService = quizService;
    }

    // GET /api/quizzes/source/trivia_api?count=15
    // GET /api/quizzes/source/wwtbm_ru?count=10
    [HttpGet("source/{sourceName}")]
    public async Task<IActionResult> GetQuizFromSource(string sourceName, [FromQuery] int count = 20) {
        try {
            var questions = await _quizService.GetQuestionsFromSourceAsync(sourceName, count);
            return Ok(questions);
        }
        catch (ArgumentException ex) {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { message = $"An internal error occurred: {ex.Message}" });
        }
    }

    [HttpPost("submit-result")]
    [Authorize]
    public async Task<IActionResult> SubmitResult([FromBody] SubmitMatchResultDto resultDto) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        try {
            await _quizService.SubmitMatchResultAsync(userId, resultDto);
            return Ok(new { message = "Match result submitted successfully." });
        }
        catch (Exception ex) {
            return StatusCode(500, new { message = $"An error occurred while submitting the result: {ex.Message}" });
        }
    }

    // GET /api/quizzes/{id}
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserQuiz(Guid id) {
        var quiz = await _quizService.GetUserQuizByIdAsync(id);
        if (quiz == null) return NotFound();
        return Ok(quiz);
    }

    // POST /api/quizzes
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateUserQuiz([FromBody] CreateQuizDto createDto) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var newQuizId = await _quizService.CreateUserQuizAsync(createDto, userId);

        return CreatedAtAction(nameof(GetUserQuiz), new { id = newQuizId }, new { id = newQuizId });
    }

    // PUT /api/quizzes/{id}
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateUserQuiz(Guid id, [FromBody] CreateQuizDto updateDto) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        try {
            var success = await _quizService.UpdateUserQuizAsync(id, updateDto, userId);
            if (!success) return NotFound();
            return NoContent(); // Default success answer for PUT
        }
        catch (UnauthorizedAccessException ex) {
            return Forbid(ex.Message);
        }
    }

    // DELETE /api/quizzes/{id}
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteUserQuiz(Guid id) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        try {
            var success = await _quizService.DeleteUserQuizAsync(id, userId);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException ex) {
            return Forbid(ex.Message);
        }
    }

    // GET /api/quizzes/by-author/{authorId}
    [HttpGet("by-author/{authorId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetQuizzesByAuthor(Guid authorId) {
        var quizzes = await _quizService.GetQuizzesByAuthorAsync(authorId);
        return Ok(quizzes);
    }

    // GET /api/quizzes/search?query=...
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchQuizzes([FromQuery] string query) {
        if (string.IsNullOrWhiteSpace(query)) return BadRequest("Search query cannot be empty.");
        var quizzes = await _quizService.SearchQuizzesByTitleAsync(query);
        return Ok(quizzes);
    }
}