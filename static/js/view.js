$(document).ready(function() {

    $("#join-session-button").on("click", function () {
        var sessId = $("#session-id").val();
        var plName = $("#player-name").val();
        if (!sessId || !plName) {
            alert("fali session-id ili ime plejera");
        }
        else {
            Bot.joinSession(sessId, plName, Bot.init);
            //$(this).hide();
        }
    });

    $("#hit").on("click", function () {
        bot.makeHit();
    });

    $("#hold").on("click", function () {
        bot.makeHold();
    });

});