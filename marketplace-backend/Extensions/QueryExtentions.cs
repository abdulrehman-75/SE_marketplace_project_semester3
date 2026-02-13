
using MarketPlace.Models.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Extensions
{
    public static class QueryExtensions
    {
        // Generic pagination
        public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
            this IQueryable<T> query,
            PaginationParams paginationParams)
        {
            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize,
                TotalCount = totalCount
            };
        }

        // Apply sorting dynamically
        public static IQueryable<T> ApplySorting<T>(
            this IQueryable<T> query,
            string? sortBy,
            string sortOrder = "asc")
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return query;

            var parameter = System.Linq.Expressions.Expression.Parameter(typeof(T), "x");
            var property = typeof(T).GetProperty(sortBy);

            if (property == null)
                return query;

            var propertyAccess = System.Linq.Expressions.Expression.MakeMemberAccess(parameter, property);
            var orderByExpression = System.Linq.Expressions.Expression.Lambda(propertyAccess, parameter);

            var methodName = sortOrder.ToLower() == "desc" ? "OrderByDescending" : "OrderBy";
            var resultExpression = System.Linq.Expressions.Expression.Call(
                typeof(Queryable),
                methodName,
                new Type[] { typeof(T), property.PropertyType },
                query.Expression,
                System.Linq.Expressions.Expression.Quote(orderByExpression));

            return query.Provider.CreateQuery<T>(resultExpression);
        }
    }
}