//Start express to server up the static html index page
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Use anything from this root folder
app.use(express.static('.'));

//Listening for a port
server.listen(8080, function() {
    var host = "localhost";
    var port = this.address().port;

    console.log('Listening at http://%s:%s', host, port);
});

//Client connection notification 
io.on('connection', function(socket) {
    console.log('A client connected');
    socket.on('disconnect', function () {
        console.log('A client disconnected');
    });
});