import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  task?: Task;
  laneId: string;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: var(--primary-color);
    color: white;

    &:hover {
      background: #1976d2;
    }
  ` : `
    background: #e1e4e8;
    color: #24292e;

    &:hover {
      background: #d1d5da;
    }
  `}
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  min-height: 42px;
`;

const Tag = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  button {
    border: none;
    background: none;
    color: #64748b;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    line-height: 1;

    &:hover {
      color: #ef4444;
    }
  }
`;

const TagInputField = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 120px;
  font-size: 14px;
`;

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task, laneId }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    assignee: '',
    storyPoints: 0,
    labels: [],
    lane: laneId,
    position: 0,
  });

  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        assignee: '',
        storyPoints: 0,
        labels: [],
        lane: laneId,
        position: 0,
      });
    }
    // Reset newLabel when modal opens/closes
    setNewLabel('');
  }, [task, laneId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleAddLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newLabel.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        labels: [...(prev.labels || []), newLabel.trim()],
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels?.filter(label => label !== labelToRemove) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              required
            />
          </FormGroup>

          <InputGroup>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </FormGroup>

            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="storyPoints">Story Points</Label>
              <Input
                type="number"
                id="storyPoints"
                name="storyPoints"
                value={formData.storyPoints}
                onChange={handleNumberChange}
                min="0"
                max="100"
              />
            </FormGroup>
          </InputGroup>

          <FormGroup>
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              placeholder="Enter assignee name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Labels</Label>
            <TagInput>
              {formData.labels?.map(label => (
                <Tag key={label}>
                  {label}
                  <button type="button" onClick={() => handleRemoveLabel(label)}>&times;</button>
                </Tag>
              ))}
              <TagInputField
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={handleAddLabel}
                placeholder="Type and press Enter"
              />
            </TagInput>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TaskModal;
