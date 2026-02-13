
using MarketPlace.Data;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Helpers
{
    public interface IRatingCalculator
    {
        Task<decimal> CalculateSellerOverallRatingAsync(int sellerId);
        Task UpdateSellerRatingAsync(int sellerId);
    }

    public class RatingCalculator : IRatingCalculator
    {
        private readonly ApplicationDbContext _context;

        public RatingCalculator(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculateSellerOverallRatingAsync(int sellerId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.Product.SellerId == sellerId && r.IsApproved)
                .ToListAsync();

            if (reviews.Count == 0)
                return 0m;

            var averageRating = reviews.Average(r => (decimal)r.Rating);
            return decimal.Round(averageRating, 2);
        }

        public async Task UpdateSellerRatingAsync(int sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null)
                return;

            var reviews = await _context.Reviews
                .Where(r => r.Product.SellerId == sellerId && r.IsApproved)
                .ToListAsync();

            seller.TotalReviews = reviews.Count;

            seller.OverallRating = reviews.Count > 0
                ? decimal.Round(reviews.Average(r => (decimal)r.Rating), 2)
                : 0m;

            await _context.SaveChangesAsync();
        }
    }
}
