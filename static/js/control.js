$(document).ready(function(){

    //ApiCalls.joinSession(66, "dejan", initBot);

    (function(){
        intervalCheckJoinSession = setInterval(function(){
            console.log("checking session, if bot exists");
            if(bot){
                clearInterval(intervalCheckJoinSession);
                intervalWaitForStart = setInterval(function(){
                    console.log("bot created, waiting for all players");
                    ApiCalls.getSessionState(bot.getSessionId(), gameStart);
                }, 500);
            }
        }, 500);
    })();

    function gameStart(response){
        if(response["current_game"]) {
            clearInterval(intervalWaitForStart);
            checkPlayer();
        }
    }

    function checkPlayer(){
        intervalCheckPlayerTurn = setInterval(function () {
            console.log("waiting for my turn");
            ApiCalls.getSessionState(bot.getSessionId(), checkPlayerTurn);
        }, 500);
    }


    function checkPlayerTurn(response){
        if(response["current_game"]["current_player"]["id"].toString() == bot.getPlayerId().toString()) {

            clearInterval(intervalCheckPlayerTurn);

            console.log("my turn");
            console.log(response);

        }
    }












    getSessionState = function (response){
        console.log("***************** get-session-state ********************");
        console.log(response);
    };

    getGameState = function (response){
        console.log("***************** get-game-state ********************");
        console.log(response["current_game"]);
    };

    getPreviousGame = function (response){
        console.log("***************** get-previous-game ********************");
        console.log(response["previous_game"]);
    };

    checkTurn = function (response){
        console.log("***************** check-turn ********************");
        console.log(response["current_game"]["current_player"]["id"]);
    };



    hit = function (response){
        console.log("***************** hit ********************");
        console.log(response);
        checkPlayer();
    };

    hold = function (response){
        console.log("***************** hold ********************");
        console.log(response);
        checkPlayer();
    };

});