import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getAllBoards, createBoard } from '../services/api';
import type { Board } from '../types';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const BoardCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const BoardName = styled.h3`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const BoardDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const BoardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #888;
`;

const CreateBoardCard = styled.div`
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  min-height: 150px;

  &:hover {
    border-color: #667eea;
    background: #f0f2ff;
  }
`;

const CreateBoardIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const CreateBoardText = styled.span`
  color: #667eea;
  font-weight: 500;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  color: #333;
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SwimlaneSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SwimlaneList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SwimlaneItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SwimlaneInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background: #c0392b;
  }
`;

const AddButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #229954;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const CancelButton = styled(Button)`
  background: #95a5a6;
  color: white;

  &:hover {
    background: #7f8c8d;
  }
`;

const CreateButton = styled(Button)`
  background: #27ae60;
  color: white;

  &:hover {
    background: #229954;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  font-size: 1.1rem;
`;

interface DashboardProps {
  onBoardSelect: (board: Board) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBoardSelect }) => {
  const { isAdmin } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardData, setBoardData] = useState({
    name: '',
    description: '',
    swimlanes: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done']
  });
  const [creating, setCreating] = useState(false);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await getAllBoards();
      setBoards(response.data);
    } catch (error) {
      setError('Failed to fetch boards');
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBoardData({
      ...boardData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwimlaneChange = (index: number, value: string) => {
    const newSwimlanes = [...boardData.swimlanes];
    newSwimlanes[index] = value;
    setBoardData({
      ...boardData,
      swimlanes: newSwimlanes
    });
  };

  const addSwimlane = () => {
    setBoardData({
      ...boardData,
      swimlanes: [...boardData.swimlanes, '']
    });
  };

  const removeSwimlane = (index: number) => {
    if (boardData.swimlanes.length > 1) {
      const newSwimlanes = boardData.swimlanes.filter((_, i) => i !== index);
      setBoardData({
        ...boardData,
        swimlanes: newSwimlanes
      });
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await createBoard({
        name: boardData.name,
        description: boardData.description,
        swimlanes: boardData.swimlanes.filter(lane => lane.trim() !== '')
      });
      setShowCreateModal(false);
      setBoardData({
        name: '',
        description: '',
        swimlanes: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done']
      });
      await fetchBoards();
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading boards...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <>
      <DashboardContainer>
        <Title>My Boards</Title>
        <BoardsGrid>
          {isAdmin && (
            <CreateBoardCard onClick={() => setShowCreateModal(true)}>
              <CreateBoardIcon>+</CreateBoardIcon>
              <CreateBoardText>Create New Board</CreateBoardText>
            </CreateBoardCard>
          )}
          {boards.map((board) => (
            <BoardCard key={board._id} onClick={() => onBoardSelect(board)}>
              <BoardName>{board.name}</BoardName>
              <BoardDescription>{board.description}</BoardDescription>
              <BoardMeta>
                <span>{board.lanes?.length || 0} lanes</span>
                <span>Created by {board.createdBy?.username || 'Unknown'}</span>
              </BoardMeta>
            </BoardCard>
          ))}
        </BoardsGrid>
      </DashboardContainer>

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New Board</ModalTitle>
            <form onSubmit={handleCreateBoard}>
              <FormGroup>
                <Label htmlFor="name">Board Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={boardData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={boardData.description}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <SwimlaneSection>
                <Label>Swimlanes</Label>
                <SwimlaneList>
                  {boardData.swimlanes.map((swimlane, index) => (
                    <SwimlaneItem key={index}>
                      <SwimlaneInput
                        type="text"
                        value={swimlane}
                        onChange={(e) => handleSwimlaneChange(index, e.target.value)}
                        placeholder={`Swimlane ${index + 1}`}
                        required
                      />
                      {boardData.swimlanes.length > 1 && (
                        <RemoveButton
                          type="button"
                          onClick={() => removeSwimlane(index)}
                        >
                          Remove
                        </RemoveButton>
                      )}
                    </SwimlaneItem>
                  ))}
                </SwimlaneList>
                <AddButton type="button" onClick={addSwimlane}>
                  Add Swimlane
                </AddButton>
              </SwimlaneSection>

              <ModalActions>
                <CancelButton type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </CancelButton>
                <CreateButton type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Board'}
                </CreateButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Dashboard;
