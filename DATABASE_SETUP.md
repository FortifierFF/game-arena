# Database Setup Guide for Multiplayer Chess

This guide will help you set up the database to store chess games, moves, and player statistics.

## 🎯 What We're Building

- **Chess Games Table**: Store completed games with results, players, and metadata
- **Chess Moves Table**: Store every move made in each game
- **Player Statistics Table**: Track wins, losses, ratings, and performance metrics

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js Project**: Your Next.js app should already be set up
3. **Supabase Dependencies**: Already installed (`@supabase/supabase-js`)

## 🚀 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `game-arena-chess` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"
6. Wait for setup to complete (2-3 minutes)

### 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Create `.env.local` file in your project root
2. Add your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Restart your development server

### 4. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to execute the SQL

### 5. Verify Setup

1. Go to **Table Editor** in Supabase
2. You should see three new tables:
   - `chess_games`
   - `chess_moves`
   - `chess_player_stats`

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only see their own data
- **Authentication Required**: All operations require valid user session
- **Data Validation**: Constraints ensure data integrity

## 📊 Database Schema Overview

### Chess Games Table
- Game metadata (players, time control, result)
- Game duration and final position
- Winner/loser information

### Chess Moves Table
- Every individual move in each game
- Move notation and board state
- Timing information for analysis

### Player Statistics Table
- Win/loss/draw counts
- ELO rating system
- Performance metrics and streaks

## 🧪 Testing the Setup

1. **Start your server**: `npm run server`
2. **Start your client**: `npm run dev`
3. **Play a chess game** with two accounts
4. **Check the database** for saved game data

## 🚨 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env.local` file exists
   - Verify variable names are correct
   - Restart development server

2. **"Permission denied" errors**
   - Ensure RLS policies are created
   - Check user authentication
   - Verify table permissions

3. **"Table doesn't exist" errors**
   - Run the SQL schema again
   - Check for SQL execution errors
   - Verify table names match

### Debug Steps

1. Check browser console for errors
2. Check server console for database errors
3. Verify Supabase connection in Network tab
4. Test database connection in Supabase dashboard

## 🔄 Next Steps

After successful setup:

1. **Test Game Recording**: Play a complete chess game
2. **Verify Statistics**: Check if player stats are updated
3. **Add Features**: Implement rating display, game history
4. **Optimize**: Add indexes for better performance

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs in dashboard
3. Check browser console for error messages
4. Verify all environment variables are set correctly 