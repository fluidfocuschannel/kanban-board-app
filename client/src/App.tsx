import { useEffect } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { GlobalStyle } from './styles/GlobalStyle';
import Board from './components/Board';
import { getAllBoards } from './services/api';

const BoardContent = () => {
  const { setBoard, loading, setLoading, error, setError } = useBoard();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const response = await getAllBoards();
        if (response.data.length > 0) {
          setBoard(response.data[0]); // For now, just use the first board
        }
      } catch (error) {
        setError('Failed to fetch board data');
        console.error('Error fetching board:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [setBoard, setLoading, setError]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <Board />;
};

function App() {
  return (
    <BoardProvider>
      <GlobalStyle />
      <BoardContent />
    </BoardProvider>
  );
}

export default App;
