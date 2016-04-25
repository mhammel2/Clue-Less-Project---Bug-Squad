
//Start express to server up the static html index page
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
populateDeck();
//To initialize the game being off until we have four players
var gameOn = false;
var solution = [];

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//List of players to populate player select drop down menu
var availPlayers = [['mustard', 'Col. Mustard', Mustard], ['plum', 'Professor Plum',Plum], ['green', 'Mr. Green',Green],
    ['peacock', 'Mrs. Peacock',Peacock], ['scarlet', 'Miss Scarlet',Scarlet], ['white', 'Mrs. White',White]];
var players = [];
var playerNum = 1;
//arrays used to populate the update tables
var characters = [];
var weapons = [];

//count to track the turns
var count = 0;

//setting up the cardset Object
function CardSet(character, room, weapon){
    this.character = character;
    this.weapon = weapon;
    this.room = room;
}

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
        var player = new Player(playerNum, msg, socket.id);
        playerNum++;

        console.log('Player %s connected!', player.id);

        //remove the chosen character from the drop down menu
        for(var j = 0; j < availPlayers.length; j++) {
            if (availPlayers[j][1] === msg) {
                player.character = availPlayers[j][2];
                availPlayers.splice(j--, 1);
            }
        }
        players.push(player);

        //Can't start unless 6 players
        if(players.length >= 6)
            io.emit('gameReady', true);
        else
            io.emit('gameReady', false);

    });

    //function to broadcast a disproved card
    socket.on('disprove', function(msg){
        io.emit('message', msg + ' has been used to disprove the suggestion!');
    });

    //TODO: Implement start game functions
    socket.on('startGame', function() {
        io.emit('message', 'New Game Started!');
        //initializing the deck
        var deck = populateDeck();
        //function used to populate the Board[] array of boardLocations
        board = populateBoard();
        //getting the random index variables for the solution
        var characterIndex = Math.floor(Math.random() * 5);
        var roomIndex = Math.floor(Math.random() * 8) + 6;
        var weaponIndex = Math.floor(Math.random() * 5)+15;
        solution.push(deck[characterIndex]);
        solution.push(deck[roomIndex]);
        solution.push(deck[weaponIndex]);

        //broadcasting the solution message, to be deleted later
        io.emit('message', 'Solution: ' + solution[0].name + ' ' + solution[1].name + ' '
            + solution[2].name);


        //Remove the solution cards, then shuffle the cards and pass them to the players
        deck.splice(characterIndex,1);
        deck.splice(weaponIndex,1);
        deck.splice(roomIndex, 1);

        shuffle(deck);

        //passing the three cards to the players
        for(var i = 0; i < 6; i++)
        {
            for(var j = 0; j < 3; j++ )
            {
                players[i].hand.push(deck.pop());
            }
        }

        //populating the players hands on their screens
        for(var i = 0; i < 6; i++)
        {
            io.to(players[i].socket).emit('deck',players[i].hand);
        }




        //populate the rooms with the starting locations
        players[0].character.location = board[players[0].character.locationID];
        players[1].character.location = board[players[1].character.locationID];
        players[2].character.location = board[players[2].character.locationID];
        players[3].character.location = board[players[3].character.locationID];
        players[4].character.location = board[players[4].character.locationID];
        players[5].character.location = board[players[5].character.locationID];
        board[1].addPlayer(Scarlet);

        board[2].addPlayer(Mustard);

        board[4].addPlayer(White);

        board[5].addPlayer(Green);

        board[6].addPlayer(Peacock);

        board[7].addPlayer(Plum);

        weapons.push(new Weapon_Piece(20, "lead pipe", board[13]));
        weapons.push(new Weapon_Piece(18, "revolver", board[14]));
        weapons.push(new Weapon_Piece(17, "candlestick", board[16]));
        weapons.push(new Weapon_Piece(19, "rope", board[17]));
        weapons.push(new Weapon_Piece(16, "knife", board[13]));
        weapons.push(new Weapon_Piece(21, "wrench", board[19]));

        io.emit('updateWeapons', weapons);
        io.emit('updateCharacters', characters);

        game = new Game(board, solution);
        updateGame();


    });

    //Method to move a player
    socket.on('movePlayer', function(id){
        console.log('Move Player being called');
        //getting the id to identify a player
        var playerID = socket.id;
        var index;
        for(index = 0; index < players.length; index++)
        {
            if(players[index].socket == playerID)
                break;
        }
        io.emit('message', players[index].character.name + ' moves to ' + board[id].name);

        //updating the rooms
        board[players[index].character.locationID].removePlayer(players[index].character);
        players[index].character.locationID = id;
        players[index].character.location = board[players[index].character.locationID];
        board[id].addPlayer(players[index].character);

        if (board[id] instanceof Room)
            io.to(players[index].socket).emit('makeSuggestion', true);
        else
            io.to(players[index].socket).emit('makeSuggestion', false);

        updateGame();

    });

    //Method to process the suggestion of a player
    socket.on('playerSuggestion', function(cards) {
        var weaponID = cards[0];
        var characterID = cards[1];
        var index;
        var j;
        //finding the player who made the suggestion
        for (index = 0; index < players.length; index++) {
            if (players[index].socket == socket.id)
                break;
        }
        //finding the id of the player who is being suspected
        for (j = 0; j < players.length; j++)
        {
            if(players[j].character.id == characterID)
                break;
        }

        //finding the weapon passed as a parameter
        var weaponIndex;
        for (weaponIndex = 0; weaponIndex < weapons.length; weaponIndex++){
            if(weapons[weaponIndex].id == weaponID)
                break;
        }

        //finding the boardID
        var boardID = players[index].character.locationID;
        io.emit('message', players[index].character.name +
            ' suggests the murder took place by ' + players[j].character.name +
        ' at the ' + board[boardID].name + ' by using the ' + weapons[weaponIndex].name);

        //moving the player to the suggested location
        board[players[j].character.locationID].removePlayer(players[j].character);
        players[j].character.locationID = boardID;
        players[j].character.location = board[players[j].character.locationID];
        board[boardID].addPlayer(players[j].character);

        //moving the weapon to the suggested location
        weapons[weaponIndex].location = board[boardID];
        updateGame();

    });

    socket.on('playerAccusation', function(cards){
        var weaponID = cards[0];
        var characterID = cards[1];
        for(index = 0; index < players.length; index++)
        {
            if(players[index].socket == socket.id)
                break;
        }
        var boardID = players[index].character.locationID;
        var win = (characterID == solution[0].id && boardID == solution[1].id && weaponID == solution[2].id);
        console.log('characterID= ' + characterID+ 'soution0ID = ' + solution[0].id + 'boardID =' + boardID + 'solution1ID= ' + solution[1].id + 'weaponID = ' + weaponID + 'solution2ID = ' + solution[2].id);
        if(win)
            io.emit('message', players[index].character.name + ' wins!');
        else
            io.emit('message', players[index].character.name + ' looses!');
    });

    //Update the character and weapon tables on the client page
    var updateGame = function()
    {
        characters = [];
         for(var i = 0; i< players.length; i++)
         {
            characters.push(players[i].character);
         }
           io.emit('updateWeapons', weapons);
           io.emit('updateCharacters', characters);
        gameLoop();
    };

    //gameLoop to prompt users to make a move
    var gameLoop = function() {
            if(count == 6)
                count = 0;

            //To populate the list of available rooms to the active player
            var rooms = [];
            moveableRooms = board[players[count].character.locationID].neighbors;
            for(var j = 0; j < moveableRooms.length; j++){
                //If the room is not full, push it to the available options
                if(!board[moveableRooms[j].isFull])
                {
                    rooms.push(board[moveableRooms[j]]);
                }
            }
            //If there are no rooms to move into, the player loses a turn
            if(rooms.length ==0){
                io.emit('message', players[count].character.name + ' losses a turn.  No available moves');
                count++;
                gameLoop();
            }
                //populate the makeMove dropdown menu
            else {
                io.to(players[count++].socket).emit('makeMove', rooms);
            }
    };

    var makeAccusation = function () {

    };

    var makeSuggestion = function () {

    };


});

