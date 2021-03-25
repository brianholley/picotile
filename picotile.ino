#include <FastLED.h>

#define LEDS_PER_TRI 9
#define TRIANGLES 2
#define LED_COUNT (LEDS_PER_TRI * TRIANGLES)
#define DATA_PIN 6

CRGB leds[LED_COUNT];
uint8_t hue[TRIANGLES];

void setup() {
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, LED_COUNT);

  for (uint8_t t=0; t < TRIANGLES; t++) {
    hue[t] = random8();
  }
}

void loop() {
  for (uint8_t t=0; t < TRIANGLES; t++) {
    hue[t]++;
  }
  
  for(int l = 0; l < LED_COUNT; l++) { 
    uint8_t triangle = l / LEDS_PER_TRI;
    leds[l] = CHSV(hue[triangle], 255, 255);
  }
  FastLED.show();
  delay(30);
}