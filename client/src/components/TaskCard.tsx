import { useState } from 'react';
import styled from 'styled-components';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../types';
import TaskModal from './TaskModal';
import { updateTask, deleteTask } from '../services/api';

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
}

const CardContainer = styled.div<{ isDragging: boolean; priority: string }>`
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: grab;
  box-shadow: ${props => props.isDragging 
    ? '0 8px 16px rgba(0,0,0,0.1)' 
    : '0 1px 3px rgba(0,0,0,0.12)'};
  transition: all 0.2s ease;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'High':
        return '#ef5350';
      case 'Medium':
        return '#ffa726';
      case 'Low':
        return '#66bb6a';
      default:
        return '#90a4ae';
    }
  }};
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transform: translateY(-1px);
    
    .task-actions {
      opacity: 1;
    }
  }

  &:active {
    cursor: grabbing;
    transform: scale(1.02);
  }
`;

const TaskActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  &.edit {
    color: #1976d2;
    &:hover {
      background: #e3f2fd;
      border-color: #1976d2;
    }
  }

  &.delete {
    color: #d32f2f;
    &:hover {
      background: #ffebee;
      border-color: #d32f2f;
    }
  }
`;

const Title = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
  line-height: 1.4;
  padding-right: 60px;
`;

const Description = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;

  &[data-truncated="true"] {
    cursor: help;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Priority = styled.span<{ priority: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.priority) {
      case 'High':
        return '#ffebee';
      case 'Medium':
        return '#fff3e0';
      case 'Low':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'High':
        return '#d32f2f';
      case 'Medium':
        return '#f57c00';
      case 'Low':
        return '#388e3c';
      default:
        return '#757575';
    }
  }};
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(0.95);
  }
`;

const StoryPoints = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #bbdefb;
  }
`;

const Assignee = styled.span`
  color: #616161;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f5f5f5;
  transition: all 0.2s ease;

  &:before {
    content: '👤';
  }

  &:hover {
    background: #eeeeee;
  }
`;

const Labels = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const Label = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onTaskUpdate, onTaskDelete }) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const isDescriptionTruncated = task.description.length > 100;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        onTaskDelete?.(task);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleTaskUpdate = async (updatedTaskData: Partial<Task>) => {
    try {
      const response = await updateTask(task._id, updatedTaskData);
      onTaskUpdate?.(response.data);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <CardContainer
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            priority={task.priority}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            aria-label={`Task: ${task.title}`}
            role="article"
          >
            <TaskActions className="task-actions">
              <ActionButton 
                className="edit" 
                onClick={handleEdit}
                title="Edit task"
                aria-label="Edit task"
              >
                ✏️
              </ActionButton>
              <ActionButton 
                className="delete" 
                onClick={handleDelete}
                title="Delete task"
                aria-label="Delete task"
              >
                🗑️
              </ActionButton>
            </TaskActions>
            
            <Title>{task.title}</Title>
            <Description 
              data-truncated={isDescriptionTruncated}
              title={isDescriptionTruncated ? task.description : undefined}
              aria-label={`Task description: ${task.description}`}
            >
              {task.description}
            </Description>
            <Meta>
              <Priority 
                priority={task.priority}
                title={`Priority: ${task.priority}`}
                role="status"
              >
                {task.priority}
              </Priority>
              {task.storyPoints > 0 && (
                <StoryPoints title="Story Points" role="status">
                  {task.storyPoints} pts
                </StoryPoints>
              )}
              <Assignee title={`Assigned to: ${task.assignee}`} role="status">
                {task.assignee}
              </Assignee>
            </Meta>
            {task.labels && task.labels.length > 0 && (
              <Labels role="group" aria-label="Task labels">
                {task.labels.map((label) => (
                  <Label key={label} title={label}>
                    {label}
                  </Label>
                ))}
              </Labels>
            )}
          </CardContainer>
        )}
      </Draggable>
      
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleTaskUpdate}
        task={task}
        laneId={task.lane}
      />
    </>
  );
};

export default TaskCard;
