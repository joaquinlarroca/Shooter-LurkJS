import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";

await loadImage("src/images/crosshair.png", "crosshair");
export let crosshair = new object(image["crosshair"], [0, 0], [32, 32]);

crosshair.borderRadius = 16;

export let crosshairAngle = 0;
export function updateCrosshair() {
    if(mouse.x != Infinity && mouse.y != Infinity){
        crosshair.x = lerp(crosshair.x, mouse.x - crosshair.halfwidth, (1 ** time.fixedDeltaTime) * 0.6)
        crosshair.y = lerp(crosshair.y, mouse.y - crosshair.halfheight, (1 ** time.fixedDeltaTime) * 0.6)
        crosshairAngle = Math.atan2(mouse.y - (player.y + player.halfheight), mouse.x - (player.x + player.halfwidth)) * (180 / Math.PI)
    }
    
} 
