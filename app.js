
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

var allClients = {};
allClients['d'] = [];
var clientNum = 1;
io.on('connection', function(socket){
    console.log('User %s connected!', clientNum);
    allClients['d'].push(clientNum);
    clientNum++;

    socket.on('disconnect', function(){
        console.log('User disconnected');
    });
});

server.listen(8080, function () {
    var host = "localhost";
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

//Use anything from this root folder
app.use(express.static('.'));
