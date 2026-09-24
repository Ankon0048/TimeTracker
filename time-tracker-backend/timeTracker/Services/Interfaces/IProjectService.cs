using timeTracker.Models.DTOs;

namespace timeTracker.Services.Interfaces
{
    public interface IProjectService
    {
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto);
        Task<ProjectDto?> UpdateProjectAsync(int id, CreateProjectDto dto);
        Task<bool> DeleteProjectAsync(int id);
        Task<IEnumerable<ProjectDto>> GetAllProjectsAsync();
    }
}
