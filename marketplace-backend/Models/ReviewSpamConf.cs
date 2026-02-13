namespace MarketPlace.Models
{
    public static class ReviewSpamConfig
    {
        public const int DEFAULT_DAILY_LIMIT = 10;

        public const int DEFAULT_MIN_SECONDS_BETWEEN_REVIEWS = 300;

        public const bool DEFAULT_ALLOW_MULTIPLE_PER_PRODUCT = false;

        public const double DEFAULT_MIN_PURCHASE_RATIO = 0.5;
    }
}