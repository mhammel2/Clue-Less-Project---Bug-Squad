
//Start express to server up the static html index page
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);

//To initialize the game being off until we have four players
var gameOn = false;

//function used to populate the Board[] array of boardLocations
populateBoard();
populateDeck();
// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//List of players to populate player select drop down menu
var availPlayers = [['mustard', 'Col. Mustard',Mustard], ['plub', 'Professor Plub',Plub], ['green', 'Mr. Green',Green],
    ['peacock', 'Mrs. Peacock',Peacock], ['scarlet', 'Miss Scarlet',Scarlet], ['white', 'Mrs. White',White]];
var players = [];
var playerNum = 1;

io.on('connection', function(socket){
    //First populate the available players to choose from.
    for(var i = 0; i < availPlayers.length; i++)
        io.emit('viewPlayers', availPlayers[i]);
    
    //Not ready unless 6 players are playing
    if(players.length >= 6)
        io.emit('gameReady', true);
    else
        io.emit('gameReady', false);

    //notification of disconnecting players
    socket.on('disconnect', function(){
        for (var i = 0; i < players.length; i++) {
            if (players[i].socket == socket.id) {
                console.log('Player %s disconnected! :(', players[i].id);
                players.splice(i, 1);
            }
        }
    });

    //TODO: Implement start game functions
    socket.on('startGame', function() {

    });

    /**  Original messaging code lines left in
    socket.on('message', function(msg){
        for (var i = 0; i < players.length; i++) {
            if (players[i].socket == socket.id) {
                io.emit('message', 'Player ' + players[i].id + ': ' + msg);
            }
        }

    });*/

    //Allows users to select a character from the drop down box
    socket.on('select-character', function(msg){
        //Emitting the message to the status update bar on the top of the page
        io.emit('message', msg + ' joined the game!');
        //If 6 or more players are connected.  The game is ready to start

        //Creating a new player instance
        var player = new Player(playerNum, msg, null, socket.id);
        playerNum++;
        players.push(player);
        console.log('Player %s connected!', player.id);

        //Can't start unless 6 players
        if(players.length >= 6)
            io.emit('gameReady', true);
        else
            io.emit('gameReady', false);

        //remove the chosen character from the drop down menu
        for(var j = 0; j < availPlayers.length; j++) {
            if (availPlayers[j][1] === msg) {
                player.character = availPlayers[j][2];
                availPlayers.splice(j--, 1);
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

function Player (id, character, hand, socket) {
    this.id = id;
    this.character = character;
    this.hand = hand;
    this.socket = socket;
}

//Creating the Player Object
Player.prototype = {
    constructor: Player,

    startNextTurn: function() {},

    //Assuming this is an authorized move, this removes the player from the old room
    //and adds him to the new room.  Hallways will remove the player, rooms will append/splice
    move:function(oldRoom, newRoom) {
        if(oldRoom instanceof Hallway)
            oldRoom.player = null;
        else
        {
            var i = oldRoom.players.indexOf(player);
            oldRoom.players.splice(i,1);
        }

        if(newRoom instanceof Hallway)
            newRoom.player = player;
        else
            newRoom.players.push(player);
    },

    makeSuggestion: function(){},

    selectCharacter: function(){return character;},

    respond: function(){return card;}

};

//Creating the boardLocation Object
function BoardLocation(id, name, neighbors){
    this.id = id;
    this.name = name;
    this.neighbors = neighbors;
}

//Creating the subclass Hallway
function Hallway(){
    this.isFilled = false;
    var player;
}

//The Room subclass
function Room(id, name, neighbors, associatedCard){
    var players = [];
    this.id = id;
    this.name = name;
    this.neighbors = neighbors;
    this.associatedCard = associatedCard;

}

//Hallway inheriting BoardLocation
Hallway.prototype = Object.create(BoardLocation.prototype);

//Updating hallway constructor
Hallway.prototype.constructor = Hallway;

//Updating the Room constructor
Room.prototype = Object.create(BoardLocation.prototype);
Room.prototype.constructor = Room;

//creating all the room objects, the 1st parameter is the room ID
//the third parameter are the IDs of its neighbor.  This logic will play later on
function populateBoard() {
    h1 = new Hallway(1, "Hallway 1", [13, 14]);
    h2 = new Hallway(2, "Hallway 2", [14, 15]);
    h3 = new Hallway(3, "Hallway 3", [15, 16]);
    h4 = new Hallway(4, "Hallway 4", [16, 17]);
    h5 = new Hallway(5, "Hallway 5", [17, 18]);
    h6 = new Hallway(6, "Hallway 6", [18, 19]);
    h7 = new Hallway(7, "Hallway 7", [19, 20]);
    h8 = new Hallway(8, "Hallway 8", [20, 13]);
    h9 = new Hallway(9, "Hallway 9", [14, 21]);
    h10 = new Hallway(10, "Hallway 10", [16, 21]);
    h11 = new Hallway(11, "Hallway 11", [18, 21]);
    h12 = new Hallway(12, "Hallway 12", [20, 21]);
    r13 = new Room(13, "Study", [1,2,9], 15);
    r14 = new Room(14, "Hall", [1,8,17], 7);
    r15 = new Room(15, "Lounge", [2,3,14], 8);
    r16 = new Room(16, "Dining Room", [3,4,10], 9);
    r17 = new Room(17, "Kitchen", [4,5,13], 10);
    r18 = new Room(18, "Ballroom", [5,6,11], 11);
    r19 = new Room(19, "Conservatory", [6,7,15], 12);
    r20 = new Room(20, "Library", [7,8,12], 14);
    r21 = new Room(21, "Billiard Room", [9,10,11,12], 13);

}


//creating the card object
function Card(id, name)
{
    this.id = id;
    this.name = name;

}

//Card object, parent of the character/weapon/location
Card.prototype = {
    constructor: Card,
    isEqual: function(name){
        return this.name === name;
    }
};

//function subclass
function Weapon() {}
Weapon.prototype = Object.create(Card.prototype);

//location subclass
function Location(){}
Location.prototype = Object.create(Card.prototype);


function Character(id,name,location)
{
    this.id = id;
    this.name = name;
    this.location = location;
}
Character.prototype = Object.create(Card.prototype);


//populating the deck with card objects
//to provide random weapon/character/location cards, we can randomize
//the through the indices 0-5 for Character,6-15 for Location, and 15-21 for Weapon
function populateDeck() {
    var deck = [];
    Mustard = new Character(id = 1, name = "Col. Mustard", 3);
    deck.push(Mustard);
    Plub = new Character(id = 2, name = "Professor Plub", 8);
    deck.push(Plub);
    Green = new Character(id = 3, name = "Mr. Green", 6);
    deck.push(Green);
    Peacock = new Character(id = 4, name = "Mrs. Peacock", 7);
    deck.push(Peacock);
    Scarlet = new Character(id = 5, name = "Miss Scarlet", 2);
    deck.push(Scarlet);
    White = new Character(id = 6, name = "Mrs. White", 5);
    deck.push(White);
    Hall = new Location(id = 7, name = "Hall", Plub);
    deck.push(Hall);
    Lounge = new Location(id = 8, name = "Lounge");
    deck.push(Lounge);
    Dining_Room = new Location(id = 9, name = "Dining Room");
    deck.push(Dining_Room);
    Kitchen = new Location(id = 10, name = "Kitchen");
    deck.push(Kitchen);
    Ballroom = new Location(id = 11, name = "Ballroom");
    deck.push(Ballroom);
    Conservatory = new Location(id = 12, name = "Conservatory");
    deck.push(Conservatory);
    Billiard = new Location(id = 13, name = "Billiard");
    deck.push(Billiard);
    Library = new Location(id = 14, name = "Library");
    deck.push(Library);
    Study = new Location(id = 15, name = "Study");
    deck.push(Study);
    Knife = new Weapon(id = 16, name = "Knife");
    deck.push(Knife);
    Candlestick = new Weapon(id = 17, name = "Candlestick");
    deck.push(Candlestick);
    Revolver = new Weapon(id = 18, name = "Revolver");
    deck.push(Revolver);
    Rope = new Weapon(id = 19, name = "Rope");
    deck.push(Rope);
    Lead_Pipe = new Weapon(id = 20, name = "Lead Pipe");
    deck.push(Lead_Pipe);
    Wrench = new Weapon(id = 21, name = "Wrench");
    deck.push(Wrench);
}
