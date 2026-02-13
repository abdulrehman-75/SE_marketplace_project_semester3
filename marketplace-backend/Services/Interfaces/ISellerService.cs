using MarketPlace.Models.DTOs.Common;
using MarketPlace.Models.DTOs.Seller;

namespace MarketPlace.Services.Interfaces
{
    public interface ISellerService
    {
        // Product Management
        Task<ApiResponse<ProductResponseDto>> CreateProductAsync(int sellerId, CreateProductDto dto);
        Task<ApiResponse<ProductResponseDto>> UpdateProductAsync(int sellerId, int productId, UpdateProductDto dto);
        Task<ApiResponse<bool>> DeleteProductAsync(int sellerId, int productId);
        Task<ApiResponse<ProductResponseDto>> UpdateProductStockAsync(int sellerId, int productId, UpdateProductStockDto dto);
        Task<ApiResponse<ProductResponseDto>> GetProductByIdAsync(int sellerId, int productId);
        Task<ApiResponse<PagedResult<ProductResponseDto>>> GetMyProductsAsync(int sellerId, ProductFilterParams filterParams);

        // Product Image Management
        Task<ApiResponse<string>> UploadProductImageAsync(int sellerId, int productId, IFormFile image);
        Task<ApiResponse<bool>> DeleteProductImageAsync(int sellerId, int productId);

        // Shop Logo Management
        Task<ApiResponse<string>> UploadShopLogoAsync(int sellerId, IFormFile logo);
        Task<ApiResponse<bool>> DeleteShopLogoAsync(int sellerId);

        // Order Management
        Task<ApiResponse<PagedResult<SellerOrderResponseDto>>> GetMyOrdersAsync(int sellerId, OrderFilterParams filterParams);
        Task<ApiResponse<SellerOrderResponseDto>> GetOrderDetailsAsync(int sellerId, int orderId);
        Task<ApiResponse<bool>> ConfirmOrderAsync(int sellerId, int orderId);

        // Payment Verification
        Task<ApiResponse<PagedResult<PaymentVerificationResponseDto>>> GetMyPaymentVerificationsAsync(int sellerId, PaginationParams paginationParams);
        Task<ApiResponse<PaymentVerificationResponseDto>> GetPaymentVerificationDetailsAsync(int sellerId, int verificationId);

        // Followers
        Task<ApiResponse<PagedResult<SellerFollowerResponseDto>>> GetMyFollowersAsync(int sellerId, PaginationParams paginationParams);

        // Profile & Dashboard
        Task<ApiResponse<SellerProfileDto>> GetMyProfileAsync(int sellerId);
        Task<ApiResponse<SellerDashboardStatsDto>> GetDashboardStatsAsync(int sellerId);

        // Categories
        Task<ApiResponse<List<CategoryListDto>>> GetActiveCategoriesAsync();
    }
}