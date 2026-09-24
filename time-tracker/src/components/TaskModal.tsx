import React, { useState } from 'react';
import { api } from '../services/api';
import type { Task } from '../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: number | null;
  projectId: number;
  onSuccess: (newTask: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, parentId, projectId, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [timeTaken, setTimeTaken] = useState('00:00:00');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const newTask = await api.createTask({
        parentID: parentId,
        projectID: projectId,
        name,
        description,
        start: start || new Date().toISOString(),
        end: end || null,
        timeTaken
      });
      onSuccess(newTask);
      
      // Reset form for potential successive opens
      setName('');
      setDescription('');
      setStart('');
      setEnd('');
      setTimeTaken('00:00:00');
    } catch (e) {
      console.error(e);
      // Depending on setup, might want to use ToastContext here, but keeping it simple
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card flex-col gap-4" style={{ width: '400px', backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex-row justify-between items-center">
          <h3>Create {parentId ? 'Child Task' : 'Task'}</h3>
          <button className="btn btn-icon" onClick={onClose} type="button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">Name</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <input type="text" className="input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">Start Date (ISO)</label>
            <input type="text" className="input" value={start} onChange={e => setStart(e.target.value)} placeholder={new Date().toISOString()} />
          </div>
          
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">End Date (ISO)</label>
            <input type="text" className="input" value={end} onChange={e => setEnd(e.target.value)} placeholder="Optional" />
          </div>

          <div className="flex-row justify-end gap-2 mt-4">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};
