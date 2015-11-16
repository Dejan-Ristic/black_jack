$(document).ready(function() {

    $("#join-session-button").on("click", function () {
        var sessId = $("#session-id").val();
        var plName = $("#player-name").val();
        if (!sessId || !plName) {
            alert("fali session-id ili ime plejera");
        }
        else {
            ApiCalls.joinSession(sessId, plName, initBot);
            //$(this).hide();
        }
    });

    $("#get-session-state").on("click", function () {
        ApiCalls.getSessionState(bot.getSessionId(), getSessionState);
    });

    $("#get-game-state").on("click", function () {
        ApiCalls.getSessionState(bot.getSessionId(), getGameState);
    });

    $("#check-turn").on("click", function () {
        ApiCalls.getSessionState(bot.getSessionId(), checkTurn);
    });

    $("#hit").on("click", function () {
        ApiCalls.hit(bot.getSessionId(), bot.getPlayerId(), hit);
    });

    $("#hold").on("click", function () {
        ApiCalls.hold(bot.getSessionId(), bot.getPlayerId(), hold);
    });

    $("#get-previous-game").on("click", function () {
        ApiCalls.getSessionState(bot.getSessionId(), getPreviousGame);
    });

});