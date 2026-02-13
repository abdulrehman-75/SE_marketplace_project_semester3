using MarketPlace.Data;
using Microsoft.AspNetCore.Identity;
using MarketPlace.Models;

namespace MarketPlace.Extensions
{
    public static class ServiceExtensions
    {
        public static async Task<IApplicationBuilder> SeedDatabaseAsync(this IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var services = scope.ServiceProvider;

            try
            {
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>();
                var context = services.GetRequiredService<ApplicationDbContext>();

                var seeder = new DbSeeder(roleManager, userManager, context);
                await seeder.SeedAsync();

                Console.WriteLine("✅ Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ An error occurred while seeding the database: {ex.Message}");
                throw;
            }

            return app;
        }
    }
}