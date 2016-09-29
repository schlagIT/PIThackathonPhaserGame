/**
 * Created by Schlag on 01.07.2016
 */
var gametitle = function(game){

};

gametitle.prototype = {

    create: function()
    {

        //Background Image
        this.game.add.sprite(0,0,"bgTitleScreen",this);

        //GameTitleText
        var style = { font: "80px Roboto", fill: "#FFFFFF", align: "center", stroke:"black",strokeThickness: 5};
        var gameTitleText = this.game.add.text(this.world.centerX, 60, 'PIT Rocket',style);
        gameTitleText.anchor.set(0.5);
        gameTitleText.alpha = 0.1;
        //Alpha Wert verändern
        this.game.add.tween(gameTitleText).to( { alpha: 1 }, 1000, "Linear", true);

        //PlayButton
        var playButton = this.game.add.button(this.world.centerX,this.world.centerY,"play",this.playTheGame,this,1,0,2);
        playButton.anchor.setTo(0.5,0.5);

        //Tutorial Button
        //var tutorialbutton = this.game.add.button(this.world.centerX,200,"tutshow",this.showTutorial,this,1,0,2);
        //tutorialbutton.anchor.setTo(0.5,0.5);

        //MuteButton
        muteButton = this.game.add.button(this.world.width-25,30,"mute",this.muteGame,this,1,0,2);
        muteButton.anchor.setTo(0.5,0.5);

        //Sound
        sound_bg = this.game.add.audio("sound_bgloop",1,true);
        sound_bg.play('',0,0.7,true);

        sound_button = this.game.add.audio("sound_buttonclick",1,false);





    },
    playTheGame: function(){
        sound_bg.stop();
        sound_button.play('',0,1,false);
        this.game.state.start("TheGame");
    },
    showTutorial : function()
    {
        sound_button.play('',0,1,false);
        tutorialshow = this.game.add.button(0,0,"tutorial",this.backToMenu,this);
        tutorialshow.alpha = 0.1;
        this.game.add.tween(tutorialshow).to( { alpha: 1 }, 1000, "Linear", true);
    },
    backToMenu : function()
    {
        tutorialshow.destroy();
    },
    //Mute Button
    muteGame : function()
    {

        if(sound_bg.isPlaying == true)
        {
            sound_bg.stop();
        }
        else
        {

            sound_bg.play('',0,0.7,true);
        }

    }

};