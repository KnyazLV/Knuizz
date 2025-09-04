using Knuizz.Api.Application.DTOs.Auth;
using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public interface IAuthService {
    Task<User> RegisterAsync(RegisterDto registerDto);
    Task<string> LoginAsync(LoginDto loginDto);
}