using Knuizz.Api.Application;

namespace Knuizz.Api.Domain.Entities;

public class UserStatistics {
    public Guid UserId { get; set; }
    public int Rating { get; set; } = (int)DomainConstants.Rating.BaseRating;
    public int Level { get; set; } = 1;
    public int CurrentExperience { get; set; } = 0;
    public int TotalGamesPlayed { get; set; }
    public int TotalCorrectAnswers { get; set; }
    public int TotalAnswers { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}