// Simple script to start the RAG service with better error handling
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting RAG service...');

// Get the full path to server.js
const serverPath = path.join(__dirname, 'server.js');
console.log(`Server path: ${serverPath}`);

const ragService = spawn('node', [serverPath], { 
  stdio: 'inherit',
  env: { ...process.env }
});

ragService.on('error', (error) => {
  console.error('Failed to start RAG service:', error);
});

process.on('SIGINT', () => {
  console.log('Stopping RAG service...');
  ragService.kill();
  process.exit();
});