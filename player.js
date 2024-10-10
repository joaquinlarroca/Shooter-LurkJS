import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";

await loadImage("src/images/player.png", "conejo");

export let player = new object(image["conejo"], [0, 0], [86, 86])
window.addEventListener("started", () => {
    player.x = screen.canvas.width / 2 - player.width / 2
    player.y = screen.canvas.height / 2 - player.height / 2
})

