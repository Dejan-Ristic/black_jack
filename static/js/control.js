function botInit(response, sessId, plName){
    bot = new BotStart();
    bot.setSessionId(sessId);
    bot.setPlayerId(response['player_id']);
    bot.setPlayerName(plName);

    goToGame();

}

function goToGame(){

    console.log("*************** Session Object ******************");
    ApiCalls.getSessionState(bot.getSessionId());

    //Game object izgelda isto kao Session.current_game  PROVERITI !!!!!!!!!!!!!!!!!!
    console.log("*************** Game Object ******************");
    ApiCalls.getGameState(bot.getSessionId());

}

function displayState(response){
    console.log(response);
}