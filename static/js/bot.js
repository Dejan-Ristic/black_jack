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
    function Bot(sessId, plId){
        var sessionId = sessId;
        var playerId = plId;
        var intervalWaitAllPlayers;
        var intervalCheckPlayerTurn;
        (function(){
            intervalWaitAllPlayers = setInterval(function(){
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
            intervalCheckPlayerTurn = setInterval(function(){
                ApiCalls.getSessionState(sessionId, checkPlayerTurn);
            }, 400);
        }
        function checkPlayerTurn(response){
            if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()){
                displayGamesAndResults(response);
                clearInterval(intervalCheckPlayerTurn);
                considerMove(response);
            }
        }
        function considerMove(response){
            function getCurrentDeck(dealer, players){
                function subtractCard(cardSet){
                    $.each(cardSet, function(index, card){
                        deck[card["number"]] -= 1;
                    });
                }
                var deck = {};
                $.each(deckStart, function(card, count){
                    deck[card] = count;
                });
                subtractCard(dealer["hand"]["cards"]);
                $.each(players, function(index, player){
                    subtractCard(player["hand"]["cards"]);
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
            function getMyCards(players){
                var cards = [];
                $.each(players, function(index, player){
                    if (player["id"].toString() == playerId.toString()){
                        $.each(player["hand"]["cards"], function(index, card){
                            cards.push(card);
                        });
                        return false;
                    }
                });
                return cards;
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

        //    ******************************************************************************************

            //var testingCards = [
            //    {"color": "K", "number": 10},
            //    {"color": "K", "number": 8},
            //    {"color": "K", "number": 2},
            //    {"color": "K", "number": 1},
            //    {"color": "K", "number": 5}
            //];
            //var myCardsSums = getCardsSums(testingCards);




            var dealer = response["current_game"]["dealer"];
            var players = response["current_game"]["players"];

            var deckCurrent = getCurrentDeck(dealer, players);
            var cardsLeftTotal = countCardsLeft(deckCurrent);
            var myCards = getMyCards(players);
            var myCardsSums = getCardsSums(myCards);


        //    ******************************************************************************************

            function maxHitNumber(sums){
                return (sums.length > 1) ? ((sums[0] > sums[1]) ? sums[0] : sums[1]) : sums[0];
            }

            var myMaxNumber = 21 - maxHitNumber(myCardsSums);

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
                for (var i = 1; i <= number; i++) {
                    if (i < 11){
                        countCards += deckTemp[i];
                    }
                }
                return countCards;
            }


            var probability = (countGoodCards(myMaxNumber)/cardsLeftTotal*100).toFixed(2);
            console.log("probability is "+probability+"%");





        }
        function hit(){
            ApiCalls.hit(sessionId, playerId, checkPlayer);
        }
        function hold(){
            ApiCalls.hold(sessionId, playerId, checkPlayer);
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
    $.get("join-session/66/dejan").done(function (response){
        window.bot = new Bot(66, response['player_id']);
    });
});