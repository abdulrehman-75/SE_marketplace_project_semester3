using System.ComponentModel.DataAnnotations;

namespace MarketPlace.Models.DTOs.Admin
{
    public class PaymentVerificationSummaryDto
    {
        public int VerificationId { get; set; }
        public int OrderId { get; set; }
        public int SellerId { get; set; }
        public string SellerShopName { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime VerificationStartDate { get; set; }
        public DateTime VerificationEndDate { get; set; }
        public string Status { get; set; } = null!;
        public string CustomerAction { get; set; } = null!;
        public DateTime? ActionDate { get; set; }
        public DateTime? ReleasedDate { get; set; }
        public string? ReleasedBy { get; set; }
        public int DaysRemaining { get; set; }
        public bool IsExpired { get; set; }
        public bool IsDisputed { get; set; }
    }

    public class PaymentVerificationDetailDto : PaymentVerificationSummaryDto
    {
        public string? Notes { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string? CustomerEmail { get; set; }
        public string? SellerEmail { get; set; }
        public string? SellerPhone { get; set; }
    }

    public class ManualPaymentActionDto
    {
        [Required]
        public int VerificationId { get; set; }

        [Required]
        public string Action { get; set; } = null!; // "Release", "Hold", "Dispute"

        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = null!;

        public bool NotifySeller { get; set; } = true;
        public bool NotifyCustomer { get; set; } = true;
    }
}
