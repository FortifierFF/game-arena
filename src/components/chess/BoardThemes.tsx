/**
 * Board Themes Component
 * Allows users to select different chess board color schemes and themes
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';

export interface BoardTheme {
  id: string;
  name: string;
  description: string;
  lightSquare: string;
  darkSquare: string;
  preview: {
    lightSquare: string;
    darkSquare: string;
  };
}

// Predefined board themes
export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional brown and cream chess board',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    preview: {
      lightSquare: '#f0d9b5',
      darkSquare: '#b58863',
    }
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Elegant blue and white theme',
    lightSquare: '#e8edf9',
    darkSquare: '#2b3546',
    preview: {
      lightSquare: '#e8edf9',
      darkSquare: '#2b3546',
    }
  },
  {
    id: 'green',
    name: 'Forest Green',
    description: 'Natural green and cream theme',
    lightSquare: '#f4f1e8',
    darkSquare: '#769656',
    preview: {
      lightSquare: '#f4f1e8',
      darkSquare: '#769656',
    }
  },
  {
    id: 'gray',
    name: 'Modern Gray',
    description: 'Contemporary gray and white theme',
    lightSquare: '#ffffff',
    darkSquare: '#8b8b8b',
    preview: {
      lightSquare: '#ffffff',
      darkSquare: '#8b8b8b',
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Regal purple and gold theme',
    lightSquare: '#f4e4bc',
    darkSquare: '#8b5a96',
    preview: {
      lightSquare: '#f4e4bc',
      darkSquare: '#8b5a96',
    }
  },
  {
    id: 'red',
    name: 'Crimson Red',
    description: 'Bold red and cream theme',
    lightSquare: '#f4e4bc',
    darkSquare: '#b74d4d',
    preview: {
      lightSquare: '#f4e4bc',
      darkSquare: '#b74d4d',
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark theme for low-light environments',
    lightSquare: '#4a4a4a',
    darkSquare: '#1a1a1a',
    preview: {
      lightSquare: '#4a4a4a',
      darkSquare: '#1a1a1a',
    }
  },
  {
    id: 'wood',
    name: 'Wooden',
    description: 'Rich wooden texture theme',
    lightSquare: '#d2b48c',
    darkSquare: '#8b4513',
    preview: {
      lightSquare: '#d2b48c',
      darkSquare: '#8b4513',
    }
  }
];

interface BoardThemesProps {
  currentTheme: string;
  onThemeChange: (theme: BoardTheme) => void;
}

export default function BoardThemes({ currentTheme, onThemeChange }: BoardThemesProps) {
  return (
    <Card className="bg-gray-100 dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Palette className="w-4 h-4" />
          Board Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {BOARD_THEMES.map((theme) => (
            <Button
              key={theme.id}
              variant={currentTheme === theme.id ? 'default' : 'outline'}
              size="sm"
              className="h-auto p-2 flex flex-col items-center gap-2"
              onClick={() => onThemeChange(theme)}
            >
              {/* Theme preview squares */}
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: theme.preview.darkSquare }}
                />
                <div 
                  className="w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: theme.preview.lightSquare }}
                />
                <div 
                  className="w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: theme.preview.darkSquare }}
                />
                <div 
                  className="w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: theme.preview.lightSquare }}
                />
              </div>
              
              {/* Theme name */}
              <span className="text-xs font-medium">{theme.name}</span>
              
              {/* Selected indicator */}
              {currentTheme === theme.id && (
                <Check className="w-3 h-3 text-white" />
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 