using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Knuizz.Api.Application.Services;

public class UserService : IUserService {
    private readonly KnuizzDbContext _context;

    public UserService(KnuizzDbContext context) {
        _context = context;
    }

    public async Task<UserProfileDto> GetUserProfileAsync(Guid userId) {
        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileDto { Id = u.Id, Username = u.Username, Email = u.Email })
            .FirstOrDefaultAsync();
        if (user == null) throw new Exception("User Profile not found!");

        return user;
    }

    public async Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileDto profileDto) {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (await _context.Users.AnyAsync(u => u.Username == profileDto.Username && u.Id != userId))
            throw new ArgumentException("Username is already taken.");

        user.Username = profileDto.Username;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserStatistics?> GetUserStatisticsAsync(Guid userId) {
        return await _context.UserStatistics.FindAsync(userId);
    }

    public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int count) {
        if (count > 100) count = 100;
        var leaderboardEntries = await _context.UserStatistics
            .OrderByDescending(s => s.Rating)
            .Take(count)
            .Select(s => new LeaderboardEntryDto {
                UserId = s.UserId,
                Username = s.User.Username,
                Rating = s.Rating,
                Level = s.Level
            })
            .AsNoTracking()
            .ToListAsync();

        return leaderboardEntries;
    }
}