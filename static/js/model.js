ApiCalls = {

    "joinSession":
        function(sessId, plName){
            $.get("join-session/"+sessId+"/"+plName, function (response) {
                botInit(response, sessId, plName);
            });
        },

    "getSessionState":
        function(sessId){
            $.get("get-session-state/"+sessId, function (response) {
                displayState(response);
            });
        },

    "getGameState":
        function(sessId){
            $.get("get-game-state/"+sessId, function (response) {
                displayState(response);
            });

        }
};



//***************************************************
//@app.route('/join-session/<session_id>')
//@app.route('/join-session/<session_id>/<name>')

//@app.route('/get-session-state/<session_id>')

//@app.route('/get-game-state/<session_id>')
//***************************************************

//@app.route('/check-turn/<session_id>/<player_id>')

//@app.route('/hit/<session_id>/<player_id>')

//@app.route('/hold/<session_id>/<player_id>')

//@app.route('/get-previous-game/<session_id>')



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

