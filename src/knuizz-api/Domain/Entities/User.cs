namespace knuizz_api.Domain.Entities;

public class User {
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public UserStatistics? Statistics { get; set; }
    public ICollection<UserQuiz> Quizzes { get; set; } = new List<UserQuiz>();
    public ICollection<MatchHistory> MatchHistories { get; set; } = new List<MatchHistory>();
}