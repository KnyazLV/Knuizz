namespace Knuizz.Api.Application.DTOs.User;

public class UserProfileDto {
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
}

public class UpdateProfileDto {
    // User can update only it's username. Email is locked
    public required string Username { get; set; }
}