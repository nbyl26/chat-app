const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = new Set();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', (username) => {
        socket.username = username;
        users.add(username);
        io.emit('chat message', { user: 'Server', message: `${username} has joined the chat.` });
        io.emit('update users', Array.from(users));
    });

    socket.on('chat message', (data) => {
        const timestamp = new Date().toLocaleTimeString();
        io.emit('chat message', { user: data.user, message: data.message, time: timestamp });
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.emit('chat message', { user: 'Server', message: `${socket.username} has left the chat.` });
            io.emit('update users', Array.from(users));
        }
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3001; 
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
