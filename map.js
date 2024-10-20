import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";

await loadImage("src/images/map.png", "map0");
await loadImage("src/images/map1.png", "map1");

export let map = {
    map: "1",
    maps: {
        "0": {width: 1920, height: 1920},
        "1": {width: 5120, height: 1920},
    },
    object: undefined,
    x: -600,
    y: 400,
    width: 9600,
    height: 5400,
    min: {
        x: -960,
        y: -540
    },
    max: {
        x: 9600,
        y: 3072
    },
    currentVelocity: 0,
    velocity: 2200,
    vel: {
        x: 0,
        y: 0
    },
    vector: {
        x: 0,
        y: 0
    }
}
map.object = new object(image[`map${map.map}`], [0, 0], [map.maps[map.map].width, map.maps[map.map].height]);