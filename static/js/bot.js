$(document).ready(function(){
    var ApiCalls = {
        "getSessionState":
            function(sessId, callback){
                $.get("get-session-state/"+sessId).done(function(response){
                    callback(response);
                });
            },
        "hit":
            function(sessId, plId, callback){
                $.get("hit/"+sessId+"/"+plId).done(function(response){
                    callback(response);
                });
            },
        "hold":
            function(sessId, plId, callback){
                $.get("hold/"+sessId+"/"+plId).done(function(response){
                    callback(response);
                });
            }
    };
    var BotMethods = {
        "resetDeck":
            function(deck){
                for(i=1; i<15; i++){
                    if(i != 11){
                        deck[i.toString()] = 28;
                    }
                }
            },
        "setCurrentDeck":
            function(cardSets, deck){
                $.each(cardSets, function(index, cardSet){
                    $.each(cardSet, function(index, card){
                        deck[card["number"]] -= 1;
                    });
                });
            },
        "countCardsLeft":
            function (deck){
                var cardsNumber = 0;
                $.each(deck, function(card, count){
                    cardsNumber += count;
                });
                return cardsNumber;
            },
        "getCardsSums":
            function (cards){
                var sums = [0];
                $.each(cards, function(index, card){
                    if (card["number"] == 1 && sums.length == 1 && sums[0] <= 10) {
                        sums[0] += 1;
                        sums[1] = sums[0] + 10;
                    }
                    else {
                        $.each(sums, function(index, sum){
                            sums[index] += (card["number"] < 10) ? parseInt(card["number"]) : 10;
                            sums.splice(index, (sums[index] > 21) ? 1 : 0);
                        });
                    }
                });
                return sums;
            },
        "greaterSum":
            function (sums){
                return (sums.length > 1) ? ((sums[0] > sums[1]) ? sums[0] : sums[1]) : sums[0];
            }
    };

    window.gamesCounter = 0;

    function Bot(sessId, plId){
        var sessionId = sessId;
        var playerId = plId;
        var deckCurrent = {};
        var intervalWaitAllPlayers;
        var intervalCheckPlayerTurn;
        (function(){
            intervalWaitAllPlayers = setInterval(function(){
                ApiCalls.getSessionState(sessionId, gameStart);
            }, 600);
        })();
        function gameStart(response){
            if(response["current_game"]) {
                clearInterval(intervalWaitAllPlayers);
                BotMethods.resetDeck(deckCurrent);
                checkPlayer();
            }
        }
        function checkPlayer(){
//****************************************************************************************
            if (gamesCounter == 100) {
                clearInterval(intervalCheckPlayerTurn);
                return;
            }
            clearInterval(intervalCheckPlayerTurn);
//****************************************************************************************
            intervalCheckPlayerTurn = setInterval(function(){
                ApiCalls.getSessionState(sessionId, checkPlayerTurn);
            }, 600);
        }
        function checkPlayerTurn(response){
            if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()){
                if(response["games"].length > gamesCounter){
                    gamesCounter = response["games"].length;
                    if((gamesCounter-4)%3 == 0 && gamesCounter > 3){
                        BotMethods.resetDeck(deckCurrent);
                    }
                }
                displayGamesAndResults(response);
                clearInterval(intervalCheckPlayerTurn);
                considerMove(response);
            }
        }



        function considerMove(response){

            var dealer = response["current_game"]["dealer"];
            var players = response["current_game"]["players"];
            var allPlayersCards = [];

            allPlayersCards.push(dealer["hand"]["cards"]);
            $.each(players, function(index, player){
                var me = (player["id"].toString() == playerId.toString());
                me ? allPlayersCards.unshift(player["hand"]["cards"]) : allPlayersCards.push(player["hand"]["cards"]);
            });


            BotMethods.setCurrentDeck(allPlayersCards, deckCurrent);

            console.log(deckCurrent);

            var cardsLeftTotal = BotMethods.countCardsLeft(deckCurrent);


        //    ******************************************************************************************


            var myMaxNumber = 21 - BotMethods.greaterSum(BotMethods.getCardsSums(allPlayersCards[0]));

            function countGoodCards(number) {
                var countCards = 0;
                var deckTemp = {};
                $.each(deckCurrent, function (card, count) {
                    if(parseInt(card) < 10) {
                        deckTemp[card] = count;
                    }
                    else{
                        if (deckTemp.hasOwnProperty("10")){
                            deckTemp["10"] += count;
                        }
                        else deckTemp["10"] = count;
                    }
                });
                var counter = (number < 11) ? number : 10;
                for (var i = 1; i <= counter; i++) {
                    countCards += deckTemp[i];
                }
                return countCards;
            }


            var probability = Math.floor(countGoodCards(myMaxNumber)/cardsLeftTotal*100);


        //    ******************************************************************************************

            function compareSums(cardSets){
                var meIsBest = true;
                var myBestSum = BotMethods.greaterSum(BotMethods.getCardsSums(cardSets[0]));
                $.each(cardSets.slice(1), function(index, cardSet){
                    var oppBestSum = BotMethods.greaterSum(BotMethods.getCardsSums(cardSet));

                    if (oppBestSum && (oppBestSum > myBestSum)) {
                        return meIsBest = false;
                    }
                });
                return meIsBest;
            }




            //if (!compareSums(allPlayersCards)) {
            //    hit();
            //}
            //else if (probability > 30) {
            //    hit();
            //}
            //else {
            //    hold();
            //}


        }



        function hit(){
            ApiCalls.hit(sessionId, playerId, checkPlayer);
        }
        function hold(){
            ApiCalls.hold(sessionId, playerId, checkPlayer);
        }



        // =================== REMOVE LATER ============================
        this.makeHit = function(){
            hit();
        };
        this.makeHold = function(){
            hold();
        };
        // =============================================================


    }
    $.get("join-session/66/dejan").done(function (response){
        window.bot = new Bot(66, response['player_id']);
    });
});