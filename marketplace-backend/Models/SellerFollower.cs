using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketPlace.Models
{
    public class SellerFollower
    {
        [Key]
        public int FollowerId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;

        [Required]
        public int SellerId { get; set; }

        [ForeignKey("SellerId")]
        public Seller Seller { get; set; } = null!;

        [Required]
        public DateTime DateFollowed { get; set; } = DateTime.UtcNow;

        [Required]
        public bool NotificationsEnabled { get; set; } = true;
    }
}
