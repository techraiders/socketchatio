const express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io').listen(server),
      usernames = [];

server.listen(process.env.PORT || 3000);
console.log('server running...')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  console.log('socket connected');

  socket.on('new user', (username, callback) => {
    if(usernames.includes(username)) {
      callback(false);
    } else {
      callback(true);
      socket.username = username;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  function updateUsernames () {
    io.sockets.emit('usernames', usernames);
  }

  // send messages
  socket.on('send message', (data) => {
    console.log(data);
    io.sockets.emit('new message', {
      msg: data,
      user: socket.username
    });
  });

  socket.on('disconnect', () => {
    if (!socket.username) return;
    usernames.splice(usernames.indexOf(socket.username, 1));
    updateUsernames();
  });
});