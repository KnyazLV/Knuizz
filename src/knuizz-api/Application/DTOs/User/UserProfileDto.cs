namespace knuizz_api.Application.DTOs.User;

public class UserProfileDto {
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
}

public class UpdateProfileDto {
    // User can update only it's username. Email is locked
    public string Username { get; set; }
}