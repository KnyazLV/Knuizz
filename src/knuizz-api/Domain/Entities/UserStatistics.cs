namespace knuizz_api.Domain.Entities;

public class UserStatistics {
    public Guid UserId { get; set; }
    public int Rating { get; set; } = 1000;
    public int Level { get; set; } = 1;
    public int TotalGamesPlayed { get; set; }
    public int TotalCorrectAnswers { get; set; }
    public int TotalAnswers { get; set; }

    // Navigation property
    public User User { get; set; }
}