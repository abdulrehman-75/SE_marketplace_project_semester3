using System.ComponentModel.DataAnnotations;
namespace MarketPlace.Models.DTOs.InventoryManager
{
    public class InventoryManagerProfileDto
    {
        public int InventoryManagerId { get; set; }
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? EmployeeCode { get; set; }
        public string? Department { get; set; }
        public string? Phone { get; set; }
        public DateTime DateJoined { get; set; }
        public bool IsActive { get; set; }
        public string? AssignedWarehouse { get; set; }
    }
}
