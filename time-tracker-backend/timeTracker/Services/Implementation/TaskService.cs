using Microsoft.EntityFrameworkCore;
using timeTracker.Models.DataModel;
using timeTracker.Models.DTOs;
using timeTracker.Services.Interfaces;
using timeTracker.Utilities;

namespace timeTracker.Services.Implementation
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _context;

        public TaskService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto)
        {
            int stateId;

            if (dto.ParentID == null)
            {
                var pendingState = await _context.States.FirstOrDefaultAsync(s => s.Name == Constants.StatePending);
                if (pendingState == null)
                {
                    pendingState = new State { Name = Constants.StatePending };
                    _context.States.Add(pendingState);
                    await _context.SaveChangesAsync();
                }
                stateId = pendingState.ID;
            }
            else
            {
                var parentTask = await _context.Tasks.FindAsync(dto.ParentID);
                if (parentTask == null) throw new ArgumentException("Parent task not found.");
                stateId = parentTask.StateID;
            }

            var task = new TaskEntity
            {
                ParentID = dto.ParentID,
                Name = dto.Name,
                Description = dto.Description,
                Start = dto.Start,
                End = dto.End,
                TimeTaken = dto.TimeTaken,
                StateID = stateId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            if (dto.ProjectID.HasValue)
            {
                var projectTask = new ProjectTask
                {
                    ProjectID = dto.ProjectID.Value,
                    TaskID = task.ID
                };
                _context.ProjectTasks.Add(projectTask);
                await _context.SaveChangesAsync();
            }

            return MapToDto(task);
        }

        public async Task<bool> DeleteTaskAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return false;

            var children = await _context.Tasks.Where(t => t.ParentID == id).ToListAsync();
            foreach (var child in children)
            {
                await DeleteTaskAsync(child.ID);
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<TaskDto>> GetAllTasksAsync()
        {
            var tasks = await _context.Tasks.ToListAsync();
            return tasks.Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> GetNestedTasksAsync(int parentTaskId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.ParentID == parentTaskId)
                .ToListAsync();
            return tasks.Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> GetParentTasksAsync(int projectId)
        {
            var tasks = await _context.ProjectTasks
                .Where(pt => pt.ProjectID == projectId && pt.Task.ParentID == null)
                .Select(pt => pt.Task)
                .ToListAsync();

            return tasks.Where(t => t != null).Select(t => MapToDto(t!));
        }

        public async Task<TaskDto?> UpdateTaskAsync(int id, TaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return null;

            if (dto.ParentID.HasValue)
                task.ParentID = dto.ParentID;

            if (!string.IsNullOrEmpty(dto.Name))
                task.Name = dto.Name;

            task.Description = dto.Description;

            if (dto.Start != default)
                task.Start = dto.Start;

            if (dto.End.HasValue)
                task.End = dto.End;

            if (dto.TimeTaken.HasValue)
                task.TimeTaken = dto.TimeTaken;

            if (dto.StateID != 0)
                task.StateID = dto.StateID;

            await _context.SaveChangesAsync();
            return MapToDto(task);
        }

        private static TaskDto MapToDto(TaskEntity task)
        {
            return new TaskDto
            {
                ID = task.ID,
                ParentID = task.ParentID,
                Name = task.Name,
                Description = task.Description,
                Start = task.Start,
                End = task.End,
                TimeTaken = task.TimeTaken,
                StateID = task.StateID
            };
        }
    }
}
