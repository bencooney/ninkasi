var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	led.toggle();
	console.log('arduino toggle changed');
	res.send('arduino')
});

module.exports = router;


