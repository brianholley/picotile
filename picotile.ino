#include "Common.h"

#define DATA_PIN 6

#include "Fire.h"
#include "Firefly.h"
#include "Rainbow.h"
#include "Settings.h"
#include "Starburst.h"
#include "Transition.h"
#include "WifiCredentials.h"
#include "Webserver.h"

CRGB leds[LED_COUNT];

enum State {
  InPattern,
  InTransition
} state = InPattern;

const uint16_t TransitionTimeInMsec = 1000;
const uint16_t MinTimeInPatternInMsec = 15000;
const uint16_t MaxTimeInPatternInMsec = 60000;

uint16_t tick = 0;
uint16_t patternTime = 0;
uint8_t currentPattern = 0;

typedef void (*FnStart)();
typedef void (*FnUpdate)();

struct Pattern {
  const char * name;
  FnStart start;
  FnUpdate update;
};

const Pattern patterns[] = {
  { "Fire", Fire::start, Fire::update },
  { "Firefly", Firefly::start, Firefly::update },
  { "Rainbow", Rainbow::start, Rainbow::update },
  { "Starburst", Starburst::start, Starburst::update },
};
const uint8_t PatternCount = sizeof(patterns) / sizeof(patterns[0]);

void setup() {
  
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  Serial.println();
  Serial.print("Heap: "); Serial.println(system_get_free_heap_size());
  Serial.print("Boot Vers: "); Serial.println(system_get_boot_version());
  Serial.print("CPU: "); Serial.println(system_get_cpu_freq());
  Serial.print("SDK: "); Serial.println(system_get_sdk_version());
  Serial.print("Chip ID: "); Serial.println(system_get_chip_id());
  Serial.print("Flash ID: "); Serial.println(spi_flash_get_id());
  Serial.print("Flash Size: "); Serial.println(ESP.getFlashChipRealSize());
  Serial.print("Vcc: "); Serial.println(ESP.getVcc());
  Serial.println();
  
  Serial.println("loadSettings: ");
  loadSettings();

  Serial.println("setupLeds: ");
  setupLeds();
  
  Serial.println("connectToWifi: ");
  connectToWifi();
  Serial.println("setupHttpServer: ");
  setupHttpServer();
  Serial.println("setupWebsocketServer: ");
  setupWebsocketServer();
}

void loop() {

  updateWifi();
  updateHttpServer();
  updateWebsocketServer();

  updateLeds();
}

void setupLeds() {
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, LED_COUNT);

  patternTime = random(MinTimeInPatternInMsec, MaxTimeInPatternInMsec);
  currentPattern = random(PatternCount);

  patterns[currentPattern].start();
}

void updateLeds() {
  tick += SleepInMsec;
  if (state == InPattern) {
    if (tick > patternTime) {
      state = InTransition;
      tick = 0;

      Transition::start();
    }
    else {
      patterns[currentPattern].update();
    }
  }
  else if (state == InTransition) {
    Transition::update();
  
    if (tick > TransitionTimeInMsec) {
      state = InPattern;
      tick = 0;
      
      currentPattern = random(PatternCount);
      patterns[currentPattern].start();
    }
  }
  
  delay(SleepInMsec);
}
