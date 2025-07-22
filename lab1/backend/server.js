const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());
app.use(express.static('public'));

app.get('/xss', (req, res) => {
    res.sendFile('xss.html', { root: './public' });
});

app.get('/', (req, res) => {
    res.cookie('lol_how', 'you_accessed_me');
    res.send('Victim cookie set!');
});

app.listen(3000, () => console.log('Lab 1 running on http://localhost:3000'));
