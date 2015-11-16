// API CALLS **************************************************************************
var ApiCalls = {
    "joinSession":
        function(sessId, plName, callback){
            $.get("join-session/"+sessId+"/"+plName, function (response) {
                callback(response, sessId, plName);
            });
        },
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
// ************************************************************************************

// BOT ********************************************************************************
var bot;

function Bot(){

    var sessionId;
    var playerId;
    var playerName;
    var gameNumber = 1;

    this.setSessionId = function(sessId){
        sessionId = sessId;
        return sessionId;
    };
    this.getSessionId = function(){
        return sessionId;
    };
    this.setPlayerId = function(plId){
        playerId = plId;
        return playerId;
    };
    this.getPlayerId = function(){
        return playerId;
    };
    this.setPlayerName = function(plName){
        playerName = plName;
        return playerName;
    };
    this.getPlayerName = function(){
        return playerName;
    };
    this.setGameNumber = function(gameNo){
        gameNumber = gameNo;
        return gameNumber;
    };
    this.getGameNumber = function(){
        return gameNumber;
    };

    this.waitAllPlayers = function(){
        intervalWaitAllPlayers = setInterval(function(){
            console.log("bot created, waiting for all players");
            ApiCalls.getSessionState(sessionId, this.gameStart);
        }, 400);
    };

    this.gameStart = function(response){
        if(response["current_game"]) {
            clearInterval(intervalWaitAllPlayers);
            checkPlayer();
        }
    };

}
// ************************************************************************************

// BOT INITIALIZATION *****************************************************************
Bot.init = function(response, sessId, plName){
    bot = new Bot();
    bot.setSessionId(sessId);
    bot.setPlayerId(response['player_id']);
    bot.setPlayerName(plName);
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