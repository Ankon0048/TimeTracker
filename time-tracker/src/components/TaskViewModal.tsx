import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Task } from '../services/api';
import { Edit2, Save, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface TaskViewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ task, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) {
      setEditData(task);
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    try {
      // Always include description so the backend receives it even if unchanged
      const payload: Partial<Task> = {
        ...editData,
        description: editData.description ?? task.description ?? '',
      };
      const updated = await api.updateTask(task.id, payload);
      onUpdate(updated);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    setEditData(task);
    setIsEditing(false);
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const readonlyInputStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    color: 'var(--text-primary)',
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <div className="card flex-col gap-4" style={{ width: '540px', backgroundColor: 'var(--bg-primary)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex-row justify-between items-center">
          <h3>Task Details</h3>
          <button className="btn btn-icon" onClick={onClose} type="button">&times;</button>
        </div>

        <div className="flex-col gap-4">
          {/* Name */}
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="input"
              value={isEditing ? editData.name || '' : task.name}
              onChange={e => handleChange('name', e.target.value)}
              disabled={!isEditing}
              style={!isEditing ? readonlyInputStyle : {}}
            />
          </div>

          {/* Description — rich text */}
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <RichTextEditor
              value={isEditing ? (editData.description || '') : (task.description || '')}
              onChange={html => handleChange('description', html)}
              disabled={!isEditing}
              placeholder="Enter task description…"
            />
          </div>

          {/* Start & End dates — vertically aligned */}
          <div className="flex-col gap-2">
            <label className="text-sm font-medium">Start Date (ISO)</label>
            <input
              type="text"
              className="input"
              value={isEditing ? editData.start || '' : new Date(task.start).toLocaleString()}
              onChange={e => handleChange('start', e.target.value)}
              disabled={!isEditing}
              style={!isEditing ? readonlyInputStyle : {}}
            />
          </div>

          <div className="flex-col gap-2">
            <label className="text-sm font-medium">End Date (ISO)</label>
            <input
              type="text"
              className="input"
              value={isEditing ? editData.end || '' : (task.end ? new Date(task.end).toLocaleString() : 'N/A')}
              onChange={e => handleChange('end', e.target.value)}
              disabled={!isEditing}
              style={!isEditing ? readonlyInputStyle : {}}
            />
          </div>

          {/* Actions */}
          <div className="flex-row justify-end gap-2 mt-4">
            {!isEditing ? (
              <button className="btn btn-icon" onClick={() => setIsEditing(true)} title="Edit">
                <Edit2 size={10} />
              </button>
            ) : (
              <>
                <button
                  className="btn btn-icon"
                  onClick={handleSave}
                  title="Save"
                  style={{ color: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                >
                  <Save size={10} />
                </button>
                <button
                  className="btn btn-icon"
                  onClick={handleCancel}
                  title="Cancel"
                  style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                >
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
