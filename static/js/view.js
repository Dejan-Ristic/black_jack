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

    $("#hit").on("click", function () {
        bot.makeHit();
    });

    $("#hold").on("click", function () {
        bot.makeHold();
    });

    displayCards = function(response){

        var $gamesContainer = $(".games-container");
        var dealerCards = response["current_game"]["dealer"]["hand"]["cards"];
        var players = response["current_game"]["players"];


        console.log("dealer cards");

        for(i= 0; i<dealerCards.length; i++) {
            console.log(dealerCards[i]["color"]);
            console.log(dealerCards[i]["number"]);
        }

        for(i= 0; i<players.length; i++) {
            console.log("player"+(i+1)+" cards");
            for(j=0; j<players[i]["hand"]["cards"].length; j++){
                console.log(players[i]["hand"]["cards"][j]["color"]);
                console.log(players[i]["hand"]["cards"][j]["number"]);
            }

        }
    }

});