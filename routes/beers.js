var express = require('express');
var johnnyFive = require("johnny-five");

var router = express.Router();


var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ninkasi:ninkasi@127.0.0.1/ninkasi')

function processDbError(dbErrorMessage, res){
	console.log("ERROR: " + dbErrorMessage);
	res.status(500);
	res.send(JSON.stringify({"error" : "sql-error"}));			
}


router.get('/', function(req, res, next) {
	console.log("listing beers");
	
	db.many(`SELECT beerId, name, brewdate FROM beers ORDER BY brewdate DESC;`)
		.then(function(data){
			res.send(JSON.stringify({ beers: data}))
		})
		.catch(function (error){
			processDbError(error, res);
		});
});

router.put('/', function(req, res, next){

	console.log('updating beers');
	
	if(typeof req.body.delete !== 'undefined'){
		db.none("DELETE FROM beers WHERE beerid=$1;", req.body.delete)
			.then(function(){
				console.log('2');
				res.status(200);
				res.send(JSON.stringify({"deleted":req.params.beerId}));
			})
			.catch(function(dbError){
				console.log('3');
				processDbError(dbError, res);
				return;
			});

	}else{
		res.send(JSON.stringify({'Error': 'not sure what to do'}));
	}

});

router.post('/', function(req,res,next) {
	console.log("Adding Beer " + req.body.beerName);
	console.dir(req.body);
	if(!req.body.beerName){
		res.send(JSON.stringify({"error":"'beerName' is required"}));
		return 0;
	}

	if(req.body.brewDate){
		db.none("INSERT INTO beers(name, brewdate) VALUES($1,$2);",[req.body.beerName,req.body.brewDate])
			.then(function (){
				console.log('Added a new beer to db!');
			})
			.catch(function (errorString){
				processDbError(errorString);	
			});
		res.status(201);
		res.send(JSON.stringify({"created":res.body.beerName}));		
	}else{
		db.none("INSERT INTO beers(name) VALUES($1);",req.body.beerName)
			.then(function (){
				console.log('Added a new beer to db!');
			})
			.catch(function (errorString){
				processDbError(errorString, res);	
			});
		res.status(201);
		res.send(JSON.stringify({"created":req.body.beerName}));
	}
	  
});

router.get('/:beerId/', function(req, res, next) {
	var response = {}

	db.one("SELECT name, brewdate, beerId FROM beers WHERE beerId=$1", req.params.beerId)
		.then(function(dbResponse){
			response["beer"] = dbResponse;
			db.any("SELECT eventid,eventcode,data FROM beer_events WHERE beerid=$1 ORDER BY eventtime DESC",req.params.beerId)
				.then(function(beerEvents){
					response["events"] = beerEvents;
					res.send(JSON.stringify(response));
				})
				.catch(function(error){
					processDbError(error, res);
				});
		})
		.catch(function(dbError){
			processDbError(dbError, res);
		});
	
});


router.post('/:beerId/events', function(req, res, next) {

	db.none("INSERT INTO beer_events(beerid, eventcode, data) VALUES($1,$2,$3)", [req.params.beerId, req.body.eventcode, req.body.data])
		.then(function(){
			res.send(JSON.stringify({'created':'beer-event'}));
		})
		.catch(function(error){
			processDbError(error, res);
		});
});

module.exports = router;


