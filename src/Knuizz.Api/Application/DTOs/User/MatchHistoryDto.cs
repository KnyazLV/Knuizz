namespace Knuizz.Api.Application.DTOs.User;

public class MatchHistoryDto {
    public long Id { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int RatingChange { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime CompletedAt { get; set; }
    public required string SourceName { get; set; }
}