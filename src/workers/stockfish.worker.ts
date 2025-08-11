// Stockfish Web Worker: load stockfish.js 10.0.2 from /public/stockfish

/* eslint-disable @typescript-eslint/no-explicit-any */

declare function importScripts(...urls: string[]): void;

const ORIGIN = (self as any)?.location?.origin || '';

// Provide absolute URL to the wasm so the worker never uses a relative path
;(self as any).h = `${ORIGIN}/stockfish/stockfish.wasm`;

// Emscripten configuration so helper lookups resolve to /public/stockfish
;(self as any).Module = {
  wasmBinaryFile: `${ORIGIN}/stockfish/stockfish.wasm`,
  locateFile: (path: string) => `${ORIGIN}/stockfish/${path}`
};

// Track initialization state
let isInitialized = false;
let pendingRequests: Array<{type: string, fen: string, depth: number, time: number, resolve: () => void}> = [];

// Initialize Stockfish
function initializeStockfish() {
  if (isInitialized) return Promise.resolve();
  
  return new Promise<void>((resolve, reject) => {
    try {
      console.log('Stockfish worker: Starting initialization...');
      
      // Import the engine script (reads the globals above)
      importScripts(`${ORIGIN}/stockfish/stockfish.js`);
      
      // Wait for Stockfish to be available
      const checkStockfish = () => {
        if ((self as any).stockfish) {
          console.log('Stockfish worker: Stockfish loaded successfully');
          isInitialized = true;
          
          // Process any pending requests
          pendingRequests.forEach(request => {
            processAnalysisRequest(request);
          });
          pendingRequests = [];
          
          resolve();
        } else {
          // Check again in a short while
          setTimeout(checkStockfish, 100);
        }
      };
      
      checkStockfish();
      
    } catch (error) {
      console.error('Stockfish worker: Initialization failed:', error);
      reject(error);
    }
  });
}

// Process analysis request
function processAnalysisRequest(request: {type: string, fen: string, depth: number, time: number, resolve: () => void}) {
  if (!isInitialized) {
    console.log('Stockfish worker: Queuing request until initialization complete');
    pendingRequests.push(request);
    return;
  }
  
  const { fen, depth, time, resolve } = request;
  console.log('Stockfish worker: Processing analysis request for:', fen);
  
  try {
    const stockfish = (self as any).stockfish;
    
    // Set up Stockfish for analysis
    stockfish.postMessage('uci');
    stockfish.postMessage('isready');
    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage(`go depth ${depth} movetime ${time}`);
    
    // Listen for Stockfish responses
    let bestMove: string | null = null;
    let score: number | null = null;
    
    const handleStockfishMessage = (msg: string) => {
      console.log('Stockfish worker: Received from engine:', msg);
      
      if (msg.startsWith('bestmove')) {
        const parts = msg.split(' ');
        if (parts.length >= 2 && parts[1]) {
          bestMove = parts[1];
          // Extract score if available
          if (parts.length >= 4 && parts[2] === 'cp' && parts[3]) {
            score = parseInt(parts[3]);
          }
          
          // Send result back to main thread
          if (bestMove && bestMove.length >= 4) {
            self.postMessage({
              type: 'bestmove',
              data: {
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                score: score || 0
              }
            });
          }
          
          // Clean up
          stockfish.removeEventListener('message', handleStockfishMessage);
          resolve();
        }
      }
    };
    
    stockfish.addEventListener('message', handleStockfishMessage);
    
  } catch (error) {
    console.error('Stockfish worker: Error during analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ type: 'error', data: errorMessage });
    resolve();
  }
}

// Start initialization immediately
initializeStockfish().catch(error => {
  console.error('Stockfish worker: Failed to initialize:', error);
});

// Message handler for hint requests
self.addEventListener('message', (event) => {
  const { type, fen, depth, time } = event.data;
  
  if (type === 'analyze') {
    console.log('Stockfish worker: Received analyze request for:', fen);
    
    // Create a promise resolver for this request
    const resolve = () => {
      // This will be called when the analysis is complete
      console.log('Stockfish worker: Analysis complete for:', fen);
    };
    
    // Process the request (will be queued if not initialized yet)
    processAnalysisRequest({ type, fen, depth, time, resolve });
  }
}); 