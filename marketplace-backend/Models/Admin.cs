using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MarketPlace.Models
{
    public class Admin
    {
        [Key]
        public int AdminId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string EmployeeCode { get; set; } = null!;

        [MaxLength(100)]
        public string? Department { get; set; }

        [Required]
        public DateTime DateJoined { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginDate { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        // Navigation properties
        // Admins can manually release payments
        public ICollection<PaymentVerification> ManuallyReleasedPayments { get; set; } = new List<PaymentVerification>();
    }
}
