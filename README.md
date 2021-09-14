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
- [ESP8266 board](https://github.com/esp8266/Arduino)
- [FastLED](https://github.com/FastLED/FastLED)
- [WiFiManager](https://github.com/tzapu/WiFiManager)
- [Arduino WebSockets](https://github.com/Links2004/arduinoWebSockets)

Debugging the web app:
1. `cd webapp`
1. `npm install`
1. `npm run start`

Publishing the web app to the ESP8266
1. `cd webapp`
1. `npm run build`
1. In the Arduino IDE: Tools | ESP8266 Sketch Data Upload

Running on the Arduino:
1. Open `picotile.ino`
1. Upload the `data` folder into [SPIFFS memory](https://arduino-esp8266.readthedocs.io/en/2.7.4_a/filesystem.html#)
1. Run project
