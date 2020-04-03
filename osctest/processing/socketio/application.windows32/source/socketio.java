import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import vsync.*; 
import processing.serial.*; 
import oscP5.*; 
import netP5.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class socketio extends PApplet {

// Importing the library that will help us in sending and receiving the values from the Arduino
// You always need to import the serial library in addition to the VSync library
 
  

// Below libraries will connect and send, receive OSC messages
  


// Creating the instances to connect and send, receive OSC messages
OscP5 oscP5;
NetAddress dest;

//  We create a new ValueReceiver to receive values from the arduino and a new
// ValueSender to send values to arduino
ValueSender sender;
ValueReceiver receiver; 

// The below variables will be syncronized with the Arduino and they should be same on the both sides.
public int output;
public int input = 2;

public void setup() 
{
  // Starting the serial communication, the baudrate and the com port should be same as on the Arduino side.
  Serial serial = new Serial(this, "COM4", 9600);

  //  Ininialize the ValueReceiver and ValueSender with this (to hook it to your sketch)
  //  and the serial interface you want to use.
  sender = new ValueSender(this, serial);
  receiver = new ValueReceiver(this, serial);

  // Synchronizing the variables as on the Arduino side. The order should be same.
  sender.observe("output");
  receiver.observe("input");

  // Starting the OSC Communication. listen on port 9999, return messages on port 9998
  oscP5 = new OscP5(this, 9999); 
  dest = new NetAddress("127.0.0.1", 9998);
}

public void draw() {
  if (input == 1) {
    sendOsc();
  }
  if (input == 2) {
    sendOsc();
  }
  if (input == 3) {
    sendOsc();
  }
  if (input == 4) {
    sendOsc();
  }
  if (input == 5) {
    sendOsc();
  }
  print("input: ");
  println(input);
}

// Function to send OSC messages to browser
public void sendOsc() {
  OscMessage msg = new OscMessage("/socketio");  // tell the address
  msg.add((float)input); // add the message
  oscP5.send(msg, dest); //send the OSC message
}

// Recieve OSC messages from browser
public void oscEvent(OscMessage theOscMessage) {
  if (theOscMessage.checkAddrPattern("/socketio") == true) {
    // Receiving the output from browser
    output = theOscMessage.get(0).intValue();  

    print("output: ");
    println(output);
  }
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "socketio" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
