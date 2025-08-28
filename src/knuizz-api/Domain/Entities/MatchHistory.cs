namespace knuizz_api.Domain.Entities;

public class MatchHistory {
    public long Id { get; set; }
    public Guid? UserId { get; set; }
    public int Score { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    // Source Identification
    public string SourceName { get; set; } // "trivia_api", "wwtbm_ru", etc.
    public Guid? UserQuizId { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public UserQuiz? UserQuiz { get; set; }
}