using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models
{
    public class ComplaintMessage
    {
        [Key]
        public int MessageId { get; set; }

        [Required]
        public int ComplaintId { get; set; }

        [Required]
        [MaxLength(50)]
        public string SenderType { get; set; } = null!; // System, Customer, SupportStaff

        [MaxLength(150)]
        public string? SenderName { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = null!;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsInternal { get; set; } = false;
    }
}
