// Transition.h
#ifndef __PICOTILE_TRANSITION__
#define __PICOTILE_TRANSITION__ 1

#include "Common.h"

namespace Transition {

void start() {

}

void update() {
    float factor = 1.0f - 0.03;
    for (uint8_t i = 0; i < MAX_LEDS; i++) {
        uint8_t r = leds[i].r * factor;
        uint8_t g = leds[i].g * factor;
        uint8_t b = leds[i].b * factor;
        leds[i] = CRGB(r, g, b);
    }
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_TRANSITION__
