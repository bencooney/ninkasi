var express = require('express');
var johnnyFive = require("johnny-five");

var router = express.Router();


var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ninkasi:ninkasi@127.0.0.1/ninkasi')

router.get('/', function(req, res, next) {
	console.log("listing beers");
	
	db.many(`SELECT beerId, name, brewdate FROM beers;`)
		.then(function(data){
			res.send(JSON.stringify({ beers: data}))
		})
		.catch(function (error){
			console.log('ERROR: ' + error)
			res.status(500)
			res.send(JSON.stringify({"error": "sql-error"}));
		});
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
				console.log('ERROR: ' + errorString)
				res.status(500);
				res.send(JSON.stringify({"error" : "sql-error" }));	
			});
		res.status(201);
		res.send(JSON.stringify({"created":res.body.beerName}));		
	}else{
		db.none("INSERT INTO beers(name) VALUES($1);",req.body.beerName)
			.then(function (){
				console.log('Added a new beer to db!');
			})
			.catch(function (errorString){
				console.log('ERROR: ' + error)
				res.status(500);
				res.send(JSON.stringify({"error" : "sql-error" }));	
			});
		res.status(201);
		res.send(JSON.stringify({"created":req.body.beerName}));
	}
	  
});

router.get('/:beer/', function(req, res, next) {
	var response = {}

	db.one("SELECT beers.name, beers.brewdate, beers.beerId FROM beers WHERE beerId=$1", req.params.beer)
		.then(function(dbResponse){
			response.push("beer",beer)

			res.send(JSON.stringify(response));
		})
		.catch(function(dbError){
			console.log("ERROR: " + dbError);
			res.status(500);
			res.send(JSON.stringify({"error" : "sql-error"}));
			return;
		});
	
});



module.exports = router;


