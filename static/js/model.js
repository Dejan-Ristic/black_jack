// BOT ********************************************************************************
var bot;

function Bot(sessId, plId){

    var sessionId = sessId;
    var playerId = plId;
    var gameNumber = 0;

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

    var intervalWaitAllPlayers;
    var intervalCheckPlayerTurn;

    this.getGameNumber = function(){
        return gameNumber;
    };


    var deckStart = {"1": 28, "2": 28, "3": 28, "4": 28, "5": 28, "6": 28, "7": 28, "8": 28, "9": 28, "10": 28, "12": 28, "13": 28, "14": 28};


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

            displayCards(response);

            if (response["games"].length+1 > gameNumber){

                gameNumber = response["games"].length+1;

                console.log("*********** NEW GAME START *************");
                console.log("****************************************");

            }

            clearInterval(intervalCheckPlayerTurn);

            displayCards(response);

            console.log("my turn");
            console.log(response);


            considerMove(response);

        }
    }


    function considerMove(response){

        function getCurrentDeck(dealer, players) {
            var deckCurrentLocal = {};
            for (var card in deckStart) {
                if (deckStart.hasOwnProperty(card)) {
                    deckCurrentLocal[card] = deckStart[card];
                }
            }
            for (i = 0; i < dealer["hand"]["cards"].length; i++) {
                var cardDealer = dealer["hand"]["cards"][i]["number"];
                deckCurrentLocal[cardDealer] -= 1;

            }
            for (i = 0; i < players.length; i++){
                for(j=0; j<players[i]["hand"]["cards"].length; j++){
                    var cardPlayer = players[i]["hand"]["cards"][j]["number"];
                    deckCurrentLocal[cardPlayer] -= 1;
                }
            }
            return deckCurrentLocal;
        }

        function countCardsLeft(deck){
            var cardsNumber = 0;
            for (var card in deck) {
                if (deck.hasOwnProperty(card)) {
                    cardsNumber += deck[card];
                }
            }
            return cardsNumber;
        }

        function countCardsGood(player){
            
        }

        var dealer = response["current_game"]["dealer"];
        var players = response["current_game"]["players"];

        var deckCurrent = getCurrentDeck(dealer, players);

        var cardsLeftTotal = countCardsLeft(deckCurrent);
        var cardsLeftGood = countCardsGood(player);



    }




    // =================== REMOVE LATER ============================
    this.makeHit = function(){
        ApiCalls.hit(sessionId, playerId, checkPlayer);
    };

    this.makeHold = function(){
        ApiCalls.hold(sessionId, playerId, checkPlayer);
    };
    // =============================================================

}
// ************************************************************************************


// CHECK IF JOINED TO SESSION *********************************************************
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
        bot = new Bot(sessId, response['player_id']);
    });
};
// ************************************************************************************