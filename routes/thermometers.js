var express = require('express');
var johnnyFive = require("johnny-five");

var router = express.Router();


var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ninkasi:ninkasi@127.0.0.1/ninkasi')

router.get('/', function(req, res, next) {
	//list thermometers
	console.log("listing thermometers");
	
	db.many(`SELECT address FROM temperatures GROUP BY address;`)
		.then(function(data){
			res.send(JSON.stringify({ sensors: data}))
		})
		.catch(function (error){
			console.log('ERROR: ' + error)
		});
});



router.get('/:address', function(req, res) {
	//list most recent values for that sensor
	
	db.one("SELECT dt, value FROM temperatures WHERE address=$1 AND dt=(SELECT MAX(dt) from temperatures WHERE address=$1);", req.params.address)
		.then(function(data){
			res.send(JSON.stringify({ sensors: data}))
		})
		.catch(function (error){
			res.send(JSON.stringify({'Error': 'SQLError'}));
			console.log('SQL Error: ' + error);
		});
});



router.get('/:address/track', function(req, res) {
	//list minute averages
	
	db.many("SELECT TO_CHAR(dt, 'YYYY-MM-DD HH:MI') || ':00' as dt ,ROUND(CAST(AVG(value) AS NUMERIC),2) FROM temperatures WHERE address = $1 GROUP BY 1 ORDER BY 1;", req.params.address)
		.then(function(data){
			res.send(JSON.stringify({ sensors: data}))
		})
		.catch(function (error){
			res.send(JSON.stringify({'Error': 'SQLError'}));
			console.log('SQL Error: ' + error);
		});
});

router.get('/:address/track/hourly', function(req, res) {
	//list hourly averages
	
	db.many("SELECT TO_CHAR(dt, 'YYYY-MM-DD HH') || ':00:00' as dt ,ROUND(CAST(AVG(value) AS NUMERIC) ,2) FROM temperatures WHERE address = $1 GROUP BY 1 ORDER BY 1;", req.params.address)
		.then(function(data){
			res.send(JSON.stringify({ sensors: data}))
		})
		.catch(function (error){
			res.send(JSON.stringify({'Error': 'SQLError'}));
			console.log('SQL Error: ' + error);
		});
});

router.get('/:address/track/daily', function(req, res) {
	//list daily averages
	
	db.many("SELECT TO_CHAR(dt, 'YYYY-MM-DD') as dt ,ROUND(CAST(AVG(value) AS NUMERIC),2) FROM temperatures WHERE address = $1 GROUP BY 1 ORDER BY 1;", req.params.address)
		.then(function(data){
			res.send(JSON.stringify({ sensors: data}))
		})
		.catch(function (error){
			res.send(JSON.stringify({'Error': 'SQLError'}));
			console.log('SQL Error: ' + error);
		});
});

module.exports = router;


