using UserSignin.Dtos;

namespace UserSignin.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto?> UpdateUserAsync(int id, UpdateProfileRequestDto request);
        Task<bool> LogoutAsync(int userId);
    }
}