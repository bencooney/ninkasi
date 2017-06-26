var express = require('express');
var johnnyFive = require("johnny-five");

var router = express.Router();


router.get('/', function(req, res, next) {
	//list devices
	console.log("listing arduino devices");
	var listOfBoards = [];
	boards.each(function(board){listOfBoards.push(board.id);});
	res.send(JSON.stringify({ devices:listOfBoards }));
});



router.get('/:device', function(req, res) {
	//list details of the specified device
	var device = req.params.device;
	console.log('list details for board ', device);
	var thisBoard = boards.byId(device)
	res.send(JSON.stringify({ device:{ 
			id: thisBoard.id,
			port: thisBoard.port,
			repl: thisBoard.repl,
			debug: thisBoard.debug,
			timeout: thisBoard.timeout
	  } }));
});





//these really only exist to help debugging...

router.get('/:device/led/on', function(req, res){
	console.log('turn on the onboard led on board ', req.params.device);
	var led =	johnnyFive.Led({ pin:13, board: boards.byId(req.params.device)});
	led.on();
	res.send(JSON.stringify({led:true}));
});


router.get('/:device/led/off', function(req, res){
	console.log('turn off the onboard led on board ', req.params.device);
	var led =	johnnyFive.Led({ pin:13, board: boards.byId(req.params.device)});
	led.off();
	res.send(JSON.stringify({led:false}));
});




module.exports = router;


