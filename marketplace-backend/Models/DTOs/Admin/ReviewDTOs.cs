using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminReviewListDto
    {
        public int ReviewId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime DatePosted { get; set; }
        public bool IsApproved { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public string? ModerationNotes { get; set; }
    }

    public class ModerateReviewDto
    {
        [Required]
        public int ReviewId { get; set; }

        [Required]
        public bool IsApproved { get; set; }

        [MaxLength(500)]
        public string? ModerationNotes { get; set; }
    }
}
