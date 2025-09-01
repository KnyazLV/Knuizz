namespace Knuizz.Api.Application.DTOs.User;

public class LeaderboardEntryDto {
    public Guid UserId { get; set; }
    public required string Username { get; set; }
    public int Rating { get; set; }
    public int Level { get; set; }
}