'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './index';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const pathname = usePathname();
  
  // Hide navbar on 404 page
  const is404Page = pathname?.includes('/404');
  
  return (
    <>
      {!is404Page && <NavBar />}
      {children}
    </>
  );
};

export default LayoutWrapper; 