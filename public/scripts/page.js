
function loadSystem(){
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

function getLibraryLinks(thisLibraryId){
	links = { 
		'Beers': 'loadBeersList()',
		'Events': 'loadEventConfigsList()',
		'Devices': 'loadDevicesList()',
		'Thermometers': 'loadThermometersList()'
	};

	returnStr = "<div>";
	var i = 0;
	for(var key in links){
		if(i > 0){
			returnStr += " | ";
		}

		if(thisLibraryId.toLowerCase() === key.toLowerCase()){
			returnStr += key;
		}else{
			returnStr += "<button onclick='" + links[key] + "'>"+key+"</button>";
		}
		i++;
	}
	returnStr += "</div>"

	return returnStr;
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

		setLibraryPanel('devices',listHtml);
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

		setLibraryPanel('thermometers', thermsHtml);
	});
}


function loadBeersList(){
	httpGet('/beers/', function(beersJson){
		var beersHtml = "<button onclick='displayAddBeer()'>+</button>";
		beersHtml += "<ul>";		
		JSON.parse(beersJson).beers.forEach( function(beer){
			beersHtml += "<li><button onclick='displayBeer(\""+ beer.beerid+"\")'>" + beer.name + "</button></li>";
		});
		beersHtml += "</ul>";

		setLibraryPanel('beers',beersHtml);
	});
}

function loadEventConfigsList(){	
	httpGet('/events/', function(eventsJson){
		var eventsHtml = "<button onclick='displayAddEventConfig()'>+</button>";
		eventsHtml += "<ul>";
		JSON.parse(eventsJson).events.forEach( function(event){
			eventsHtml += "<li><button onclick='displayEditEventConfig(\""+ event.eventcode+"\")'>" + event.eventcode + "</button></li>";
		});
		eventsHtml += "</ul>";

		setLibraryPanel('events', eventsHtml);
	});
}

function setLibraryPanel(libraryName, htmlContent){
	content = "<div>"+getLibraryLinks(libraryName)+htmlContent+"</div>";
	document.getElementById('panel-library').innerHTML = content;
}

function setDynamicPanel(htmlContent){
	document.getElementById('dynamicPanel').innerHTML = htmlContent;
}

function clearDynamicPanel(){
	setDynamicPanel('');
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
		beerDetails += `
			<button onclick="showDeleteBeer('`+data.beer.beerid+`')">Delete</button>
			<button onclick="displayAddEventToBeer()">Add Event</button>
			<br />
			<div id="beer-addEvent"></div>
		`;

		var ingredientsHtml = "<ul>";
		var eventsHtml = "<table>";

		data.events.forEach( function(event){
			if(event.eventcode==='ingredient'){
				ingredientsHtml += "<li>" + event.data.name + " - " + event.data.amount + event.data.amountUnit + " (";
				
				var i =0;
				for(var key in event.data){
					if(['name','amount','amountUnit'].indexOf(key) < 0){
						if(i > 0)
							ingredientsHtml += ", ";
						ingredientsHtml += key + ": " + event.data[key];
					}
				}	
				ingredientsHtml += ")</li>";
			}else{
				eventsHtml += `<tr>
											<td>`+event.eventtime+`</td>
											<td>`+event.eventcode+`</td>
											<td>`+event.data.name+`</td>
										`;
			}
		});

		ingredientsHtml += "</ul>"
		eventsHtml += "</table>";

		beerDetails += ingredientsHtml;
		beerDetails += eventsHtml;
		beerDetails += "</div>";
		setDynamicPanel(beerDetails);
	});
}

function displayAddEventToBeer(){
	httpGet('/events/', function(eventsJson){
		var html = "<select id='beer-addEvent-eventcode' onchange='displayEventsFields()'>";
		JSON.parse(eventsJson).events.forEach( function(event){
			html += "<option>"+ event.eventcode+"</option>";
		});
		html += "</select>";
		html += "<div id='beer-addEvent-fields'></div>"

		document.getElementById('beer-addEvent').innerHTML = html;
	});
}

function displayEventsFields(){
	var eventCode = document.getElementById('beer-addEvent-eventcode').value;
	httpGet('/events/'+eventCode, function(eventJson){
		var html = `
			<textarea>
				`+JSON.stringify(JSON.parse(eventJson).standarddata) + `
			</textarea>
			<button onclick='processAddEventToBeer()'>`;
		document.getElementById('beer-addEvent-fields').innerHTML = html; 
	});
}

function showDeleteBeer(beerId){
	form = `<div class='confirmDialog'>
			Are you sure you want to delete this beer and all associated events? It cannot be undone.
			<br />
			<button onclick="processDeleteBeer(`+beerId+`)">YES</button>
			<button onclick="clearDynamicPanel()">NO</button>
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



function processAddEventConfig(){
	var eventCodeElement = document.getElementById('eventConfig-eventCode');
	var standardDataElement = document.getElementById('eventConfig-standardData');

	if((eventCodeElement.value === "")||(standardDataElement.value === "")){
		document.getElementById('addEventConfig-errorMessage').innerHTML = "ERROR: eventCode and standardData are mandatory";
		return;
	}
	
	var request = {'eventCode': eventCodeElement.value, 'standarddata': JSON.parse(standardDataElement.value) };

	httpPost('/events/',request,function(){
		displayEditEventConfig(eventCodeElement.value);
		loadEventConfigsList();
	});
}


function processEditEventConfig(){
	var eventCodeElement = document.getElementById('eventConfig-eventCode');
	var standardDataElement = document.getElementById('eventConfig-standardData');

	if((eventCodeElement.value === "")||(standardDataElement.value === "")){
		document.getElementById('addEventConfig-errorMessage').innerHTML = "ERROR: eventCode and standardData are mandatory";
		return;
	}
	
	var request = {'eventCode': eventCodeElement.value, 'standarddata': JSON.parse(standardDataElement.value) };

	httpPut('/events/',request,function(){
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
		
		setDynamicPanel(tempHtml);
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

