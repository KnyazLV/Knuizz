namespace Knuizz.Api.Application.DTOs.User;

public class MatchHistoryDto {
    public int Score { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime CompletedAt { get; set; }
    public string SourceName { get; set; }
}