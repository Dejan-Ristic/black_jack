$(document).ready(function() {

    $("#join-session-button").on("click", function () {
        var sessId = $("#session-id").val();
        var plName = $("#player-name").val();
        if (!sessId || !plName) {
            alert("fali session-id ili ime plejera");
        }
        else {
            Bot.joinSession(sessId, plName);
            //$(this).hide();
        }
    });

    // =================== REMOVE LATER ============================
    $("#hit").on("click", function () {
        bot.makeHit();
    });

    $("#hold").on("click", function () {
        bot.makeHold();
    });
    // =============================================================

    displayCards = function(response){

        function gameResults(game){
            var allResults = "";
            var dealer = game["dealer"];
            var players = game["players"];

            var gameDealer = "";
            gameDealer += ('<div class="res-container"><div class="results"><div class="name">'+dealer["name"]+'</div>');
            for(i= 0; i<dealer["hand"]["cards"].length; i++) {
                gameDealer += ('<div class="cards"><span>|</span>'+dealer["hand"]["cards"][i]["color"]+'</div>');
                gameDealer += ('<div class="cards">'+dealer["hand"]["cards"][i]["number"]+'<span>|</span></div>');
                gameDealer += (i == dealer["hand"]["cards"].length-1) ? "</div>" : "";
            }
            allResults += gameDealer;

            var gamePlayer = "";
            for(i= 0; i<players.length; i++) {
                gamePlayer += ('<div class="results"><div class="name">'+players[i]["name"]+'</div>');
                for(j=0; j<players[i]["hand"]["cards"].length; j++){
                    gamePlayer += ('<div class="cards"><span>|</span>'+players[i]["hand"]["cards"][j]["color"]+'-</div>');
                    gamePlayer += ('<div class="cards">'+players[i]["hand"]["cards"][j]["number"]+'<span>|</span></div>');
                    gamePlayer += (j == players[i]["hand"]["cards"].length-1) ? "</div>" : "";
                }
                gamePlayer += (i == players.length-1) ? "</div>" : "";
            }
            allResults += gamePlayer;
            return allResults;
        }

        var toDisplay = "";
        var $gamesContainer = $(".games-container");

        $gamesContainer.find(".res-container").last().remove();

        if (!(response["games"].length < bot.getGameNumber()) && response["games"].length){
            toDisplay = gameResults(response["games"][response["games"].length-1]);
            $gamesContainer.append(toDisplay);
        }

        toDisplay = gameResults(response["current_game"]);
        $gamesContainer.append(toDisplay);




        var dealerCurrent = response["current_game"]["dealer"];
        var playersCurrent = response["current_game"]["players"];

        var $scores = $(".scores");
        var $scoresPlayers = $scores.find(".games-players");

        $scoresPlayers.empty();
        $scores.find(".games-count").find(".total-played").text(response["games"].length);

        var houseWins = "";
        houseWins += '<div class="games-count"><div>'+dealerCurrent["name"]+'</div><div>'+response["house_wins"]+'</div></div>';
        $scoresPlayers.append(houseWins);

        for(i= 0; i<playersCurrent.length; i++) {
            var playerWins = "";
            playerWins += '<div class="games-count"><div>'+playersCurrent[i]["name"]+'</div><div>'+playersCurrent[i]["wins"]+'</div></div>';
            $scoresPlayers.append(playerWins);
        }

    }

});