using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MarketPlace.Models
{
    public class DeliveryStaff
    {
        [Key]
        public int DeliveryStaffId { get; set; }

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

        // Vehicle Info
        [MaxLength(50)]
        public string? VehicleType { get; set; }

        [MaxLength(50)]
        public string? VehicleNumber { get; set; }

        [MaxLength(100)]
        public string? LicenseNumber { get; set; }

        [MaxLength(150)]
        public string? AssignedArea { get; set; }

        [Required]
        public DateTime DateJoined { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public bool IsAvailable { get; set; } = true;

        // Tracking
        [MaxLength(200)]
        public string? CurrentLocation { get; set; }

        // Metrics
        [Required]
        public int TotalDeliveries { get; set; } = 0;

        [Required]
        public int SuccessfulDeliveries { get; set; } = 0;

        // Navigation properties
        public ICollection<Order> AssignedOrders { get; set; } = new List<Order>();
    }
}