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

    var deckStart = {
        "1": 28, "2": 28, "3": 28, "4": 28, "5": 28, "6": 28, "7": 28,
        "8": 28, "9": 28, "10": 28, "12": 28, "13": 28, "14": 28
    };


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

        function getMyCards(players){
            $.each(players, function(index, player){
                if (player["id"].toString() == playerId.toString()){
                    return player["hand"]["cards"];
                }
            });
            //for (i = 0; i < players.length; i++){
            //    if (players[i]["id"].toString() == playerId.toString()){
            //        return players[i]["hand"]["cards"];
            //    }
            //}
        }

        function getMyCardsSum(cards){
            var sum = [0];
            var sumTemp = [0];

            function checkIfInArray(valueToCheck, array){
                var check = false;
                $.each(array, function(key, value){
                    if (value == valueToCheck){
                        return check = true;
                    }
                });
                return check;
            }

            for (i = 0; i < cards.length; i++){

                if (cards[i]["number"] == 12 || cards[i]["number"] == 13 || cards[i]["number"] == 14){
                    for (j=0; j<sum.length; j++){
                        sum[j] += 10;
                    }
                }
                else if(cards[i]["number"] == 1){
                    for (j=0; j<sum.length; j++){
                        sumTemp[j] = parseInt(sum[j])+1;
                        sumTemp[sum.length+j] = parseInt(sum[j])+11;
                    }
                    sum = [];
                    for (j=0; j<sumTemp.length; j++){
                        if(!checkIfInArray(sumTemp[j], sum)){
                            sum.push(sumTemp[j]);
                        }
                    }
                }
                else {
                    for (j=0; j<sum.length; j++){
                        sum[j] += parseInt(cards[i]["number"]);
                    }
                }


            }
            return sum;
        }

        var testingCards = [
            {"color": "K", "number": 3},
            {"color": "K", "number": 1},
            {"color": "K", "number": 5},
            {"color": "K", "number": 1},
            {"color": "K", "number": 1},
            {"color": "K", "number": 1}
        ];


        var dealer = response["current_game"]["dealer"];
        var players = response["current_game"]["players"];
        var myCards = getMyCards(players);
        var testingCardsa = getMyCardsSum(testingCards);

        console.log(testingCardsa);
        //var myCardsSum = getMyCardsSum(myCards);

        var deckCurrent = getCurrentDeck(dealer, players);

        var cardsLeftTotal = countCardsLeft(deckCurrent);

        console.log("total cards left");
        console.log(cardsLeftTotal);
        //console.log("these are my cards");
        //console.log(myCardsSum);

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