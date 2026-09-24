using Microsoft.EntityFrameworkCore;
using timeTracker.Models.DataModel;
using timeTracker.Models.DTOs;
using timeTracker.Services.Interfaces;

namespace timeTracker.Services.Implementation
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;

        public ProjectService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                Start = DateTime.UtcNow,
                End = dto.End
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                ID = project.ID,
                Name = project.Name,
                Description = project.Description,
                Start = project.Start,
                End = project.End
            };
        }

        public async Task<bool> DeleteProjectAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync()
        {
            return await _context.Projects
                .Select(p => new ProjectDto
                {
                    ID = p.ID,
                    Name = p.Name,
                    Description = p.Description,
                    Start = p.Start,
                    End = p.End
                })
                .ToListAsync();
        }

        public async Task<ProjectDto?> UpdateProjectAsync(int id, CreateProjectDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return null;

            project.Name = dto.Name;
            project.Description = dto.Description;
            project.End = dto.End;

            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                ID = project.ID,
                Name = project.Name,
                Description = project.Description,
                Start = project.Start,
                End = project.End
            };
        }
    }
}
