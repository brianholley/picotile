// Common.h
#ifndef __PICOTILE_COMMON__
#define __PICOTILE_COMMON__ 1

#define FASTLED_ESP8266_NODEMCU_PIN_ORDER
#define FASTLED_ALLOW_INTERRUPTS            0
#include <FastLED.h>
FASTLED_USING_NAMESPACE


#define LEDS_PER_TILE 9
#define MAX_TILES 7
#define LED_COUNT (LEDS_PER_TILE * MAX_TILES)

extern CRGB leds[];

#endif // ifndef __PICOTILE_COMMON__
