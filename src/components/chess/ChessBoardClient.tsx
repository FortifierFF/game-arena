"use client";

import dynamic from 'next/dynamic';

const ClientBoard = dynamic(() => import('./ChessBoard'), { ssr: false });

export default function ChessBoardClient() {
  return <ClientBoard />;
} 