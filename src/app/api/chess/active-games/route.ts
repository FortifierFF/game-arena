import { NextResponse } from 'next/server';

// API route to get active chess games
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // This will be implemented to query the server for active games
    // For now, return empty array - the actual implementation will be
    // handled by the server-side function getActiveGamesForPlayer()
    const activeGames: unknown[] = [];
    
    return NextResponse.json({
      success: true,
      games: activeGames,
      count: activeGames.length,
      userId: userId
    });
  } catch (error) {
    console.error('Error fetching active games:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch active games' 
      },
      { status: 500 }
    );
  }
}

// API route to create a new game (if needed)
export async function POST() {
  try {
    // This is a placeholder implementation
    // In a real app, you would create a new game in your database
    
    return NextResponse.json({
      success: true,
      message: 'Game creation endpoint - implement as needed'
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create game' 
      },
      { status: 500 }
    );
  }
} 