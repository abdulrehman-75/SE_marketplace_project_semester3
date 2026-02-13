using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MarketPlace.Models
{
    public class SupportStaff
    {
        [Key]
        public int SupportStaffId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        // Basic Info
        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string EmployeeCode { get; set; } = null!;

        [MaxLength(100)]
        public string? Department { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        [Required]
        public DateTime DateJoined { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsActive { get; set; } = true;

        [MaxLength(150)]
        public string? Specialization { get; set; }

        // Metrics
        [Required]
        public int TotalCasesHandled { get; set; } = 0;

        [Required]
        public int ActiveCases { get; set; } = 0;

        // Navigation properties
        public ICollection<Complaint> AssignedComplaints { get; set; } = new List<Complaint>();
        public ICollection<Order> DisputedOrders { get; set; } = new List<Order>();
    }
}
