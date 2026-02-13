using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MarketPlace.Models
{
    public class Customer
    {
        [Key]
        public int CustomerId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        // Basic Info
        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = null!;

        [MaxLength(20)]
        public string? Phone { get; set; }

        // Address Info
        [MaxLength(200)]
        public string? ShippingAddress { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [Required]
        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsActive { get; set; } = true;

        // Metrics
        [Required]
        public int TotalOrders { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalSpent { get; set; } = 0;

        // Navigation properties
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<SellerFollower> FollowedSellers { get; set; } = new List<SellerFollower>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Complaint> Complaints { get; set; } = new List<Complaint>();
        public Cart? Cart { get; set; }
    }
}