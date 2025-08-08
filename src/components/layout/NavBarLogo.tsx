/**
 * NavBar Logo Component
 * 
 * Reusable logo component with flexible styling
 */

import Image from 'next/image';
import Link from 'next/link';

interface NavBarLogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export default function NavBarLogo({ className, height = 64, width = 64 }: NavBarLogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/images/logoGarena-transp.png"
        alt="Game Arena Logo"
        width={width}
        height={height}
        className="h-auto w-auto"
        priority
      />
    </Link>
  );
} 