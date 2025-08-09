import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Engine moved to client-side Web Worker' }, { status: 405 });
} 