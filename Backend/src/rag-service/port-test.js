const express = require('express');
const app = express();

// Try multiple ports
const tryPort = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server successfully started on port ${port}`);
    console.log(`Test it with: curl http://localhost:${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying next...`);
      tryPort(port + 1);
    } else {
      console.error(`Error starting server on port ${port}:`, err);
    }
  });
};

// Start with port 5001
tryPort(5001);