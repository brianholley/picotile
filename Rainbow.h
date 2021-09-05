// Rainbow.h
#ifndef __PICOTILE_RAINBOW__
#define __PICOTILE_RAINBOW__ 1

#include "Common.h"

namespace Rainbow {

const uint8_t SleepInMsec = 30;

uint8_t hue = 0;
const uint8_t hsvTileStep = 20;

void render();

void start() {
    hue = random(256);
    render();
}

void update() {
    hue++;
    render();
   
    delay(SleepInMsec);
}

void render() {
    for (uint8_t i=0; i < LED_COUNT; i++) {
        leds[i] = CHSV(hue + (i % LEDS_PER_TILE) * hsvTileStep, 255, 255);
    }
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_RAINBOW__
