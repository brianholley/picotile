// Pulse.h
#ifndef __PICOTILE_PULSE__
#define __PICOTILE_PULSE__ 1

#include "Common.h"

namespace Pulse {

uint8_t hue;
uint8_t sat;
float position;

const float SpeedInTilesPerMsec = 7.0f / 1000;

const uint8_t lead = 2;
const uint8_t tail = 4;

void reset();
void render();

void start() {
    reset();
    render();
}

void update() {
    position += SpeedInTilesPerMsec * SleepInMsec;

    if (position > TileCount + 1) {
        reset();
    }
    render();
}

void reset() {
    hue = random(256);
    sat = random(256);
    position = -1.0f;
}

void render() {
    for (uint8_t i=0; i < MAX_LEDS; i++) {
        uint8_t tile = i / LEDS_PER_TILE;
        if (tile > position + lead || tile < position - tail) {
            leds[i] = CRGB(0, 0, 0);
        }
        else if (tile > position) {
            float factor = 1.0f - fabs((float)tile - position) / (float)lead;
            leds[i] = CHSV(hue, sat, factor * 255);
        }
        else {
            float factor = 1.0f - fabs((float)tile - position) / (float)tail;
            leds[i] = CHSV(hue, sat, factor * 255);
        }
    }
    
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_PULSE__
