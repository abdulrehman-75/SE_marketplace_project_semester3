// Add this method signature to your ICustomerService interface
// in the ORDER MANAGEMENT section

using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.Customer;

namespace MarketPlace.Services.Interfaces
{
    public interface ICustomerService
    {
        // ================== PROFILE MANAGEMENT ==================
        Task<CustomerProfileDto?> GetProfileAsync(int customerId);
        Task<bool> UpdateProfileAsync(int customerId, UpdateCustomerProfileDto dto);

        // ================== PRODUCT BROWSING ==================
        Task<PagedResult<ProductListDto>> GetAllProductsAsync(ProductFilterParams filterParams);
        Task<ProductDetailDto?> GetProductDetailAsync(int productId, int? customerId = null);
        Task<PagedResult<ProductListDto>> SearchProductsAsync(string searchTerm, ProductFilterParams filterParams);

        // ================== CART MANAGEMENT ==================
        Task<CartDto?> GetCartAsync(int customerId);
        Task<bool> AddToCartAsync(int customerId, AddToCartDto dto);
        Task<bool> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto);
        Task<bool> RemoveFromCartAsync(int customerId, int cartItemId);
        Task<bool> ClearCartAsync(int customerId);

        // ================== ORDER MANAGEMENT ==================
        Task<int> CreateOrderAsync(int customerId, CreateOrderDto dto);
        Task<PagedResult<CustomerOrderDto>> GetOrderHistoryAsync(int customerId, OrderFilterParams filterParams);
        Task<CustomerOrderDto?> GetOrderDetailsAsync(int customerId, int orderId);
        Task<OrderTrackingDto?> TrackOrderAsync(int customerId, int orderId);

        // ✅ NEW: Order Cancellation
        Task<CancelOrderResponseDto> CancelOrderAsync(int customerId, int orderId, CancelOrderDto dto);

        // ================== ORDER VERIFICATION ==================
        Task<bool> ConfirmReceiptAsync(int customerId, int orderId);
        Task<bool> ReportProblemAsync(int customerId, ReportProblemDto dto);

        // ================== REVIEWS ==================
        Task<int> CreateReviewAsync(int customerId, CreateReviewDto dto);
        Task<PagedResult<ReviewDto>> GetMyReviewsAsync(int customerId, PaginationParams paginationParams);
        Task<ReviewValidationResultDto> CanPostReviewAsync(int customerId, int productId, int orderId);
        Task<ReviewRateLimitDto> GetReviewRateLimitAsync(int customerId);
        Task<bool> CanReviewProduct(int customerId, int productId, int orderId);

        // ================== SELLER FOLLOWING ==================
        Task<bool> FollowSellerAsync(int customerId, int sellerId);
        Task<bool> UnfollowSellerAsync(int customerId, int sellerId);
        Task<PagedResult<FollowedSellerDto>> GetFollowedSellersAsync(int customerId, PaginationParams paginationParams);
        Task<PagedResult<FollowedSellerProductDto>> GetFollowedSellersProductsAsync(int customerId, PaginationParams paginationParams);
        Task<bool> IsFollowingSellerAsync(int customerId, int sellerId);


        // ================== COMPLAINT MANAGEMENT ==================

        Task<PagedResult<CustomerComplaintListDto>> GetMyComplaintsAsync(int customerId,CustomerComplaintFilterParams filterParams);

        Task<CustomerComplaintDetailDto?> GetComplaintDetailsAsync( int customerId, int complaintId);

        Task<int> CreateComplaintAsync(int customerId, CreateComplaintDto dto);

        Task<bool> ReplyToComplaintAsync( int customerId,  ReplyToComplaintDto dto);
    }
}