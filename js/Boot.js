/*
  Phaser boot state - first state which is loaded, to load the assets for the preload state
*/

var CluelessGame = CluelessGame || {};

CluelessGame.Boot = function(){};

//Game config and assets
CluelessGame.Boot.prototype = {
  preload: function() {
    //assets for loading screen bar
    //this.game.load.spritesheet('preloadbar', 'Resources/TreasureAnimation.png', 100, 100, 3);
  },
  create: function() {
    //the game will have a sky blue background
    this.game.stage.backgroundColor = '#fffff';

    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
  
    //Start the preload state
    this.state.start('Preload');
  }};