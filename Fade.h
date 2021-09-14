// Fade.h
#ifndef __PICOTILE_FADE__
#define __PICOTILE_FADE__ 1

#include "Common.h"

namespace Fade {

uint8_t hueStart, hueTarget;
uint8_t satStart, satTarget;

const uint16_t DurationInMsec = 10000;
uint16_t tick = 0;

void render();

void start() {
    tick = 0;

    hueStart = random(256);
    hueTarget = random(256);
    satStart = random(256);
    satTarget = random(256);

    render();
}

void update() {
    tick += SleepInMsec;
    if (tick > DurationInMsec) {
        tick = 0;
        
        hueStart = hueTarget;
        hueTarget = random(256);
        satStart = satTarget;
        satTarget = random(256);
    }
    render();
}

void render() {
    float factor = (float)tick / (float)DurationInMsec;
    uint8_t hue = ((int16_t)hueTarget - hueStart) * factor + hueStart;
    uint8_t sat = ((int16_t)satTarget - satStart) * factor + satStart;

    CHSV hsv(hue, sat, 255);
    for (uint8_t i=0; i < MAX_LEDS; i++) {
        leds[i] = hsv;
    }
    
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_FADE__
