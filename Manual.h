// Manual.h
#ifndef __PICOTILE_MANUAL__
#define __PICOTILE_MANUAL__ 1

#include "Common.h"

namespace Manual {

void start() {
    render();
}

void update() {
    render();
}

void render() {
    FastLED.show();
}

}

#endif // ifndef __PICOTILE_MANUAL__
