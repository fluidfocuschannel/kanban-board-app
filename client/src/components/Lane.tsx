import { useState } from 'react';
import styled from 'styled-components';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import type { Lane as LaneType, Task } from '../types';
import { createTask } from '../services/api';

interface LaneProps {
  lane: LaneType;
  onTaskAdded: (task: Task) => void;
}

const LaneContainer = styled.div`
  background: #f4f5f7;
  border-radius: 8px;
  min-width: 280px;
  max-width: 280px;
  height: fit-content;
  display: flex;  flex-direction: column;
`;

const LaneHeader = styled.div`
  padding: 12px;
  background: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddTaskButton = styled.button`
  background: none;
  border: none;
  color: #586069;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  &:hover {
    background: #f6f8fa;
    color: var(--primary-color);
  }

  &:active {
    background: #eef1f3;
  }
`;

const LaneTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskCount = styled.span`
  background: #e1e4e8;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  color: #586069;
`;

const TaskList = styled.div<{ isDraggingOver: boolean }>`
  padding: 8px;
  flex-grow: 1;
  min-height: 100px;
  height: calc(100vh - 200px);
  overflow-y: auto;
  background-color: ${props => props.isDraggingOver ? '#e1e4e8' : '#f4f5f7'};
  transition: background-color 0.2s ease;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
    
    &:hover {
      background: #bbb;
    }
  }
`;

const Lane: React.FC<LaneProps> = ({ lane, onTaskAdded }) => {
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    try {
      const response = await createTask(taskData);
      onTaskAdded(response.data);
      setTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      // TODO: Show error notification
    }
  };

  return (
    <LaneContainer>
      <LaneHeader>
        <LaneTitle>
          {lane.name}
          <TaskCount>{lane.tasks.length}</TaskCount>
        </LaneTitle>
        <AddTaskButton
          onClick={() => setTaskModalOpen(true)}
          title="Add new task"
          aria-label="Add new task"
        >
          +
        </AddTaskButton>
      </LaneHeader>
      <Droppable droppableId={lane._id}>
        {(provided, snapshot) => (
          <TaskList
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {lane.tasks.map((task, index) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                index={index}
                onTaskUpdate={(updatedTask: Task) => {
                  // Task updates are handled by SSE in Board component
                  console.log('Task updated:', updatedTask);
                }}
                onTaskDelete={(deletedTask: Task) => {
                  // Task deletions are handled by SSE in Board component
                  console.log('Task deleted:', deletedTask);
                }}
              />
            ))}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        laneId={lane._id}
      />
    </LaneContainer>
  );
};

export default Lane;
