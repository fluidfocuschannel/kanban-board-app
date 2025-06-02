import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { createBoard } from '../services/api';
import type { Board } from '../types';

const HeaderContainer = styled.header`
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #ecf0f1;
  cursor: pointer;
`;

const BackButton = styled.button`
  background: #34495e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background: #2c3e50;
  }
`;

const BoardTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #bdc3c7;
  font-weight: normal;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Username = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
`;

const Role = styled.span`
  font-size: 0.8rem;
  color: #bdc3c7;
  text-transform: capitalize;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const LogoutButton = styled(Button)`
  background: #e74c3c;

  &:hover {
    background: #c0392b;
  }
`;

const CreateBoardButton = styled(Button)`
  background: #27ae60;

  &:hover {
    background: #229954;
  }
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
    border-color: #3498db;
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
    border-color: #3498db;
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

const CancelButton = styled(Button)`
  background: #95a5a6;

  &:hover {
    background: #7f8c8d;
  }
`;

interface HeaderProps {
  onBoardCreated?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentBoard?: Board | null;
}

const Header: React.FC<HeaderProps> = ({ 
  onBoardCreated, 
  showBackButton = false, 
  onBackClick,
  currentBoard 
}) => {
  const { user, logout, isAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardData, setBoardData] = useState({
    name: '',
    description: '',
    swimlanes: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done']
  });
  const [loading, setLoading] = useState(false);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      if (onBoardCreated) {
        onBoardCreated();
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleLogoClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <>
      <HeaderContainer>
        <LeftSection>
          {showBackButton && onBackClick && (
            <BackButton onClick={onBackClick}>
              ← Back to Dashboard
            </BackButton>
          )}
          <Logo onClick={handleLogoClick}>Kanban Board</Logo>
          {currentBoard && (
            <BoardTitle>{currentBoard.name}</BoardTitle>
          )}
        </LeftSection>
        <UserSection>
          {isAdmin && !showBackButton && (
            <CreateBoardButton onClick={() => setShowCreateModal(true)}>
              Create New Board
            </CreateBoardButton>
          )}
          <UserInfo>
            <Username>{user?.username}</Username>
            <Role>{user?.role}</Role>
          </UserInfo>
          <LogoutButton onClick={logout}>Logout</LogoutButton>
        </UserSection>
      </HeaderContainer>

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
                <CreateBoardButton type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Board'}
                </CreateBoardButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Header;
