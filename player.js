import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";

await loadImage("src/images/player/pep.png", "peperoni");

// player reason = 5
export let player = new object(image["peperoni"], [0, 0], [85, 85])
player.hitboxes.push(new hitboxFixed([player.x, player.y + player.height / 2], [player.width, player.height / 2]))
player.hitboxes.push(new hitboxCircleFixed([player.x + player.halfwidth, player.y + player.halfheight], player.halfwidth))

window.addEventListener("started", () => {
    player.x = screen.canvas.width / 2 - player.width / 2
    player.y = screen.canvas.height / 2 - player.height / 2
})
