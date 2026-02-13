using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MarketPlace.Models
{
    public class Seller
    {
        [Key]
        public int SellerId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        // Shop Info
        [Required]
        [MaxLength(150)]
        public string ShopName { get; set; } = null!;

        [MaxLength(500)]
        public string? ShopDescription { get; set; }

        [MaxLength(300)]
        public string? ShopLogo { get; set; }

        [MaxLength(100)]
        public string? BusinessRegistrationNumber { get; set; }

        // Contact Info
        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [EmailAddress]
        [MaxLength(150)]
        public string? ContactEmail { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [Required]
        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;

        // Status
        [Required]
        public bool IsVerified { get; set; } = false;

        [Required]
        public bool IsActive { get; set; } = true;

        // Business Metrics
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal OverallRating { get; set; } = 0;

        [Required]
        public int TotalReviews { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalSales { get; set; } = 0;

        [Required]
        public int TotalOrders { get; set; } = 0;

        // Banking Info
        [MaxLength(150)]
        public string? BankAccountName { get; set; }

        [MaxLength(50)]
        public string? BankAccountNumber { get; set; }

        [MaxLength(150)]
        public string? BankName { get; set; }

        [MaxLength(50)]
        public string? BankBranchCode { get; set; }

        // Navigation properties
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<SellerFollower> Followers { get; set; } = new List<SellerFollower>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<PaymentVerification> PaymentVerifications { get; set; } = new List<PaymentVerification>();
    }
}
