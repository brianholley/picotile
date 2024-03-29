// ------------------------------------------------------------
// Webserver.h
// 
// HTTP and Websocket server implementation
//
#ifndef __PICOTILE_WEBSERVER__
#define __PICOTILE_WEBSERVER__ 1

#include <ArduinoJson.h>

#include "Common.h"

#include <ESP8266WiFi.h> // https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager

#include <ESP8266HTTPClient.h>
#include <ESP8266HTTPUpdateServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>

#include <EEPROM.h>
#include <FS.h>
#include <WebSocketsServer.h>

#include "Settings.h"

const uint8_t HttpPort = 80;
const uint8_t WebsocketPort = 81;

void OnSetTile(uint8_t index, uint8_t r, uint8_t g, uint8_t b);
void OnSetPattern(const String& pattern);

namespace Webserver {

WiFiManager wifiManager;
ESP8266WebServer webServer(HttpPort);
WebSocketsServer webSocketsServer(WebsocketPort);
ESP8266HTTPUpdateServer httpUpdateServer;

// Callbacks
typedef void (*FnSetMode)(uint8_t mode);
typedef void (*FnSetPattern)(const String& pattern);
typedef void (*FnSetTile)(uint8_t index, uint8_t r, uint8_t g, uint8_t b);

void OnSetMode(uint8_t mode);

FnSetMode fnSetMode = OnSetMode;
FnSetPattern fnSetPattern = OnSetPattern;
FnSetTile fnSetTile = OnSetTile;

const char * currentPattern = null;

void sendTiles();
void sendPattern();

String generateMDNSName() {
    // Generate a durable, reasonably unique name
    uint8_t macaddr[WL_MAC_ADDR_LENGTH];
    WiFi.softAPmacAddress(macaddr);
    String name = "esp8266-" +
        String(macaddr[WL_MAC_ADDR_LENGTH - 4], HEX) +
        String(macaddr[WL_MAC_ADDR_LENGTH - 3], HEX) +
        String(macaddr[WL_MAC_ADDR_LENGTH - 2], HEX) +
        String(macaddr[WL_MAC_ADDR_LENGTH - 1], HEX);
    name.toUpperCase();
    return name;
}

bool connectToWifi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    WiFi.setSleepMode(WIFI_NONE_SLEEP);

    String dnsName = generateMDNSName();
    char name[dnsName.length() + 1];
    dnsName.toCharArray(name, dnsName.length() + 1);
    Serial.printf("DNS name: %s\n", name);

    wifiManager.setConfigPortalBlocking(false);

    if (wifiManager.autoConnect(name)) {
        Serial.println("Wifi connected");
    }

    MDNS.begin(name);
    MDNS.setHostname(name);
    return true;
}

void setupHttpServer() {
    SPIFFS.begin();
    httpUpdateServer.setup(&webServer);
    webServer.enableCORS(true);

    webServer.on("/settings", HTTP_GET, []() {
        String json = settingsToJson();
        webServer.send(200, "application/json", json);
    });

    webServer.on("/settings", HTTP_POST, []() {
        if (webServer.hasArg("brightness")) {
            settings.brightness = webServer.arg("brightness").toInt();
        }
        if (webServer.hasArg("speed")) {
            settings.speed = webServer.arg("speed").toInt();
        }
        if (webServer.hasArg("mode")) {
            const String mode = webServer.arg("mode");
            if (mode == ModeAutomatic) {
                settings.mode = MODE_AUTOMATIC;
            }
            else if (mode == ModeSingle) {
                settings.mode = MODE_SINGLE;
            }
            else if (mode == ModeManual) {
                    settings.mode = MODE_MANUAL;
            }
        }
        saveSettings();

        String json = settingsToJson();
        webServer.send(200, "application/json", json);
    });

    webServer.on("/tiles", HTTP_GET, []() {
        String json = tilesToJson();
        webServer.send(200, "application/json", json);
    });

    webServer.on("/tiles/add", HTTP_POST, []() {
        if (!webServer.hasArg("index") || 
            !webServer.hasArg("x") || 
            !webServer.hasArg("y") || 
            !webServer.hasArg("z") ||
            !webServer.hasArg("type")) {
            
            webServer.send(400, "application/json", "{ error: \"missing paramter\" }");
            return;
        }
        if (settings.tileCount == MAX_TILES) {            
            webServer.send(400, "application/json", "{ error: \"max tile count reached\" }");
            return;
        }

        settings.tiles[settings.tileCount].index = webServer.arg("index").toInt();
        settings.tiles[settings.tileCount].x = webServer.arg("x").toInt();
        settings.tiles[settings.tileCount].y = webServer.arg("y").toInt();
        settings.tiles[settings.tileCount].z = webServer.arg("z").toInt();
        const String type = webServer.arg("type");
        if (type == LightTile) {
          settings.tiles[settings.tileCount].type = LIGHT_TILE;
          TileCount++;
        }
        else if (type == ControlTile) {
          settings.tiles[settings.tileCount].type = CONTROL_TILE;
        }
        else {
            webServer.send(400, "application/json", "{ error: \"invalid tile type\" }");
            return;
        }
        settings.tileCount++;
        saveSettings();
        
        String json = tilesToJson();
        webServer.send(201, "application/json", json);
    });

    webServer.on("/tiles/delete", HTTP_POST, []() {
        if (!webServer.hasArg("index")) {
            webServer.send(400, "application/json", "{ error: \"missing paramter\" }");
            return;
        }

        uint8_t index = webServer.arg("index").toInt();
        bool found = false;
        for (int i=0; i < settings.tileCount; i++) {
            if (found) {
                settings.tiles[i-1].index == settings.tiles[i].index - 1;
                settings.tiles[i-1].x == settings.tiles[i].x;
                settings.tiles[i-1].y == settings.tiles[i].y;
                settings.tiles[i-1].z == settings.tiles[i].z;
                settings.tiles[i-1].type == settings.tiles[i].type;
            }
            if (settings.tiles[i].index == index) {
                found = true;
            }
        }
        if (found) {
            settings.tileCount--;
        }
        saveSettings();
        
        String json = tilesToJson();
        webServer.send(200, "application/json", json);
    });

    webServer.on("/tiles/update", HTTP_POST, []() {
        if (!webServer.hasArg("x") || 
            !webServer.hasArg("y") || 
            !webServer.hasArg("z") ||
            !webServer.hasArg("newX") || 
            !webServer.hasArg("newY") || 
            !webServer.hasArg("newZ") ||
            !webServer.hasArg("newType")) {
            
            webServer.send(400, "application/json", "{ error: \"missing paramter\" }");
            return;
        }

        uint8_t x = webServer.arg("x").toInt();
        uint8_t y = webServer.arg("y").toInt();
        uint8_t z = webServer.arg("z").toInt();
        for (int i=0; i < settings.tileCount; i++) {
            
            if (settings.tiles[i].x == x &&
                settings.tiles[i].y == y &&
                settings.tiles[i].z == z) {

                settings.tiles[i].x = webServer.arg("newX").toInt();
                settings.tiles[i].y = webServer.arg("newY").toInt();
                settings.tiles[i].z = webServer.arg("newZ").toInt();
                settings.tiles[i].type = webServer.arg("newType").toInt();
                break;
            }
        }
        saveSettings();
        
        String json = tilesToJson();
        webServer.send(200, "application/json", json);
    });

    webServer.serveStatic("/", SPIFFS, "/", "max-age=86400");

    webServer.begin();
    Serial.println("HTTP web server started");
}

