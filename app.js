
//Start express to server up the static html index page
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var players = [];
var playerNum = 1;
io.on('connection', function(socket){
    var player = {};
    player.id = playerNum;
    playerNum++;
    player.socket = socket.id;
    players.push(player);
    console.log('Player %s connected!', player.id);

    socket.on('disconnect', function(){
        for (var i = 0; i < players.length; i++) {
            if (players[i].socket == socket.id) {
                console.log('Player %s disconnected! :(', players[i].id);
                players.splice(i, 1);
            }
        }
    });

    socket.on('message', function(msg){
        for (var i = 0; i < players.length; i++) {
            if (players[i].socket == socket.id) {
                io.emit('message', 'Player ' + players[i].id + ': ' + msg);
            }
        }

    });
});

server.listen(8080, function () {
    var host = "localhost";
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

//Use anything from this root folder
app.use(express.static('.'));
