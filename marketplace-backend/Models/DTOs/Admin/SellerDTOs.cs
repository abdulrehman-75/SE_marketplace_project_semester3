using MarketPlace.Models.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminSellerListDto
    {
        public int SellerId { get; set; }
        public string UserId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string ShopName { get; set; } = null!;
        public string? ShopLogo { get; set; }
        public string? ContactPhone { get; set; }
        public string? City { get; set; }
        public DateTime DateRegistered { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public decimal OverallRating { get; set; }
        public int TotalReviews { get; set; }
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
    }

    public class AdminSellerDetailDto : AdminSellerListDto
    {
        public string? ShopDescription { get; set; }
        public string? BusinessRegistrationNumber { get; set; }
        public string? ContactEmail { get; set; }
        public string? Address { get; set; }
        public string? Country { get; set; }
        public string? BankAccountName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankName { get; set; }
        public int TotalFollowers { get; set; }
        public int ActiveProducts { get; set; }
        public int LowStockProducts { get; set; }
        public decimal PendingPayments { get; set; }
    }

    public class CreateSellerByAdminDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string ShopName { get; set; } = null!;

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [EmailAddress]
        public string? ContactEmail { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        public bool IsVerified { get; set; } = true;
    }

    public class UpdateSellerStatusDto
    {
        [Required]
        public int SellerId { get; set; }

        public bool? IsVerified { get; set; }
        public bool? IsActive { get; set; }
    }
      

}
