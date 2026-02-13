using MarketPlace.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MarketPlace.Helpers
{
    public interface IOwnershipHelper
    {
        Task<int?> GetSellerIdAsync(string userId);
        Task<int?> GetCustomerIdAsync(string userId);
        Task<bool> IsProductOwnerAsync(int productId, int sellerId);
        Task<bool> IsOrderOwnerAsync(int orderId, int customerId);
        Task<bool> IsSellerOfOrderItemAsync(int orderItemId, int sellerId);
        string? GetUserIdFromClaims(ClaimsPrincipal user);
        string? GetRoleFromClaims(ClaimsPrincipal user);
        Task<int?> GetDeliveryStaffIdAsync(string userId);
        Task<int?> GetSupportStaffIdAsync(string userId);
        Task<int?> GetInventoryManagerIdAsync(string userId);
        Task<int?> GetAdminIdAsync(string userId);
    }

    public class OwnershipHelper : IOwnershipHelper
    {
        private readonly ApplicationDbContext _context;

        public OwnershipHelper(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int?> GetSellerIdAsync(string userId)
        {
            var seller = await _context.Sellers
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return seller?.SellerId;
        }

        public async Task<int?> GetCustomerIdAsync(string userId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId);
            return customer?.CustomerId;
        }

        public async Task<bool> IsProductOwnerAsync(int productId, int sellerId)
        {
            return await _context.Products
                .AnyAsync(p => p.ProductId == productId && p.SellerId == sellerId);
        }

        public async Task<bool> IsOrderOwnerAsync(int orderId, int customerId)
        {
            return await _context.Orders
                .AnyAsync(o => o.OrderId == orderId && o.CustomerId == customerId);
        }

        public async Task<bool> IsSellerOfOrderItemAsync(int orderItemId, int sellerId)
        {
            return await _context.OrderItems
                .AnyAsync(oi => oi.OrderItemId == orderItemId && oi.SellerId == sellerId);
        }

        public string? GetUserIdFromClaims(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public string? GetRoleFromClaims(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value;
        }
        public async Task<int?> GetDeliveryStaffIdAsync(string userId)
        {
            var deliveryStaff = await _context.DeliveryStaffs
                .FirstOrDefaultAsync(d => d.UserId == userId);
            return deliveryStaff?.DeliveryStaffId;
        }
        public async Task<int?> GetSupportStaffIdAsync(string userId)
        {
            var supportStaff = await _context.SupportStaffs
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return supportStaff?.SupportStaffId;
        }
        public async Task<int?> GetInventoryManagerIdAsync(string userId)
        {
            var manager = await _context.InventoryManagers
                .FirstOrDefaultAsync(im => im.UserId == userId);

            return manager?.InventoryManagerId;
        }
        public async Task<int?> GetAdminIdAsync(string userId)
        {
            var admin = await _context.Admins
                .FirstOrDefaultAsync(a => a.UserId == userId);
            return admin?.AdminId;
        }

    }
}