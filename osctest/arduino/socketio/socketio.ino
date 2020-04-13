//Including the library that will help us in receiving and sending the values from processing
#include <VSync.h>
ValueReceiver<1> receiver;  // Receiver Object
ValueSender<1> sender;      // Sender Object

// The below variables will be syncronized with the Processing and they should be same on the both sides.
int output;
int input;

int greenLED = 9; 
int yellowLED = 10; 
int redLED = 11; 

void setup()
{
  /* Starting the serial communication because we are communicating with the
    Arduino through serial. The baudrate should be same as on the processing side. */
  Serial.begin(9600);
  pinMode(greenLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(redLED, OUTPUT);

  // Synchronizing the variables with the processing. The variables must be int type.
  receiver.observe(output);
  sender.observe(input);
}

void loop()
{
  // Receiving the output from the processing.
  receiver.sync();

  // Matching the received output to light up LED
  if (output == 1)
  {
    digitalWrite(greenLED, HIGH);
    digitalWrite(yellowLED, HIGH);
    digitalWrite(redLED, HIGH);
    input = 1;
  }
  else if (output == 2)
  {
    digitalWrite(greenLED, LOW);
    digitalWrite(yellowLED, LOW);
    digitalWrite(redLED, LOW);
    input = 2;
  }
  else if (output == 3)
  {
    digitalWrite(greenLED, HIGH);
    input = 3;
  }
  else if (output == 4)
  {
    digitalWrite(yellowLED, HIGH);
    input = 4;
  }
  else if (output == 5)
  {
    digitalWrite(redLED, HIGH);
    input = 5;
  }
  sender.sync();
}
