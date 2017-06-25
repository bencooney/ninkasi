var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	console.log('identifying resources available on the arduino...');
	//scan for onewire thermometers
	


	console.log('listing resources available on the arduinos');
	res.send(JSON.stringify({ sensors:{abc:1,cde:2}}));
});

router.get('/sensor/:resource', function(req, res) {
	var resource = req.params.resource;
	console.log('list value on sensor resource', resource);
	res.send(JSON.stringify({ name: resource, value: 1234 }));
});




//these really only exist to help debugging...

router.get('/led/toggle', function(req, res){
	console.log('toggle the onboard led');
	onboardLed.toggle();
	res.send(JSON.stringify({led:'toggle'}));
});


router.get('/led/on', function(req, res){
	console.log('turn on the onboard led');
	onboardLed.on();
	res.send(JSON.stringify({led:true}));
});


router.get('/led/off', function(req, res){
	console.log('turn off the onboard led');
	onboardLed.off();
	res.send(JSON.stringify({led:false}));
});

module.exports = router;


