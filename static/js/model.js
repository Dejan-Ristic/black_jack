
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


function BotStart(){

    var sessionId;
    var playerId;
    var playerName;

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
}

