const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate credentials
  if (validCredentials[username] && validCredentials[username] === password) {
    // Generate session ID and store session
    const sessionId = generateSessionId();
    sessions[sessionId] = username;
    
    // Set secure session cookie
    res.cookie('sessionId', sessionId, { 
      httpOnly: false,
      secure: false, // Set to true in production with HTTPS
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
    payload = '<img src=x onerror=eval(window.name)>';
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
      </body>
    </html>
  `);
});

app.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  // Remove session from storage
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }
  
  // Clear session cookie
  res.clearCookie('sessionId');
  res.redirect('/login');
});

app.listen(3000, () => console.log('Backend running on http://localhost:3001'));
