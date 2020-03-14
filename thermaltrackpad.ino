/*
  BASE CODE SOURCE: https://astronomersanonymous.wordpress.com/2016/04/02/controlling-heating-pads-with-arduino-uno/
  PARTS: 
  1 Electric Heating Pad (such as: https://www.sparkfun.com/products/11289)
  1 N-Channel MOSFET (https://www.sparkfun.com/products/10213 )
  1 1N4001 Diode or Schottky Diode ( https://www.adafruit.com/products/755 )
  1 10k ohm resistor
  1 Arduino Uno or equivalent
  Solder & soldering tools
  TMP102 digital temperature sensor ( https://www.sparkfun.com/products/11931 )
  Several LEDS (for testing circuit only) and 330 ohm resistors
  wire, alligator clips, breadboard
*/

#include <Wire.h>
int tmp102Address = 0x48;

int green = 9;
int yellow = 10;
int red = 11;
int fetPin = 3;
const int pinUP = 225;
const int pinDOWN = 0;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  pinMode(green, OUTPUT); 
  pinMode(yellow, OUTPUT);
  pinMode(red, OUTPUT);
  pinMode(fetPin, OUTPUT);  
}

void loop() {
  float celsius = getTemperature();
  Serial.print("Celsius: ");
  Serial.print(celsius);
  Serial.print("\n");
  
  if(celsius >= 30){
    digitalWrite(green, LOW);
    digitalWrite(yellow, LOW);
    digitalWrite(red, HIGH);
    analogWrite(fetPin, pinDOWN); //heater off 
    delay(3000);
  }
  else if (celsius < 23.5){
    digitalWrite(green, HIGH);
    digitalWrite(yellow, LOW);
    digitalWrite(red, LOW);
    analogWrite(fetPin, pinUP); //heater on at 100%
    delay(3000);
  }
  else {
    digitalWrite(green, LOW);
    digitalWrite(yellow, HIGH);
    digitalWrite(red, LOW);
    analogWrite(fetPin, 145); //heater on at 65%
    delay(1000);    
  }
  delay(1000); //repeat once per second
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
