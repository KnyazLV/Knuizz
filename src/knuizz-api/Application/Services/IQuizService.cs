using knuizz_api.Application.DTOs.Quiz;
using knuizz_api.Domain.Entities;

namespace knuizz_api.Application.Services;

public interface IQuizService {
    Task<List<Question>> GetQuestionsFromSourceAsync(string source, int count);
    Task SubmitMatchResultAsync(Guid userId, SubmitMatchResultDto resultDto);
    Task<QuizDetailDto> GetUserQuizByIdAsync(Guid quizId);
    Task<Guid> CreateUserQuizAsync(CreateQuizDto quizDto, Guid authorId);
    Task<bool> UpdateUserQuizAsync(Guid quizId, CreateQuizDto quizDto, Guid userId);
    Task<bool> DeleteUserQuizAsync(Guid quizId, Guid userId);
    Task<List<QuizSummaryDto>> GetQuizzesByAuthorAsync(Guid authorId);
    Task<List<QuizSummaryDto>> SearchQuizzesByTitleAsync(string titleQuery);
}