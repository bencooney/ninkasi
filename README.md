# ninkasi

robots for beer

## About

This is a npm project intended to be run on a raspberry-pi. It contains a number of tools for remote controlling utilities to aid in the automation of beer brewing.

## Setup

### Arduino Setup
ninkasi uses the npm libary johnny-five for control and communication with arduinos using the Firmata firmware. 
1. Connect your arduino to your computer 
1. Start the arduino IDE
1. From the file menu choose 'Examples' -> 'Firmata' -> 'Standard'
1. Check the port and arduino type are correctly selected under Tools menu
1. Upload

Or to use the latest version of firmata follow the instructions at: https://github.com/firmata/arduino
 

### Raspi Setup

#### install nodejs 4+ and build serialport
obviously subject to change as raspian and nodejs evolve. At time of writing (june 2017) these docs worked:
https://timodenk.com/blog/install-node-serialport-on-raspberry-pi/

#### setup thermometers with one-wire

add to /boot/config.txt
(where nn is the pin you've connected the onewire data wire to)
```
dtoverlay=w1-gpio,gpiopin=nn

```
