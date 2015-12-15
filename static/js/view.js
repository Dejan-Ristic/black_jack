$(document).ready(function() {
    var innerGamesCounter = 0;
    window.displayGamesAndResults = function(response){
        function displayScores(sessionObject){
            var houseWins = "";
            var dealer = sessionObject["current_game"]["dealer"];
            var players = sessionObject["current_game"]["players"];
            var $scores = $(".scores");
            var $totalPlayed = $scores.find(".games-count").find(".total-played");
            var $scoresPlayers = $scores.find(".games-players");
            $totalPlayed.text(sessionObject["games"].length);
            $scoresPlayers.empty();
            houseWins += '<div class="games-count"><div>'+dealer["name"]+'</div>';
            houseWins += '<div>'+sessionObject["house_wins"]+'</div></div>';
            $scoresPlayers.append(houseWins);
            $.each(players, function(index, player){
                var playerWins = "";
                playerWins += '<div class="games-count"><div>'+player["name"]+'</div>';
                playerWins += '<div>'+player["wins"]+'</div></div>';
                $scoresPlayers.append(playerWins);
            });
        }
        function displayCards(sessionObject){
            var resultsToDisplay = "";
            var $gamesContainer = $(".games-container");
            function getCards(game){
                var dealer = game["dealer"];
                var players = game["players"];
                var allResults = "";
                var gameDealer = "";
                var gamePlayer = "";
                gameDealer += '<div class="res-container"><div class="results"><div class="name">';
                gameDealer += dealer["name"]+'</div>';
                $.each(dealer["hand"]["cards"], function(index, card){
                    gameDealer += '<div class="cards"><span>|</span>'+card["color"]+'</div>';
                    gameDealer += '<div class="cards">'+card["number"]+'<span>|</span></div>';
                });
                allResults += gameDealer+"</div>";
                $.each(players, function(index, player){
                    gamePlayer += '<div class="results"><div class="name">'+player["name"]+'</div>';
                    $.each(player["hand"]["cards"], function(index, card){
                        gamePlayer += '<div class="cards"><span>|</span>'+card["color"]+'-</div>';
                        gamePlayer += '<div class="cards">'+card["number"]+'<span>|</span></div>';
                    });
                    gamePlayer += "</div>";
                });
                allResults += gamePlayer+"</div>";
                return allResults;
            }
            $gamesContainer.find(".res-container").last().remove();
            if (gamesCounter > innerGamesCounter){
                innerGamesCounter = gamesCounter;
                resultsToDisplay = getCards(sessionObject["games"][innerGamesCounter-1]);
                $gamesContainer.append(resultsToDisplay);
            }
            resultsToDisplay = getCards(sessionObject["current_game"]);
            $gamesContainer.append(resultsToDisplay);
        }
        displayScores(response);
        displayCards(response);
    };



    // =================== REMOVE LATER ============================
    $("#hit").on("click", function () {
        bot.makeHit();
    });
    $("#hold").on("click", function () {
        bot.makeHold();
    });
    // =============================================================


});