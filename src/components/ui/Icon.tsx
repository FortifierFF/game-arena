/**
 * Icon Component
 * 
 * A wrapper around Lucide React icons with consistent styling
 * 
 * <Icon icon={Home} size="2xl" />
 */

import { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export default function Icon({ 
  icon: IconComponent, 
  size = 'md', 
  className,
  ...props 
}: IconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      className={cn('inline-block', className)}
      {...props}
    />
  );
}

// Export commonly used icons for easy access
export { 
  Home,
  Gamepad2,
  Users,
  Trophy,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Globe,
  Heart,
  Star,
  Crown,
  Target,
  Zap,
  Shield,
  Sword,
  SkipBack,
  SkipForward,
  Wallet,
  AlertCircle,
  CheckCircle,
  Edit3,
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  Download,
  Share2,
} from 'lucide-react'; 


