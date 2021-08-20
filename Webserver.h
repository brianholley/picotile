// Webserver.h
#ifndef __PICOTILE_WEBSERVER__
#define __PICOTILE_WEBSERVER__ 1

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

WiFiManager wifiManager;
ESP8266WebServer webServer(80);
WebSocketsServer webSocketsServer(81);
ESP8266HTTPUpdateServer httpUpdateServer;


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
            settings.mode = webServer.arg("mode").toInt();
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
        if (!webServer.hasArg("x") || 
            !webServer.hasArg("y") || 
            !webServer.hasArg("z") ||
            !webServer.hasArg("type")) {
            
            webServer.send(400, "application/json", "{ error: \"missing paramter\" }");
            return;
        }
        if (settings.tileCount + 1 == MAX_TRIANGLES) {            
            webServer.send(400, "application/json", "{ error: \"max tile count reached\" }");
            return;
        }

        settings.tiles[settings.tileCount].x = webServer.arg("x").toInt();
        settings.tiles[settings.tileCount].y = webServer.arg("y").toInt();
        settings.tiles[settings.tileCount].z = webServer.arg("z").toInt();
        settings.tiles[settings.tileCount].type = webServer.arg("type").toInt();
        settings.tileCount++;
        saveSettings();
        
        String json = tilesToJson();
        webServer.send(201, "application/json", json);
    });

    webServer.on("/tiles/delete", HTTP_POST, []() {
        if (!webServer.hasArg("x") || 
            !webServer.hasArg("y") || 
            !webServer.hasArg("z")) {
            
            webServer.send(400, "application/json", "{ error: \"missing paramter\" }");
            return;
        }

        uint8_t x = webServer.arg("x").toInt();
        uint8_t y = webServer.arg("y").toInt();
        uint8_t z = webServer.arg("z").toInt();
        bool found = false;
        for (int i=0; i < settings.tileCount; i++) {
            if (found) {
                settings.tiles[i-1].x == settings.tiles[i].x;
                settings.tiles[i-1].y == settings.tiles[i].y;
                settings.tiles[i-1].z == settings.tiles[i].z;
                settings.tiles[i-1].type == settings.tiles[i].type;
            }
            if (settings.tiles[i].x == x &&
                settings.tiles[i].y == y &&
                settings.tiles[i].z == z) {
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
}

#endif // ifndef __PICOTILE_WEBSERVER__
