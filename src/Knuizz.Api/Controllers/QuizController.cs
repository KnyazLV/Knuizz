using System.Security.Claims;
using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Knuizz.Api.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuizController : ControllerBase {
    private const int MaxQuestionsPerQuiz = 30;
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
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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
        if (createDto.Questions.Count > MaxQuestionsPerQuiz)
            return BadRequest(new { message = $"A quiz cannot have more than {MaxQuestionsPerQuiz} questions." });
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var newQuizId = await _quizService.CreateUserQuizAsync(createDto, userId);

        return CreatedAtAction(nameof(GetUserQuiz), new { id = newQuizId }, new { id = newQuizId });
    }

    // PUT /api/quizzes/{id}
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateUserQuiz(Guid id, [FromBody] CreateQuizDto updateDto) {
        if (updateDto.Questions.Count > MaxQuestionsPerQuiz)
            return BadRequest(new { message = $"A quiz cannot have more than {MaxQuestionsPerQuiz} questions." });
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized("User identifier is missing in token.");
        var userId = Guid.Parse(userIdString);
        try {
            var success = await _quizService.UpdateUserQuizAsync(id, updateDto, userId);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException ex) {
            return Forbid(ex.Message);
        }
    }

    // DELETE /api/quizzes/{id}
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteUserQuiz(Guid id) {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized("User identifier is missing in token.");
        var userId = Guid.Parse(userIdString);
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