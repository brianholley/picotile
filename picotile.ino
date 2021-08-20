#define FASTLED_ESP8266_NODEMCU_PIN_ORDER
#include <FastLED.h>
FASTLED_USING_NAMESPACE

#define LEDS_PER_TRI 9
#define MAX_TRIANGLES 20
#define LED_COUNT (LEDS_PER_TRI * MAX_TRIANGLES)
#define DATA_PIN 6

#include "Settings.h"
#include "WifiCredentials.h"
#include "Webserver.h"

CRGB leds[LED_COUNT];
uint8_t hue[MAX_TRIANGLES];

uint8_t triangles = MAX_TRIANGLES;

void setup() {
  loadSettings();

  setupLeds();
  
  connectToWifi();
  setupHttpServer();
  setupWebsocketServer();
}

void loop() {

  updateWifi();
  updateHttpServer();
  updateWebsocketServer();

  updateLeds();
}

void setupLeds() {
  FastLED.addLeds<WS2812B, DATA_PIN, GBR>(leds, LED_COUNT);

  for (uint8_t t=0; t < MAX_TRIANGLES; t++) {
    hue[t] = random8();
  }
}

void updateLeds() {
  for (uint8_t t=0; t < MAX_TRIANGLES; t++) {
    hue[t]++;
  }
  
  for(int l = 0; l < LED_COUNT; l++) { 
    uint8_t triangle = l / LEDS_PER_TRI;
    leds[l] = CHSV(hue[triangle], 255, 255);
  }
  FastLED.show();
  delay(30);
}