uint8_t toIntHex(const String& str) {
    uint8_t n = 0;
    for (auto i = 0; i < 2; i++) {
        n = n * 16;
        
        char c = str.charAt(i);
        if (c >= '0' && c <= '9') {
          n += (uint8_t)c - (uint8_t)'0';
        }
        else if (c >= 'a' && c <= 'f') {
          n += (uint8_t)c - (uint8_t)'a' + 10;
        }
        else if (c >= 'A' && c <= 'F') {
          n += (uint8_t)c - (uint8_t)'A' + 10;
        }
    }
    return n;
}

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED: {
            IPAddress ip = webSocketsServer.remoteIP(num);
            Serial.printf("[%u] Disconnected Ip: %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
            break;
        }
        
        case WStype_CONNECTED: {
            IPAddress ip = webSocketsServer.remoteIP(num);
            Serial.printf("[%u] Connected Ip: %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);

            sendPattern();
            sendTiles();
            break;
        }

        case WStype_TEXT: {
            DynamicJsonDocument message(1024);
            deserializeJson(message, payload);
            
            const char * type = message["type"];
            if (strcmp(type, "setMode") == 0) {
                uint8_t mode = message["mode"];
                if (fnSetMode) {
                    fnSetMode(mode);
                }
            }
            else if (strcmp(type, "setPattern") == 0) {
                String pattern = message["pattern"];
                if (fnSetPattern) {
                    fnSetPattern(pattern);
                }
            }
            else if (strcmp(type, "setTile") == 0) {
                uint8_t index = message["index"];
                const String color = message["color"];
                uint8_t r = toIntHex(color.substring(1, 3));
                uint8_t g = toIntHex(color.substring(3, 5));
                uint8_t b = toIntHex(color.substring(5, 7));
                if (fnSetTile) {
                    Serial.printf("setTile index=%d color=%d,%d,%d\n", index, r, g, b);
                    fnSetTile(index, r, g, b);
                }
            }
            break;
        }
    }
}

void setupWebsocketServer() {
    webSocketsServer.begin();
    webSocketsServer.onEvent(onWebSocketEvent);
    Serial.println("WS server started");
}

void updateWifi() {
    wifiManager.process();
    MDNS.update();
}

void updateHttpServer() {
    webServer.handleClient();
}

void updateWebsocketServer() {
    webSocketsServer.loop();
    sendTiles();
}

void onPatternChange(const char* patternName) {
  currentPattern = patternName;
  sendPattern();
}

void sendPattern() {
  String json = "{\"type\":\"pattern\", \"data\":\"" + String(currentPattern) + "\"}";
  webSocketsServer.broadcastTXT(json);
}

String colorPartToHex(uint8_t c) {
  return (c < 16 ? "0" : "") + String(c, HEX);
}

void sendTiles() {
  String json = "{\"type\":\"tileColors\", \"tiles\":[";
  uint16_t offset = 0;
  for (uint8_t t = 0; t < MAX_TILES; t++) {
    uint32_t r = 0;
    uint32_t g = 0;
    uint32_t b = 0;
    for (uint8_t i=0; i < LEDS_PER_TILE; i++, offset++) {
      r += leds[offset].r;
      g += leds[offset].g;
      b += leds[offset].b;
    }
    String color = "#" + colorPartToHex(r/LEDS_PER_TILE) + colorPartToHex(g/LEDS_PER_TILE) + colorPartToHex(b/LEDS_PER_TILE);
    json += "{\"index\":" + String(t) + ", \"color\":\"" + color + "\"}";
    if (t < MAX_TILES - 1) {
      json += ",";
    }
  }
  json += "]}";
  webSocketsServer.broadcastTXT(json);
}

void OnSetMode(uint8_t mode) {
    settings.mode = mode;
    saveSettings();
}


}

#endif // ifndef __PICOTILE_WEBSERVER__
