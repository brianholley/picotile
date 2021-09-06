// Firefly.h
#ifndef __PICOTILE_FIREFLY__
#define __PICOTILE_FIREFLY__ 1

#include "Common.h"

namespace Firefly {

CRGB nightColor = 0x000008;
CRGB fireflyColor = 0x506612;

const uint32_t MinFireflyDurationInMsec = 1200;
const uint32_t MaxFireflyDurationInMsec = 3000;
const uint32_t MinFireflyDelayInMsec = 500;
const uint32_t MaxFireflyDelayInMsec = 10000;

const uint8_t BackgroundSame = 10;
const uint8_t BackgroundDarken = 40;
const uint8_t BackgroundLighten = 100;

struct Firefly
{
    uint8_t tile;
    CRGB currentColor;
    uint32_t tick;
    uint32_t duration;
    uint32_t delay;
};
Firefly firefly;

void jitterBackground();
bool updateFirefly(Firefly& ff);
void resetFirefly(Firefly& ff);
void render(Firefly& ff);
void fill(CRGB& c);
uint8_t fade(uint8_t c1, uint8_t c2, float d);

void start() {
    resetFirefly(firefly);
    fill(nightColor);
    render(firefly);
}

void update() {

    //jitterBackground();
    
    bool valid = updateFirefly(firefly);
    render(firefly);
    
    if (!valid) {
        resetFirefly(firefly);
        fill(nightColor);
    }
}

void render(Firefly& ff) {
  
    uint16_t offset = LEDS_PER_TILE * ff.tile;
    for (uint8_t i=0; i < LEDS_PER_TILE; i++, offset++) {
        leds[offset] = ff.currentColor;
    }
    FastLED.show();
}

void logColor(CRGB& rgb) {
  Serial.print(rgb.r);
  Serial.print(",");
  Serial.print(rgb.g);
  Serial.print(",");
  Serial.println(rgb.b);
}

// TODO: Open question - jitter per LED or per tile?
void jitterBackground() {
    uint8_t bNight = nightColor.b;
    for (uint8_t i=0; i < MAX_LEDS; i++) {
        if (i % LEDS_PER_TILE == firefly.tile) {
            // Don't jitter firefly pixels
        }
        uint8_t r = random(100);
        if (r < BackgroundSame) {
            // No change
        }
        else if (r < BackgroundDarken) {
            if (leds[i].b > 0)
                leds[i].b--;
        }
        else if (r < BackgroundLighten) {
            if (leds[i].b < 255)
                leds[i].b++;
        }
    }
}

bool updateFirefly(Firefly& ff) {

    // Wait to start the next firefly
    if (ff.delay >= SleepInMsec) {
        ff.delay -= SleepInMsec;
        return true;
    }

    ff.tick += SleepInMsec;

    // Brighten
    if (ff.tick < ff.duration / 2) {
        float elapsed = ff.tick / (float)(ff.duration / 2);
        uint8_t r = fade(nightColor.r, fireflyColor.r, elapsed);
        uint8_t g = fade(nightColor.g, fireflyColor.g, elapsed);
        uint8_t b = fade(nightColor.b, fireflyColor.b, elapsed);
        ff.currentColor = CRGB(r, g, b);
        //Serial.print("Brighten: "); logColor(ff.currentColor);
    }
    // Fade
    else {
        float elapsed = min(ff.tick / (float)(ff.duration / 2) - 1, 1.0f);
        uint8_t r = fade(fireflyColor.r, nightColor.r, elapsed);
        uint8_t g = fade(fireflyColor.g, nightColor.g, elapsed);
        uint8_t b = fade(fireflyColor.b, nightColor.b, elapsed);
        ff.currentColor = CRGB(r, g, b);
        //Serial.print("Fade: "); logColor(ff.currentColor);
    }
    return ff.tick < ff.duration;
}

void resetFirefly(Firefly& ff) {
  
  ff.tile = random(MAX_TILES);
  ff.currentColor = nightColor;
  ff.tick = 0;
  ff.duration = random(MinFireflyDurationInMsec, MaxFireflyDurationInMsec);
  ff.delay = random(MinFireflyDelayInMsec, MaxFireflyDelayInMsec);

  Serial.println("NEW FIREFLY");
  Serial.print("Tile: ");     Serial.println(ff.tile);
  Serial.print("Duration: "); Serial.println(ff.duration);
  Serial.print("Delay: ");    Serial.println(ff.delay);
}

void fill(CRGB& c) {
  for(uint16_t i=0; i < MAX_LEDS; i++) {
    leds[i] = c;
  }
}

uint8_t fade(uint8_t c1, uint8_t c2, float d) {
  return (uint8_t)(((int32_t)c2 - c1) * d + c1);
}

}

#endif // ifndef __PICOTILE_PALETTES__
