namespace MarketPlace.Models.DTOs.Auth
{
    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? Token { get; set; }
        public DateTime? TokenExpiry { get; set; }
        public UserInfoDto? UserInfo { get; set; }
    }

    public class UserInfoDto
    {
        public string UserId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public ActorInfoDto? ActorInfo { get; set; }
    }

    public class ActorInfoDto
    {
        public int ActorId { get; set; }
        public string ActorType { get; set; } = null!; // Admin, Seller, Customer, etc.
        public string DisplayName { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool? IsVerified { get; set; } // For Seller
        public decimal? OverallRating { get; set; } // For Seller
    }
}