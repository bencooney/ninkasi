
import('deviceControlFunctions.js');
import('genericHelperFunctions.js');

function loadSystem(){
	loadThermometersList();

	loadDevicesList();

	loadBeersList();
}




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



function loadDevicesList(){

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

function loadThermometersList(){

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
}

function loadBeersList(){

	httpGet('/beers/', function(beersJson){
		var beersHtml = `<div>
			<div>
				Beers | <button onclick='loadEventConfigsList()'>Events</button>
			</div>
			<button onclick='displayAddBeer()'>+</button>
			<ul>
		`;
		
		JSON.parse(beersJson).beers.forEach( function(beer){
			beersHtml += "<li><button onclick='displayBeer(\""+ beer.beerid+"\")'>" + beer.name + "</button></li>";
		});
		beersHtml += "</ul></div>";
		document.getElementById('panel-library').innerHTML = beersHtml;
	});
}

function loadEventConfigsList(){
	
	httpGet('/events/', function(eventsJson){
		var eventsHtml = `<div>
			<div>
				<button onclick='loadBeersList()'>Beers</button> | Events
			</div>
			<button onclick='displayAddEventConfig()'>+</button>
			<ul>
		`;
		
		JSON.parse(eventsJson).events.forEach( function(event){
			eventsHtml += "<li><button onclick='displayEditEventConfig(\""+ event.eventcode+"\")'>" + event.eventcode + "</button></li>";
		});
		eventsHtml += "</ul></div>";
		document.getElementById('panel-library').innerHTML = eventsHtml;
	});
}

function setDynamicPanel(htmlContent){
	document.getElementById('dynamicPanel').innerHTML = htmlContent;
}

function displayAddBeer(){
	var addBeerForm = `
		<h3>Add a new beer to database</h3>
		Name <input id='addBeer-beerName' type='text' /><br />
		Brewed on <input id='addBeer-brewDate' type='date' /><br />		
		<button onclick='processAddBeer()'>Add</button>
		<div id='addBeer-errorMessage' class='errorMessage'></div>
		
	`;	
	setDynamicPanel(addBeerForm);
}	

function getEventConfigForm(mode){
	return `EventCode <input id='eventConfig-eventCode' type='text' /><br />
		Json for event configuration <br />
		<textarea id='eventConfig-standardData' type='text' cols='60' rows='10'>\{\}</textarea><br />		
		<button id='eventConfig-submit' onclick='process`+mode+`EventConfig()'>`+mode+`</button>
		<div id='eventConfig-errorMessage' class='errorMessage'></div>`;
}

function displayAddEventConfig(){
	var addForm = "<h3>Add a new event configuration to database</h3>" + getEventConfigForm('Add');	
	setDynamicPanel(addForm);
}

function displayEditEventConfig(eventCode){
	httpGet('/events/'+eventCode, function(eventJson){
		var event = JSON.parse(eventJson); 
		var editForm = "<h3>Edit the "+eventCode+" event</h3>" + getEventConfigForm('Edit');
		setDynamicPanel(editForm);
		document.getElementById('eventConfig-submit').onclick="processEditEventConfig('"+eventCode+"')"
		document.getElementById('eventConfig-eventCode').value=event.eventcode;
		document.getElementById('eventConfig-standardData').value=JSON.stringify(event.standarddata);
	});
}	



function displayBeer(beerId){


	httpGet('/beers/' + beerId, function(beerJson){
		var beerDetails = "<div><h3>";

		var data = JSON.parse(beerJson);

		var brewDate = new Date(data.beer.brewdate);
		
		beerDetails += data.beer.name + "</h3>";
		beerDetails += "Created: " + getIsoDate(brewDate) + "<br />";
		beerDetails += "<button onclick=\"showDeleteBeer('"+data.beer.beerid+"')\">delete</button>";

		beerDetails += "<ul>";
		data.events.forEach( function(event){
			beerDetails += "<li>" + event.eventtime + " - " + event.eventcode + " - " + event.data.name +"</li>";
		});
		beerDetails += "</ul></div>";
		setDynamicPanel(beerDetails);
	});
}

function showDeleteBeer(beerId){
	form = `<div class='confirmDialog'>
			Are you sure you want to delete this beer and all associated events? It cannot be undone.
			<br />
			<button onclick="processDeleteBeer(`+beerId+`)">YES</button> <button onclick="cancelDynamicPanelCommand()">NO</button>
		</div>
	`;
	setDynamicPanel(form);
}

function processDeleteBeer(beerId){
	httpPut('/beers/', {'delete':beerId}, function(){
		setDynamicPanel('');
		loadBeersList();
	});
}

function cancelDynamicPanelCommand(){
	setDynamicPanel('');
}


function processAddEventConfig(){
	var eventCodeElement = document.getElementById('eventConfig-eventCode');
	var standardDataElement = document.getElementById('eventConfig-standardData');

	if((eventCodeElement.value === "")||(standardDataElement.value === "")){
		document.getElementById('addEventConfig-errorMessage').innerHtml = "ERROR: eventCode and standardData are mandatory";
		return;
	}
	
	var request = {'eventCode': eventCodeElement.value, 'standarddata': JSON.parse(standardDataElement.value) };

	httpPost('/events/',request,function(){
		eventCodeElement.value = "";
		standardDataElement.value = "";
		loadEventConfigsList();
	});
}

function processAddBeer(){
	var beerName = document.getElementById('addBeer-beerName').value;
	var brewDate = document.getElementById('addBeer-brewDate').value;

	if(beerName === ""){
		document.getElementById('addBeer-errorMessage').innerHTML = "ERROR: Name is Mandatory";
		return;
	}

	if(brewDate === ""){
		httpPost('/beers/', {"beerName": beerName}, resetAddBeerForm());	
	}else{
		httpPost('/beers/', {"beerName": beerName, "brewDate":brewDate}, resetAddBeerForm());	
	}
}

function resetAddBeerForm(){
	document.getElementById('addBeer-beerName').value = "";
	document.getElementById('addBeer-brewDate').value = "";
	document.getElementById('addBeer-errorMessage').innerHTML = "";
	loadBeersList();
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
			graphData += tempRecord.datetime + "," + tempRecord.temperature + "\n";
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

