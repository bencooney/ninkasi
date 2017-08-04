
//DATA HELPERS

function getIsoDate(date){
	return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
}



//NETWORK HELPERS

function httpGet(targetUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", targetUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}

function httpPut(targetUrl, body, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("PUT", targetUrl, true); // true for asynchronous 
	xmlHttp.setRequestHeader("Content-Type", "application/json");
	xmlHttp.send(JSON.stringify(body));
}

function httpPost(targetUrl, body, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4 && (xmlHttp.status == 201 || xmlHttp.status == 200))
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("POST", targetUrl, true);
	xmlHttp.setRequestHeader("Content-Type", "application/json");
	xmlHttp.send(JSON.stringify(body));
}

function httpDelete(targetUrl, body, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && (xmlHttp.status == 200 || xmlHttp.status == 204))
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("DELETE", targetUrl, true); // true for asynchronous 
	xmlHttp.setRequestHeader("Content-Type", "application/json");
	xmlHttp.send(JSON.stringify(body));
}
