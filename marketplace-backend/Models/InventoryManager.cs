using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MarketPlace.Models
{
    public class InventoryManager
    {
        [Key]
        public int InventoryManagerId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        // Basic Info
        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = null!;

        [MaxLength(50)]
        public string? EmployeeCode { get; set; }

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

        [MaxLength(100)]
        public string? AssignedWarehouse { get; set; }

        // Navigation properties
        // Inventory managers don't have direct entity relationships
        // but could track stock updates through a separate StockMovement table if needed
    }
}