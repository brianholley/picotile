// Manual.h
#ifndef __PICOTILE_MANUAL__
#define __PICOTILE_MANUAL__ 1

#include "Common.h"

namespace Manual {

void start() {
}

void update() {
    FastLED.show();
}


void OnSetTile(uint8_t index, uint8_t r, uint8_t g, uint8_t b) {
    uint16_t offset = index * LEDS_PER_TILE;
    for (auto i = 0; i < LEDS_PER_TILE; i++, offset++) {
        leds[offset] = CRGB(r, g, b);
    }
}

}

#endif // ifndef __PICOTILE_MANUAL__
