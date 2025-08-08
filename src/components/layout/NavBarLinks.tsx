/**
 * NavBar Links Component
 * 
 * Navigation links with flexible structure
 */

import Link from 'next/link';
import Icon, { Gamepad2, Home } from '@/components/ui/Icon';
import { LucideIcon } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface NavBarLinksProps {
  className?: string;
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/games',
    label: 'Games',
    icon: Gamepad2,
  },
];

export default function NavBarLinks({ className, links = defaultLinks }: NavBarLinksProps) {
  return (
    <nav className={`flex items-center space-x-8 ${className}`}>
      {links.map((link) => {
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            {link.icon && <Icon icon={link.icon} size="lg" />}
            <span className="font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 