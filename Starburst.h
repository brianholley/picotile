// Starburst.h
#ifndef __PICOTILE_STARBURST__
#define __PICOTILE_STARBURST__ 1

#include "Common.h"

namespace Starburst {

// TODO: Fade-in for stars

uint8_t hue[MAX_TILES];
uint8_t value[MAX_TILES];

const uint32_t TimeToNewStartInMsec = 3000 / TileCount;
uint32_t tick = 0;

uint8_t lastIndex = MAX_TILES;
uint8_t lastHue = 0;

void render();

void start() {
    for (uint8_t t=0; t < MAX_TILES; t++) {
        hue[t] = random(256);
        value[t] = random(256);
    }
    render();
}

void update() {
    tick += SleepInMsec;
    for (uint8_t t=0; t < TileCount; t++) {
        if (value[t] > 0) {
            value[t] -= 1;
        }
    }
    if (tick > TimeToNewStartInMsec) {
        tick = 0;

        uint8_t index = random(TileCount);
        if (index == lastIndex) {
            index = random(TileCount);
        }
        hue[index] = random(256);
        if (abs(hue[index] - lastHue) < 10) {
            hue[index] = random(256);
        }
        value[index] = 255;
        
        lastIndex = index;
        lastHue = hue[index];
    }
    render();
}

void render() {
    for (uint8_t i=0; i < MAX_LEDS; i++) {
        uint8_t tile = i / LEDS_PER_TILE;
        leds[i] = CHSV(hue[tile], 255, value[tile]);
    }
    
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_STARBURST__
