var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/arduino', function(req, res){
	var five = require("johnny-five");
	var board = new five.Board();

	board.on("ready", function() {
	  var led = new five.Led(13);
	  led.blink(500);
	});

	res.send('arduino');
});


module.exports = router;
