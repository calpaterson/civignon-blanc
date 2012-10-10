var config = {
    // Where to look the god proxy
    "goFeedApiUrl": "http://localhost:8153/go/api/",
    // How often to check each build (in milliseconds)
    "frequency": 60000
};

var contents = function () {
    var element = document.querySelector("#contents");
    var failures = {};
    var update = function(){
	if (failures === {}){
	    element.textContent = ":)";
	} else {
	    element.textContent = ":(";
	}
    };
    var add = function(failure){
	failures[failure.name] = failure;
	update();
    };
    var remove = function(name){
	update();
    };
    var showHelp = function(){
	var helpHTML = "D:  The go proxy is not running.  " +
	    "<pre>source bin/activate && ./src/go_proxy.py</pre>"
	element.innerHTML = helpHTML;
    };
    return {
	addFailure: add,
	removeFailure: remove,
	showHelp: showHelp
    };
}();

var updateC = function(url_){
    var url = url_;
    var update = function(){
	var request = new XMLHttpRequest();
	request.onerror = function (xhrProgressEvent){
	    contents.showHelp();
	};
	request.onload = function(xhrProgressEvent){
	    var xml = xhrProgressEvent.currentTarget.responseXML;
	    var category = xml.querySelectorAll("category")[2];
	    console.log(category);
	    // if(!success){
	    // 	console.log("Failure!");
	    // } else {
	    // 	console.log("Success!");
	    // }
	    window.setTimeout(update, config["frequency"]);
	};
	request.open("get", url);
	// This is required for firefox, which sets its own Accept otherwise
	request.setRequestHeader("Accept", "application/xml");
	request.send();
    };
    return update;
};

var fetchPipelineUrlsAndBeginUpdating = function() {
    var request = new XMLHttpRequest();
    request.onerror = function(xhrProgressEvent){
	contents.showHelp();
    };
    request.onload = function(xhrProgressEvent){
	var xml = xhrProgressEvent.currentTarget.responseXML;
	var pipelineElements = xml.querySelectorAll("pipeline");
	for (var i = 0; i< pipelineElements.length; i++){
	    var originalUrl = pipelineElements[i].getAttribute("href");
	    var newUrl = originalUrl.replace(/http:\/\/[^\/]*\/go\/api\//, config["goFeedApiUrl"]);
	    var update = updateC(newUrl);
	    window.setTimeout(update, config["frequency"]);
	}
    };
    request.open("get", config["goFeedApiUrl"] + "pipelines.xml");
    // This is required for firefox, which sets its own Accept otherwise
    request.setRequestHeader("Accept", "application/xml");
    request.send();
};

document.addEventListener("DOMContentLoaded", function(){
    fetchPipelineUrlsAndBeginUpdating()
});