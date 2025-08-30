using knuizz_api.Application.DTOs.User;
using knuizz_api.Domain.Entities;

namespace knuizz_api.Application.Services;

public interface IUserService {
    Task<UserProfileDto> GetUserProfileAsync(Guid userId);
    Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileDto profileDto);
    Task<UserStatistics> GetUserStatisticsAsync(Guid userId);
    Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int count);
}
