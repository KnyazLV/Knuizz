namespace Knuizz.Api.Domain.Entities;

public class Question {
    public Guid Id { get; set; }
    public string QuestionText { get; set; } = null!;
    public string[] Options { get; set; } = null!; // Will mapping to jsonb
    public int CorrectAnswerIndex { get; set; }

    // Source Identification
    public string? SourceName { get; set; } // "wwtbm_ru", "wwtbm_en"
    public Guid? UserQuizId { get; set; }

    // Navigation property
    public UserQuiz? UserQuiz { get; set; }
}