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
    var gameNumber = 0;

    var intervalWaitAllPlayers;
    var intervalCheckPlayerTurn;

    (function waitAllPlayers(){
        intervalWaitAllPlayers = setInterval(function(){
            console.log("bot created, waiting for all players");
            ApiCalls.getSessionState(sessionId, gameStart);
        }, 400);
    })();

    function gameStart(response){
        if(response["current_game"]) {
            clearInterval(intervalWaitAllPlayers);
            checkPlayer();
        }
    }

    function checkPlayer(){
        clearInterval(intervalCheckPlayerTurn);
        intervalCheckPlayerTurn = setInterval(function () {
            console.log("waiting for my turn");
            ApiCalls.getSessionState(sessionId, checkPlayerTurn);
        }, 400);
    }

    function checkPlayerTurn(response){
        if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()) {
            if (response["games"].length+1 > gameNumber){

                gameNumber = response["games"].length+1;

                console.log("*********** NEW GAME START *************");
                console.log("****************************************");

            }

            clearInterval(intervalCheckPlayerTurn);

            var dealerCards = response["current_game"]["dealer"]["hand"]["cards"];
            var players = response["current_game"]["players"];

            console.log("dealer cards");
            for(i= 0; i<dealerCards.length; i++) {
                console.log(dealerCards[i]["color"]);
                console.log(dealerCards[i]["number"]);
            }

            for(i= 0; i<players.length; i++) {
                console.log("player"+(i+1)+" cards");
                for(j=0; j<players[i]["hand"]["cards"].length; j++){
                    console.log(players[i]["hand"]["cards"][j]["color"]);
                    console.log(players[i]["hand"]["cards"][j]["number"]);
                }

            }

            console.log("my turn");
            console.log(response);

        }
    }



    this.makeHit = function(){
        ApiCalls.hit(sessionId, playerId, checkPlayer);
    };

    this.makeHold = function(){
        ApiCalls.hold(sessionId, playerId, checkPlayer);
    };

}
// ************************************************************************************


// CHECK IF JOINED TO SESSION AND ALL THE PLAYERS ARE JOINED **************************
Bot.beforeStart = function(){
    var intervalCheckJoinSession = setInterval(function(){
        console.log("checking session, if bot exists");
        if(bot){
            clearInterval(intervalCheckJoinSession);
        }
    }, 400);
};
// ************************************************************************************


// JOINING SESSION AND BOT INITIALIZATION *********************************************
Bot.joinSession = function(sessId, plName){
    $.get("join-session/"+sessId+"/"+plName, function (response) {
        bot = new Bot(sessId, response['player_id'], plName);
    });
};
// ************************************************************************************