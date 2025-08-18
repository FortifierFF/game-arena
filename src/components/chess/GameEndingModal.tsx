/**
 * Game Ending Modal Component
 * Displays game ending states (checkmate, stalemate, draw) in a modal overlay
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Crown } from 'lucide-react';

interface GameEndingModalProps {
  isOpen: boolean;
  winner: 'white' | 'black' | 'draw' | undefined;
  onNewGame: () => void;
  onClose: () => void;
}

export default function GameEndingModal({ isOpen, winner, onNewGame, onClose }: GameEndingModalProps) {
  // Add confetti effect for checkmate wins
  useEffect(() => {
    if (isOpen && winner && winner !== 'draw') {
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
  }, [isOpen, winner]);

  if (!isOpen) return null;

  // Determine modal content based on game result
  const getModalContent = () => {
    if (winner === 'draw') {
      return {
        title: 'Game Draw!',
        subtitle: 'The game ended in a draw',
        icon: Handshake,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-900 dark:text-blue-100',
        description: 'Neither player can win this position.',
      };
    } else if (winner === 'white') {
      return {
        title: 'White Wins!',
        subtitle: 'Checkmate!',
        icon: Crown,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-900 dark:text-yellow-100',
        description: 'Congratulations to White! Black has been checkmated.',
      };
    } else if (winner === 'black') {
      return {
        title: 'Black Wins!',
        subtitle: 'Checkmate!',
        icon: Crown,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-900 dark:text-yellow-100',
        description: 'Congratulations to Black! White has been checkmated.',
      };
    }
    return null;
  };

  const content = getModalContent();
  if (!content) return null;

  const IconComponent = content.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <Card className={`${content.bgColor} ${content.borderColor} border-2 shadow-2xl transform transition-all`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <IconComponent className={`w-16 h-16 ${content.iconColor}`} />
            </div>
            <CardTitle className={`text-2xl font-bold ${content.textColor} mb-2`}>
              {content.title}
            </CardTitle>
            <p className={`text-lg font-semibold ${content.textColor} opacity-80`}>
              {content.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className={`text-sm ${content.textColor} opacity-70 leading-relaxed`}>
              {content.description}
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={onNewGame}
                className="px-6 py-2 font-semibold"
                size="lg"
              >
                New Game
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="px-6 py-2 font-semibold"
                size="lg"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 