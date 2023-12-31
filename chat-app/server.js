const express = require('express')
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser , userLeave, getRoomUsers} = require('./utils/users');


const app = express()
const server = http.createServer(app);
const io = socketio(server);


// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin( socket.id, username, room );
        socket.join(user.room); 

        // welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to chatcord'));

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })


    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
        }
    })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`The server is running on port ${PORT}`));