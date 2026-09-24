using Microsoft.EntityFrameworkCore;

namespace timeTracker.Models.DataModel
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<TaskEntity> Tasks { get; set; } = null!;
        public DbSet<ProjectTask> ProjectTasks { get; set; } = null!;
        public DbSet<State> States { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Description fields store HTML rich text content (e.g., from a rich text editor).
            // The 'text' column type in PostgreSQL supports arbitrary-length HTML strings.
            modelBuilder.Entity<Project>()
                .Property(p => p.Description)
                .HasComment("HTML rich text content. Supports bold, lists, headings, links, etc.");

            modelBuilder.Entity<TaskEntity>()
                .Property(t => t.Description)
                .HasComment("HTML rich text content. Supports bold, lists, headings, links, etc.");
        }
    }
}
