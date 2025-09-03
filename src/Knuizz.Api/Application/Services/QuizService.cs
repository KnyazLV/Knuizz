using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Knuizz.Api.Application.Services;

public class QuizService : IQuizService {
    private readonly KnuizzDbContext _context;
    private readonly ILogger<QuizService> _logger;
    private readonly OpenTriviaService _triviaService;

    public QuizService(
        KnuizzDbContext context,
        OpenTriviaService triviaService,
        ILogger<QuizService> logger) {
        _context = context;
        _triviaService = triviaService;
        _logger = logger;
    }

    public async Task<List<Question>> GetQuestionsFromSourceAsync(string source, int count) {
        _logger.LogInformation("Attempting to get {Count} questions from source: {Source}", count, source);

        return source.ToLowerInvariant() switch {
            "trivia_api" => await _triviaService.GetQuestionsAsync(count),
            "wwtbm_ru" or "wwtbm_en" => await _context.Questions
                .Where(q => q.SourceName == source)
                .OrderBy(q => EF.Functions.Random())
                .Take(count)
                .ToListAsync(),
            _ => throw new ArgumentException($"The source '{source}' is not supported.")
        };
    }

    //#region SubmitResults
    public async Task SubmitMatchResultAsync(Guid userId, SubmitMatchResultDto resultDto) {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try {
            var matchHistory = new MatchHistory {
                UserId = userId,
                Score = resultDto.Score,
                DurationSeconds = resultDto.DurationSeconds,
                SourceName = resultDto.SourceName,
                UserQuizId = resultDto.UserQuizId,
                CompletedAt = DateTime.UtcNow
            };
            _context.MatchHistories.Add(matchHistory);

            // Refactor this
            var isOfficialSource = resultDto.SourceName is "trivia_api" or "wwtbm_ru" or "wwtbm_en";
            if (isOfficialSource) {
                var userStats = await _context.UserStatistics.FindAsync(userId);
                if (userStats != null) {
                    userStats.TotalGamesPlayed++;
                    userStats.TotalCorrectAnswers += resultDto.Score;
                    userStats.TotalAnswers += resultDto.TotalQuestions;

                    userStats.Rating += CalculateRatingChange(resultDto.Score, resultDto.TotalQuestions, userStats.Rating);
                    userStats.CurrentExperience += resultDto.Score; // Experience = count of correct answers

                    var requiredExp = ExperienceForNextLevel(userStats.Level);
                    while (userStats.CurrentExperience >= requiredExp) {
                        userStats.Level++;
                        userStats.CurrentExperience -= requiredExp;
                        requiredExp = ExperienceForNextLevel(userStats.Level);
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (Exception ex) {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to submit match result for user {UserId}", userId);
            throw;
        }
    }

    //#endregion

    //#region User's Quizzes
    public async Task<QuizDetailDto?> GetUserQuizByIdAsync(Guid quizId) {
        var quiz = await _context.UserQuizzes
            .AsNoTracking()
            .Include(q => q.Author)
            .Include(q => q.Questions)
            .Where(q => q.Id == quizId)
            .Select(q => new QuizDetailDto {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                AuthorId = q.AuthorId,
                AuthorName = q.Author.Username,
                CreatedAt = q.CreatedAt,
                Questions = q.Questions.Select(p => new QuestionDto {
                    Id = p.Id,
                    QuestionText = p.QuestionText,
                    Options = p.Options,
                    CorrectAnswerIndex = p.CorrectAnswerIndex
                }).ToList()
            })
            .FirstOrDefaultAsync();

        return quiz;
    }

    public async Task<Guid> CreateUserQuizAsync(CreateQuizDto quizDto, Guid authorId) {
        if (quizDto.Questions.Count > 30) throw new ArgumentException("A quiz cannot have more than 30 questions.");

        var userQuiz = new UserQuiz {
            Title = quizDto.Title,
            Description = quizDto.Description,
            AuthorId = authorId,
            Questions = quizDto.Questions.Select(q => new Question {
                QuestionText = q.QuestionText,
                Options = q.Options,
                CorrectAnswerIndex = q.CorrectAnswerIndex
            }).ToList()
        };

        _context.UserQuizzes.Add(userQuiz);
        await _context.SaveChangesAsync();
        return userQuiz.Id;
    }

    public async Task<bool> UpdateUserQuizAsync(Guid quizId, CreateQuizDto quizDto, Guid userId) {
        var quiz = await _context.UserQuizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null) return false;
        if (quiz.AuthorId != userId) throw new UnauthorizedAccessException("You are not the author of this quiz.");

        quiz.Title = quizDto.Title;
        quiz.Description = quizDto.Description;

        _context.Questions.RemoveRange(quiz.Questions);

        quiz.Questions = quizDto.Questions.Select(q => new Question {
            QuestionText = q.QuestionText,
            Options = q.Options,
            CorrectAnswerIndex = q.CorrectAnswerIndex
        }).ToList();

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserQuizAsync(Guid quizId, Guid userId) {
        var quiz = await _context.UserQuizzes.FindAsync(quizId);

        if (quiz == null) return false;
        if (quiz.AuthorId != userId) throw new UnauthorizedAccessException("You are not the author of this quiz.");

        _context.UserQuizzes.Remove(quiz);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<QuizSummaryDto>> GetQuizzesByAuthorAsync(Guid authorId) {
        return await _context.UserQuizzes
            .AsNoTracking()
            .Where(q => q.AuthorId == authorId)
            .Include(q => q.Author)
            .Select(q => new QuizSummaryDto {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                AuthorName = q.Author.Username,
                QuestionCount = q.Questions.Count,
                CreatedAt = q.CreatedAt
            })
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<QuizSummaryDto>> SearchQuizzesByTitleAsync(string titleQuery) {
        var query = _context.UserQuizzes
            .AsNoTracking()
            .Where(q => q.Title.Contains(titleQuery, StringComparison.OrdinalIgnoreCase))
            .Include(q => q.Author)
            .Select(q => new QuizSummaryDto {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                AuthorName = q.Author.Username,
                QuestionCount = q.Questions.Count,
                CreatedAt = q.CreatedAt
            })
            .OrderByDescending(q => q.CreatedAt)
            .Take(20);

        return await query.ToListAsync();
    }

    /// <summary>
    ///     Calculates rating changes based on a system similar to ELO.
    /// </summary>
    private int CalculateRatingChange(int score, int totalQuestions, int currentRating) {
        if (totalQuestions == 0) return 0;

        var accuracy = (double)score / totalQuestions;

        var maxGain = Math.Max(50.0 - (currentRating - 1000) / 20.0, 5.0);
        var maxLoss = Math.Max(5.0 + (currentRating - 1000) / 25.0, 5.0);

        double ratingChange;
        if (accuracy >= 0.5)
            ratingChange = maxGain * (accuracy - 0.5) * 2;
        else
            ratingChange = -maxLoss * (0.5 - accuracy) * 2;

        return (int)Math.Round(ratingChange);
    }

    private int ExperienceForNextLevel(int currentLevel) {
        const double baseExperience = 50.0;
        const double growthFactor = 1.2; // Each level requires 20% more experience.

        return (int)Math.Floor(baseExperience * Math.Pow(growthFactor, currentLevel - 1));
    }
    //#endregion
}