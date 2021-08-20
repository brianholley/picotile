// Settings.h
#ifndef __PICOTILE_SETTINGS__
#define __PICOTILE_SETTINGS__ 1

#include <EEPROM.h>

#define CURRENT_VERSION 1

#define LIGHT_TILE      0
#define CONTROL_TILE    1

struct TilePosition {
    uint8_t x, y, z;
    uint8_t type;   // LIGHT_TILE/CONTROL_TILE
};

struct Settings {
    // Version
    uint8_t version;

    // Tile layouts
    uint8_t tileCount;
    TilePosition tiles[MAX_TRIANGLES];

    // Brightness
    uint8_t brightness;

    // Speed
    uint8_t speed;

    // Mode
    uint8_t mode;

    // Palettes - TBD
};

Settings settings;

// TODO: data validation
void loadSettings() {
    EEPROM.begin(512);

    uint16_t offset = 0;
    settings.version = EEPROM.read(offset++);

    settings.tileCount = EEPROM.read(offset++);
    for (uint8_t i=0; i < settings.tileCount; i++) {
        settings.tiles[i].x = EEPROM.read(offset++);
        settings.tiles[i].y = EEPROM.read(offset++);
        settings.tiles[i].z = EEPROM.read(offset++);
        settings.tiles[i].type = EEPROM.read(offset++);
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
    String json = "{";
    json += 
        "version:" + String(settings.version) + "," +
        "brightness:" + String(settings.brightness) + "," +
        "speed:" + String(settings.speed) + "," +
        "mode:" + String(settings.mode) +
        "}";
    return json;
}

String tilesToJson() {
    String json = "{";
    json +=
        "version:" + String(settings.version) + "," +
        "maxTiles:" + String(MAX_TRIANGLES) + "," +
        "tiles:[";
    for (uint8_t i = 0; i < settings.tileCount; i++) {
        json += "{";
        json += "type:" + String(settings.tiles[i].type) + "," +
            "pos: {";
        json += 
            "x:" + String(settings.tiles[i].x) +
            "y:" + String(settings.tiles[i].y) +
            "z:" + String(settings.tiles[i].z) +
            "}}";
        if (i < settings.tileCount - 1) {
            json += ",";
        }
    }
    json += "]}";
    return json;
}

#endif // ifndef __PICOTILE_SETTINGS__