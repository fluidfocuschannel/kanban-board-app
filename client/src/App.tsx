import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { BoardProvider } from './context/BoardContext';
import { GlobalStyle } from './styles/GlobalStyle';
import Board from './components/Board';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import type { Board as BoardType } from './types';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);

  const handleBoardSelect = (board: BoardType) => {
    setSelectedBoard(board);
    setCurrentView('board');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedBoard(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Header 
        onBoardCreated={handleBackToDashboard}
        showBackButton={currentView === 'board'}
        onBackClick={handleBackToDashboard}
        currentBoard={selectedBoard}
      />
      {currentView === 'dashboard' ? (
        <Dashboard onBoardSelect={handleBoardSelect} />
      ) : (
        <BoardProvider>
          <Board selectedBoard={selectedBoard} />
        </BoardProvider>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