server.listen(8080, function () {
    var host = "localhost";
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

//Use anything from this root folder
app.use(express.static('.'));

function Player (id, character, socket) {
    this.id = id;
    this.character = character;
    this.hand = [];
    this.socket = socket;
}

//Creating the Player Object
Player.prototype = {
    constructor: Player,

    startNextTurn: function() {},

    //Assuming this is an authorized move, this removes the player from the old room
    //and adds him to the new room.  Hallways will remove the player, rooms will append/splice
    move:function(oldRoom, newRoom) {

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
function Hallway(id, name, neighbors){
    this.id = id;
    this.name = name;
    this.neighbors = neighbors;
    this.isFull = false;
    var player;
    this.addPlayer = function(p){
        player = p;
        this.isFull = true;
    };
    this.removePlayer = function(player){
        this.isFull = false;
    };
}

//The Room subclass
function Room(id, name, neighbors, associatedCard){
    var players = [];
    this.id = id;
    this.name = name;
    this.isFull = false;
    this.neighbors = neighbors;
    this.associatedCard = associatedCard;
    this.addPlayer = function(player)
    {
        players.push(player);
    };
    this.removePlayer = function(player){
        var i = players.indexOf(player);
        players.splice(i,1);
    }
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

    var board = [];
    h0 = new Hallway(0, "Hallway 0", [12, 13]);
    board.push(h0);
    h1 = new Hallway(1, "Hallway 1", [13, 14]);
    board.push(h1);
    h2 = new Hallway(2, "Hallway 2", [14, 15]);
    board.push(h2);
    h3 = new Hallway(3, "Hallway 3", [15, 16]);
    board.push(h3);
    h4 = new Hallway(4, "Hallway 4", [16, 17]);
    board.push(h4);
    h5 = new Hallway(5, "Hallway 5", [17, 18]);
    board.push(h5);
    h6 = new Hallway(6, "Hallway 6", [18, 19]);
    board.push(h6);
    h7 = new Hallway(7, "Hallway 7", [19, 12]);
    board.push(h7);
    h8 = new Hallway(8, "Hallway 8", [13, 20]);
    board.push(h8);
    h9 = new Hallway(9, "Hallway 9", [15, 20]);
    board.push(h9);
    h10 = new Hallway(10, "Hallway 10", [17, 20]);
    board.push(h10);
    h11 = new Hallway(11, "Hallway 11", [19, 20]);
    board.push(h11);
    r12 = new Room(12, "Study", [0,1,8], 15);
    board.push(r12);
    r13 = new Room(13, "Hall", [0,7,16], 7);
    board.push(r13);
    r14 = new Room(14, "Lounge", [1,2,18], 8);
    board.push(r14);
    r15 = new Room(15, "Dining Room", [2,3,9], 9);
    board.push(r15);
    r16 = new Room(16, "Kitchen", [3,4,12], 10);
    board.push(r16);
    r17 = new Room(17, "Ballroom", [4,5,10], 11);
    board.push(r17);
    r18 = new Room(18, "Conservatory", [5,6,14], 12);
    board.push(r18);
    r19 = new Room(19, "Library", [6,7,11], 14);
    board.push(r19);
    r20 = new Room(20, "Billiard Room", [8,9,10,11], 13);
    board.push(r20);
    return board;
}


//creating the weapon piece object
function Weapon_Piece(id, name, location)
{
    this.id = id;
    this.name = name;
    this.location = location;
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
function Weapon(id, name) {
    this.id = id;
    this.name = name;
}
Weapon.prototype = Object.create(Card.prototype);

//location subclass
function Location(id, name){
    this.id = id;
    this.name = name;
}
Location.prototype = Object.create(Card.prototype);

//creating the Character object
function Character(id,name,locationID)
{
    this.id = id;
    this.name = name;
    this.locationID = locationID;
    var location;
    this.updateLocation = function(board, id)
    {
        this.locationID = id;
        this.location = board[id];
    };

}
Character.prototype = Object.create(Card.prototype);



//populating the deck with card objects
//to provide random weapon/character/location cards, we can randomize
//the through the indices 0-5 for Character,6-15 for Location, and 15-21 for Weapon
function populateDeck() {
    var deck = [];
    Mustard = new Character(id = 1, name = "Col. Mustard", 2);
    deck.push(Mustard);
    Plum = new Character(id = 2, name = "Professor Plum", 7);
    deck.push(Plum);
    Green = new Character(id = 3, name = "Mr. Green", 5);
    deck.push(Green);
    Peacock = new Character(id = 4, name = "Mrs. Peacock", 6);
    deck.push(Peacock);
    Scarlet = new Character(id = 5, name = "Miss Scarlet", 1);
    deck.push(Scarlet);
    White = new Character(id = 6, name = "Mrs. White", 4);
    deck.push(White);
    Hall = new Location(id = 13, name = "Hall", Plum);
    deck.push(Hall);
    Lounge = new Location(id = 14, name = "Lounge");
    deck.push(Lounge);
    Dining_Room = new Location(id = 15, name = "Dining Room");
    deck.push(Dining_Room);
    Kitchen = new Location(id = 16, name = "Kitchen");
    deck.push(Kitchen);
    Ballroom = new Location(id = 17, name = "Ballroom");
    deck.push(Ballroom);
    Conservatory = new Location(id = 18, name = "Conservatory");
    deck.push(Conservatory);
    Billiard = new Location(id = 20, name = "Billiard");
    deck.push(Billiard);
    Library = new Location(id = 19, name = "Library");
    deck.push(Library);
    Study = new Location(id = 12, name = "Study");
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
    return deck;
}
function Game (board, solution) {
    this.board = board;
    this.solution = solution;
    solution.isEqual = function(c,r,w){
        return (solution.weapon.id == w.id && solution.character.id == c.id && solution.room.id == r.id);
    };
}

//Creating the Player Object
Game.prototype = {
    constructor: Game,

    compareToSolution: function (CardSet) {
        return solution.isEqual(CardSet.character, CardSet.room, CardSet.weapon);
    }

};

//Knuth Shuffle, used to shuffle an array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}