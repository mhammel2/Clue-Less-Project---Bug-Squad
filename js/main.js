//Start the Sefarers
var CluelessGame = CluelessGame || {};

//Initiate the game object and the specified resolution
CluelessGame.game = new Phaser.Game(800, 600, Phaser.CANVAS, '');

//Add all the game states
CluelessGame.game.state.add('Boot', CluelessGame.Boot);
CluelessGame.game.state.add('Preload', CluelessGame.Preload);
CluelessGame.game.state.add('Game', CluelessGame.Game);

//Start the boot state
CluelessGame.game.state.start('Boot'); 