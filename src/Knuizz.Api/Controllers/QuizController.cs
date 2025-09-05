using System.Security.Claims;
using Knuizz.Api.Application;
using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Knuizz.Api.Controllers;

/// <summary>
///     Manages all operations related to quizzes.
/// </summary>
/// <remarks>
///     This controller allows you to create custom quizzes, get questions from external sources,
///     search for quizzes and manage them (update, delete).
/// </remarks>
[ApiController]
[Route("api/quizzes")]
public class QuizController : ControllerBase {
    private readonly IQuizService _quizService;

    public QuizController(IQuizService quizService) {
        _quizService = quizService;
    }

    /// <summary>
    ///     Receives a list of questions from an external source.
    /// </summary>
    /// <remarks>
    ///     Allows you to generate a random quiz using one of the available external APIs.
    ///     Available sources: 'trivia_api', 'wwtbm_ru'.
    /// </remarks>
    /// <param name="sourceName">Name of the question source (e.g., ‘trivia_api’).</param>
    /// <param name="count">Number of questions requested (default 20).</param>
    /// <returns>List of questions for the quiz.</returns>
    /// <response code="200">Returns a list of questions.</response>
    /// <response code="400">The source of the questions is incorrect.</response>
    /// <response code="500">Internal server error when accessing an external source.</response>
    [HttpGet("source/{sourceName}")]
    [ProducesResponseType(typeof(IEnumerable<QuestionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult>
        GetQuizFromSource(string sourceName, [FromQuery] int count = DomainConstants.Quiz.DefaultQuestionCount) {
        try {
            var questions = await _quizService.GetQuestionsFromSourceAsync(sourceName, count);
            return Ok(questions);
        }
        catch (ArgumentException ex) {
            return BadRequest(ex.Message);
        }
        catch (Exception ex) {
            return StatusCode(500, new { message = $"An internal error occurred: {ex.Message}" });
        }
    }


    /// <summary>
    ///     Saves the result of the completed match. (Authorization required)
    /// </summary>
    /// <param name="resultDto">DTO with match results: quiz ID and number of correct answers.</param>
    /// <returns>Message about successful saving.</returns>
    /// <response code="200">Match result submitted successfully</response>
    /// <response code="401">User is not authorized.</response>
    /// <response code="500">Internal server error when saving the result.</response>
    [HttpPost("submit-result")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
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

    /// <summary>
    ///     Receives detailed information about the quiz by its ID.
    /// </summary>
    /// <param name="id">Unique quiz identifier.</param>
    /// <returns>Complete information about the quiz, including all questions and answers.</returns>
    /// <response code="200">Returns detailed information about the quiz.</response>
    /// <response code="404">No quiz with the specified ID was found.</response>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(QuizDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserQuiz(Guid id) {
        var quiz = await _quizService.GetUserQuizByIdAsync(id);
        if (quiz == null) return NotFound();
        return Ok(quiz);
    }

    /// <summary>
    ///     Creates a new custom quiz. (Authorization required)
    /// </summary>
    /// <remarks>
    ///     The maximum number of questions in the quiz is 30.
    /// </remarks>
    /// <param name="createDto">Data for creating a quiz: title and list of questions.</param>
    /// <returns>Returns a link to the created quiz.</returns>
    /// <response code="201">The quiz has been successfully created. There will be a link to it in the ‘Location’ header.</response>
    /// <response code="400">Error in request (e.g., question limit exceeded).</response>
    /// <response code="401">The user is not authorized.</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateUserQuiz([FromBody] CreateQuizDto createDto) {
        if (createDto.Questions.Count > DomainConstants.Quiz.MaxQuestionsPerQuiz)
            return BadRequest($"A quiz cannot have more than {DomainConstants.Quiz.MaxQuestionsPerQuiz} questions.");
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var newQuizId = await _quizService.CreateUserQuizAsync(createDto, userId);

        return CreatedAtAction(nameof(GetUserQuiz), new { id = newQuizId }, new { id = newQuizId });
    }

    /// <summary>
    ///     Updates an existing user quiz. (Authorization required)
    /// </summary>
    /// <remarks>
    ///     Only the author of the quiz can update it.
    /// </remarks>
    /// <param name="id">ID of the updated quiz.</param>
    /// <param name="updateDto">New data for the quiz.</param>
    /// <returns>Empty response upon success.</returns>
    /// <response code="204">Quiz successfully updated.</response>
    /// <response code="400">Error in request (e.g., question limit exceeded).</response>
    /// <response code="401">The user is not authorized.</response>
    /// <response code="403">The user is not the author of this quiz.</response>
    /// <response code="404">The update quiz has not been found.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize]
    public async Task<IActionResult> UpdateUserQuiz(Guid id, [FromBody] CreateQuizDto updateDto) {
        if (updateDto.Questions.Count > DomainConstants.Quiz.MaxQuestionsPerQuiz)
            return BadRequest($"A quiz cannot have more than {DomainConstants.Quiz.MaxQuestionsPerQuiz} questions.");
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

    /// <summary>
    ///     Deletes a user quiz. (Authorization required)
    /// </summary>
    /// <remarks>
    ///     Only the author of a quiz can delete it.
    /// </remarks>
    /// <param name="id">ID of the quiz to be deleted.</param>
    /// <returns>Empty response upon success.</returns>
    /// <response code="204">The quiz has been successfully deleted.</response>
    /// <response code="401">User is not authorized.</response>
    /// <response code="403">The user is not the author of this quiz..</response>
    /// <response code="404">The quiz for deletion has not been found..</response>
    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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

    /// <summary>
    ///     Get a list of all quizzes created by a selected author.
    /// </summary>
    /// <param name="authorId">Quiz author ID.</param>
    /// <returns>List of short summaries about quizzes.</returns>
    /// <response code="200">Returns a list of the author's quizzes.</response>
    [HttpGet("by-author/{authorId:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<QuizSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetQuizzesByAuthor(Guid authorId) {
        var quizzes = await _quizService.GetQuizzesByAuthorAsync(authorId);
        return Ok(quizzes);
    }

    /// <summary>
    ///     Searches for quizzes by title.
    /// </summary>
    /// <param name="query">Text to search for in quiz titles.</param>
    /// <returns>List of quizzes found.</returns>
    /// <response code="200">Returns a list of found quizzes.</response>
    /// <response code="400">If the search query is blank.</response>
    [HttpGet("search")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<QuizSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SearchQuizzes([FromQuery] string query) {
        if (string.IsNullOrWhiteSpace(query)) return BadRequest("Search query cannot be empty.");
        var quizzes = await _quizService.SearchQuizzesByTitleAsync(query);
        return Ok(quizzes);
    }
}