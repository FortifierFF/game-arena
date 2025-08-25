import React from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessBoardWrapperProps {
  fen: string;
  playerColor: 'white' | 'black';
  onPieceDragBegin: (data: { piece: unknown; square: string | null; isSparePiece: boolean }) => void;
  onDrop: (data: { sourceSquare: string; targetSquare: string | null }) => boolean;
  onSquareClick: () => void;
}

export default function ChessBoardWrapper({
  fen,
  playerColor,
  onPieceDragBegin,
  onDrop,
  onSquareClick
}: ChessBoardWrapperProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="w-150 h-150"> {/* Fixed size container */}
        <Chessboard 
          options={{
            position: fen,
            boardOrientation: playerColor === 'white' ? 'white' : 'black',
            onSquareClick: onSquareClick,
            onPieceDrag: onPieceDragBegin,
            onPieceDrop: ({ sourceSquare, targetSquare }) => onDrop({ sourceSquare, targetSquare }),
            boardStyle: { borderRadius: 8 }
          }}
        />
      </div>
    </div>
  );
} 