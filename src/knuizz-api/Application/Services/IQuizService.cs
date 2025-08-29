using knuizz_api.Domain.Entities;

namespace knuizz_api.Application.Services;

public interface IQuizService {
    Task<List<Question>> GetQuestionsFromSourceAsync(string source, int count);
    
    // Methods for managing user-created quizzes 
    // Task<UserQuiz> GetUserQuizByIdAsync(Guid id);
    // Task<UserQuiz> CreateUserQuizAsync(UserQuiz quiz);
    // Task<bool> UpdateUserQuizAsync(Guid id, UserQuiz quiz);
    // Task<bool> DeleteUserQuizAsync(Guid id);
}