// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { createServer } = require('http');
const { Server } = require('socket.io');

// Import modular components
const ChessGame = require('./src/lib/chess-game');
const Matchmaking = require('./src/lib/matchmaking');
const GameManager = require('./src/lib/game-manager');
const SocketHandler = require('./src/lib/socket-handler');

// Create HTTP server and Socket.IO instance
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize managers and handlers
const matchmaking = new Matchmaking();
const gameManager = new GameManager();
const socketHandler = new SocketHandler(io, gameManager, matchmaking);

// Handle socket connections
io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📊 Matchmaking queues initialized`);
  console.log(`🎮 Game manager ready`);
  console.log(`🔌 Socket handler ready`);
});

// Optional: Periodic cleanup tasks
setInterval(() => {
  matchmaking.cleanupOldEntries();
  gameManager.cleanupCompletedGames();
}, 5 * 60 * 1000); // Every 5 minutes 