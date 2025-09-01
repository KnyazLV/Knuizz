namespace knuizz_api.Application.DTOs.Quiz;

public class QuizDetailDto {
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<QuestionDto> Questions { get; set; }
}