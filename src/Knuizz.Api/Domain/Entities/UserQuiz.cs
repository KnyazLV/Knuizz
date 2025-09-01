namespace Knuizz.Api.Domain.Entities;

public class UserQuiz {
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Author { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}