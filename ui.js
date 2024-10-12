import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";
import { gun, switchGun } from "./guns.js";


export const ui = {
    weapon_selector: {
        active: false,
        width: 0,
        height: 300,
        size: 224,
        space: 8,
        x: 960 - 256,
        y: 540 - 128,
        draw() {
            this.x = 960 - ((this.size * this.width) + this.space) / 2
            this.y = 540 - this.height / 2
            ctx.fillStyle = "rgba(24,24,24,0.8)"
            ctx.fillRect(this.x, this.y - this.space, (this.size * this.width) + this.space, this.height + this.space * 2)
            Object.keys(gun.types).forEach((key, i) => {
                ctx.fillStyle = "rgba(255,255,255,0.1)"
                ctx.fillRect(
                    this.x + this.space + (i * this.size),
                    this.y,
                    this.size - this.space,
                    this.height)
                ctx.fillStyle = "rgba(255,255,255,0.8)"
                drawtext(key, [this.x + (i * this.size) + this.space + this.size / 2 - this.space, this.y + this.height / 2], this.size / 10, "monospace", "top", "center", 0, 1.0)

            })
        },
        update() {
            if (!this.active) {
                this.width = Object.keys(gun.types).length
                this.active = true
                time.scale = 0;
            }
            this.hitboxes = []
            Object.keys(gun.types).forEach((key, i) => {
                let hitbox = new hitboxFixed(
                    [this.x + this.space + (i * this.size),
                    this.y],
                    [this.size - this.space,
                    this.height]
                )
                if (isClicking(hitbox, true)) {
                    switchGun(key);
                    this.active = false
                    time.scale = 1;
                }
            })
        }
    }
}