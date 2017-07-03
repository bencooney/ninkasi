var express = require('express');

var router = express.Router();

var fileSys = require('fs');

router.get('/', function(req, res, next) {
	fileSys.readdir('/sys/bus/w1/devices', function(err, items){
		res.send(JSON.stringify({ 'items':items }));
		
	});
	
});

router.get('/:device', function(req, res, next){
	fileSys.readFile('/sys/bus/w1/devices/'+req.params.device+'/w1_slave', function(err, buffer){

		if (err){
	        	console.error(err);
         		process.exit(1);
		}

		res.end(JSON.stringify({'data': buffer.toString('ascii')}));
	});
});


module.exports = router;


