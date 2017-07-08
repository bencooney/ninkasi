# ninkasi

robots for beer

## About

This is a npm project intended to be run on a raspberry-pi. It contains a number of tools for remote controlling utilities to aid in the automation of beer brewing.

## Setup

### Arduino Setup
ninkasi uses the npm libary johnny-five for control and communication with arduinos using the ConfigurableFirmata firmware. 

1. Connect your arduino to your computer 
1. Start the arduino IDE
1. Load the ConfigurableFirmata sketch for the board (These vary based on purpose)
1. Check the port and arduino type are correctly selected under Tools menu
1. Upload

#### Thermometer Device


 

### Raspi Setup

#### enable access
connect raspi to network and allow connections on port NN

#### install nodejs 4+ and build serialport
obviously subject to change as raspian and nodejs evolve. At time of writing (june 2017) these docs worked:
https://timodenk.com/blog/install-node-serialport-on-raspberry-pi/

#### run ninkasi
1. clone this repo
1. use 'npm install' to download the dependencies
1. use 'sudo npm start' to start the server

