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

// Import the engine script (reads the globals above)
importScripts(`${ORIGIN}/stockfish/stockfish.js`); 