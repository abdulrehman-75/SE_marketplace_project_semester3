using MarketPlace.Models;
using System.Security.Claims;

namespace MarketPlace.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(AppUser user, string role);
        ClaimsPrincipal? ValidateToken(string token);
    }
}