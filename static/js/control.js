function botInit(response, sessId, plName) {
    bot = new BotStart();
    bot.setSessionId(sessId);
    bot.setPlayerId(response['player_id']);
    bot.setPlayerName(plName);
}

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