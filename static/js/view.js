$(document).ready(function() {

    // =================== REMOVE LATER ============================
    $("#hit").on("click", function () {
        bot.makeHit();
    });
    $("#hold").on("click", function () {
        bot.makeHold();
    });
    // =============================================================

    displayGamesAndResults = function(response){

        function displayScores(sessionObject){
            var dealer = sessionObject["current_game"]["dealer"];
            var players = sessionObject["current_game"]["players"];

            var $scores = $(".scores");
            var $totalPlayed = $scores.find(".games-count").find(".total-played");
            var $scoresPlayers = $scores.find(".games-players");

            $totalPlayed.text(sessionObject["games"].length);
            $scoresPlayers.empty();

            var houseWins = "";
            houseWins += '<div class="games-count"><div>'+dealer["name"]+'</div>'+'<div>'+sessionObject["house_wins"]+'</div></div>';
            $scoresPlayers.append(houseWins);

            $.each(players, function(index, player){
                var playerWins = "";
                playerWins += '<div class="games-count"><div>'+player["name"]+'</div>'+'<div>'+player["wins"]+'</div></div>';
                $scoresPlayers.append(playerWins);
            });
        }

        function displayCards(sessionObject){

            function getCards(game){
                var allResults = "";
                var dealer = game["dealer"];
                var players = game["players"];

                var gameDealer = "";
                gameDealer += '<div class="res-container"><div class="results"><div class="name">'+dealer["name"]+'</div>';
                $.each(dealer["hand"]["cards"], function(index, card){
                    gameDealer += '<div class="cards"><span>|</span>'+card["color"]+'</div>'+'<div class="cards">'+card["number"]+'<span>|</span></div>';
                });
                allResults += gameDealer+"</div>";

                var gamePlayer = "";
                $.each(players, function(index, player){
                    gamePlayer += '<div class="results"><div class="name">'+player["name"]+'</div>';
                    $.each(player["hand"]["cards"], function(index, card){
                        gamePlayer += '<div class="cards"><span>|</span>'+card["color"]+'-</div>'+'<div class="cards">'+card["number"]+'<span>|</span></div>';
                    });
                    gamePlayer += "</div>";
                });
                allResults += gamePlayer+"</div>";

                return allResults;
            }

            var games = sessionObject["games"];
            var resultsToDisplay = "";
            var $gamesContainer = $(".games-container");

            $gamesContainer.find(".res-container").last().remove();

            if (!(games.length < bot.getGameNumber()) && games.length){
                resultsToDisplay = getCards(games[games.length-1]);
                $gamesContainer.append(resultsToDisplay);
            }

            resultsToDisplay = getCards(sessionObject["current_game"]);
            $gamesContainer.append(resultsToDisplay);
        }

        displayScores(response);
        displayCards(response);
    }
});