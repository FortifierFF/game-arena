'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Handshake, Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameResult: {
    result: string;
    winner: string | null;
    loser: string | null;
    isWinner: boolean; // Use this instead of playerColor comparison
    playerColor?: 'white' | 'black'; // Keep for backward compatibility
    opponentName?: string;
  } | null;
  onFindNewOpponent?: () => void;
  onGoHome?: () => void;
}

export default function GameEndModal({ isOpen, onClose, gameResult, onFindNewOpponent, onGoHome }: GameEndModalProps) {
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    if (isOpen && gameResult) {
      console.log('🎭 [GameEndModal] Modal opened with data:', gameResult);
      console.log('🎭 [GameEndModal] Result:', gameResult.result);
      console.log('🎭 [GameEndModal] isWinner:', gameResult.isWinner);
    }
  }, [isOpen, gameResult]);

  // Add confetti effect for wins
  useEffect(() => {
    if (isOpen && gameResult && gameResult.isWinner && gameResult.result !== 'draw' && gameResult.result !== 'stalemate') {
      // Simple confetti effect - create falling particles
      const confettiCount = 50;
      const confettiContainer = document.createElement('div');
      confettiContainer.style.position = 'fixed';
      confettiContainer.style.top = '0';
      confettiContainer.style.left = '0';
      confettiContainer.style.width = '100%';
      confettiContainer.style.height = '100%';
      confettiContainer.style.pointerEvents = 'none';
      confettiContainer.style.zIndex = '40';
      document.body.appendChild(confettiContainer);

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '8px';
        confetti.style.height = '8px';
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] || '#ff6b6b';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        confettiContainer.appendChild(confetti);
      }

      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);

      // Clean up after animation
      setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 5000);

      return () => {
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
    
    // Return empty cleanup function when no confetti is created
    return () => {};
  }, [isOpen, gameResult]);

  if (!isOpen || !gameResult) return null;

  const getResultInfo = () => {
    const { result, isWinner } = gameResult;
    
    console.log('🎭 [GameEndModal] getResultInfo called with:', { result, isWinner });
    
    switch (result) {
      case 'checkmate':
        console.log('🎭 [GameEndModal] Processing checkmate result');
        if (isWinner) {
          return {
            icon: Crown,
            title: 'You Won!',
            subtitle: 'Checkmate!',
            description: 'Congratulations! You checkmated your opponent.',
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            borderColor: 'border-green-200 dark:border-green-800',
            textColor: 'text-green-900 dark:text-green-100',
            showConfetti: true
          };
        } else {
          return {
            icon: Crown,
            title: 'You Lost!',
            subtitle: 'Checkmate!',
            description: 'Your opponent checkmated you.',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-red-200 dark:border-red-800',
            textColor: 'text-red-900 dark:text-red-100',
            showConfetti: false
          };
        }
      case 'resignation':
        if (isWinner) {
          return {
            icon: Flag,
            title: 'You Won!',
            subtitle: 'Opponent Resigned',
            description: 'Your opponent resigned the game.',
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            borderColor: 'border-green-200 dark:border-green-800',
            textColor: 'text-green-900 dark:text-green-100',
            showConfetti: true
          };
        } else {
          return {
            icon: Flag,
            title: 'You Resigned',
            subtitle: 'Game Ended',
            description: 'You resigned the game.',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-red-200 dark:border-red-800',
            textColor: 'text-red-900 dark:text-red-100',
            showConfetti: false
          };
        }
      case 'draw':
        return {
          icon: Handshake,
          title: 'Game Drawn!',
          subtitle: 'Draw',
          description: 'The game ended in a draw.',
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-900 dark:text-blue-100',
          showConfetti: false
        };
      case 'stalemate':
        return {
          icon: Handshake,
          title: 'Game Drawn!',
          subtitle: 'Stalemate',
          description: 'The game ended in a stalemate.',
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-900 dark:text-blue-100',
          showConfetti: false
        };
      default:
        return {
          icon: Clock,
          title: 'Game Ended',
          subtitle: 'Unknown Result',
          description: 'The game has ended.',
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-900 dark:text-gray-100',
          showConfetti: false
        };
    }
  };

  const resultInfo = getResultInfo();
  const IconComponent = resultInfo.icon;

  // Handle button actions
  const handleFindNewOpponent = () => {
    console.log('🎭 [GameEndModal] Find New Opponent button clicked!');
    if (onFindNewOpponent) {
      console.log('🎭 [GameEndModal] Calling onFindNewOpponent callback');
      onFindNewOpponent();
    } else {
      console.log('🎭 [GameEndModal] No onFindNewOpponent callback, using default behavior');
      // Default behavior - go back to matchmaking
      onClose();
    }
  };

  const handleGoHome = () => {
    console.log('🎭 [GameEndModal] Go Home button clicked!');
    if (onGoHome) {
      console.log('🎭 [GameEndModal] Calling onGoHome callback');
      onGoHome();
    } else {
      console.log('🎭 [GameEndModal] No onGoHome callback, using default behavior');
      // Default behavior - navigate to home
      router.push('/');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <Card className={`${resultInfo.bgColor} ${resultInfo.borderColor} border-2 shadow-2xl transform transition-all`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <IconComponent className={`w-16 h-16 ${resultInfo.iconColor}`} />
            </div>
            <CardTitle className={`text-2xl font-bold ${resultInfo.textColor} mb-2`}>
              {resultInfo.title}
            </CardTitle>
            <p className={`text-lg font-semibold ${resultInfo.textColor} opacity-80`}>
              {resultInfo.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className={`text-sm ${resultInfo.textColor} opacity-70 leading-relaxed`}>
              {resultInfo.description}
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleFindNewOpponent}
                className="px-6 py-2 font-semibold"
                size="lg"
              >
                Find New Opponent
              </Button>
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="px-6 py-2 font-semibold"
                size="lg"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 