var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://ninkasi:ninkasi@127.0.0.1/ninkasi')

db.none(`CREATE TABLE IF NOT EXISTS temperatures(
					dt TIMESTAMP DEFAULT NOW(),
					address VARCHAR(64),
					value REAL 
				);`);

db.none(`CREATE TABLE IF NOT EXISTS sensor_names(
		sensorId VARCHAR(64),
		startDate TIMESTAMP DEFAULT NOW(),
		name VARCHAR(255)		
	);`);

db.none(`CREATE TABLE IF NOT EXISTS beers(
		beerId BIGSERIAL PRIMARY KEY,
		name VARCHAR(255),
		brewdate TIMESTAMP DEFAULT NOW()
	);`);



var index = require('./routes/index');
var devices = require('./routes/devices');
var thermometers = require('./routes/thermometers');
var beers = require('./routes/beers');


//setup arduino devices to control
var johnnyFive = require("johnny-five");
var Raspi = require("raspi-io");

boards = new johnnyFive.Boards([
	{id:"A",timeout:36000, port:"/dev/ttyUSB0"}
	,{id:"fermentorTracker",timeout:36000, port:"/dev/ttyUSB1"}
	,{id:"C",timeout:36000, port:"/dev/ttyACM0"}
	,{id:"raspi",io: new Raspi()}
]);

boards.on("error", function(msg){
	console.log("error found on board...",msg);
});

boards.on("ready", function() { 
	console.log('Ninkasi\'s johnny-five devices have loaded.');
	

	initThermometer(db, johnnyFive, boards.byId('fermentorTracker'), 0x63d8724);
	initThermometer(db, johnnyFive, boards.byId('fermentorTracker'), 0x63fd8dd);
	initThermometer(db, johnnyFive, boards.byId('fermentorTracker'), 0x63ea3e8);
	
	

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
app.use('/thermometers', thermometers);
app.use('/beers', beers);

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

function initThermometer(db, johnnyFive, boardId, addressCode){
	
	
	

	var thermometer = new johnnyFive.Thermometer({
		board: boardId,
		controller: "DS18B20",
		pin: 4,
		freq: 10000
		,address: addressCode
	})

	thermometer.on("change", function(){
		if(this.celsius>4000 || this.celsius==85){
			console.log("Bad Reading!!");
		} else {
			db.none("INSERT INTO temperatures(address, value) VALUES($1,$2);",["0x"+this.address.toString(16),this.celsius])
				.then(function(data){})
				.catch(function(erro){
					console.log("SQL Error: " + erro);
				});
		}
		console.log(this.address.toString(16) + " - " + this.id + " - " + this.celsius + "C");
	});

	console.log("initialised Thermometer Sensor: " + thermometer.address.toString(16));

}