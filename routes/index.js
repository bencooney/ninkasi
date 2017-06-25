
var express = require('express');

var router = express.Router();

	


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/arduino', function(req, res){
	led.toggle();
	res.send('arduino toggle changed');
});

module.exports = router;


