using System.ComponentModel.DataAnnotations;

namespace knuizz_api.Application.DTOs.Quiz;

public class CreateQuizDto {
    [Required]
    [StringLength(255, MinimumLength = 3)]
    public string Title { get; set; }

    public string? Description { get; set; }

    [Required]
    [MinLength(1)] // Quiz must have at least one question
    public List<QuestionDto> Questions { get; set; }
}