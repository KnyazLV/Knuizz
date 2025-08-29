using Microsoft.AspNetCore.Mvc;
using knuizz_api.Application.Services;

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
    
    // GET /api/quizzes/{id}
    // [HttpGet("{id:guid}")]
    // public async Task<IActionResult> GetUserQuiz(Guid id)
    // {
    //     // ... call _quizService.GetUserQuizByIdAsync(id) ...
    //     return Ok();
    // }

    // POST /api/quizzes
    // [HttpPost]
    // public async Task<IActionResult> CreateUserQuiz([FromBody] object createDto)
    // {
    //     // ... call _quizService.CreateUserQuizAsync(createDto) ...
    //     return CreatedAtAction(nameof(GetUserQuiz), new { id = 1 }, null);
    // }
}