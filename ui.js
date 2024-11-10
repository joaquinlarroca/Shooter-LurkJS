import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv, sound2, sound } from "./src/js/classes.js";
import { loadFont, loadImage, loadSound } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";
import { gun, switchGun, bullets } from "./guns.js";
import { entities } from "./entities.js";

await loadImage("./src/images/banners/banner0.png", "banner0");

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
    },
    weapon_info: {
        y: 55,
        draw() {
            ctx.fillStyle = "rgba(24,24,24,0.8)"
            ctx.fillRect(1616, 952 + this.y, 304, 128)

            ctx.fillStyle = "rgba(64,64,64,0.8)"
            for (let i = 0; i < gun.mag.max - gun.mag.current; i++) {
                ctx.save()
                ctx.beginPath();
                ctx.roundRect(1624 + (i * (290 / gun.mag.max)) + (290 / gun.mag.max) * gun.mag.current, 960 + this.y, (290 / gun.mag.max) / 2, 8, 2);
                ctx.clip()
                ctx.closePath()
                ctx.fillRect(1624 + (i * (290 / gun.mag.max)), 960 + this.y, (290 / gun.mag.max) / 2, 8)
                ctx.fill();
                ctx.restore()
            }
            if (gun.reloading) {
                ctx.fillStyle = "rgba(255,100,100,1)"
            }
            else {
                ctx.fillStyle = "rgba(255,255,255,1)"
            }
            for (let i = 0; i < gun.mag.current; i++) {
                ctx.save()
                ctx.beginPath();
                ctx.roundRect(1624 + (i * (290 / gun.mag.max)), 960 + this.y, (290 / gun.mag.max) / 2, 8, 2);
                ctx.clip()
                ctx.closePath()
                ctx.fillRect(1624 + (i * (290 / gun.mag.max)), 960 + this.y, (290 / gun.mag.max) / 2, 8)
                ctx.fill();
                ctx.restore()
            }

            drawtext(`${gun.mag.current}/${gun.mag.max}`, [1690, 970 + this.y], 24, "monospace", "top", "end", 0, 1.0)
            ctx.fillStyle = "rgba(255,255,255,1)"
            drawtext(`${gun.equiped}`, [1702, 970 + this.y], 24, "monospace", "top", "start", 0, 1.0)
            ctx.fillStyle = "rgba(255,255,255,.3)"
            drawtext(`BULLETS: ${bullets.length} ENTITIES: ${entities.length}`, [1624, 994 + this.y], 18, "monospace", "top", "start", 0, 1.0)
        }
    },
    lobby: {
        playBTN: new button("color: transparent", [832, 984], [256, 64], ["P L A Y", "white", 26, "sans-serif"], 1000),
        banner: new object(image["banner0"], [810, 277], [300, 675]),
        draw() {
            this.playBTN.draw()
            this.banner.draw()
            ctx.fillStyle = "rgb(24,24,24)"
            ctx.beginPath();
            ctx.roundRect(32, 32, 746, 1016, 3);
            ctx.fill()

            


            if (this.playBTN.hovered) {
                this.playBTN.mycolor = lerp(this.playBTN.mycolor, 1, (1 ** time.deltaTime) * 0.1 * time.scale)
                this.playBTN.stroke.color = `rgba(255, 255, 255, ${1 - this.playBTN.mycolor})`
                this.playBTN.color = `rgba(255, 255, 255, ${this.playBTN.mycolor})`
                this.playBTN.text.color = "rgb(17, 17, 17)"
            }
            else {
                this.playBTN.mycolor = lerp(this.playBTN.mycolor, 0, (1 ** time.deltaTime) * 0.1 * time.scale)
                this.playBTN.stroke.color = `rgba(255, 255, 255, ${1 - this.playBTN.mycolor})`
                this.playBTN.color = `rgba(255, 255, 255, ${this.playBTN.mycolor})`
                this.playBTN.text.color = "rgb(255, 255, 255)"
            }
        }
    }
}
ui.lobby.playBTN.stroke.active = true
ui.lobby.playBTN.stroke.width = 3
ui.lobby.playBTN.borderRadius = 3
ui.lobby.playBTN.mycolor = 0
ui.lobby.banner.borderRadius = 3