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
	console.log("listing events");
	
	db.any(`SELECT eventCode, standarddata, displaystructure FROM events_lookup ORDER BY eventCode DESC;`)
		.then(function(data){
			res.send(JSON.stringify({ 'events': data}))
		})
		.catch(function (error){
			processDbError(error, res);
		});
});

router.put('/', function(req, res, next){

	console.log('updating events');
	
	if(typeof req.body.delete !== 'undefined'){
		db.none("DELETE FROM events_lookup WHERE eventcode=$1;", req.body.delete)
			.then(function(){
				res.status(200);
				res.send(JSON.stringify({"deleted":req.body.delete}));
			})
			.catch(function(dbError){
				processDbError(dbError, res);
				return;
			});

	}else{
		db.none("UPDATE events_lookup SET standarddata=$1 , displaystructure=$2 WHERE eventcode=$3;",[req.body.standarddata,req.body.displaystructure,req.body.eventCode])
			.then(function (){
				res.status(200);
				res.send(JSON.stringify({"updated":req.body.eventCode}));		
			})
			.catch(function (errorString){
				processDbError(errorString);	
			});

	}

});

router.post('/', function(req,res,next) {
	console.log("Adding Event " + req.body.eventCode);
	console.dir(req.body);
	if((!req.body.eventCode)||(!req.body.standarddata)||(!req.body.displaystructure)){
		res.send(JSON.stringify({"error":"'eventCode', 'standarddata', and 'displaystructure' are required"}));
		return 0;
	}

	db.none("INSERT INTO events_lookup(eventcode, standarddata, displaystructure) VALUES($1,$2,$3);",[req.body.eventCode,req.body.standarddata,req.body.displaystructure])
		.then(function (){
			res.status(201);
			res.send(JSON.stringify({"created":req.body.eventCode}));		
		})
		.catch(function (errorString){
			processDbError(errorString);	
		});
  
});

router.get('/:eventCode/', function(req, res, next) {
	var response = {}

	db.one("SELECT eventCode, standarddata, displaystructure FROM events_lookup WHERE eventCode=$1", req.params.eventCode)
		.then(function(dbResponse){
			res.send(JSON.stringify(dbResponse));
		})
		.catch(function(dbError){
			processDbError(dbError, res);
		});
	
});




module.exports = router;


