using System.ComponentModel.DataAnnotations;

namespace knuizz_api.Application.DTOs.Quiz;

public class QuestionDto {
    public Guid? Id { get; set; }

    [Required]
    public string QuestionText { get; set; }
    
    [Required]
    [MinLength(4, ErrorMessage = "A question must have exactly 4 options.")]
    [MaxLength(4, ErrorMessage = "A question must have exactly 4 options.")]
    public string[] Options { get; set; }

    [Required]
    [Range(0, 3)]
    public int CorrectAnswerIndex { get; set; }
}