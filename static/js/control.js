$(document).ready(function(){

    //ApiCalls.joinSession(66, "dejan", initBot);

    (function(){
        intervalCheckJoinSession = setInterval(function(){
            console.log("krenuo interval 1");
            if(bot){
                clearInterval(intervalCheckJoinSession);
                ApiCalls.getSessionState(bot.getSessionId(), waitForStart);
            }
        }, 500);
    })();

    function waitForStart(response){
        if(!response["current_game"]) {
            return;
        }

        //if(response["current_game"]) {
        //    gameStart(response);
        //}
        //else {
        //    console.log("nista jos");
            intervalWaitForStart = setInterval(function(){
            //    console.log("krenuo interval 2");
                ApiCalls.getSessionState(bot.getSessionId(), waitForStart);
            }, 500);
        //}
    }

    function gameStart(response){
        //if(!response["current_game"]) {
        //    return;
        //}
        clearInterval(intervalWaitForStart);
        console.log("game starts");
        console.log(response["current_game"]);
    }




});








function getSessionState(response){
    console.log("***************** get-session-state ********************");
    console.log(response)
}

function getGameState(response){
    console.log("***************** get-game-state ********************");
    console.log(response["current_game"]);
}

function getPreviousGame(response){
    console.log("***************** get-previous-game ********************");
    console.log(response["previous_game"]);
}

function checkTurn(response){
    console.log("***************** check-turn ********************");
    console.log(response["current_game"]["current_player"]["id"]);
}

function hit(response){
    console.log("***************** hit ********************");
    console.log(response);
}

function hold(response){
    console.log("***************** hold ********************");
    console.log(response);
}

