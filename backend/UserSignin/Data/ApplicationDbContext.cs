using Microsoft.EntityFrameworkCore;
using UserSignin.Models;

namespace UserSignin.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email)
                    .IsUnique();

                entity.Property(u => u.Role)
                    .HasDefaultValue("user");

                entity.Property(u => u.CreatedAt)
                    .IsRequired();

                // MySQL specific configurations
                entity.Property(u => u.FirstName)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(u => u.LastName)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(u => u.Email)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(u => u.PhoneNumber)
                    .HasMaxLength(20);

                entity.Property(u => u.ProfilePicture)
                    .HasMaxLength(500);

                entity.Property(u => u.Department)
                    .HasMaxLength(100);

                entity.Property(u => u.StudentId)
                    .HasMaxLength(50);
            });
        }
    }
}