namespace MarketPlace.Helpers
{
    public interface IPaymentCalculator
    {
        decimal CalculateBuyerProtectionFee(decimal amount);
        decimal CalculateGrandTotal(decimal subtotal);
        DateTime CalculateVerificationEndDate(DateTime deliveryDate, int verificationDays = 7);
        bool IsVerificationPeriodExpired(DateTime verificationEndDate);
    }

    public class PaymentCalculator : IPaymentCalculator
    {
        private const decimal BuyerProtectionFeePercentage = 0.02m; // 2%
        private const int DefaultVerificationDays = 7;

        public decimal CalculateBuyerProtectionFee(decimal amount)
        {
            return Math.Round(amount * BuyerProtectionFeePercentage, 2);
        }

        public decimal CalculateGrandTotal(decimal subtotal)
        {
            var fee = CalculateBuyerProtectionFee(subtotal);
            return subtotal + fee;
        }

        public DateTime CalculateVerificationEndDate(DateTime deliveryDate, int verificationDays = DefaultVerificationDays)
        {
            return deliveryDate.AddDays(verificationDays);
        }

        public bool IsVerificationPeriodExpired(DateTime verificationEndDate)
        {
            return DateTime.UtcNow > verificationEndDate;
        }
    }
}