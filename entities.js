import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound, timeout } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";

export let entities = [];
export class bullet_decay extends object {
    constructor(bullet_img, x, y, width, height, angle) {
        super(bullet_img, [0, 0], [width, height], [0, 0])
        this.entity_type = "bullet_decay"
        this.x = x + map.x
        this.y = y + map.y
        this.alpha = 1
        this.angle = angle
        entities.push(this)
    }
}

export function drawBulletDecay() {
    var bullet_decays = entities.filter(e => e.entity_type == "bullet_decay")
    for (let i = 0; i < bullet_decays.length; i++) {
        if (entities[i].entity_type == "bullet_decay") {
            entities[i].draw()
        }
    }
}
export function updateEntities() {
    for (let i = 0; i < entities.length; i++) {
        if (entities[i].entity_type == "bullet_decay") {
            entities[i].alpha = lerp(entities[i].alpha, 0, (1 ** time.fixedDeltaTime) * 0.025 * time.scale)
            if (entities[i].alpha <= 0.05) {
                entities[i].toDelete = true
            }
        }
        if (entities[i].toDelete) {
            entities.splice(i, 1)
        }
    }
}