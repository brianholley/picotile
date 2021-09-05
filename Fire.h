// Fire.h
#ifndef __PICOTILE_FIRE__
#define __PICOTILE_FIRE__ 1

#include "Common.h"

namespace Fire {

uint8_t heat[LED_COUNT];
const uint8_t MaxHeat = 200;
const uint8_t MaxReheat = 10;

void render();

void start() {
    for (uint8_t i=0; i < LED_COUNT; i++) {
        heat[i] = random(MaxHeat);
    }
    render();
}

void update() {
    for (uint8_t i=0; i < LED_COUNT; i++) {
        if (heat[i] > 0) {
            heat[i]--;
        }
        else {
            heat[i] = random(MaxHeat);
        }
    }

    for (uint8_t i=0; i < 3; i++) {
        uint8_t reheatIndex = random(LED_COUNT);
        uint8_t reheat = random(MaxReheat);
        if (heat[reheatIndex] < MaxHeat - reheat) {
          heat[reheatIndex] += reheat;
        }
        else {
          heat[reheatIndex] = MaxHeat;
        }
    }
    
    render();
}

void render() {
    for (uint8_t i=0; i < LED_COUNT; i++) {
        leds[i] = HeatColor(heat[i]);
    }
    
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_FIRE__
