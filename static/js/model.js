// BOT ********************************************************************************
var bot;

function Bot(sessId, plId, plName){

    var ApiCalls = {
        "getSessionState":
            function(sessId, callback){
                $.get("get-session-state/"+sessId, function (response) {
                    callback(response);
                });
            },
        "hit":
            function(sessId, plId, callback){
                $.get("hit/"+sessId+"/"+plId, function (response) {
                    callback(response);
                });
            },
        "hold":
            function(sessId, plId, callback){
                $.get("hold/"+sessId+"/"+plId, function (response) {
                    callback(response);
                });
            }
    };

    var sessionId = sessId;
    var playerId = plId;
    var playerName = plName;
    var gameNumber = 1;

    var intervalWaitAllPlayers;
    var intervalCheckPlayerTurn;

    this.waitAllPlayers = function(){
        intervalWaitAllPlayers = setInterval(function(){
            console.log("bot created, waiting for all players");
            ApiCalls.getSessionState(sessionId, gameStart);
        }, 400);
    };

    function gameStart(response){
        if(response["current_game"]) {
            clearInterval(intervalWaitAllPlayers);
            checkPlayer();
        }
    }

    function checkPlayer(){
        intervalCheckPlayerTurn = setInterval(function () {
            console.log("waiting for my turn");
            ApiCalls.getSessionState(sessionId, checkPlayerTurn);
        }, 400);
    }


    function checkPlayerTurn(response){
        if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()) {
            if (response["games"].length+1 > gameNumber){

                console.log(gameNumber);


                gameNumber = response["games"].length+1;

                console.log(gameNumber);

                console.log("****************************************");
                console.log("*********** NEW GAME START *************");
                console.log("****************************************");
            }

            clearInterval(intervalCheckPlayerTurn);

            console.log("my turn");
            console.log(response);

        }
    }

    this.makeHit = function(){
        ApiCalls.hit(sessionId, playerId, hit);
    };

    this.makeHold = function(){
        ApiCalls.hold(sessionId, playerId, hold);
    };

    function hit(response){
        console.log("***************** hit ********************");
        console.log(response);
        clearInterval(intervalCheckPlayerTurn);
        checkPlayer();
    }

    function hold(response){
        console.log("***************** hold ********************");
        console.log(response);
        clearInterval(intervalCheckPlayerTurn);
        checkPlayer();
    }

}
// ************************************************************************************

// BOT INITIALIZATION *****************************************************************
Bot.init = function(response, sessId, plName){
    bot = new Bot(sessId, response['player_id'], plName);
};
// ************************************************************************************

// CHECK IF JOINED TO SESSION AND ALL THE PLAYERS ARE JOINED **************************
Bot.beforeStart = function(){
    intervalCheckJoinSession = setInterval(function(){
        console.log("checking session, if bot exists");
        if(bot){
            clearInterval(intervalCheckJoinSession);
            bot.waitAllPlayers();
        }
    }, 400);
};
// ************************************************************************************

// JOINING SESSION ********************************************************************
Bot.joinSession = function(sessId, plName, callback){
    $.get("join-session/"+sessId+"/"+plName, function (response) {
        callback(response, sessId, plName);
    });
};
// ************************************************************************************