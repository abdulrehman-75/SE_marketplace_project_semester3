using MarketPlace.Models.DTOs.Customer;

namespace MarketPlace.Services
{
    public interface IReviewValidator
    {
        Task<ReviewValidationResultDto> ValidateReviewAsync(
            int customerId,
            int productId,
            int orderId
        );

        Task<ReviewRateLimitDto> CheckRateLimitAsync(int customerId);

        Task<bool> HasExceededDailyLimitAsync(int customerId);

        Task<bool> IsWithinMinimumTimeGapAsync(int customerId);

        Task<bool> HasAlreadyReviewedProductAsync(int customerId, int productId);
    }
}
