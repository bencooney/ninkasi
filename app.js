var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ninkasi:ninkasi@127.0.0.1/ninkasi')

db.one(`CREATE TABLE IF NOT EXISTS temperatures(
					dt TIMESTAMP DEFAULT NOW(),
					address VARCHAR(64),
					value REAL 
				);`)
  .then(function (data) {
    console.log('DATA:', data.value)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })




var index = require('./routes/index');
var devices = require('./routes/devices');

var osHostname = require('os-hostname');
osHostname(function(err, hostname){
	if(hostname==='raspberrypi'){

		//setup arduino devices to control
		var johnnyFive = require("johnny-five");
		var Raspi = require("raspi-io");

		boards = new johnnyFive.Boards([
			{id:"A",timeout:36000, port:"/dev/ttyUSB0"}
			,{id:"fermentorTracker",timeout:36000, port:"/dev/ttyUSB1"}
			,{id:"C",timeout:36000, port:"/dev/ttyACM0"}
			,{id:"raspi",io: new Raspi()}
		]);
		boards.on("ready", function() { 
			console.log('Ninkasi\'s johnny-five devices have loaded.');
			/*
			var thermometer = new johnnyFive.Thermometer({
				board: boards.byId('fermentorTracker'),
				controller: "DS18B20",
				pin: 4
			});

			thermometer.on("change", function(){
				console.log(this.celsius + "C");
			});*/

		});
	}
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/devices', devices);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;

