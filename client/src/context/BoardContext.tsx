import React, { createContext, useContext, useState } from 'react';
import type { Board, Lane, Task } from '../types';

interface BoardContextType {
  board: Board | null;
  setBoard: (board: Board) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <BoardContext.Provider value={{ board, setBoard, loading, setLoading, error, setError }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

// Re-export types for convenience
export type { Board, Lane, Task };
