namespace Knuizz.Api.Application.DTOs.Quiz;

public class MatchResultResponseDto {
    public int XpGained { get; set; }
    public int OldRating { get; set; }
    public int NewRating { get; set; }
    public int OldLevel { get; set; }
    public int NewLevel { get; set; }
}