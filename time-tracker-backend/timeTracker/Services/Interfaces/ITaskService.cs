using timeTracker.Models.DTOs;

namespace timeTracker.Services.Interfaces
{
    public interface ITaskService
    {
        Task<TaskDto> CreateTaskAsync(CreateTaskDto dto);
        Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto);
        Task<bool> DeleteTaskAsync(int id);
        Task<IEnumerable<TaskDto>> GetAllTasksAsync();
        Task<IEnumerable<TaskDto>> GetParentTasksAsync(int projectId);
        Task<IEnumerable<TaskDto>> GetNestedTasksAsync(int parentTaskId);
        Task<IEnumerable<TaskDto>> ReorderTasksAsync(ReorderTasksDto dto);
    }
}
