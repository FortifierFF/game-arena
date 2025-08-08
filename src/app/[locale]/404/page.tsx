/**
 * Dedicated 404 Page within locale structure
 */

'use client';

import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { useEffect } from 'react';
import Image from 'next/image';

const NotFoundPage = () => {
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 404 page rendered!');
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <div className="absolute inset-0 z-1 w-full h-full">
        <Image
          src="/images/not-found-16-9.webp"
          alt="404 Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="absolute top-0 left-0 w-full mt-[40px] flex items-center justify-center z-10">
        <button
          onClick={() => router.push('/en')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage; 