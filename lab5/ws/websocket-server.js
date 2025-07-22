const WebSocket = require('ws');
const crypto = require('crypto');

const wss = new WebSocket.Server({ port: 3004 });

// Store connected clients for broadcasting
const clients = new Set();

// Generate random captcha token
function generateCaptchaToken() {
    return crypto.randomBytes(8).toString('hex');
}

// Broadcast message to all connected clients
function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

console.log('Enhanced WebSocket server is running on port 3004');
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received message:', data);
        
        switch(data.type) {
            case 'visited':
                console.log('Client sent visited message');
                console.log('Generating captcha token in 5 seconds...');
                
                // Wait 5 seconds then send random captcha token
                setTimeout(() => {
                    const token = generateCaptchaToken();
                    console.log(`Sending captcha token: ${token}`);
                    ws.send(JSON.stringify({
                        type: 'captcha',
                        captchaToken: token
                    }));
                }, 5000);
                break;
                
            case 'exploit-ready':
                console.log('Exploit page is ready');
                break;
                
            case 'attacker-login-ready':
                console.log('Attacker login page ready, sending captcha token in 3 seconds...');
                setTimeout(() => {
                    const token = generateCaptchaToken();
                    console.log(`Sending captcha token for attacker: ${token}`);
                    ws.send(JSON.stringify({
                        type: 'captcha',
                        captchaToken: token
                    }));
                }, 3000);
                break;
                
            case 'victim-login-ready':
                console.log('Victim login page ready, sending captcha token in 3 seconds...');
                setTimeout(() => {
                    const token = generateCaptchaToken();
                    console.log(`Sending captcha token for victim: ${token}`);
                    ws.send(JSON.stringify({
                        type: 'captcha',
                        captchaToken: token
                    }));
                }, 3000);
                break;
                
            case 'attacker-logged-in':
                console.log('✅ Attacker successfully logged in');
                // Broadcast to exploit page
                broadcast({
                    type: 'attacker-logged-in'
                });
                break;
                
            case 'attacker-logged-out':
                console.log('🔓 Attacker logged out');
                // Broadcast to exploit page
                broadcast({
                    type: 'attacker-logged-out'
                });
                break;
                
            case 'victim-logged-in':
                console.log('✅ Victim successfully logged in');
                // Broadcast to exploit page
                broadcast({
                    type: 'victim-logged-in'
                });
                break;
                
            case 'fetchlater-data':
                console.log('📡 fetchLater data received from backend:', data.data);
                // Broadcast the data to all connected clients (exploit page)
                broadcast({
                    type: 'fetchlater-data',
                    data: data.data
                });
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});
