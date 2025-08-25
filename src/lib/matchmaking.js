// Matchmaking system for finding compatible opponents
class Matchmaking {
  constructor() {
    // Map<timeControl, Array<{userId, socketId, rating, timestamp}>>
    this.queues = new Map();
  }

  // Add player to matchmaking queue
  addToQueue(userId, socketId, timeControl, rating = 1200) {
    // Remove from any existing queue first
    this.removeFromAllQueues(userId);

    // Initialize queue if it doesn't exist
    if (!this.queues.has(timeControl)) {
      this.queues.set(timeControl, []);
    }

    const playerData = {
      userId,
      socketId,
      rating: rating || 1200,
      timestamp: Date.now()
    };

    this.queues.get(timeControl).push(playerData);
    
    console.log(`✅ [Queue] User ${userId} added to ${timeControl} queue`);
    console.log(`📊 [Queue] ${timeControl} queue now has ${this.queues.get(timeControl).length} players`);

    return playerData;
  }

  // Remove player from all queues
  removeFromAllQueues(userId) {
    for (const [timeControl, queue] of this.queues.entries()) {
      const index = queue.findIndex(player => player.userId === userId);
      if (index !== -1) {
        queue.splice(index, 1);
        console.log(`🔄 [Queue] Removed ${userId} from ${timeControl} queue`);
      }
    }
  }

  // Find a compatible opponent
  findMatch(userId, timeControl, rating) {
    if (!this.queues.has(timeControl)) {
      return null;
    }

    const queue = this.queues.get(timeControl);
    
    // Find a compatible opponent (not the same user, within rating range)
    const opponent = queue.find(player => 
      player.userId !== userId && 
      Math.abs(player.rating - rating) <= 200
    );

    return opponent;
  }

  // Remove matched players from queue
  removeMatchedPlayers(userId1, userId2, timeControl) {
    if (!this.queues.has(timeControl)) return;

    const queue = this.queues.get(timeControl);
    const player1Index = queue.findIndex(p => p.userId === userId1);
    const player2Index = queue.findIndex(p => p.userId === userId2);
    
    if (player1Index !== -1) queue.splice(player1Index, 1);
    if (player2Index !== -1) queue.splice(player2Index, 1);
    
    console.log(`🔄 [Queue] Removed matched players from ${timeControl} queue. Queue now has ${queue.length} players`);
  }

  // Get queue size for a specific time control
  getQueueSize(timeControl) {
    return this.queues.has(timeControl) ? this.queues.get(timeControl).length : 0;
  }

  // Get all queue sizes
  getAllQueueSizes() {
    const sizes = {};
    for (const [timeControl, queue] of this.queues.entries()) {
      sizes[timeControl] = queue.length;
    }
    return sizes;
  }

  // Clean up old entries (optional: remove players who have been waiting too long)
  cleanupOldEntries(maxWaitTime = 5 * 60 * 1000) { // 5 minutes default
    const now = Date.now();
    for (const [timeControl, queue] of this.queues.entries()) {
      const initialLength = queue.length;
      const filteredQueue = queue.filter(player => (now - player.timestamp) < maxWaitTime);
      
      if (filteredQueue.length !== initialLength) {
        this.queues.set(timeControl, filteredQueue);
        console.log(`🧹 [Queue] Cleaned up ${timeControl} queue: ${initialLength} -> ${filteredQueue.length} players`);
      }
    }
  }
}

module.exports = Matchmaking; 