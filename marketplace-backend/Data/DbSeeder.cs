using MarketPlace.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Data
{
    public class DbSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly ApplicationDbContext _context;

        public DbSeeder(
            RoleManager<IdentityRole> roleManager,
            UserManager<AppUser> userManager,
            ApplicationDbContext context)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }

        public async Task SeedAsync()
        {
            // Seed Roles
            await SeedRolesAsync();

            // Seed Default Admin (Optional but recommended)
            await SeedDefaultAdminAsync();

            // Seed System Configuration (Optional)
            await SeedSystemConfigurationAsync();
        }

        private async Task SeedRolesAsync()
        {
            string[] roles = new[]
            {
                "Admin",
                "Seller",
                "Customer",
                "DeliveryStaff",
                "SupportStaff",
                "InventoryManager"
            };

            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                    Console.WriteLine($"✅ Role '{role}' created successfully");
                }
                else
                {
                    Console.WriteLine($"ℹ️  Role '{role}' already exists");
                }
            }
        }

        private async Task SeedDefaultAdminAsync()
        {
            // Check if admin already exists
            var adminUser = await _userManager.FindByEmailAsync("admin@marketplace.com");
            if (adminUser != null)
            {
                Console.WriteLine("ℹ️  Default admin already exists");
                return;
            }

            // Create default admin user
            var user = new AppUser
            {
                UserName = "admin@marketplace.com",
                Email = "admin@marketplace.com",
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, "Admin@123");

            if (result.Succeeded)
            {
                // Assign Admin role
                await _userManager.AddToRoleAsync(user, "Admin");

                // Create Admin profile
                var admin = new Admin
                {
                    UserId = user.Id,
                    EmployeeCode = "ADM001",
                    Department = "Management",
                    DateJoined = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                Console.WriteLine("✅ Default admin created successfully");
                Console.WriteLine("   Email: admin@marketplace.com");
                Console.WriteLine("   Password: Admin@123");
                Console.WriteLine("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!");
            }
            else
            {
                Console.WriteLine($"❌ Failed to create default admin: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        private async Task SeedSystemConfigurationAsync()
        {
            var configs = new[]
            {
        // Existing configurations
        new SystemConfiguration
        {
            ConfigKey = "VerificationPeriodDays",
            ConfigValue = "7",
            Description = "Number of days for buyer protection verification period",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "BuyerProtectionFeePercentage",
            ConfigValue = "2",
            Description = "Buyer protection fee percentage (2% of order total)",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "LowStockThreshold",
            ConfigValue = "10",
            Description = "Default low stock threshold for products",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "MaxOrderItems",
            ConfigValue = "50",
            Description = "Maximum number of items per order",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "SellerVerificationRequired",
            ConfigValue = "true",
            Description = "Whether sellers need admin verification before selling",
            LastUpdated = DateTime.UtcNow
        },
        
        // ✅ NEW: Review Spam Prevention Configurations
        new SystemConfiguration
        {
            ConfigKey = "Review:DailyLimit",
            ConfigValue = "10",
            Description = "Maximum number of reviews a customer can post per day",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "Review:MinimumTimeBetweenReviews",
            ConfigValue = "300",
            Description = "Minimum seconds between reviews (300 = 5 minutes)",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "Review:AllowMultipleReviewsPerProduct",
            ConfigValue = "false",
            Description = "Allow customers to review same product multiple times from different orders",
            LastUpdated = DateTime.UtcNow
        },
        new SystemConfiguration
        {
            ConfigKey = "Review:MinimumPurchaseToReviewRatio",
            ConfigValue = "0.5",
            Description = "Minimum ratio of completed purchases to reviews (0.5 = 1 review per 2 purchases)",
            LastUpdated = DateTime.UtcNow
        }
    };

            foreach (var config in configs)
            {
                var existingConfig = await _context.SystemConfigurations
                    .FirstOrDefaultAsync(c => c.ConfigKey == config.ConfigKey);

                if (existingConfig == null)
                {
                    _context.SystemConfigurations.Add(config);
                    Console.WriteLine($"✅ System config '{config.ConfigKey}' created");
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}