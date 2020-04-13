/*
  OSC BASE CODE SOURCE: https://maker.pro/arduino/projects/learn-how-to-enable-communication-between-an-arduino-and-web-browser
  ARDUINO CODE SOURCE: https://astronomersanonymous.wordpress.com/2016/04/02/controlling-heating-pads-with-arduino-uno/
  
  COMPONENTS: 
  1 Electric Heating Pad (such as: https://www.sparkfun.com/products/11289)
  1 N-Channel MOSFET (https://www.sparkfun.com/products/10213 )
  1 1N4001 Diode or Schottky Diode ( https://www.adafruit.com/products/755 )
  1 10k ohm resistor
  1 Arduino Uno or equivalent
  Solder & soldering tools
  TMP102 digital temperature sensor ( https://www.sparkfun.com/products/11931 )
  Several LEDS (for testing circuit only) and 330 ohm resistors
  wire, alligator clips, breadboard

  TODO: abstract loop to reusable funcs
*/

#include <Wire.h>
int tmp102Address = 0x48;   // Breakout sensor

#include <VSync.h>
ValueReceiver<1> receiver;  // Receiver Object
ValueSender<1> sender;      // Sender Object

int output;
int input;

int yellowLED = 9;
int greenLED = 10;
int redLED = 11;
int fetPin = 3;

const int pinUP = 225;
const int pinDOWN = 0;
const int DANGER = 30;

void setup() {
  Serial.begin(9600);

  //set up PINS
  Wire.begin();
  pinMode(greenLED, OUTPUT); 
  pinMode(yellowLED, OUTPUT);
  pinMode(redLED, OUTPUT);
  pinMode(fetPin, OUTPUT); 

  //synchronizing variables with processing
  receiver.observe(output);
  sender.observe(input);
}

void loop() {

  //heater-related functionality
  receiver.sync();  //get output from processing
  if (output == 1){
    digitalWrite(yellowLED, HIGH); // indicator on
    analogWrite(fetPin, pinUP); // heater on
    input = 1;
  } else {
    digitalWrite(yellowLED, LOW);    // indicator off
    analogWrite(fetPin, pinDOWN); // heater off
    input = 0;
  }
  sender.sync(); 

  //monitoring the heater
  float celsius = getTemperature(); //NOTE: the getTemperature is not accurate
  Serial.print("Celsius: ");
  Serial.print(celsius);
  Serial.print("\n");
  if(celsius >= DANGER){
    digitalWrite(greenLED, LOW);
    digitalWrite(redLED, HIGH);  // red LED on
    delay(3000);
  }
  else{
    digitalWrite(greenLED, HIGH);  // green LED on
    digitalWrite(redLED, LOW);
    delay(3000);
  }

  delay(1000); //repeat loop once per second
}

float getTemperature(){
  Wire.requestFrom(tmp102Address, 2);
  byte MSB = Wire.read();
  byte LSB = Wire.read();
  
  //it's a 12bit int, using two's compliment for negative
  int TemperatureSum = ((MSB << 8) | LSB) >> 4;
  float celsius = TemperatureSum*0.0625;
  return celsius;
}
