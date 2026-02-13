namespace MarketPlace.Models.DTOs.Customer
{
    public class ReviewValidationResultDto
    {
        public bool CanReview { get; set; }
        public string? ReasonIfCannot { get; set; }
        public int? ExistingReviewId { get; set; }
        public DateTime? NextAllowedReviewTime { get; set; }
        public int DailyReviewsRemaining { get; set; }
    }

    public class ReviewRateLimitDto
    {
        public int TotalReviewsToday { get; set; }
        public int DailyLimit { get; set; }
        public int ReviewsRemaining { get; set; }
        public DateTime? NextResetTime { get; set; }
        public bool IsLimited { get; set; }
    }
}