var config = {
    // Where to look the god proxy
    "goFeedApiUrl": "http://localhost:8153/go/api/",
    // How often to check each build (in milliseconds)
    "frequency": 60000,
    "buildsToWatch": [/core/, /identity/, /marklogic/, /aim/, /mud/,
		      /mum/, /sid/, /track/]
};

var shouldWatch = function(url){
    for (var i = 0; i<config["buildsToWatch"].length; i++){
	if (url.match(config["buildsToWatch"][i]) !== null){
	    return true;
	}
    }
    return false;
};

var contents = function () {
    var element = document.querySelector("#contents");
    var failures = {};
    var update = function(){
	if (Object.keys(failures).length === 0){
	    element.textContent = ":)";
	} else {
	    element.textContent = "Failing: \n";
	    for (var url in failures){
		if (failures.hasOwnProperty(url)){
		    element.textContent += ("    " + url + "\n")
		}
	    }
	}
    };
    var add = function(name){
	failures[name] = true;
    };
    var remove = function(name){
	delete failures[name];
    };
    var showHelp = function(){
	var helpHTML = "D:  The go proxy is not running.  " +
	    "<pre>source bin/activate && ./src/go_proxy.py</pre>"
	element.innerHTML = helpHTML;
    };
    window.setInterval(update, 100);
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
	    var state = category.getAttribute("term");
	    if(state === "failed"){
	    	contents.addFailure(url);
	    }
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
	    if (shouldWatch(newUrl)){
		var update = updateC(newUrl);
		window.setTimeout(update, Math.round(Math.random() * config["frequency"]));
	    }
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