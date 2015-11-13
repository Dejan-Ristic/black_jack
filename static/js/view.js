$("#join-session-button").on("click", function(){
    var sessId = $("#session-id").val();
    var plName = $("#player-name").val();
    if (!sessId){
        alert("fali session id");
    }
    else if (!plName) {
        alert("fali plejer nejm");
    }
    else
        ApiCalls.joinSession(sessId, plName);
});