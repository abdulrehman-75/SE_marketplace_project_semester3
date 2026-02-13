namespace MarketPlace.Models.DTOs.Seller
{
    public class PaymentVerificationResponseDto
    {
        public int VerificationId { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public DateTime VerificationStartDate { get; set; }
        public DateTime VerificationEndDate { get; set; }
        public string Status { get; set; } = null!;
        public string CustomerAction { get; set; } = null!;
        public DateTime? ActionDate { get; set; }
        public DateTime? ReleasedDate { get; set; }
        public int DaysRemaining { get; set; }
        public bool IsExpired { get; set; }

        // Order details
        public string OrderStatus { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
    }
}
