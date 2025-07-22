const WebSocket = require('ws');
const crypto = require('crypto');

const wss = new WebSocket.Server({ port: 3004 });

// Generate random captcha token
function generateCaptchaToken() {
    return crypto.randomBytes(8).toString('hex');
}

console.log('WebSocket server is running on port 3004');
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'visited') {
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
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
