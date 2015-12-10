$(document).ready(function(){

    window.ApiCalls = {
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

    var deckStart = {
            "1": 28, "2": 28, "3": 28, "4": 28, "5": 28, "6": 28, "7": 28, "8": 28, "9": 28, "10": 28, "12": 28, "13": 28, "14": 28
        };

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
            intervalCheckPlayerTurn = setInterval(function () {
                ApiCalls.getSessionState(sessionId, checkPlayerTurn);
            }, 400);
        }

        function checkPlayerTurn(response){
            if(response["current_game"]["current_player"]["id"].toString() == playerId.toString()) {
                displayGamesAndResults(response);
                clearInterval(intervalCheckPlayerTurn);
                considerMove(response);

                console.log("************ session object ******************");
                console.log(response);
                console.log("***************** MY MOVE ********************");
            }
        }


        function considerMove(response){

            function getCurrentDeck(dealer, players) {
                var deck = {};
                $.each(deckStart, function(card, count){
                    deck[card] = count;
                });
                $.each(dealer["hand"]["cards"], function(index, card){
                    var cardDealer = card["number"];
                    deck[cardDealer] -= 1;
                });
                $.each(players, function(index, player){
                    $.each(player["hand"]["cards"], function(index, card){
                        var cardPlayer = card["number"];
                        deck[cardPlayer] -= 1;
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

                function checkIfInArray(valueToCheck, array){
                    var check = false;
                    $.each(array, function(index, value){
                        if (value == valueToCheck){
                            return check = true;
                        }
                    });
                    return check;
                }

                var sum = [0];
                var sumTemp = [];

                $.each(cards, function(index, card){
                    switch (card["number"]){
                        case 1:
                            $.each(sum, function(index, element){
                                sumTemp[index] = parseInt(element)+1;
                                sumTemp[sum.length+index] = parseInt(element)+11;
                            });
                            sum = [];
                            $.each(sumTemp, function(index, element){
                                if(!checkIfInArray(element, sum)){
                                    sum.push(element);
                                }
                            });
                            break;
                        default:
                            var valueToAdd = (card["number"] < 10) ? parseInt(card["number"]) : 10;
                            $.each(sum, function(index, element){
                                sum[index] += valueToAdd;
                            });
                    }
                });

                var sumUnique= [];
                $.each(sum, function(index, element){
                    if(element <= 21){
                        sumUnique.push(element);
                    }
                });

                return sumUnique;
            }



            //var testingCards = [
            //    {"color": "K", "number": 1},
            //    {"color": "K", "number": 3},
            //    {"color": "K", "number": 1},
            //    {"color": "K", "number": 4},
            //    {"color": "K", "number": 1},
            //    {"color": "K", "number": 1}
            //];


            var dealer = response["current_game"]["dealer"];
            var players = response["current_game"]["players"];

            var myCards = getMyCards(players);
            var myCardsSums = getCardsSums(myCards);



            var deckCurrent = getCurrentDeck(dealer, players);

            var cardsLeftTotal = countCardsLeft(deckCurrent);

            console.log("total cards left");
            console.log(cardsLeftTotal);
            console.log("these are my cards");
            console.log(myCards);
            console.log("these are my sums");
            console.log(myCardsSums)

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

    $.get("join-session/66/dejan", function (response) {
        window.bot = new Bot(66, response['player_id']);
    });

});