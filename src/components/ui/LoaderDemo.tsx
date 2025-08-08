/**
 * Loader Demo Component
 * 
 * Demonstrates all loader variants and sizes
 */

import Loader from './Loader';

export default function LoaderDemo() {
  const classicVariants = ['spinner', 'dots', 'pulse', 'bars', 'orbit'] as const;
  const futuristicVariants = ['matrix', 'hologram', 'quantum', 'neural', 'plasma'] as const;
  const insaneVariants = ['space', 'planets', 'cosmic', 'lasers', 'portal', 'nebula', 'wormhole', 'supernova'] as const;
  const sizes = ['sm', 'md', 'lg', 'xl'] as const;

  return (
    <div className="space-y-8">
      {/* Classic Variants */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Classic Loaders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {classicVariants.map((variant) => (
            <div
              key={variant}
              className="flex flex-col items-center space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {variant}
              </h4>
              <Loader variant={variant} size="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Futuristic Variants */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Futuristic Loaders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {futuristicVariants.map((variant) => (
            <div
              key={variant}
              className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg border border-gray-700"
            >
              <h4 className="text-sm font-medium text-gray-300 capitalize">
                {variant}
              </h4>
              <Loader variant={variant} size="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* INSANE Variants */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌌 INSANE Cosmic Loaders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insaneVariants.map((variant) => (
            <div
              key={variant}
              className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-black rounded-lg shadow-lg border border-purple-700"
            >
              <h4 className="text-sm font-medium text-purple-300 capitalize">
                {variant}
              </h4>
              <Loader variant={variant} size="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Space & Planets Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌟 Space & Planetary Systems
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sizes.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-lg shadow-lg border border-blue-700"
            >
              <h4 className="text-sm font-medium text-blue-300 capitalize">
                Space {size}
              </h4>
              <Loader variant="space" size={size} />
            </div>
          ))}
        </div>
      </div>

      {/* Cosmic & Nebula Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌈 Cosmic & Nebula Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sizes.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 rounded-lg shadow-lg border border-pink-700"
            >
              <h4 className="text-sm font-medium text-pink-300 capitalize">
                Cosmic {size}
              </h4>
              <Loader variant="cosmic" size={size} />
            </div>
          ))}
        </div>
      </div>

      {/* Laser & Portal Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ Laser & Portal Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sizes.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 rounded-lg shadow-lg border border-red-700"
            >
              <h4 className="text-sm font-medium text-red-300 capitalize">
                Lasers {size}
              </h4>
              <Loader variant="lasers" size={size} />
            </div>
          ))}
        </div>
      </div>

      {/* Wormhole & Supernova Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌌 Wormhole & Supernova Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sizes.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900 rounded-lg shadow-lg border border-cyan-700"
            >
              <h4 className="text-sm font-medium text-cyan-300 capitalize">
                Wormhole {size}
              </h4>
              <Loader variant="wormhole" size={size} />
            </div>
          ))}
        </div>
      </div>

      {/* Insane with Text Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌟 Insane Loaders with Text
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-blue-900 to-cyan-900 rounded-lg shadow-lg border border-blue-700">
            <h4 className="text-sm font-medium text-blue-300">
              Space Travel...
            </h4>
            <Loader variant="space" size="lg" text="Space Travel..." showText />
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg shadow-lg border border-purple-700">
            <h4 className="text-sm font-medium text-purple-300">
              Quantum Jump...
            </h4>
            <Loader variant="portal" size="lg" text="Quantum Jump..." showText />
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-red-900 to-orange-900 rounded-lg shadow-lg border border-red-700">
            <h4 className="text-sm font-medium text-red-300">
              Laser Charging...
            </h4>
            <Loader variant="lasers" size="lg" text="Laser Charging..." showText />
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-yellow-900 to-red-900 rounded-lg shadow-lg border border-yellow-700">
            <h4 className="text-sm font-medium text-yellow-300">
              Supernova...
            </h4>
            <Loader variant="supernova" size="lg" text="Supernova..." showText />
          </div>
        </div>
      </div>

      {/* Custom Styling Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Custom Styling
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Blue Theme
            </h4>
            <Loader variant="spinner" size="lg" className="border-t-blue-500" />
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Green Theme
            </h4>
            <Loader variant="pulse" size="lg" className="bg-green-500" />
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900 dark:to-violet-900 rounded-lg shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Purple Theme
            </h4>
            <Loader variant="orbit" size="lg" className="border-t-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
} 