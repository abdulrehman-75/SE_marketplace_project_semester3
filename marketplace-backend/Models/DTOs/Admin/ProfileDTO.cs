using System.ComponentModel.DataAnnotations;
namespace MarketPlace.Models.DTOs.Admin
{
    public class AdminProfileDto
    {
        public int AdminId { get; set; }
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string EmployeeCode { get; set; } = null!;
        public string? Department { get; set; }
        public DateTime DateJoined { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsActive { get; set; }
    }
}
