/**
 * NavBar Links Component
 * 
 * Navigation links with flexible structure
 */

'use client';

import Link from 'next/link';
import Icon, { Gamepad2, Home } from '@/components/ui/Icon';
import { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface NavBarLinksProps {
  className?: string;
  links?: NavLink[];
}

export default function NavBarLinks({ className }: NavBarLinksProps) {
  const t = useTranslations('navigation');
  
  const defaultLinks: NavLink[] = [
    {
      href: '/',
      label: t('home'),
      icon: Home,
    },
    {
      href: '/games',
      label: t('games'),
      icon: Gamepad2,
    },
  ];

  return (
    <nav className={`flex items-center space-x-8 ${className}`}>
      {defaultLinks.map((link) => {
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