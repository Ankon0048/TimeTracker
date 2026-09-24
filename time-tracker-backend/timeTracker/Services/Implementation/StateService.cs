using Microsoft.EntityFrameworkCore;
using timeTracker.Models.DataModel;
using timeTracker.Models.DTOs;
using timeTracker.Services.Interfaces;

namespace timeTracker.Services.Implementation
{
    public class StateService : IStateService
    {
        private readonly AppDbContext _context;

        public StateService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<StateDto> CreateStateAsync(CreateStateDto dto)
        {
            var state = new State { Name = dto.Name };
            _context.States.Add(state);
            await _context.SaveChangesAsync();

            return new StateDto { ID = state.ID, Name = state.Name };
        }

        public async Task<bool> DeleteStateAsync(int id)
        {
            var state = await _context.States.FindAsync(id);
            if (state == null) return false;

            _context.States.Remove(state);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<StateDto>> GetAllStatesAsync()
        {
            return await _context.States
                .Select(s => new StateDto { ID = s.ID, Name = s.Name })
                .ToListAsync();
        }

        public async Task<StateDto?> UpdateStateAsync(int id, CreateStateDto dto)
        {
            var state = await _context.States.FindAsync(id);
            if (state == null) return null;

            state.Name = dto.Name;
            await _context.SaveChangesAsync();

            return new StateDto { ID = state.ID, Name = state.Name };
        }
    }
}
