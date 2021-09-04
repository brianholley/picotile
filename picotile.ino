#include "Common.h"

#define DATA_PIN 6

#include "Firefly.h"
#include "Settings.h"
#include "Starburst.h"
#include "WifiCredentials.h"
#include "Webserver.h"

CRGB leds[LED_COUNT];
uint8_t hue[MAX_TILES];

uint8_t triangles = MAX_TILES;

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

  Starburst::start();
}

void updateLeds() {
  Starburst::update();
}
