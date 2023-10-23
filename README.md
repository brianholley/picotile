Picotile
=========

DIY nanoleaf replica control software


### Hardware 

Currently designed for:
- ESP8266 microcontroller
- WP2812B strand lights
- [Light panels](https://www.thingiverse.com/thing:4686921)


### Feature set

Current + Planned features:
- Flexible tile arrangements
- Brightness
- On/off
- Light modes
- Palette switching


### Running modes

Automatic - cycles through these patterns:
- Fade - single color fade transitions
- Fire - warm color palette mimicking firelight
- Firefly - darn nighttime with fireflies
- Pulse - single color pulses through the tiles
- Rainbow - chasing rainbow lights
- Starburst - tile color explosion and fade

Single - lock to single pattern above

Manual - toggle individual tiles on/off or color


### Instructions

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

Intial setup (wifi configuration):
1. TBD


### Dependencies

Arduino dependencies:
- [ESP8266 board](https://github.com/esp8266/Arduino)
- [FastLED](https://github.com/FastLED/FastLED)
- [WiFiManager](https://github.com/tzapu/WiFiManager)
- [Arduino WebSockets](https://github.com/Links2004/arduinoWebSockets)
- [ArduinoJson](https://arduinojson.org)

Packages:
| Name        | Installed   |
| ----------- | ----------- |
| ArduinoJson | 6.21.3      |
| FastLED     | 3.6.0       |
| WebSockets  | 2.4.0       |
| WiFiManager | 2.0.16-rc.2 |

Installation (with [arduino-cli](https://arduino.github.io/arduino-cli)):

```sh
arduino-cli lib install ArduinoJson@6.21.3
arduino-cli lib install FastLED@3.6.0
arduino-cli lib install WebSockets@2.4.0
arduino-cli lib install WiFiManager@2.0.16-rc.2
```