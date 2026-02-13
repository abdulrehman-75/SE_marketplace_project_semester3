using MarketPlace.Models.DTOs.Auth;

namespace MarketPlace.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> RegisterSellerAsync(RegisterSellerDto request);
        Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerDto request);
        Task<AuthResponseDto> RegisterAdminAsync(RegisterAdminDto request);
        Task<AuthResponseDto> RegisterDeliveryStaffAsync(RegisterDeliveryStaffDto request);
        Task<AuthResponseDto> RegisterSupportStaffAsync(RegisterSupportStaffDto request);
        Task<AuthResponseDto> RegisterInventoryManagerAsync(RegisterInventoryManagerDto request);

        // Password Reset Methods
        Task<PasswordResetResponseDto> ForgotPasswordAsync(ForgotPasswordDto request);
        Task<PasswordResetResponseDto> ResetPasswordAsync(ResetPasswordDto request);
    }
}