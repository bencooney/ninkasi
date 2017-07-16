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
	if(!req.params.name){
		res.send(JSON.stringify({"error":"'name' is required"}));
		return 0;
	}

	if(req.params.brewdate){
		db.none("INSERT INTO beers(name, brewdate) VALUES($1,$2);",[req.body.name,req.body.brewdate])
			.catch(function (errorString){
				console.log('ERROR: ' + errorString)
				res.status(500);
				res.send(JSON.stringify({"error" : "sql-error" }));	
			});
		res.status(201);
		res.send(JSON.stringify({"created":res.params.name}));		
	}else{
		db.none("INSERT INTO beers(name) VALUES($1);",req.params.name)
			.catch(function (errorString){
				console.log('ERROR: ' + error)
				res.status(500);
				res.send(JSON.stringify({"error" : "sql-error" }));	
			});
		res.status(201);
		res.send(JSON.stringify({"created":req.params.name}));
	}
	  
});

router.get('/:beer/', function(req, res, next) {
	db.one("SELECT beers.name, beers.brewdate, beers.beerId FROM beers WHERE beerId=$1", req.params.beer)
		.then(function(dbResponse){
			

			res.send(JSON.stringify({"beer":beer}));
		})
		.catch(function(dbError){
			console.log("ERROR: " + dbError);
			res.status(500);
			res.send(JSON.stringify({"error" : "sql-error"}));
			return;
		});
	
});

router.post('/:beer/', function(req, res, next){
	// add event for the beer.

});



module.exports = router;


