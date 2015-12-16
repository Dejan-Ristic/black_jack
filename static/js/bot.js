$(document).ready(function(){
    function Bot(sessId, plId){
        var sessionId = sessId;
        var playerId = plId;
        var intervalWaitAllPlayers;
        var intervalCheckPlayerTurn;
        var deckStart = {
            "1":28, "2":28, "3":28, "4":28, "5":28, "6":28, "7":28, "8":28, "9":28, "10":28, "12":28, "13":28, "14":28
        };
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
        (function(){
            intervalWaitAllPlayers = setInterval(function(){
                ApiCalls.getSessionState(sessionId, function(response){
                    if(response["current_game"]) {
                        clearInterval(intervalWaitAllPlayers);
                        checkPlayer();
                    }
                });
            }, 400);
        })();
        function checkPlayer(){
            intervalCheckPlayerTurn = setInterval(function(){
                ApiCalls.getSessionState(sessionId, checkPlayerTurn);
            }, 400);
        }
        function checkPlayerTurn(response){
            if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()){
                clearInterval(intervalCheckPlayerTurn);
                considerMove(response);
            }
        }
        function considerMove(response){
            function getCurrentDeck(cardSets){
                var deck = {};
                $.each(deckStart, function (number, count){
                    deck[number] = count;
                });
                $.each(cardSets, function(index, cardSet){
                    $.each(cardSet, function(index, card){
                        deck[card["number"]] -= 1;
                    });
                });
                return deck;
            }
            function countCardsLeft(deck) {
                var cardsNumber = 0;
                $.each(deck, function (card, count) {
                    cardsNumber += count;
                });
                return cardsNumber;
            }
            function getBestSum(cards) {
                var sums = [0];
                $.each(cards, function (index, card) {
                    if (card["number"] == 1 && sums.length == 1 && sums[0] <= 10) {
                        sums[0] += 1;
                        sums[1] = sums[0] + 10;
                    }
                    else {
                        $.each(sums, function (index, sum) {
                            sums[index] += (card["number"] < 10) ? parseInt(card["number"]) : 10;
                            sums.splice(index, (sums[index] > 21) ? 1 : 0);
                        });
                    }
                });
                return (sums.length > 1) ? ((sums[0] > sums[1]) ? sums[0] : sums[1]) : sums[0];
            }
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
            function compareSums(cardSets){
                var meIsBest = true;
                var myBestSum = getBestSum(cardSets[0]);
                $.each(cardSets.slice(1), function(index, cardSet){
                    var oppBestSum = getBestSum(cardSet);

                    if (oppBestSum && (oppBestSum > myBestSum)) {
                        return meIsBest = false;
                    }
                });
                return meIsBest;
            }
            var dealer = response["current_game"]["dealer"];
            var players = response["current_game"]["players"];
            var allPlayersCards = [];
            var deckCurrent = getCurrentDeck(allPlayersCards);
            var cardsLeftTotal = countCardsLeft(deckCurrent);
            allPlayersCards.push(dealer["hand"]["cards"]);
            $.each(players, function(index, player){
                var me = (player["id"].toString() == playerId.toString());
                me ? allPlayersCards.unshift(player["hand"]["cards"]) : allPlayersCards.push(player["hand"]["cards"]);
            });
            var myMaxNumber = 21 - getBestSum(allPlayersCards[0]);
            var probability = Math.floor(countGoodCards(myMaxNumber)/cardsLeftTotal*100);
            if (myMaxNumber == 0) hold();
            else if (!compareSums(allPlayersCards)) hit();
            else if (probability > 30) hit();
            else hold();
        }
        function hit(){
            ApiCalls.hit(sessionId, playerId, checkPlayer);
        }
        function hold(){
            ApiCalls.hold(sessionId, playerId, checkPlayer);
        }
    }
    $.get("join-session/66/dejan").done(function (response){
        var bot = new Bot(66, response['player_id']);
    });
});