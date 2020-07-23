# Thermaltrackpad

This repository includes all of the code for the thermaltrackpad prototype we use to explore how non-visual feedback can support users in behaving securely online. 

=== The Team ===

This prototype started as Daniela Napoli's course project for exploring the role of embodied cognition in usable security. Sebastian Navas refactored and optimized the web app to what you can see today! 

Right now, we're exploring ways to improve thermal feedback and other potential non-visual feedback implementations. If you would like full details about the project, feel free to email: daniela.napoli[@]carleton[dot]ca

> === We stand on the shoulders of giants! ===

This prototype was inspired by Wilson et al.'s exploration of thermal feedback, Liz Coelho's controllable heater project, and Reginald Watson's Open Sound Control (OSC) web app example. Links are included below:

https://dl.acm.org/doi/pdf/10.1145/3027063.3053127
https://astronomersanonymous.wordpress.com/2016/04/02/controlling-heating-pads-with-arduino-uno/
https://maker.pro/arduino/projects/learn-how-to-enable-communication-between-an-arduino-and-web-browser

# Documentation

Welcome to the thermaltrackpad project! In the next few lines we will explain what you need to get this working. As we continue with the development of this project, this list may change in the near future. 

### For this project you will need:
- **Software**
    - [Arduino IDE](https://www.arduino.cc/en/Main/Software)
    - [Processing IDE](https://processing.org/download/)
    - [MongoDB](https://docs.mongodb.com/manual/installation/)
    - [Firefox Browser](https://www.mozilla.org/en-CA/firefox/new/)
    - [NodeJS](https://nodejs.org/en/)
- **Hardware**
    - 1 [Electric Heating Pad](https://www.sparkfun.com/products/11289)
    - 1 [N-Channel MOSFET](https://www.sparkfun.com/products/10213)
    - 1 [1N4001 Diode or Schottky Diode](https://www.adafruit.com/products/755)
    - 1 10k ohm resistor
    - 1 Arduino Uno or equivalent
    - Solder & soldering tools
    - [TMP102 digital temperature sensor](https://www.sparkfun.com/products/11931)
    - Several LEDS (for testing circuit only) and 330 ohm resistors
    - Wire, alligator clips, breadboard


### To set up the repository
Using the command line...
1. Navigate to the directory where you want to place the repository
1. `git clone https://github.com/danielanapoli/thermaltrackpad.git`
1. `cd thermaltrackpad/trackpad/socketio`
1. `npm install`
1. Look at the file called config-example.json in the resources folder
1. Create a config.json file following the example and store it in the resources folder

Then, you can start the web app...
1. `npm start`