Picotile
=========

DIY nanoleaf replica control software

Currently designed for:

Hardware:
- ESP8266 microcontroller
- WP2812B strand lights
- [Light panels](https://www.thingiverse.com/thing:4686921)

Planned features:
- Brightness
- On/off
- Light modes
- Palette switching

Arduino dependencies:
- [FastLED](https://github.com/FastLED/FastLED)
- [IRremoteESP8266](https://github.com/sebastienwarin/IRremoteESP8266)
- [Arduino WebSockets](https://github.com/Links2004/arduinoWebSockets)

Debugging the web app:
1. `npm install`
1. `npm start`

Running on the Arduino:
1. Open `picotile.ino`
1. Upload the `data` folder into [SPIFFS memory](https://arduino-esp8266.readthedocs.io/en/2.7.4_a/filesystem.html#)
1. Run project
