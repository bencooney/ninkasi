function panelShowHide(panel) {
	var panelElement = document.getElementById('panel-'+panel);
	var buttonElement = document.getElementById('showHide-'+panel);
	if(panelElement.style.visibility === 'hidden'){
		panelElement.style.visibility = 'visible';
		buttonElement.innerHTML = "/\\";		
	}else{
		panelElement.style.visibility = 'hidden';
		buttonElement.innerHTML = "\\/";
	}
}

function ledToggle(board, state) {
    	console.log('sending led='+state+' to board ' + board );
    	var mode = 'off';
    	if(state){
    		mode = 'on'
    	}
	httpPut('/devices/'+board+'/led/'+mode, function(){});
}

function loadSystem(){
	
	
	httpGet('/thermometers/', function(thermsJson){
		var thermsHtml = "";
		
		JSON.parse(thermsJson).sensors.forEach( function(therm){
			thermsHtml += "<div>" +
				"  <h3>Therm: " + therm.address + "</h3>" +
				"  <div class='therm-info-buttons'>" +
				"    <button onclick=\"showThermStats('"+therm.address+"')\">Minutely</button>" +
				"    <button onclick=\"showThermStats('"+therm.address+"','hourly')\">Hourly</button>" +
				"    <button onclick=\"showThermStats('"+therm.address+"','daily')\">Daily</button>" +
				"    <div id=\"therm"+therm.address+"Data\"></div>" +	
				"  </div>" + 
				"</div>";
		});
		document.getElementById('panel-thermometers').innerHTML = thermsHtml;
	});

	httpGet('/devices/', function(devicesJson){
		var listHtml = "";
		JSON.parse(devicesJson).devices.forEach( function(obj){
			listHtml += "<div>" +
				"  <h3>Device: "+ obj +"</h3>" +
				"  <p>LED"+
				"    <button onclick=\"ledToggle('"+obj+"',true)\">On</button>" +
				"    <button onclick=\"ledToggle('"+obj+"',false)\">Off</button>" +
				"    <button id='cmdBoard"+obj+"Details' onclick=\"getBoardDetails('"+obj+"')\">\\/</button>" +
				"    <div id='board"+obj+"Details'></div>"
				"  </p>" +
				"</div>";
		});
		document.getElementById('panel-devices').innerHTML = listHtml;
	});
}

function showThermStats(thermAddress, freq){
	var path = "/thermometers/" + thermAddress + "/track/"; 
	if(freq){
		path += freq; 
	}
	httpGet(path, function(tempsJson){
		var tempHtml = "<div id='graphdiv"+thermAddress+freq+"'></div>";
		var graphData = "Date,Temperature\n";
		JSON.parse(tempsJson).sensors.forEach( function(tempRecord){
			graphData += tempRecord.dt + "," + tempRecord.round + "\n";
		});
		document.getElementById('therm'+thermAddress+'Data').innerHTML = tempHtml;
		g = new Dygraph(document.getElementById('graphdiv'+thermAddress+freq),graphData);
		

	});
}

function getBoardDetails(boardId){
	httpGet('/devices/'+boardId, function(boardText){
		var boardJson = JSON.parse(boardText);
		detailsHtml = "<list>"+
			" <li><strong>port: </strong>"+boardJson.device.port+"</li>" +
			" <li><strong>repl: </strong>"+boardJson.device.repl+"</li>" +
			" <li><strong>debug: </strong>"+boardJson.device.debug+"</li>" +
			"</list>";
		document.getElementById('board'+boardId+'Details').innerHTML = detailsHtml;
		document.getElementById('cmdBoard'+boardId+'Details').innerHTML = "/\\";
		document.getElementById('cmdBoard'+boardId+'Details').setAttribute('onclick',"hideBoardDetails('"+boardId+"')");
	});
}



function hideBoardDetails(boardId){
	document.getElementById('board'+boardId+'Details').innerHTML = "";
	document.getElementById('cmdBoard'+boardId+'Details').innerHTML = "\\/";
  document.getElementById('cmdBoard'+boardId+'Details').setAttribute('onclick',"getBoardDetails('"+boardId+"')");
}

function httpGet(targetUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", targetUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}

function httpPut(targetUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		callback(xmlHttp.responseText);
	}
	xmlHttp.open("PUT", targetUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}