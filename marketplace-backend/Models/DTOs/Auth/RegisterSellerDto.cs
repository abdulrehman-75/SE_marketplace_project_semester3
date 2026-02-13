using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Auth
{
    public class RegisterSellerDto
    {
        // Identity Credentials
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = null!;

        // Seller Specific Info
        [Required]
        [MaxLength(150)]
        public string ShopName { get; set; } = null!;

        [MaxLength(500)]
        public string? ShopDescription { get; set; }

        [MaxLength(100)]
        public string? BusinessRegistrationNumber { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        // Banking Info (optional at registration)
        [MaxLength(150)]
        public string? BankAccountName { get; set; }

        [MaxLength(50)]
        public string? BankAccountNumber { get; set; }

        [MaxLength(150)]
        public string? BankName { get; set; }

        [MaxLength(50)]
        public string? BankBranchCode { get; set; }
    }
}