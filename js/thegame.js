/**
 * Created by Schlag on 01.07.2016
 */
var thegame = function(game){
    rotateDirection = 1;
    isShielded = false;
    isBoosted = false;
};

thegame.prototype = {


    create : function(){

        //Reset Level
        this.resetStats();

        //Steuerung und Physik reinladen
        cursors = this.game.input.keyboard.createCursorKeys();
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //BackgroundTile hinzufuegen
        bgTileSprite = this.game.add.tileSprite(0, 0, 1000, 800, 'bgStage');

        //Sprite hinzufuegen und auf Spieler setzen
        player = this.game.add.sprite(this.game.world.centerX,this.game.world.height-200,'playerRocket');

        //Auto Animation hinzufuegen
        player.animations.add('default', [0, 1, 2, 3], 10, true);
        player.animations.add('shielded', [8, 9, 10, 11], 10, true);
        player.animations.add('boosted', [4, 5, 6, 7], 10, true);

        //Auto Animation hinzufuegen
        player.animations.play('default');


        //Player mit Physics
        this.game.physics.arcade.enable(player);

        //Player Initialwerte
        player.anchor.x = 0.5;
        player.anchor.y = 0.5;
        player.body.width = 50;
        player.body.height = 50;

        //Worldbounds
        player.body.collideWorldBounds = true;

        //Enemy Gruppen
        enemiesPilon = this.game.add.group();
        enemiesPilon.enableBody = true;
        enemiesTree = this.game.add.group();
        enemiesTree.enableBody = true;

        //Booster Gruppen
        boosterGroupBoost = this.game.add.group();
        boosterGroupBoost.enableBody = true;
        boosterGroupShield = this.game.add.group();
        boosterGroupShield.enableBody = true;

        //TimerLoop für Spawn der Pilonen
        spawnTimerEnemies = this.game.time.events.loop(Phaser.Timer.SECOND * enemySpawnTime, this.enemySpawn, this);

        //TimerLoop für Spawn der Powerups
        spawnTimerPowerups = this.game.time.events.loop(Phaser.Timer.SECOND * 5, this.powerupSpawn, this);


        //Particle Dirtline
        emitter1 = this.game.add.emitter(this.game.world.centerX, this.game.world.centerY, 400);
        emitter1.makeParticles( [ 'turbine1', 'turbine2'] );

        //Particle SpeedBoostLine
        emitter3 = this.game.add.emitter(this.game.world.centerX, this.game.world.centerY, 400);
        emitter3.makeParticles( [ 'boost1', 'boost2', 'boost3' ] );

        //Particles Explosion bei Kollision mit Pilonen
        emitter2 = this.game.add.emitter(this.game.world.centerX, this.game.world.centerY, 400);
        emitter2.makeParticles('explodeMine');

        //Particles Explosion bei Kollision mit Pilonen
        emitter4 = this.game.add.emitter(this.game.world.centerX, this.game.world.centerY, 400);
        emitter4.makeParticles('explodeBomb');


        //Timer für Punkte
        this.game.time.events.loop(Phaser.Timer.SECOND, this.updatePoints, this);

        //Hintergrund fuer Lebensanzeige
        lifebackground = this.game.add.sprite(75,30,'lifebg');
        lifebackground.anchor.setTo(0.5,0.5);

        //Hintergrund fuer PunkteAnzeige
        scorebackground = this.game.add.sprite(this.game.world.centerX,35,'highscoreingame');
        scorebackground.anchor.setTo(0.5,0.5);

        //Score Hinzufuegen
        scoreText = this.game.add.text(this.game.world.centerX-15, 15, '0', { font: "28px Roboto", fill: "white", align: "center",stroke:"black",strokeThickness:5});

        //Lebensanzeige
        lifeGroup = this.game.add.group();
        for(var i=0;i<playerLives;i++)
        {
            var lifePositionX = (20+ i * (40 + Math.random() * 1));
            lifeGroup.create(lifePositionX, 15, 'life');
        }

        //PauseButton
        pauseButton = this.game.add.button(this.world.width-85,30,"pause",this.pauseGame,this,1,0,2);
        pauseButton.anchor.setTo(0.5,0.5);

        //MuteButton
        muteButton = this.game.add.button(this.world.width-25,30,"mute",this.muteGame,this,1,0,2);
        muteButton.anchor.setTo(0.5,0.5);

        //Sound Background Hinzufuegen
        sound_bg = this.game.add.audio("sound_bgloop2",1,true);
        sound_bg.play('',0,0.6,true);



       // sound_bg = this.game.add.audio("sound_bgloop",1,true);
       // sound_bg.play('',0,1,true);

       // sound_dash = this.game.add.audio("sound_dash",1,false);
        //sound_speeddash = this.game.add.audio("sound_speeddash",1,false);







    },





    update: function () {



        //Kollisionserkennung zwischen Player und Enemies
        this.game.physics.arcade.overlap(player, enemiesPilon, this.playerEnemyCollisionPilon, null, this);
        this.game.physics.arcade.overlap(player, enemiesTree, this.playerEnemyCollisionTree, null, this);

        //Kollisionsabfrage zwischen Player und Booster
        this.game.physics.arcade.overlap(player, boosterGroupBoost, this.playerBoosterCollisionBoost, null, this);
        this.game.physics.arcade.overlap(player, boosterGroupShield, this.playerBoosterCollisionShield, null, this);

        //Auto Werte normalisieren
        player.body.velocity.x = 0;
        player.body.angularVelocity = 0;

        //Kontinuirliche nach unten Bewegung des Spielers
        player.body.velocity.y = playerYspeed;

        //GameBorders setzen mit Wrap-Level
        this.wrapLevel();

        //Background Tile kontinuirlich nach unten bewegen
        bgTileSprite.tilePosition.y += tileScrollSpeed;



        //Schild/Boost Sprite Animations Status abfragen
        if (isShielded == true)
        {
            player.animations.play('shielded');
        }
        else if(isBoosted == true)
        {
            player.animations.play('boosted');
        }
        else player.animations.play('default');


        //Playerlifes Abfrage um GameOver Screen aufzurufen
        if(playerLives == 0)
        {

            this.gameOver();
        }

        //Bei Mouseclick/Touchklick das Player-Movement Dash mit Partikel Effekt
        if (this.game.input.mouse.button == 0 || this.game.input.pointer1.isDown)
        {

            //Wenn SpeedBoostaufgesammelt, dann speed Partikel und die schnellere Dash Methode
            if(isBoosted == true)
            {
                //sound_dash.stop();
                //sound_speeddash.play('',0,1,false);
                this.particleSpeedLine();
                this.dashWithSpeedBoost();
            }
            //Sonst normaler dash mit DIRT Partikel
            else
            {
                //sound_speeddash.stop();
                //sound_dash.play('',0,1,false);
                this.particleDirtLine();
                this.dash();
            }
        }

        //Sonst durchgehend das Auto rotieren
        else
            this.rotatePlayer();

        //Highscore Abfrage, um Schwierigkeit anzupassen
        if(pointCounter >=1000)
        {
            enemyYspeed =300;
            playerYspeed =150;
            tileScrollSpeed = 7;
        }




    },













    //Zurücksetzen zum Start des Spiels
    resetStats : function()
    {
        playerLives = 3;
        pointCounter = 0;
        enemyYspeed = 200;
        playerYspeed = 100;
        tileScrollSpeed = 3;
    },

   //Wrap It
    wrapLevel : function()
    {
        if(player.body.x <= worldBorderLeft)
            player.body.x = worldBorderRight-10;

        else if(player.body.x >= worldBorderRight)
            player.body.x = worldBorderLeft+10;
    },


    //Punkte hochzaehlen
    updatePoints : function()
    {
        pointCounter+=15;
        scoreText.setText(pointCounter);
    },


    //Pause Button
    pauseGame :  function() {
        this.game.paused = true;
        var pausedText = this.add.sprite(50, this.world.centerY, "unpause");
        this.input.onDown.add(function()
        {
            pausedText.destroy();
            this.game.paused = false;
        }, this);
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

                sound_bg.play('',0,0.5,true);
            }

    },

    //Game Over Screen aufrufen
    gameOver : function()
    {
        sound_bg.stop();
        this.game.state.start("GameOver");
    },










    //Player-Rotation: ständige Rotation
    rotatePlayer : function()
    {
        player.angle +=rotationSpeed * rotateDirection;

       /* if(player.angle > 90)
            rotateDirection = -1;
        player.body.angularVelocity = 50 *rotateDirection ;

        if(player.angle < -90)
            rotateDirection = 1;
        player.body.angularVelocity = 50 *rotateDirection ;*/
    },


    //Player nach vorne Gas Geben 'DASH'
    dash : function()
    {

        player.angle +=0 ;
        this.game.physics.arcade.velocityFromAngle(player.angle + 90, playerDashSpeed, player.body.velocity);
    },



    //Nach vorne Gas geben mit SpeedBoost aktiviert 'SPEEDDASH'
    dashWithSpeedBoost : function()
    {
        player.angle +=0 ;
        this.game.physics.arcade.velocityFromAngle(player.angle + 90, playerDashSpeed-200, player.body.velocity);
    },











    //SPAWN - Powerups
    /*Random Zahl von 1-10 setzen, wenn kleiner gleich 5 spawn ein Speedboost,
     wenn echt größer 5 spawn ein Shield*/
    powerupSpawn : function()
    {
        var random = (1 + Math.random() * (10 - 1));

        if(random <= 5)
        {
            // X und Y Position der einzelnen Booster festlegen
            var boosterSpawnPoint = (35 + Math.random() * (1000 - 35));

            //Booster zur BoosterGruppe hinzufuegen
            booster1 = boosterGroupBoost.create(boosterSpawnPoint, 0, 'powerBoost');

            //SpeedBoost Animationen hinzufuegen und abspielen
            booster1.animations.add('default', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26], 15, true);
            booster1.animations.play('default');

            //Booster Anchor und Body setzen
            booster1.anchor.x = 0.5;
            booster1.anchor.y = 0.5;
            booster1.body.width = 32;
            booster1.body.height = 32;

            //Bewegungs geschwindigkeit nach unten
            booster1.body.velocity.y = powerUpYSpeed;

            //Außerhalb der World-Bounds killen
            booster1.checkWorldBounds = true;
            booster1.outOfBoundsKill = true;
        }
        else if (random > 5)
        {
            // X und Y Position der einzelnen Booster festlegen
            var boosterSpawnPoint = (35 + Math.random() * (1000 - 35));

            //Booster zur BoosterGruppe hinzufuegen
            booster2 = boosterGroupShield.create(boosterSpawnPoint, 0, 'powerShield');

            //Shield Animationen hinzufuegen und abspielen
            booster2.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], 15, true);
            booster2.animations.play('default');

            //Booster Anchor und Body Setzen
            booster2.anchor.x = 0.5;
            booster2.anchor.y = 0.5;
            booster2.body.width = 32;
            booster2.body.height = 32;

            //Bewegungs geschwindigkeit nach unten
            booster2.body.velocity.y = powerUpYSpeed;

            //Außerhalb der World-Bounds killen
            booster2.checkWorldBounds = true;
            booster2.outOfBoundsKill = true;
        }

    },
    //SPAWN - Enemies
    /*Random Zahl von 1-10 setzen, wenn echt kleiner 4 spawn ein Pilon,
    wenn echt größer 9 spawnt eine AlienBomb*/
    enemySpawn : function()
    {
        for (var i=0;i<enemySpawnCounter;i++)
        {

            var random = (1+Math.random()*(10-1));

            if( random < 4)
            {
                // X und Y Position der einzelnen Gegner festlegen
                var enemyPositionX = (i * (enemySpace + Math.random() * 2));
                var enemyPositionY = (1 + Math.random() * (100 - 1));

                //Gegner zur GegnerGruppe hinzufuegen
                enemy1 = enemiesPilon.create(enemyPositionX, enemyPositionY, 'enemyMine');

                //Pilonen Animationen hinzufuegen und abspielen
                enemy1.animations.add('default', [0, 1], 10, true);
                enemy1.animations.play('default');


                //Pilonen Anchor und Body Setzen
                enemy1.anchor.x = 0.5;
                enemy1.anchor.y = 0.5;
                enemy1.body.width = 40;
                enemy1.body.height = 40;


                //Bewegungs geschwindigkeit nach unten
                enemy1.body.velocity.y = enemyYspeed;

                //Außerhalb der World-Bounds killen
                enemy1.checkWorldBounds = true;
                enemy1.outOfBoundsKill = true;


            }

            else if( random > 9)
            {
                //// X und Y Position der einzelnen Gegner festlegen
                enemy2 = enemiesTree.create(i * (enemySpace + Math.random() * 2), 0, 'enemyBomb');

                //AlienBomb Animationen hinzufuegen und abspielen
                enemy2.animations.add('default',[0, 1, 2, 3, 4, 5, 6, 7, 8], 5, true);
                enemy2.animations.play('default');

                //AlienBomb Anchor und Body Setzen
                enemy2.anchor.x = 0.5;
                enemy2.anchor.y = 0.5;
                enemy2.body.width = 40;
                enemy2.body.height = 40;

                //Bewegungs geschwindigkeit nach unten
                enemy2.body.velocity.y = enemyYspeed;

                //Außerhalb der World-Bounds killen
                enemy2.checkWorldBounds = true;
                enemy2.outOfBoundsKill = true;
            }

        }
    },








    // KOLLISION - Player vs Mine
    playerEnemyCollisionPilon : function (player,enemy)
    {
        if (isShielded == true)
        {
            this.particleBurstTree();
            enemy.kill();
            isShielded = false;
        }
        else
        {
            if(playerLives == 3)
            { lifeGroup.getChildAt(2).kill();}
            else if(playerLives == 2)
            { lifeGroup.getChildAt(1).kill();}
            else if(playerLives == 1)
            { lifeGroup.getChildAt(0).kill();}

            playerLives--;
            this.particleBurstPilon();
            enemy.kill();
        }

    },
    // KOLLISION - Player vs AlienBomb
    playerEnemyCollisionTree: function (player, enemy)
    {
        if (isShielded == true)
        {
            this.particleBurstTree();
            enemy.kill();
            isShielded = false;
        }
        else
            this.gameOver();


    },
    // KOLLISION - Aufsammeln von BOOST powerup
    playerBoosterCollisionBoost: function (player, booster)
    {
        pointCounter+=100;
        isBoosted = true;
        this.game.time.events.add(Phaser.Timer.SECOND * 5, this.boostSpeedStop, this);
        booster.kill();

    },
    //SpeedBoostZuruecksetzen auf normale dash Werte
    boostSpeedStop : function ()
    {
        isBoosted = false;
    },
    // KOLLISION - Player vs Shield  - Aufsammeln von SHIELD powerup
    playerBoosterCollisionShield: function (player, booster)
    {

        booster.kill();
        isShielded = true;


    },



    //PartikelSystem BURST für Kollision: Player vs Mine
    particleBurstPilon : function ()
    {
        emitter2.x = player.x;
        emitter2.y = player.y-30;
        emitter2.start(true, enemyParticleLifetime, null, enemyParticleAmount);
    },

    //PartikelSystem BURST für Kollision: Player vs Mine
    particleBurstTree : function ()
    {
        emitter4.x = player.x;
        emitter4.y = player.y-30;

        emitter4.start(true, enemyParticleLifetime, null, enemyParticleAmount);
    },

    //PartikelSystem TRAIL für Player-Dirtlines hinter sich her ziehen
    particleDirtLine : function()
    {
        var px = player.body.velocity.x;
        var py = player.body.velocity.y+70;

        emitter1.minParticleSpeed.set(px,py);
        emitter1.maxParticleSpeed.set(px,py);

        emitter1.x = player.x;
        emitter1.y = player.y;

        emitter1.start(true, playerParticleLifetime,null,playerParticleAmount);

    },
    //PartikelSystem TRAIL für Player- wenn er den SpeedBoost aufgehoben hat
    particleSpeedLine : function()
    {
        var px = player.body.velocity.x;
        var py = player.body.velocity.y+80;

        emitter3.minParticleSpeed.set(px,py);
        emitter3.maxParticleSpeed.set(px,py);

        emitter3.x = player.x;
        emitter3.y = player.y;

        emitter3.start(true, playerParticleLifetime,null,playerParticleAmount);

    }







};