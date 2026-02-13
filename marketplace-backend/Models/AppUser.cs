using Microsoft.AspNetCore.Identity;

namespace MarketPlace.Models
{
    public class AppUser : IdentityUser
    {
        // Navigation properties to actor tables
        public Admin? Admin { get; set; }
        public Seller? Seller { get; set; }
        public Customer? Customer { get; set; }
        public DeliveryStaff? DeliveryStaff { get; set; }
        public SupportStaff? SupportStaff { get; set; }
        public InventoryManager? InventoryManager { get; set; }

        // Navigation to notifications
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
