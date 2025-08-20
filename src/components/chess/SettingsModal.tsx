/**
 * Settings Modal Component
 * Centralized settings for chess game including Mode, Difficulty, and Board Themes
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, X, Gamepad2, Brain, Palette, Check } from 'lucide-react';
import { BoardTheme } from './BoardThemes';
import { ChessDifficulty } from '@/types/chess';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Game settings
  manualMode: boolean;
  onManualModeChange: (manual: boolean) => void;
  difficulty: ChessDifficulty;
  onDifficultyChange: (difficulty: ChessDifficulty) => void;
  // Board theme settings
  currentTheme: string;
  onThemeChange: (theme: BoardTheme) => void;
  // Piece movement speed settings
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  manualMode,
  onManualModeChange,
  difficulty,
  onDifficultyChange,
  currentTheme,
  onThemeChange,
  animationSpeed,
  onAnimationSpeedChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
    { value: 'master', label: 'Master' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Chess Settings</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize your chess experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-4 space-y-4">
            {/* Game Mode Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Gamepad2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">Game Mode</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Choose how you want to play</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={manualMode ? 'default' : 'outline'}
                  onClick={() => onManualModeChange(true)}
                  className="h-12 flex flex-col items-center justify-center gap-1.5 p-2 hover:scale-105 transition-transform"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="text-xs opacity-70 text-center leading-tight">Control both sides</span>
                </Button>
                <Button
                  variant={!manualMode ? 'default' : 'outline'}
                  onClick={() => onManualModeChange(false)}
                  className="h-12 flex flex-col items-center justify-center gap-1.5 p-2 hover:scale-105 transition-transform"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-xs opacity-70 text-center leading-tight">Play against AI (Stockfish)</span>
                </Button>
              </div>
            </div>

            {/* Difficulty Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">AI Difficulty</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Set the challenge level</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                    Current: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {difficulties.map((diff) => (
                  <Button
                    key={diff.value}
                    onClick={() => onDifficultyChange(diff.value)}
                    variant={difficulty === diff.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs font-medium transition-all hover:scale-105 px-1"
                  >
                    {diff.label}
                    {difficulty === diff.value && (
                      <Check className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Piece Movement Speed Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                    <span className="text-xs font-bold">♟️</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">Piece Movement Speed</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Control how fast pieces slide across the board</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded-full">
                    {animationSpeed}ms
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Very Fast</span>
                  <span>Fast</span>
                  <span>Normal</span>
                  <span>Slow</span>
                  <span>Very Slow</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="100"
                    value={animationSpeed}
                    onChange={(e) => onAnimationSpeedChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100ms</span>
                    <span>200ms</span>
                    <span>300ms</span>
                    <span>400ms</span>
                    <span>500ms</span>
                    <span>600ms</span>
                    <span>700ms</span>
                    <span>800ms</span>
                    <span>900ms</span>
                    <span>1000ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Board Themes Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Palette className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white">Board Theme</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred board colors</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'classic', name: 'Classic', colors: ['#f0d9b5', '#b58863'] },
                  { id: 'blue', name: 'Ocean', colors: ['#e8edf9', '#2b3546'] },
                  { id: 'green', name: 'Forest', colors: ['#f4f1e8', '#769656'] },
                  { id: 'gray', name: 'Modern', colors: ['#ffffff', '#8b8b8b'] },
                  { id: 'purple', name: 'Royal', colors: ['#f4e4bc', '#8b5a96'] },
                  { id: 'red', name: 'Crimson', colors: ['#f4e4bc', '#b74d4d'] },
                  { id: 'dark', name: 'Dark', colors: ['#4a4a4a', '#1a1a1a'] },
                  { id: 'wood', name: 'Wooden', colors: ['#d2b48c', '#8b4513'] },
                ].map((theme) => (
                  <Button
                    key={theme.id}
                    variant={currentTheme === theme.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center gap-1.5 p-1.5 transition-all hover:scale-105 relative"
                    onClick={() => {
                      // Find the full theme object and pass it
                      const fullTheme = {
                        id: theme.id,
                        name: theme.name,
                        description: '',
                        lightSquare: theme.colors[0],
                        darkSquare: theme.colors[1],
                        preview: {
                          lightSquare: theme.colors[0],
                          darkSquare: theme.colors[1],
                        }
                      } as BoardTheme;
                      onThemeChange(fullTheme);
                    }}
                  >
                    {/* Theme preview squares */}
                    <div className="flex gap-0.5">
                      <div 
                        className="w-2 h-2 rounded-sm border border-gray-300"
                        style={{ backgroundColor: theme.colors[1] }}
                      />
                      <div 
                        className="w-2 h-2 rounded-sm border border-gray-300"
                        style={{ backgroundColor: theme.colors[0] }}
                      />
                      <div 
                        className="w-2 h-2 rounded-sm border border-gray-300"
                        style={{ backgroundColor: theme.colors[1] }}
                      />
                      <div 
                        className="w-2 h-2 rounded-sm border border-gray-300"
                        style={{ backgroundColor: theme.colors[0] }}
                      />
                    </div>
                    <span className="text-xs font-medium">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-center pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button onClick={onClose} size="lg" className="px-6 py-2 text-sm font-semibold">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 