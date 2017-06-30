# ninkasi

automated beer making




## Raspi Setup

### install nodejs 4+ and build serialport
obviously subject to change as raspian and nodejs evolve. At time of writing (june 2017) these docs worked:
https://timodenk.com/blog/install-node-serialport-on-raspberry-pi/

### setup thermometers with one-wire

add to /boot/config.txt
(where nn is the pin you've connected the onewire data wire to)
```
dtoverlay=w1-gpio,gpiopin=nn

```
