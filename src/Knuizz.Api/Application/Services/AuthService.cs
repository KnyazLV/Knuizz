using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Knuizz.Api.Application.DTOs.Auth;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Knuizz.Api.Application.Services;

public class AuthService : IAuthService {
    private readonly IConfiguration _configuration;
    private readonly KnuizzDbContext _context;

    public AuthService(KnuizzDbContext context, IConfiguration configuration) {
        _context = context;
        _configuration = configuration;
    }

    public async Task<User> RegisterAsync(RegisterDto registerDto) {
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            throw new ArgumentException("User with this email already exists.");

        if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            throw new ArgumentException("Username is already taken.");

        var user = new User {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
        };

        var userStatistics = new UserStatistics {
            User = user
        };

        _context.Users.Add(user);
        _context.UserStatistics.Add(userStatistics);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<string> LoginAsync(LoginDto loginDto) {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            throw new ArgumentException("Invalid email or password.");

        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user) {
        var tokenHandler = new JwtSecurityTokenHandler();

        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey)) throw new InvalidOperationException("JWT Key is not configured");
        var key = Encoding.ASCII.GetBytes(jwtKey);

        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Username)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}