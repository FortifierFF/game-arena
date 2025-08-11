import { Button } from '@/components/ui/button';
import { getSquareColor } from '@/lib/gameUtils';
import Image from 'next/image';

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface PromotionPickerProps {
  onSelect: (p: PromotionPiece) => void;
  pieceColor: 'w' | 'b'; // 'w' for white, 'b' for black
  targetSquare: string; // The square where the pawn is promoting
}

export default function PromotionPicker({ onSelect, pieceColor, targetSquare }: PromotionPickerProps) {
  // Determine the square color (w for white/light square, b for black/dark square)
  const squareColor = getSquareColor(targetSquare);
  
  // Calculate the position of the target square on the chessboard
  // Chess board is 8x8, each square is roughly 60px (assuming standard chess board size)
  const getSquarePosition = (square: string) => {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7 for a-h
    const rankChar = square[1];
    if (!rankChar) return { left: 0, top: 0 };
    
    const rank = parseInt(rankChar) - 1; // 0-7 for 1-8
    
    // Calculate pixel positions (assuming 60px per square)
    const left = file * 60; // Left position from left edge of board
    const top = (7 - rank) * 60; // Top position from top edge of board (ranks are inverted)
    
    return { left, top };
  };
  
  const squarePos = getSquarePosition(targetSquare);
  
  // Create the image filename pattern: [color-piece][piece][color-square]s
  // Example: wqbs = White queen on black square
  const getImageFilename = (piece: PromotionPiece): string => {
    // Map promotion pieces to their chess piece types
    const pieceMap: Record<PromotionPiece, string> = {
      'q': 'q', // queen
      'r': 'r', // rook  
      'b': 'b', // bishop
      'n': 'k'  // knight (note: 'k' in filename represents knight, not king)
    };
    
    return `${pieceColor}${pieceMap[piece]}${squareColor}s`;
  };

  console.log(getImageFilename('q'));

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        className="absolute bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg w-80"
        style={{
          left: `calc(50% - 400px + ${squarePos.left - 40}px)`,
          top: `calc(50% - 300px + ${squarePos.top + 60}px)`,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Promotion piece options with images */}
        <div className="flex flex-row gap-2">
          {/* Queen */}
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => onSelect('q')}
            className="h-20 flex flex-col gap-1 items-center justify-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Image
              src={`/images/chess/${getImageFilename('q')}.jpg`}
              alt="Queen"
              width={48}
              height={48}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Queen</span>
          </Button>
          
          {/* Rook */}
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => onSelect('r')}
            className="h-20 flex flex-col gap-1 items-center justify-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Image
              src={`/images/chess/${getImageFilename('r')}.jpg`}
              alt="Rook"
              width={48}
              height={48}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Rook</span>
          </Button>
          
          {/* Bishop */}
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => onSelect('b')}
            className="h-20 flex flex-col gap-1 items-center justify-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Image
              src={`/images/chess/${getImageFilename('b')}.jpg`}
              alt="Bishop"
              width={48}
              height={48}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Bishop</span>
          </Button>
          
          {/* Knight */}
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => onSelect('n')}
            className="h-20 flex flex-col gap-1 items-center justify-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Image
              src={`/images/chess/${getImageFilename('n')}.jpg`}
              alt="Knight"
              width={48}
              height={48}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Knight</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 