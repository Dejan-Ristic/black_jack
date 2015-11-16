$(document).ready(function(){

    //ApiCalls.joinSession(66, "dejan", Bot.init);

    Bot.beforeStart();

    checkPlayer = function(){
        intervalCheckPlayerTurn = setInterval(function () {
            console.log("waiting for my turn");
            ApiCalls.getSessionState(bot.getSessionId(), checkPlayerTurn);
        }, 400);
    };

    function checkPlayerTurn(response){
        if(response["current_game"]["current_player"]["id"].toString() == bot.getPlayerId().toString()) {
            if (response["games"].length+1 > bot.getGameNumber()){

                console.log(bot.getGameNumber());


                bot.setGameNumber(response["games"].length+1);

                console.log(bot.getGameNumber());

                console.log("****************************************");
                console.log("*********** NEW GAME START *************");
                console.log("****************************************");
            }

            clearInterval(intervalCheckPlayerTurn);

            console.log("my turn");
            console.log(response);

        }
    }

});










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
        clearInterval(intervalCheckPlayerTurn);
        checkPlayer();
    };

    hold = function (response){
        console.log("***************** hold ********************");
        console.log(response);
        clearInterval(intervalCheckPlayerTurn);
        checkPlayer();
    };

