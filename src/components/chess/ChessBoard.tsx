/**
 * Chess Board Component
 * Interactive board using chess.js and react-chessboard, wired to Stockfish Worker
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChessGame } from '@/hooks/useChessGame';
import PromotionPicker, { PromotionPiece } from './PromotionPicker';
import { MoveLog } from './MoveLog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Icon from '@/components/ui/Icon';

export default function ChessBoard() {
  const { gameState, error, changeDifficulty, resetGame, logMoveWithPiece, moveLog, getMoveLog, goBack, goForward, canGoBack, canGoForward } = useChessGame();

  // Local game model managed by chess.js for legality + FEN
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [thinking, setThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Promotion UI state
  const [pendingPromotion, setPendingPromotion] = useState<null | { from: string; to: string; pieceColor: 'w' | 'b' }>(null);

  // Manual mode: control both sides, engine disabled
  const [manualMode, setManualMode] = useState(false);

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
    { value: 'master', label: 'Master' },
  ] as const;

  // Initialize worker on mount
  useEffect(() => {
    // Dynamic import to ensure client-only
    const w = new Worker(new URL('../../workers/stockfish.worker.ts', import.meta.url));
    workerRef.current = w;
    w.onmessage = (e: MessageEvent<string>) => {
      const message = e.data || '';
      if (!message) return;

      if (message.startsWith('readyok')) {
        // ignore; used internally as sync point
        return;
      }

      if (message.startsWith('bestmove')) {
        const uci = (message.split(' ')[1] || '').toString();
        applyUciMove(uci);
        setThinking(false);
      }
    };
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  // When resetting from outside, also reset chess.js
  useEffect(() => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
  }, [resetGame]);

  function sendToEngine(cmd: string) {
    workerRef.current?.postMessage(cmd);
  }

  // Apply UCI move to chess.js
  function applyUciMove(uci: string) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promo = uci.slice(4, 5);
    const moveParams: { from: string; to: string; promotion?: string } = { from, to };
    if (promo) moveParams.promotion = promo;
    const result = chessRef.current.move(moveParams);
    if (result) {
      const newFen = chessRef.current.fen();
      setFen(newFen);
      // Log the engine move with piece type from the move result
      const pieceType = getPieceTypeFromMove(result);
      logMoveWithPiece(from, to, pieceType, newFen);
    }
  }

  // Helper function to get piece type from chess.js move result
  function getPieceTypeFromMove(moveResult: { piece: string }): string {
    const pieceMap: Record<string, string> = {
      'p': 'pawn', 'P': 'pawn',
      'r': 'rook', 'R': 'rook',
      'n': 'knight', 'N': 'knight',
      'b': 'bishop', 'B': 'bishop',
      'q': 'queen', 'Q': 'queen',
      'k': 'king', 'K': 'king'
    };
    return pieceMap[moveResult.piece] || 'unknown';
  }

  // Human makes a move (sync return for library)
  const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; }) => {
    if (thinking) return false; // Block while engine is thinking
    if (!targetSquare || sourceSquare === targetSquare) return false;

    // Only allow moving piece whose color matches side to move
    const piece = chessRef.current.get(sourceSquare as Square);
    if (!piece || chessRef.current.turn() !== piece.color) return false;
    if (!manualMode && piece.color !== 'w') return false; // vs engine: only white moves

    // Detect potential promotion for both colors
    const isPawn = piece.type === 'p';
    const targetRank = (targetSquare || '').slice(1);
    const needsPromotion = isPawn && ((piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1'));

    if (needsPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, pieceColor: piece.color });
      return false; // Don't make the move yet
    }

    // Make the move
    const result = chessRef.current.move({ from: sourceSquare, to: targetSquare });
    if (result) {
      const newFen = chessRef.current.fen();
      setFen(newFen);
      // Log the human move with piece type from the move result
      const pieceType = getPieceTypeFromMove(result);
      logMoveWithPiece(sourceSquare, targetSquare, pieceType, newFen);
      
      // If vs engine and it's now black's turn, trigger engine
      if (!manualMode && chessRef.current.turn() === 'b') {
        triggerEngine();
      }
    }
    return result !== null;
  };

  function confirmPromotion(piece: PromotionPiece | null) {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);

    if (!piece) return; // Cancelled

    const result = chessRef.current.move({ from, to, promotion: piece });
    if (result) {
      const newFen = chessRef.current.fen();
      setFen(newFen);
      // Log the promoted move with piece type from the move result
      const pieceType = getPieceTypeFromMove(result);
      logMoveWithPiece(from, to, pieceType, newFen);
      
      // If vs engine and it's now black's turn, trigger engine
      if (!manualMode && chessRef.current.turn() === 'b') {
        triggerEngine();
      }
    }
  }

  function triggerEngine() {
    if (manualMode) {
      return;
    }

    setThinking(true);
    sendToEngine('stop');
    const skillMap: Record<string, number> = { beginner: 0, easy: 5, medium: 10, hard: 15, expert: 20, master: 20 };
    const timeMap: Record<string, number> = { beginner: 400, easy: 700, medium: 1200, hard: 1800, expert: 2500, master: 3500 };
    sendToEngine('ucinewgame');
    sendToEngine(`setoption name Skill Level value ${skillMap[gameState.difficulty] ?? 10}`);
    sendToEngine('setoption name MultiPV value 1');
    sendToEngine(`position fen ${chessRef.current.fen()}`);
    sendToEngine(`go movetime ${timeMap[gameState.difficulty] ?? 1200}`);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>♔ Chess vs Stockfish</span>
            <div className="flex items-center gap-3 text-sm">
              {/* Turn indicator */}
              <span className="text-gray-600 dark:text-gray-300">
                {thinking ? 'Engine thinking…' : (chessRef.current.turn() === 'w' ? 'Your turn' : 'Engine turn')}
              </span>
              
              {/* FEN box moved to top right */}
              
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Board */}
            <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <Chessboard
                options={{
                  id: 'game-board',
                  position: fen,
                  boardOrientation: 'white',
                  canDragPiece: ({ square }) => {
                    if (thinking) return false;
                    const p = chessRef.current.get(square as Square);
                    if (!p) return false;
                    if (manualMode) {
                      // In manual mode, you can move the side to move
                      return chessRef.current.turn() === p.color;
                    }
                    // Vs engine: only white, on white's turn
                    return p.color === 'w' && chessRef.current.turn() === 'w';
                  },
                  onPieceDrop: ({ sourceSquare, targetSquare }) => onDrop({ sourceSquare, targetSquare }),
                  boardStyle: { borderRadius: 8 },
                  darkSquareStyle: { backgroundColor: '#2b3546' },
                  lightSquareStyle: { backgroundColor: '#e8edf9' },
                }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Mode</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={manualMode ? 'default' : 'outline'}
                    onClick={() => setManualMode(true)}
                  >
                    Manual (both sides)
                  </Button>
                  <Button
                    size="sm"
                    variant={!manualMode ? 'default' : 'outline'}
                    onClick={() => setManualMode(false)}
                  >
                    Vs Engine
                  </Button>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Difficulty</h3>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map((diff) => (
                    <Button
                      key={diff.value}
                      onClick={() => changeDifficulty(diff.value)}
                      variant={gameState.difficulty === diff.value ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                    >
                      {diff.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Actions</h3>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    chessRef.current = new Chess();
                    setFen(chessRef.current.fen());
                    // Clear move log when starting new game
                    resetGame(); // Calls resetGame from hook
                  }} size="sm">
                    New Game
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    chessRef.current = new Chess();
                    setFen(chessRef.current.fen());
                    resetGame(); // Calls resetGame from hook
                  }}>Reset</Button>
                  
                  {/* Navigation buttons */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const previousFen = goBack();
                      if (previousFen) {
                        // Update the local chess.js board to match the previous position
                        chessRef.current = new Chess(previousFen);
                        setFen(previousFen);
                      }
                    }}
                    disabled={!canGoBack}
                    className="px-2"
                    title="Go back one move"
                  >
                    <Icon icon={ChevronLeft} size="sm" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const nextFen = goForward();
                      if (nextFen) {
                        // Update the local chess.js board to match the next position
                        chessRef.current = new Chess(nextFen);
                        setFen(nextFen);
                      }
                    }}
                    disabled={!canGoForward}
                    className="px-2"
                    title="Go forward one move"
                  >
                    <Icon icon={ChevronRight} size="sm" />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

                               {/* MoveLog component replaces the FEN section */}
                 <MoveLog moveLog={moveLog} getMoveLog={getMoveLog} />
            </div>
          </div>
        </CardContent>
      </Card>
      {pendingPromotion && (
        <PromotionPicker
          onSelect={(p) => confirmPromotion(p)}
          pieceColor={pendingPromotion.pieceColor}
          targetSquare={pendingPromotion.to}
        />
      )}
    </div>
  );
} 