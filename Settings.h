// Settings.h
#ifndef __PICOTILE_SETTINGS__
#define __PICOTILE_SETTINGS__ 1

#include <EEPROM.h>
#include "Common.h"

#define CURRENT_VERSION 1

#define LIGHT_TILE      0
#define CONTROL_TILE    1

extern uint8_t TileCount;

const char * LightTile = "light";
const char * ControlTile = "control";

// Modes
// See README.md for mode descriptions
#define MODE_AUTOMATIC  0
#define MODE_SINGLE     1
#define MODE_MANUAL     2

const char * ModeAutomatic = "automatic";
const char * ModeSingle = "single";
const char * ModeManual = "manual";

struct Tile {
    int8_t index;
    uint8_t x, y, z;
    uint8_t type;   // LIGHT_TILE/CONTROL_TILE
};

struct Settings {
    // Version - defined as CURRENT_VERSION
    uint8_t version;

    // Tile layouts
    uint8_t tileCount;
    Tile tiles[MAX_TILES];

    // Brightness
    uint8_t brightness;

    // Speed
    uint8_t speed;

    // Mode - defined with mode definition identifiers
    uint8_t mode;
};

Settings settings;

void initializeSettings() {
    Serial.println("Initializing new settings");
    settings.version = CURRENT_VERSION;
    settings.tileCount = 1;
    TileCount = 0;
    settings.brightness = 255;
    settings.speed = 255;
    settings.mode = 0;
    settings.tiles[0] = {-1, 4, 5, 1, CONTROL_TILE};
}

// TODO: improved data validation
void loadSettings() {
    EEPROM.begin(512);

    uint16_t offset = 0;
    settings.version = EEPROM.read(offset++);

    if (settings.version != CURRENT_VERSION) {
        // TODO: Upgrade from previous settings version once needed
        initializeSettings();
        return;
    }

    settings.tileCount = EEPROM.read(offset++);

    if (settings.tileCount >= MAX_TILES) {
        initializeSettings();
        return;
    }

    TileCount = 0;
    for (uint8_t i=0; i < settings.tileCount; i++) {
        settings.tiles[i].index = EEPROM.read(offset++);
        settings.tiles[i].x = EEPROM.read(offset++);
        settings.tiles[i].y = EEPROM.read(offset++);
        settings.tiles[i].z = EEPROM.read(offset++);
        settings.tiles[i].type = EEPROM.read(offset++);
        if (settings.tiles[i].type == LIGHT_TILE) {
            TileCount++;
        }
    }

    settings.brightness = EEPROM.read(offset++);
    settings.speed = EEPROM.read(offset++);
    settings.mode = EEPROM.read(offset++);
}

void saveSettings() {
    uint16_t offset = 0;
    EEPROM.write(offset++, settings.version);

    EEPROM.write(offset++, settings.tileCount);
    for (uint8_t i=0; i < settings.tileCount; i++) {
        EEPROM.write(offset++, settings.tiles[i].index);
        EEPROM.write(offset++, settings.tiles[i].x);
        EEPROM.write(offset++, settings.tiles[i].y);
        EEPROM.write(offset++, settings.tiles[i].z);
        EEPROM.write(offset++, settings.tiles[i].type);
    }

    EEPROM.write(offset++, settings.brightness);
    EEPROM.write(offset++, settings.speed);
    EEPROM.write(offset++, settings.mode);

    EEPROM.commit();
}

String settingsToJson() {
    String mode;
    switch (settings.mode) {
        case MODE_AUTOMATIC:
            mode = ModeAutomatic;
            break;
        case MODE_SINGLE:
            mode = ModeSingle;
            break;
        case MODE_MANUAL:
            mode = ModeManual;
            break;
        default:
            mode = ModeAutomatic;
            break;
    }
    String json = "{";
    json += 
        "\"version\":" + String(settings.version) + "," +
        "\"brightness\":" + String(settings.brightness) + "," +
        "\"speed\":" + String(settings.speed) + "," +
        "\"mode\":\"" + mode + "\"" + 
        "}";
    return json;
}

String tilesToJson() {
    String json = "{";
    json +=
        "\"version\":" + String(settings.version) + "," +
        "\"maxTiles\":" + String(MAX_TILES) + "," +
        "\"tiles\":[";
    for (uint8_t i = 0; i < settings.tileCount; i++) {
        json += "{";
        json += "\"index\":" + String(settings.tiles[i].index) + ",";
        json += "\"type\":\"" + String(settings.tiles[i].type == LIGHT_TILE ? LightTile : ControlTile) + "\",";
        json += "\"pos\": {";
        json += 
            "\"x\":" + String(settings.tiles[i].x) +
            ",\"y\":" + String(settings.tiles[i].y) +
            ",\"z\":" + String(settings.tiles[i].z) +
            "}}";
        if (i < settings.tileCount - 1) {
            json += ",";
        }
    }
    json += "]}";
    return json;
}

#endif // ifndef __PICOTILE_SETTINGS__
