import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useBoard } from '../hooks/useBoard';
import type { Lane as LaneType, Task, Board as BoardType } from '../types';
import Lane from './Lane';
import { moveTask, getBoardById } from '../services/api';
import { sseService } from '../services/sse';

const BoardContainer = styled.div`
  padding: 16px;
  min-height: 100vh;
  max-width: 100vw;
  overflow: hidden;

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
    color: var(--text-primary);
    
    @media (max-width: 768px) {
      font-size: 20px;
      margin-bottom: 16px;
    }
  }
`;

const LanesContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 4px 20px 4px;
  overflow-x: auto;
  min-height: calc(100vh - 100px);
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
    
    &:hover {
      background: #bbb;
    }
  }

  /* Add padding for mobile to show there are more lanes */
  @media (max-width: 768px) {
    &::after {
      content: '';
      padding-right: 16px;
    }
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #666;
`;

interface BoardProps {
  selectedBoard?: BoardType | null;
}

const Board: React.FC<BoardProps> = ({ selectedBoard }) => {
  const { board, setBoard } = useBoard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load the selected board data
  useEffect(() => {
    const loadBoard = async () => {
      if (selectedBoard) {
        setLoading(true);
        try {
          const response = await getBoardById(selectedBoard._id);
          setBoard(response.data);
        } catch (error) {
          setError('Failed to load board');
          console.error('Error loading board:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadBoard();
  }, [selectedBoard, setBoard]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !board) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const sourceLaneId = result.source.droppableId;
    const destinationLaneId = result.destination.droppableId;

    // Find the source and destination lanes
    const sourceLane = board.lanes.find(lane => lane._id === sourceLaneId);
    const destinationLane = board.lanes.find(lane => lane._id === destinationLaneId);

    if (!sourceLane || !destinationLane) return;

    // Create new arrays for the updated lanes
    const newSourceTasks = Array.from(sourceLane.tasks);
    const newDestTasks = sourceLaneId === destinationLaneId 
      ? newSourceTasks 
      : Array.from(destinationLane.tasks);

    // Get the task being moved
    const [movedTask] = newSourceTasks.splice(sourceIndex, 1);

    // Insert the task at the new position
    if (sourceLaneId === destinationLaneId) {
      newSourceTasks.splice(destinationIndex, 0, movedTask);
    } else {
      newDestTasks.splice(destinationIndex, 0, movedTask);
    }

    // Update the board state optimistically
    const newLanes = board.lanes.map(lane => {
      if (lane._id === sourceLaneId) {
        return { ...lane, tasks: newSourceTasks };
      }
      if (lane._id === destinationLaneId) {
        return { ...lane, tasks: newDestTasks };
      }
      return lane;
    });

    setBoard({ ...board, lanes: newLanes });

    // Update the backend
    try {
      await moveTask(movedTask._id, {
        laneId: destinationLaneId,
        position: destinationIndex,
      });
    } catch (error) {
      console.error('Error moving task:', error);
      // TODO: Revert the optimistic update if the API call fails
    }
  };

  const handleTaskAdded = (task: Task) => {
    if (!board) return;

    const newLanes = board.lanes.map(lane => {
      if (lane._id === task.lane) {
        return {
          ...lane,
          tasks: [...lane.tasks, task]
        };
      }
      return lane;
    });

    setBoard({ ...board, lanes: newLanes });
  };

  const handleTaskUpdated = (updatedTask: Task, newLaneId?: string, newPosition?: number) => {
    if (!board) return;

    const newLanes = board.lanes.map(lane => {
      // If task was moved to a different lane
      if (newLaneId && lane._id === newLaneId) {
        const tasks = [...lane.tasks];
        if (typeof newPosition === 'number') {
          tasks.splice(newPosition, 0, updatedTask);
        } else {
          tasks.push(updatedTask);
        }
        return { ...lane, tasks };
      }

      // Update task in its current lane
      if (lane._id === updatedTask.lane) {
        return {
          ...lane,
          tasks: lane.tasks.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          )
        };
      }

      // Remove task from old lane if it was moved
      if (newLaneId) {
        return {
          ...lane,
          tasks: lane.tasks.filter(task => task._id !== updatedTask._id)
        };
      }

      return lane;
    });

    setBoard({ ...board, lanes: newLanes });
  };

  const handleTaskDeleted = (deletedTask: Task) => {
    if (!board) return;

    const newLanes = board.lanes.map(lane => ({
      ...lane,
      tasks: lane.tasks.filter(task => task._id !== deletedTask._id)
    }));

    setBoard({ ...board, lanes: newLanes });
  };

  useEffect(() => {
    if (board) {
      sseService.connect({
        onTaskCreate: handleTaskAdded,
        onTaskUpdate: handleTaskUpdated,
        onTaskDelete: handleTaskDeleted,
      });
    }

    return () => {
      sseService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  if (loading) {
    return <LoadingMessage>Loading board...</LoadingMessage>;
  }

  if (error) {
    return <LoadingMessage>Error: {error}</LoadingMessage>;
  }

  if (!board) {
    return <LoadingMessage>No board selected</LoadingMessage>;
  }

  return (
    <BoardContainer>
      <DragDropContext onDragEnd={handleDragEnd}>
        <LanesContainer>
          {board.lanes.map((lane: LaneType) => (
            <Lane 
              key={lane._id} 
              lane={lane} 
              onTaskAdded={handleTaskAdded}
            />
          ))}
        </LanesContainer>
      </DragDropContext>
    </BoardContainer>
  );
};

export default Board;
