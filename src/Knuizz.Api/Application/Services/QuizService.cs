using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Knuizz.Api.Application.Services;

public class QuizService : IQuizService {
    private readonly KnuizzDbContext _context;
    private readonly ILogger<QuizService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly ITriviaQuestionBuffer _triviaBuffer;

    public QuizService(
        KnuizzDbContext context,
        ITriviaQuestionBuffer triviaBuffer,
        ILogger<QuizService> logger,
        IServiceProvider serviceProvider) {
        _context = context;
        _triviaBuffer = triviaBuffer;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task<List<Question>> GetQuestionsFromSourceAsync(string source, int count) {
        _logger.LogInformation("Attempting to get {Count} questions from source: {Source}", count, source);

        switch (source.ToLowerInvariant()) {
            case "trivia_api": {
                var questions = await _triviaBuffer.GetQuestionsAsync(count);
                if (!questions.Any()) throw new Exception("The question source is temporarily unavailable.");
                return questions;
            }

            case "wwtbm_ru" or "wwtbm_en":
                return await _context.Questions
                    .Where(q => q.SourceName == source)
                    .OrderBy(q => EF.Functions.Random())
                    .Take(count)
                    .ToListAsync();
            default:
                throw new ArgumentException($"The source '{source}' is not supported.");
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
                IsPublished = q.IsPublished,
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
        if (quizDto.Questions.Count > DomainConstants.Quiz.MaxQuestionsPerQuiz)
            throw new ArgumentException($"A quiz cannot have more than {DomainConstants.Quiz.MaxQuestionsPerQuiz} questions.");

        var userQuiz = new UserQuiz {
            Title = quizDto.Title,
            Description = quizDto.Description,
            AuthorId = authorId,
            IsPublished = quizDto.IsPublished,
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
        quiz.IsPublished = quizDto.IsPublished;

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
                CreatedAt = q.CreatedAt,
                IsPublished = q.IsPublished
            })
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<QuizSummaryDto>> SearchQuizzesByTitleAsync(string titleQuery) {
        var lowerCaseQuery = titleQuery.ToLower();
        var query = _context.UserQuizzes
            .AsNoTracking()
            .Where(q => q.IsPublished && q.Title.ToLower().Contains(lowerCaseQuery))
            .Include(q => q.Author)
            .Select(q => new QuizSummaryDto {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                AuthorName = q.Author.Username,
                QuestionCount = q.Questions.Count,
                CreatedAt = q.CreatedAt,
                IsPublished = q.IsPublished
            })
            .OrderByDescending(q => q.CreatedAt)
            .Take(20);

        return await query.ToListAsync();
    }

    public async Task<bool> UpdatePublicationStatusAsync(Guid quizId, Guid userId, bool isPublished) {
        var quiz = await _context.UserQuizzes.FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz == null) return false;
        if (quiz.AuthorId != userId) throw new UnauthorizedAccessException("You are not the author of this quiz.");
        quiz.IsPublished = isPublished;
        await _context.SaveChangesAsync();
        return true;
    }

    //#region SubmitResults
    public async Task<MatchResultResponseDto> SubmitMatchResultAsync(Guid userId, SubmitMatchResultDto resultDto) {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try {
            var userStats = await _context.UserStatistics.FindAsync(userId);
            if (userStats == null) throw new InvalidOperationException("User statistics not found.");
            
            var oldLevel = userStats.Level;
            var oldRating = userStats.Rating;
            var ratingChange = 0;
            var xpGained = 0;

            if (resultDto.SourceName is "trivia_api" or "wwtbm_ru" or "wwtbm_en") {
                ratingChange = CalculateRatingChange(resultDto.Score, resultDto.TotalQuestions, userStats.Rating);
                xpGained = resultDto.Score;
                userStats.Rating += ratingChange;
            }

            userStats.TotalGamesPlayed++;
            userStats.TotalCorrectAnswers += resultDto.Score;
            userStats.TotalAnswers += resultDto.TotalQuestions;
            userStats.CurrentExperience += xpGained;

            var requiredExp = ExperienceForNextLevel(userStats.Level);
            while (userStats.CurrentExperience >= requiredExp) {
                userStats.Level++;
                userStats.CurrentExperience -= requiredExp;
                requiredExp = ExperienceForNextLevel(userStats.Level);
            }

            var matchHistory = new MatchHistory {
                UserId = userId,
                Score = resultDto.Score,
                DurationSeconds = resultDto.DurationSeconds,
                SourceName = resultDto.SourceName,
                UserQuizId = resultDto.UserQuizId,
                CompletedAt = DateTime.UtcNow,
                TotalQuestions = resultDto.TotalQuestions,
                RatingChange = ratingChange
            };
            _context.MatchHistories.Add(matchHistory);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new MatchResultResponseDto {
                XpGained = xpGained,
                OldRating = oldRating,
                NewRating = userStats.Rating,
                OldLevel = oldLevel,
                NewLevel = userStats.Level 
            };
        }
        catch (Exception ex) {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to submit match result for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    ///     Calculates rating changes based on a system similar to ELO.
    /// </summary>
    private int CalculateRatingChange(int score, int totalQuestions, int currentRating) {
        if (totalQuestions == 0) return 0;

        var accuracy = (double)score / totalQuestions;
        var ratingDifference = currentRating - DomainConstants.Rating.BaseRating;

        var requiredAccuracy = DomainConstants.Rating.BaseAccuracyThreshold +
                               ratingDifference / DomainConstants.Rating.ThresholdIncreaseFactor;

        requiredAccuracy = Math.Min(requiredAccuracy, 0.85);

        var maxGain = Math.Max(DomainConstants.Rating.MinGain,
            DomainConstants.Rating.MaxGain - ratingDifference / DomainConstants.Rating.GainReductionFactor);

        var maxLoss = Math.Min(DomainConstants.Rating.MaxLoss,
            DomainConstants.Rating.MinLoss + ratingDifference / DomainConstants.Rating.LossIncreaseFactor);

        double ratingChange;

        if (accuracy >= requiredAccuracy) {
            var performanceFactor = (accuracy - requiredAccuracy) / (1.0 - requiredAccuracy);
            ratingChange = maxGain * performanceFactor;
        } else {
            var performanceFactor = (requiredAccuracy - accuracy) / requiredAccuracy;
            ratingChange = -maxLoss * performanceFactor;
        }

        if (ratingChange > 0 && ratingChange < 1) ratingChange = 1;
        if (ratingChange < 0 && ratingChange > -1) ratingChange = -1;

        return (int)Math.Round(ratingChange);
    }

    private int ExperienceForNextLevel(int currentLevel) {
        const double baseExperience = DomainConstants.Experience.BaseExperienceForLevel;
        const double growthFactor = DomainConstants.Experience.GrowthFactor; // Each level requires 20% more experience.

        return (int)Math.Floor(baseExperience * Math.Pow(growthFactor, currentLevel - 1));
    }
    //#endregion
}