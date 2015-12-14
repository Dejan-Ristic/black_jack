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
    var deckStart = {};
    for(i=1; i<15; i++){
        if(i != 11){
            deckStart[i.toString()] = 28;
        }
    }
    function Bot(sessId, plId, probRef){
        var sessionId = sessId;
        var playerId = plId;
        var probabilityRef = probRef;
        var intervalWaitAllPlayers;
        var intervalCheckPlayerTurn;
        (function(){
            intervalWaitAllPlayers = setInterval(function(){
                ApiCalls.getSessionState(sessionId, gameStart);
            }, 1000);
        })();
        function gameStart(response){
            if(response["current_game"]) {
                clearInterval(intervalWaitAllPlayers);
                checkPlayer();
            }
        }
        function checkPlayer(){
//****************************************************************************************
            if (gamesCounter == 200) {
                clearInterval(intervalCheckPlayerTurn);
                return;
            }
//****************************************************************************************
            clearInterval(intervalCheckPlayerTurn);
            intervalCheckPlayerTurn = setInterval(function(){
                ApiCalls.getSessionState(sessionId, checkPlayerTurn);
            }, 1000);
        }
        function checkPlayerTurn(response){
            if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()){
                displayGamesAndResults(response);
                clearInterval(intervalCheckPlayerTurn);
                considerMove(response);
            }
        }



        function considerMove(response){
            function getCurrentDeck(cardSets){
                var deck = {};
                $.each(deckStart, function(card, count){
                    deck[card] = count;
                });
                $.each(cardSets, function(index, cardSet){
                    $.each(cardSet, function(index, card){
                        deck[card["number"]] -= 1;
                    });
                });
                return deck;
            }
            function countCardsLeft(deck){
                var cardsNumber = 0;
                $.each(deck, function(card, count){
                    cardsNumber += count;
                });
                return cardsNumber;
            }
            function getCardsSums(cards){
                var sums = [0];
                $.each(cards, function(index, card){
                    if (card["number"] == 1 && sums.length == 1 && sums[0] <= 10) {
                        sums[0] += 1;
                        sums[1] = sums[0] + 10;
                    }
                    else {
                        $.each(sums, function(index, element){
                            sums[index] += (card["number"] < 10) ? parseInt(card["number"]) : 10;
                            sums.splice(index, (sums[index] > 21) ? 1 : 0);
                        });
                    }
                });
                return sums;
            }
            function greaterSum(sums){
                return (sums.length > 1) ? ((sums[0] > sums[1]) ? sums[0] : sums[1]) : sums[0];
            }

        //    ******************************************************************************************

            var dealer = response["current_game"]["dealer"];
            var players = response["current_game"]["players"];

            var allPlayersCards = [];
            allPlayersCards.push(dealer["hand"]["cards"]);
            $.each(players, function(index, player){
                var me = (player["id"].toString() == playerId.toString());
                me ? allPlayersCards.unshift(player["hand"]["cards"]) : allPlayersCards.push(player["hand"]["cards"]);
            });

            var deckCurrent = getCurrentDeck(allPlayersCards);
            var cardsLeftTotal = countCardsLeft(deckCurrent);


        //    ******************************************************************************************


            var myMaxNumber = 21 - greaterSum(getCardsSums(allPlayersCards[0]));

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


            var probability = (countGoodCards(myMaxNumber)/cardsLeftTotal*100).toFixed(2);


        //    ******************************************************************************************

            function compareSums(cardSets){
                var meIsBest = true;
                var myBestSum = greaterSum(getCardsSums(cardSets[0]));
                $.each(cardSets.slice(1), function(index, cardSet){
                    var oppBestSum = greaterSum(getCardsSums(cardSet));
                    if (oppBestSum && (oppBestSum >= myBestSum)) {
                        return meIsBest = false;
                    }
                });
                return meIsBest;
            }

            if (myMaxNumber == 0){
                hold();
            }


            //else if (!compareSums(allPlayersCards)){
            //    hit();
            //}
            else if (probability > probabilityRef){
                hit();
            }
            else {
                hold();
            }







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
    $.get("join-session/66/prob_40").done(function (response){
        window.bot = new Bot(66, response['player_id'], 40);
    });
    $.get("join-session/66/prob_30").done(function (response){
        window.bot2 = new Bot(66, response['player_id'], 30);
    });
    $.get("join-session/66/prob_46").done(function (response){
        window.bot3 = new Bot(66, response['player_id'], 46);
    });
});