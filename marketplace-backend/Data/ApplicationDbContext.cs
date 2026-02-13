using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MarketPlace.Models;

namespace MarketPlace.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ACTOR DbSets
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<DeliveryStaff> DeliveryStaffs { get; set; }
        public DbSet<SupportStaff> SupportStaffs { get; set; }
        public DbSet<InventoryManager> InventoryManagers { get; set; }

        // CORE BUSINESS DbSets
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<SellerFollower> SellerFollowers { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<PaymentVerification> PaymentVerifications { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<SystemConfiguration> SystemConfigurations { get; set; }
        public DbSet<ComplaintMessage> ComplaintMessages { get; set; }
        public DbSet<SellerOrderConfirmation> SellerOrderConfirmations { get; set; }
        public DbSet<StockAdjustment> StockAdjustments { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ACTOR CONFIGURATIONS

            // Admin Configuration
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.EmployeeCode).IsUnique();
                entity.HasIndex(e => e.IsActive);

                entity.HasOne(a => a.User)
                    .WithOne(u => u.Admin)
                    .HasForeignKey<Admin>(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Seller Configuration
            modelBuilder.Entity<Seller>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.ShopName);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.DateRegistered);
                entity.HasIndex(e => e.OverallRating);
                entity.HasIndex(e => e.IsVerified);

                entity.Property(e => e.OverallRating)
                    .HasPrecision(18, 2);
                entity.Property(e => e.TotalSales)
                    .HasPrecision(18, 2);

                entity.HasOne(s => s.User)
                    .WithOne(u => u.Seller)
                    .HasForeignKey<Seller>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Customer Configuration
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.DateRegistered);

                entity.Property(e => e.TotalSpent)
                    .HasPrecision(18, 2);

                entity.HasOne(c => c.User)
                    .WithOne(u => u.Customer)
                    .HasForeignKey<Customer>(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // DeliveryStaff Configuration
            modelBuilder.Entity<DeliveryStaff>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsAvailable);
                entity.HasIndex(e => e.AssignedArea);

                entity.HasOne(d => d.User)
                    .WithOne(u => u.DeliveryStaff)
                    .HasForeignKey<DeliveryStaff>(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // SupportStaff Configuration
            modelBuilder.Entity<SupportStaff>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.EmployeeCode).IsUnique();
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.Specialization);

                entity.HasOne(s => s.User)
                    .WithOne(u => u.SupportStaff)
                    .HasForeignKey<SupportStaff>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // InventoryManager Configuration
            modelBuilder.Entity<InventoryManager>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.IsActive);

                entity.HasOne(i => i.User)
                    .WithOne(u => u.InventoryManager)
                    .HasForeignKey<InventoryManager>(i => i.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PRODUCT & CATEGORY CONFIGURATIONS
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.DateListed);
                entity.HasIndex(e => e.Price);
                entity.HasIndex(e => e.StockQuantity);

                entity.Property(e => e.Price)
                    .HasPrecision(18, 2);

                entity.HasOne(p => p.Seller)
                    .WithMany(s => s.Products)
                    .HasForeignKey(p => p.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Category relationship - FIXED
                entity.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.RowVersion)
                    .IsRowVersion()
                    .IsConcurrencyToken();
            });

            // Category Configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(e => e.CategoryName).IsUnique();
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.ParentCategoryId);

                entity.HasOne(c => c.ParentCategory)
                    .WithMany(c => c.SubCategories)
                    .HasForeignKey(c => c.ParentCategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SELLER FOLLOWER CONFIGURATION
            modelBuilder.Entity<SellerFollower>(entity =>
            {
                entity.HasIndex(e => new { e.CustomerId, e.SellerId }).IsUnique();
                entity.HasIndex(e => e.DateFollowed);

                entity.HasOne(sf => sf.Customer)
                    .WithMany(c => c.FollowedSellers)
                    .HasForeignKey(sf => sf.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sf => sf.Seller)
                    .WithMany(s => s.Followers)
                    .HasForeignKey(sf => sf.SellerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ORDER CONFIGURATIONS
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.OrderDate);
                entity.HasIndex(e => e.OrderStatus);
                entity.HasIndex(e => e.PaymentStatus);
                entity.HasIndex(e => e.DeliveryStaffId);
                entity.HasIndex(e => e.AssignedSupportStaffId);

                entity.Property(e => e.TotalAmount)
                    .HasPrecision(18, 2);
                entity.Property(e => e.BuyerProtectionFee)
                    .HasPrecision(18, 2);
                entity.Property(e => e.GrandTotal)
                    .HasPrecision(18, 2);

                entity.HasOne(o => o.Customer)
                    .WithMany(c => c.Orders)
                    .HasForeignKey(o => o.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.DeliveryStaff)
                    .WithMany(d => d.AssignedOrders)
                    .HasForeignKey(o => o.DeliveryStaffId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.AssignedSupportStaff)
                    .WithMany(s => s.DisputedOrders)
                    .HasForeignKey(o => o.AssignedSupportStaffId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // OrderItem Configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.SellerId);

                entity.Property(e => e.UnitPrice)
                    .HasPrecision(18, 2);
                entity.Property(e => e.Subtotal)
                    .HasPrecision(18, 2);

                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(oi => oi.Seller)
                    .WithMany(s => s.OrderItems)
                    .HasForeignKey(oi => oi.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // PAYMENT VERIFICATION CONFIGURATION
            modelBuilder.Entity<PaymentVerification>(entity =>
            {
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.VerificationEndDate);

                entity.Property(e => e.Amount)
                    .HasPrecision(18, 2);

                entity.HasOne(pv => pv.Order)
                    .WithMany(o => o.PaymentVerifications)
                    .HasForeignKey(pv => pv.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pv => pv.Seller)
                    .WithMany(s => s.PaymentVerifications)
                    .HasForeignKey(pv => pv.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // REVIEW CONFIGURATION
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.DatePosted);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.IsApproved);

                entity.HasOne(r => r.Product)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(r => r.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Customer)
                    .WithMany(c => c.Reviews)
                    .HasForeignKey(r => r.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Order)
                    .WithMany()
                    .HasForeignKey(r => r.OrderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // COMPLAINT CONFIGURATION
            modelBuilder.Entity<Complaint>(entity =>
            {
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.CustomerId);
                entity.HasIndex(e => e.AssignedSupportStaffId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.DateReported);
                entity.HasIndex(e => e.Priority);

                entity.HasOne(c => c.Order)
                    .WithMany()
                    .HasForeignKey(c => c.OrderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Customer)
                    .WithMany(cu => cu.Complaints)
                    .HasForeignKey(c => c.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.AssignedSupportStaff)
                    .WithMany(s => s.AssignedComplaints)
                    .HasForeignKey(c => c.AssignedSupportStaffId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // NOTIFICATION CONFIGURATION

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.DateCreated);
                entity.HasIndex(e => e.NotificationType);

                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // CART CONFIGURATIONS
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasIndex(e => e.CustomerId).IsUnique();

                entity.HasOne(c => c.Customer)
                    .WithOne(cu => cu.Cart)
                    .HasForeignKey<Cart>(c => c.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // CartItem Configuration
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasIndex(e => e.CartId);
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => new { e.CartId, e.ProductId }).IsUnique();

                entity.HasOne(ci => ci.Cart)
                    .WithMany(c => c.CartItems)
                    .HasForeignKey(ci => ci.CartId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                    .WithMany()
                    .HasForeignKey(ci => ci.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // SYSTEM CONFIGURATION
            modelBuilder.Entity<SystemConfiguration>(entity =>
            {
                entity.HasIndex(e => e.ConfigKey).IsUnique();
            });

            // complaint message model added:
            modelBuilder.Entity<ComplaintMessage>(entity =>
            {
                entity.HasIndex(e => e.ComplaintId);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => e.SenderType);
            });
            modelBuilder.Entity<SellerOrderConfirmation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Order)
                      .WithMany()
                      .HasForeignKey(e => e.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Seller)
                      .WithMany()
                      .HasForeignKey(e => e.SellerId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => new { e.OrderId, e.SellerId })
                      .IsUnique();
            });

            modelBuilder.Entity<StockAdjustment>(entity =>
            {
                entity.HasKey(e => e.StockAdjustmentId);

                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.AdjustmentDate);
                entity.HasIndex(e => e.AdjustmentType);
                entity.HasIndex(e => new { e.ProductId, e.AdjustmentDate });

                entity.HasOne(sa => sa.Product)
                    .WithMany()
                    .HasForeignKey(sa => sa.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sa => sa.InventoryManager)
                    .WithMany()
                    .HasForeignKey(sa => sa.InventoryManagerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Code);
                entity.HasIndex(e => e.ExpiresAt);
                entity.HasIndex(e => e.IsUsed);
                entity.HasIndex(e => new { e.UserId, e.Code, e.IsUsed });

                entity.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}