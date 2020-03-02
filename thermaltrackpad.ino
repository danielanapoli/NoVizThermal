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

int led1 = 9;
int led2 = 10;
int led3 = 11;
int fetPin = 13;
const int pinUP = 225;
const int pinDOWN = 0;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(fetPin, OUTPUT);  
}

void loop() {
  float celsius = getTemperature();
  Serial.print("Celsius: ");
  Serial.print(celsius);
  Serial.print("\n");
  
  if(celsius >= 30){
    digitalWrite(led1, LOW);
    digitalWrite(led2, LOW);
    digitalWrite(led3, HIGH);
    analogWrite(fetPin, pinDOWN);// 0% heater off
    delay(3000);
  }
  else if (celsius > 14){
    digitalWrite(led1, LOW);
    digitalWrite(led2, HIGH);
    digitalWrite(led3, LOW);
    analogWrite(fetPin, pinUP); //heater on at 100%
    delay(3000);
  }
  else {
    digitalWrite(led1, HIGH);
    digitalWrite(led2, LOW);
    digitalWrite(led3, LOW);
    analogWrite(fetPin, 170); //65% duty cycle on heater
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
