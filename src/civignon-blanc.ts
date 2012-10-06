var config = {
    // Where to look for go
    "cctrayXmlUrl": "foo",
    // How often to look for go (in milliseconds)
    "frequency": 1
}

var i = 1;

var main = function(){
    var contents = document.querySelector("#contents");
    contents.textContent = "Number " + i;
    i += 1;
}

document.addEventListener("DOMContentLoaded", function(){
    window.setInterval(main, config["frequency"]);
});