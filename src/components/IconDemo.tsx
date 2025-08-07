/**
 * Icon Demo Component
 * 
 * Demonstrates the icon system usage
 */

import Icon, { 
  Home, 
  Gamepad2, 
  Trophy, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Sun,
  Moon,
  Crown,
  Target,
  Zap,
  Shield,
  Sword,
  Heart,
  Star,
} from '@/components/ui/Icon';

export default function IconDemo() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Icon System Demo</h2>
        <p className="text-gray-600 mb-6">
          Consistent icon system using Lucide React with standardized sizes and styling.
        </p>
      </div>

      {/* Size Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Icon Sizes</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon icon={Home} size="xs" />
            <span className="text-sm">xs</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon icon={Home} size="sm" />
            <span className="text-sm">sm</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon icon={Home} size="md" />
            <span className="text-sm">md</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon icon={Home} size="lg" />
            <span className="text-sm">lg</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon icon={Home} size="xl" />
            <span className="text-sm">xl</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon icon={Home} size="2xl" />
            <span className="text-sm">2xl</span>
          </div>
        </div>
      </div>

      {/* Color Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Icon Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Trophy} size="lg" className="text-yellow-500" />
            <span>text-yellow-500</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Zap} size="lg" className="text-blue-600" />
            <span>text-blue-600</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Heart} size="lg" className="text-red-500" />
            <span>text-red-500</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Shield} size="lg" className="text-green-600" />
            <span>text-green-600</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Crown} size="lg" className="text-purple-600" />
            <span>text-purple-600</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Target} size="lg" className="text-orange-500" />
            <span>text-orange-500</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Sword} size="lg" className="text-gray-700" />
            <span>text-gray-700</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Star} size="lg" className="text-pink-500" />
            <span>text-pink-500</span>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Hover Effects</h3>
        <div className="flex items-center space-x-4">
          <Icon icon={Home} size="md" className="text-gray-600 hover:text-blue-600 transition-colors" />
          <Icon icon={Settings} size="md" className="text-gray-600 hover:text-green-600 transition-colors" />
          <Icon icon={Bell} size="md" className="text-gray-600 hover:text-yellow-600 transition-colors" />
          <Icon icon={Search} size="md" className="text-gray-600 hover:text-purple-600 transition-colors" />
          <Icon icon={Sun} size="md" className="text-gray-600 hover:text-orange-500 transition-colors" />
          <Icon icon={Moon} size="md" className="text-gray-600 hover:text-indigo-600 transition-colors" />
        </div>
        <p className="text-sm text-gray-500 mt-2">Hover over the icons above to see color transitions</p>
      </div>

      {/* Game Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Game-Related Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Gamepad2} size="lg" className="text-blue-600" />
            <span>Gamepad</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Trophy} size="lg" className="text-yellow-600" />
            <span>Trophy</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Crown} size="lg" className="text-purple-600" />
            <span>Crown</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Target} size="lg" className="text-red-600" />
            <span>Target</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Zap} size="lg" className="text-yellow-500" />
            <span>Zap</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Shield} size="lg" className="text-green-600" />
            <span>Shield</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Sword} size="lg" className="text-gray-700" />
            <span>Sword</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Icon icon={Users} size="lg" className="text-indigo-600" />
            <span>Users</span>
          </div>
        </div>
      </div>

      {/* Navigation Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Navigation Icons</h3>
        <div className="flex items-center space-x-4">
          <Icon icon={Home} size="md" className="text-gray-600 hover:text-gray-900" />
          <Icon icon={Settings} size="md" className="text-gray-600 hover:text-gray-900" />
          <Icon icon={Bell} size="md" className="text-gray-600 hover:text-gray-900" />
          <Icon icon={Search} size="md" className="text-gray-600 hover:text-gray-900" />
          <Icon icon={Sun} size="md" className="text-gray-600 hover:text-gray-900" />
          <Icon icon={Moon} size="md" className="text-gray-600 hover:text-gray-900" />
        </div>
      </div>

      {/* Usage Example */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Usage Example</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-700">
{`import Icon, { Home, Trophy } from '@/components/ui/Icon';

// Basic usage
<Icon icon={Home} size="md" />

// With custom styling
<Icon icon={Trophy} size="lg" className="text-yellow-600" />

// Different sizes
<Icon icon={Gamepad2} size="xs" />
<Icon icon={Gamepad2} size="sm" />
<Icon icon={Gamepad2} size="md" />
<Icon icon={Gamepad2} size="lg" />
<Icon icon={Gamepad2} size="xl" />
<Icon icon={Gamepad2} size="2xl" />

// Color variations
<Icon icon={Trophy} className="text-yellow-500" />
<Icon icon={Zap} className="text-blue-600" />
<Icon icon={Heart} className="text-red-500" />
<Icon icon={Shield} className="text-green-600" />

// Hover effects
<Icon icon={Home} className="text-gray-600 hover:text-blue-600 transition-colors" />`}
          </pre>
        </div>
      </div>
    </div>
  );
} 