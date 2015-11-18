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

        var $gamesContainer = $(".games-container");


        var dealerCards = response["current_game"]["dealer"]["hand"]["cards"];
        var players = response["current_game"]["players"];




        var gameDealer = "";
        gameDealer += ('<div class="res-container"><div class="results"><div class="name">'+response["current_game"]["dealer"]["name"]+'</div>');

        for(i= 0; i<dealerCards.length; i++) {
            gameDealer += ('<div class="cards">'+dealerCards[i]["color"]+'</div>');
            gameDealer += ('<div class="cards">'+dealerCards[i]["number"]+'</div>');
            gameDealer += (i == dealerCards.length-1) ? "</div>" : "";
        }

        $gamesContainer.append(gameDealer);




        var gamePlayer = "";

        for(i= 0; i<players.length; i++) {


            gamePlayer += ('<div class="results"><div class="name">'+players[i]["name"]+'</div>');

            for(j=0; j<players[i]["hand"]["cards"].length; j++){
                gamePlayer += ('<div class="cards">'+players[i]["hand"]["cards"][j]["color"]+'</div>');
                gamePlayer += ('<div class="cards">'+players[i]["hand"]["cards"][j]["number"]+'</div>');

                if(j == players[i]["hand"]["cards"].length-1) {
                    gamePlayer += "</div>";
                }

            }

            if(i == players.length-1) {
                gamePlayer += "</div>";
            }

            $gamesContainer.append(gamePlayer);
            gamePlayer = "";

        }
        console.log(gameDealer);
        console.log(gamePlayer);

    }

});