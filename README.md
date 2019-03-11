# ninkasi

robots for beer

## About
This project has probably been abandoned. It's currently running on a system that works fine but not great, and the next version will most likely be started from scratch with new hardware.

There are known vulnerabilities in some of the dependencies + this is not written using secure codeing practices. If for some reason you use part of this code, you should practice common sense before making the resulting server available on non-private networks

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

#### install the postgresql database and setup the ninkasi db and user
install postgres
```
sudo apt-get install postgresql
```
Give the default user a new password then start the psql client
```
sudo passwd postgres 
su - postgres
psql
```
change the users db password
```
\password postgres
```
add the ninkasi database
```
CREATE DATABASE ninkasi;
\l
```
add the ninkasi user and set a password for them
```
CREATE USER ninkasi;
\du
\password ninkasi
```
quit the psql client
```
\q
```
Still using the postgres user; connect to the ninkasi db and grant access to the ninkasi user
```
psql ninkasi
GRANT ALL PRIVILEGES ON DATABASE ninkasi TO ninkasi;
\q
```
test ninkasi's access
exit the prompt with postgres and go back to your normal user account. Connect to the ninkasi db and confirm you can create tables.
```
psql ninkasi -h 127.0.0.1 -d ninkasi
CREATE TABLE test(testcol VARCHAR(1));
INSERT INTO test(testcol) VALUES('t');
SELECT * FROM test;
```
if everything went well there should be no errors and the select statement should return the inserted row.
delete the table since you don't need it and quit psql
```
DROP TABLE test;
\q
```



#### install nodejs 4+ and build serialport
obviously subject to change as raspian and nodejs evolve. At time of writing (june 2017) these docs worked:
https://timodenk.com/blog/install-node-serialport-on-raspberry-pi/

#### run ninkasi
1. clone this repo
1. use 'npm install' to download the dependencies
1. use 'sudo npm start' to start the server

