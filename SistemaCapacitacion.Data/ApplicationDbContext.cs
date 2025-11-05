using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Data.Entities;

namespace SistemaCapacitacion.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // --- DbSets (todas las tablas del informe) ---
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<CourseCategory> CourseCategories => Set<CourseCategory>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseContent> CourseContents => Set<CourseContent>();
    public DbSet<UserCourse> UserCourses => Set<UserCourse>();
    public DbSet<Progress> Progress => Set<Progress>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // --- Nombres de tabla (fijos) ---
        b.Entity<User>().ToTable("User");
        b.Entity<Role>().ToTable("Role");
        b.Entity<UserRole>().ToTable("UserRole");
        b.Entity<Department>().ToTable("Department");
        b.Entity<CourseCategory>().ToTable("CourseCategory");
        b.Entity<Course>().ToTable("Course");
        b.Entity<CourseContent>().ToTable("CourseContent");
        b.Entity<UserCourse>().ToTable("UserCourse");
        b.Entity<Progress>().ToTable("Progress");
        b.Entity<Certificate>().ToTable("Certificate");
        b.Entity<Notification>().ToTable("Notification");
        b.Entity<Activity>().ToTable("Activity");
        b.Entity<SystemSetting>().ToTable("SystemSetting");

        // --- User ---
        b.Entity<User>(e =>
        {
            e.HasKey(x => x.IdUser);
            e.Property(x => x.Email).HasMaxLength(255).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.FirstName).HasMaxLength(120).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(120).IsRequired();
            e.Property(x => x.Position).HasMaxLength(120);
            e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("Active");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            // User → Department (muchos a 1, opcional)
            e.HasOne(x => x.Department)
             .WithMany() // si luego quieres navegación inversa, se puede agregar ICollection<User> en Department
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Role ---
        b.Entity<Role>(e =>
        {
            e.HasKey(x => x.IdRole);
            e.Property(x => x.Name).HasMaxLength(80).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Description).HasMaxLength(250);
        });

        // --- UserRole (clave compuesta) ---
        b.Entity<UserRole>(e =>
        {
            e.HasKey(x => new { x.UserId, x.RoleId });
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        // --- Department ---
        b.Entity<Department>(e =>
        {
            e.HasKey(x => x.IdDepartment);
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.IsActive).HasDefaultValue(true);

            // Manager (opcional) → User
            e.HasOne(x => x.Manager)
             .WithMany()
             .HasForeignKey(x => x.ManagerId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // --- CourseCategory ---
        b.Entity<CourseCategory>(e =>
        {
            e.HasKey(x => x.IdCourCateg);
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Description).HasMaxLength(500);
        });

        // --- Course ---
        b.Entity<Course>(e =>
        {
            e.HasKey(x => x.IdCourse);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            e.HasOne(x => x.Category)
             .WithMany()
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.CreatedBy)
             .WithMany()
             .HasForeignKey(x => x.CreatedById)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // --- CourseContent ---
        b.Entity<CourseContent>(e =>
        {
            e.HasKey(x => x.IdCourCont);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.ContentType).IsRequired();
            e.Property(x => x.ContentUrl).HasMaxLength(1024);
            e.Property(x => x.DurationMinutes).HasDefaultValue(0);
            e.Property(x => x.OrderIndex).HasDefaultValue(0);
            e.Property(x => x.IsRequired).HasDefaultValue(true);

            // ⚠️ sin cascada hacia Course
            e.HasOne(x => x.Course)
             .WithMany()
             .HasForeignKey(x => x.CourseId)
             .OnDelete(DeleteBehavior.NoAction);
        });


        // --- UserCourse ---
        b.Entity<UserCourse>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("Assigned");

            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId).OnDelete(DeleteBehavior.Cascade);

            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(x => x.AssignedById)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Progress ---
        b.Entity<Progress>(e =>
        {
            e.HasKey(x => x.IdProgress);
            e.Property(x => x.CompletionPercentage).HasDefaultValue(0d);
            e.Property(x => x.TimeSpentMinutes).HasDefaultValue(0);
            e.Property(x => x.IsCompleted).HasDefaultValue(false);
            e.Property(x => x.LastAccessed).HasDefaultValueSql("GETUTCDATE()");

            // ⚠️ sin cascada en TODAS las FKs de Progress
            e.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.NoAction);

            e.HasOne(x => x.Course)
             .WithMany()
             .HasForeignKey(x => x.CourseId)
             .OnDelete(DeleteBehavior.NoAction);

            e.HasOne(x => x.Content)
             .WithMany()
             .HasForeignKey(x => x.ContentId)
             .OnDelete(DeleteBehavior.NoAction);
        });



        // --- Certificate ---
        b.Entity<Certificate>(e =>
        {
            e.HasKey(x => x.IdCertificate);
            e.Property(x => x.CertificateNumber).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.CertificateNumber).IsUnique();
            e.Property(x => x.IssuedDate).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.IsValid).HasDefaultValue(true);
            e.Property(x => x.CertificateUrl).HasMaxLength(1024);

            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.IssuedBy).WithMany().HasForeignKey(x => x.IssuedById).OnDelete(DeleteBehavior.Restrict);
        });

        // --- Notification ---
        b.Entity<Notification>(e =>
        {
            e.HasKey(x => x.IdNotification);
            e.Property(x => x.Title).HasMaxLength(150).IsRequired();
            e.Property(x => x.Message).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Type).HasMaxLength(20).HasDefaultValue("Info");
            e.Property(x => x.IsRead).HasDefaultValue(false);
            e.Property(x => x.ActionUrl).HasMaxLength(1024);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // --- Activity ---
        b.Entity<Activity>(e =>
        {
            e.HasKey(x => x.IdActivity);
            e.Property(x => x.Action).HasMaxLength(120);
            e.Property(x => x.EntityType).HasMaxLength(80);
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // --- SystemSetting ---
        b.Entity<SystemSetting>(e =>
        {
            e.HasKey(x => x.IdSystemS);
            e.Property(x => x.SettingKey).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.SettingKey).IsUnique();
            e.Property(x => x.SettingValue).HasMaxLength(2000);
            e.Property(x => x.Category).HasMaxLength(80);
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            e.HasOne(x => x.UpdatedBy).WithMany().HasForeignKey(x => x.UpdatedById).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
