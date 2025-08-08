/**
 * Loader Component
 * 
 * A futuristic and clean loading component with multiple variants
 */

import { cn } from '@/lib/utils';

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'orbit' | 'matrix' | 'hologram' | 'quantum' | 'neural' | 'plasma' | 'space' | 'planets' | 'cosmic' | 'lasers' | 'portal' | 'nebula' | 'wormhole' | 'supernova';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showText?: boolean;
}

export default function Loader({ 
  variant = 'spinner', 
  size = 'md', 
  className = '',
  text = 'Loading...',
  showText = false 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const renderSpinner = () => (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600',
      'border-t-blue-600 dark:border-t-blue-400',
      sizeClasses[size],
      className
    )} />
  );

  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse',
            size === 'sm' && 'w-1 h-1',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4',
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={cn(
      'bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse',
      sizeClasses[size],
      className
    )} />
  );

  const renderBars = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-blue-600 dark:bg-blue-400 rounded-sm animate-pulse',
            size === 'sm' && 'w-1 h-3',
            size === 'md' && 'w-1.5 h-4',
            size === 'lg' && 'w-2 h-6',
            size === 'xl' && 'w-2.5 h-8',
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );

  const renderOrbit = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className={cn(
        'absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600',
        'animate-spin'
      )} />
      <div className={cn(
        'absolute inset-0 rounded-full border-2 border-transparent',
        'border-t-blue-600 dark:border-t-blue-400',
        'animate-spin'
      )} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      <div className={cn(
        'absolute inset-1 rounded-full border border-gray-400 dark:border-gray-500',
        'animate-pulse'
      )} />
    </div>
  );

  const renderMatrix = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg animate-pulse" />
      <div className="absolute inset-1 bg-black rounded-md">
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 h-full">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-green-400 animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.2s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderHologram = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full animate-pulse opacity-75" />
      <div className="absolute inset-1 bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
      <div className="absolute inset-2 bg-gradient-to-br from-cyan-200 via-blue-300 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
      <div className="absolute inset-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
    </div>
  );

  const renderQuantum = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-spin" />
      <div className="absolute inset-2 rounded-full border-2 border-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
      <div className="absolute inset-4 rounded-full border-2 border-pink-400 animate-spin" style={{ animationDuration: '0.8s' }} />
      <div className="absolute inset-6 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full animate-pulse" />
    </div>
  );

  const renderNeural = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0">
        <div className="w-full h-full border-2 border-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.25s' }} />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.75s' }} />
      </div>
      <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
    </div>
  );

  const renderPlasma = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 rounded-full animate-pulse" />
      <div className="absolute inset-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="absolute inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      <div className="absolute inset-3 bg-gradient-to-r from-green-400 via-yellow-500 to-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
      <div className="absolute inset-4 bg-gradient-to-r from-blue-400 via-green-500 to-yellow-600 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
      <div className="absolute inset-5 bg-gradient-to-r from-purple-400 via-blue-500 to-green-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );

  // 🚀 NEW INSANE VARIANTS 🚀

  const renderSpace = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Stars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: `${20 + (i * 10)}%`,
            top: `${20 + (i * 10)}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.5s',
          }}
        />
      ))}
      {/* Central planet */}
      <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full animate-pulse" />
      {/* Orbiting ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
    </div>
  );

  const renderPlanets = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Sun */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
      {/* Planet 1 */}
      <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      {/* Planet 2 */}
      <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      {/* Planet 3 */}
      <div className="absolute inset-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
    </div>
  );

  const renderCosmic = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-full animate-pulse" />
      {/* Nebula layers */}
      <div className="absolute inset-1 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.3s' }} />
      <div className="absolute inset-2 bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.6s' }} />
      {/* Central star */}
      <div className="absolute inset-3 bg-gradient-to-br from-yellow-300 to-white rounded-full animate-pulse" />
    </div>
  );

  const renderLasers = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Laser beams */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-gradient-to-b from-red-400 to-transparent animate-pulse"
          style={{
            width: '2px',
            height: '100%',
            left: `${25 * i}%`,
            transform: `rotate(${90 * i}deg)`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
      {/* Central core */}
      <div className="absolute inset-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-full animate-pulse" />
      {/* Energy field */}
      <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
    </div>
  );

  const renderPortal = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Portal rings */}
      <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-spin" />
      <div className="absolute inset-2 rounded-full border-2 border-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      <div className="absolute inset-4 rounded-full border-2 border-purple-400 animate-spin" style={{ animationDuration: '2s' }} />
      {/* Portal center */}
      <div className="absolute inset-6 bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-full animate-pulse" />
      {/* Energy particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{
            left: `${50 + 30 * Math.cos(i * Math.PI / 3)}%`,
            top: `${50 + 30 * Math.sin(i * Math.PI / 3)}%`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );

  const renderNebula = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Nebula clouds */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-full animate-pulse opacity-80" />
      <div className="absolute inset-1 bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.4s' }} />
      <div className="absolute inset-2 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.8s' }} />
      {/* Star clusters */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
          style={{
            left: `${20 + (i * 5)}%`,
            top: `${20 + (i * 5)}%`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '2s',
          }}
        />
      ))}
    </div>
  );

  const renderWormhole = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Wormhole rings */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-spin" style={{ animationDuration: '1s' }} />
      <div className="absolute inset-1 rounded-full border-2 border-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
      <div className="absolute inset-2 rounded-full border-2 border-purple-400 animate-spin" style={{ animationDuration: '0.8s' }} />
      <div className="absolute inset-3 rounded-full border-2 border-pink-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      {/* Central singularity */}
      <div className="absolute inset-4 bg-gradient-to-br from-black via-purple-900 to-cyan-900 rounded-full animate-pulse" />
      {/* Energy waves */}
      <div className="absolute inset-0 rounded-full border border-cyan-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
      <div className="absolute inset-0 rounded-full border border-purple-300 animate-pulse" style={{ animationDelay: '0.6s' }} />
    </div>
  );

  const renderSupernova = () => (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Explosion waves */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full animate-pulse" />
      <div className="absolute inset-1 bg-gradient-to-br from-white via-yellow-300 to-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="absolute inset-2 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      {/* Shockwave rings */}
      <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-pulse" style={{ animationDelay: '0.1s' }} />
      <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
      <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
      {/* Central core */}
      <div className="absolute inset-3 bg-gradient-to-br from-white to-yellow-300 rounded-full animate-pulse" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      case 'orbit':
        return renderOrbit();
      case 'matrix':
        return renderMatrix();
      case 'hologram':
        return renderHologram();
      case 'quantum':
        return renderQuantum();
      case 'neural':
        return renderNeural();
      case 'plasma':
        return renderPlasma();
      case 'space':
        return renderSpace();
      case 'planets':
        return renderPlanets();
      case 'cosmic':
        return renderCosmic();
      case 'lasers':
        return renderLasers();
      case 'portal':
        return renderPortal();
      case 'nebula':
        return renderNebula();
      case 'wormhole':
        return renderWormhole();
      case 'supernova':
        return renderSupernova();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderLoader()}
      {showText && (
        <p className={cn(
          'text-gray-600 dark:text-gray-300 font-medium',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
} 