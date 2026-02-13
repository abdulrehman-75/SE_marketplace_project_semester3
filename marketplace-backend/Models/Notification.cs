using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public enum NotificationType
    {
        NewProduct,
        PaymentReleased,
        OrderPlaced,
        OrderConfirmed,
        OrderShipped,
        OrderDelivered,
        OrderCancelled,
        ReviewPosted,
        ComplaintUpdate,
        LowStock,
        NewFollower,
        VerificationReminder,
        SystemAlert
    }

    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = null!;

        [MaxLength(2000)]
        public string? DetailedMessage { get; set; }

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public DateTime? DateRead { get; set; }

        // Reference to related entity
        public int? RelatedEntityId { get; set; }

        [MaxLength(50)]
        public string? RelatedEntityType { get; set; } // Order, Product, Complaint, etc.

        [MaxLength(500)]
        public string? ActionUrl { get; set; } // Link to relevant page
    }
}
