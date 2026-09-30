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

        private async Task<int> GetOrCreateStateIdAsync(string name)
        {
            var state = await _context.States.FirstOrDefaultAsync(s => s.Name == name);
            if (state == null)
            {
                state = new State { Name = name };
                _context.States.Add(state);
                await _context.SaveChangesAsync();
            }
            return state.ID;
        }

        public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto)
        {
            int stateId;

            if (dto.ParentID == null)
            {
                stateId = await GetOrCreateStateIdAsync(Constants.StatePending);
            }
            else
            {
                var parentTask = await _context.Tasks.FindAsync(dto.ParentID);
                if (parentTask == null) throw new ArgumentException("Parent task not found.");

                // A brand-new subtask should never be born already "Completed" just
                // because its parent happens to be — that reads as the parent (or the
                // subtask itself) auto-completing. Only inherit the parent's state when
                // that state isn't a terminal/completed one; otherwise start fresh at
                // "Pending" like a top-level task would.
                var parentState = await _context.States.FindAsync(parentTask.StateID);
                var parentIsCompleted = parentState != null &&
                    string.Equals(parentState.Name, Constants.StateCompleted, StringComparison.OrdinalIgnoreCase);

                stateId = parentIsCompleted
                    ? await GetOrCreateStateIdAsync(Constants.StatePending)
                    : parentTask.StateID;
            }

            var siblingMaxOrder = await _context.Tasks
                .Where(t => t.ParentID == dto.ParentID)
                .Select(t => (int?)t.Order)
                .MaxAsync() ?? -1;

            var task = new TaskEntity
            {
                ParentID = dto.ParentID,
                Name = dto.Name,
                Description = dto.Description,
                Start = dto.Start,
                End = dto.End,
                TimeTaken = dto.TimeTaken,
                StateID = stateId,
                Order = siblingMaxOrder + 1
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
            var tasks = await _context.Tasks
                .OrderBy(t => t.Order)
                .ThenBy(t => t.ID)
                .ToListAsync();
            return tasks.Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> GetNestedTasksAsync(int parentTaskId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.ParentID == parentTaskId)
                .OrderBy(t => t.Order)
                .ThenBy(t => t.ID)
                .ToListAsync();
            return tasks.Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> GetParentTasksAsync(int projectId)
        {
            var tasks = await _context.ProjectTasks
                .Where(pt => pt.ProjectID == projectId && pt.Task.ParentID == null)
                .Select(pt => pt.Task)
                .ToListAsync();

            return tasks.Where(t => t != null)
                .Select(t => t!)
                .OrderBy(t => t.Order)
                .ThenBy(t => t.ID)
                .Select(MapToDto);
        }

        public async Task<IEnumerable<TaskDto>> ReorderTasksAsync(ReorderTasksDto dto)
        {
            var tasks = await _context.Tasks
                .Where(t => dto.TaskIds.Contains(t.ID))
                .ToListAsync();

            for (var index = 0; index < dto.TaskIds.Count; index++)
            {
                var task = tasks.FirstOrDefault(t => t.ID == dto.TaskIds[index]);
                if (task == null) continue;
                task.StateID = dto.StateID;
                task.Order = index;
            }

            await _context.SaveChangesAsync();
            return tasks.OrderBy(t => t.Order).Select(MapToDto);
        }

        public async Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return null;

            // An explicit null parent moves the task to the top level; an omitted
            // parentID leaves it where it is.
            if (dto.ParentIDSpecified && dto.ParentID != task.ParentID)
            {
                if (dto.ParentID.HasValue)
                {
                    await EnsureValidParentAsync(task.ID, dto.ParentID.Value);
                }

                task.ParentID = dto.ParentID;
                // Append to the end of its new sibling group.
                task.Order = (await _context.Tasks
                    .Where(t => t.ParentID == dto.ParentID && t.ID != task.ID)
                    .Select(t => (int?)t.Order)
                    .MaxAsync() ?? -1) + 1;
            }

            if (!string.IsNullOrEmpty(dto.Name))
                task.Name = dto.Name;

            if (dto.Description != null)
                task.Description = dto.Description;

            if (dto.Start.HasValue && dto.Start.Value != default)
                task.Start = dto.Start.Value;

            if (dto.End.HasValue)
                task.End = dto.End;

            if (dto.TimeTaken.HasValue)
                task.TimeTaken = dto.TimeTaken;

            if (dto.StateID.HasValue && dto.StateID.Value != 0)
                task.StateID = dto.StateID.Value;

            await _context.SaveChangesAsync();
            return MapToDto(task);
        }

        // A task can't be its own parent or be nested under one of its own subtasks.
        private async Task EnsureValidParentAsync(int taskId, int parentId)
        {
            if (parentId == taskId)
                throw new ArgumentException("A task cannot be its own parent.");

            var parent = await _context.Tasks.FindAsync(parentId);
            if (parent == null)
                throw new ArgumentException("Parent task not found.");

            var ancestorId = parent.ParentID;
            while (ancestorId.HasValue)
            {
                if (ancestorId.Value == taskId)
                    throw new ArgumentException("A task cannot be moved under one of its own subtasks.");
                ancestorId = await _context.Tasks
                    .Where(t => t.ID == ancestorId.Value)
                    .Select(t => t.ParentID)
                    .FirstOrDefaultAsync();
            }
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
                StateID = task.StateID,
                Order = task.Order
            };
        }
    }
}
