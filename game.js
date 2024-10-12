import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { player } from "./player.js";
import { map } from "./map.js";
import { ParticleGenerator } from "./src/plugins/particles/particles.js";

import { bullets, gun, gunDraw, gunUpdate, shoot, reload, switchGun, drawBullets, updateBullets } from "./guns.js"

import "./src/plugins/gui/gui.js"
import { ui } from "./ui.js";

await loadImage("src/images/map.png", "fondo1");


await setup(1920, 1080, 0.99, 60);


let fondo = new object("color:#00dd00", [0, 0], [2000, 1000]);

let partGen = new ParticleGenerator(969, 540, 100, 15, "rgba(255,255,255,0.5)", 500, 500, 1500, 1e-100)

window.addEventListener("started", () => {
})
window.addEventListener("update", () => {
    clear()

    // #############
    // MAP
    // #############
    ctx.save()
    ctx.translate(-map.x, -map.y)

    fondo.draw()
    drawBullets()
    ctx.restore()
    // #############
    // END
    // #############
    player.draw()
    gunDraw()



    // #############
    // MAP
    // #############
    ctx.save()
    ctx.translate(-map.x, -map.y)

    partGen.draw()

    ctx.restore()
    // #############
    // END
    // #############

    ctx.fillStyle = "rgba(24,24,24,0.8)"
    ctx.fillRect(1616, 952, 304, 128)

    ctx.fillStyle = "rgba(64,64,64,0.8)"
    for (let i = 0; i < gun.mag.max - gun.mag.current; i++) {
        ctx.save()
        ctx.beginPath();
        ctx.roundRect(1624 + (i * (290 / gun.mag.max)) + (290 / gun.mag.max) * gun.mag.current, 960, (290 / gun.mag.max) / 2, 8, 2);
        ctx.clip()
        ctx.closePath()
        ctx.fillRect(1624 + (i * (290 / gun.mag.max)), 960, (290 / gun.mag.max) / 2, 8)
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
        ctx.roundRect(1624 + (i * (290 / gun.mag.max)), 960, (290 / gun.mag.max) / 2, 8, 2);
        ctx.clip()
        ctx.closePath()
        ctx.fillRect(1624 + (i * (290 / gun.mag.max)), 960, (290 / gun.mag.max) / 2, 8)
        ctx.fill();
        ctx.restore()
    }

    drawtext(`${gun.mag.current}/${gun.mag.max}`, [1690, 970], 24, "monospace", "top", "end", 0, 1.0)
    ctx.fillStyle = "rgba(255,255,255,1)"
    drawtext(`${gun.equiped}`, [1702, 970], 24, "monospace", "top", "start", 0, 1.0)
    drawtext(`BULLETS: ${bullets.length}`, [1624, 994], 24, "monospace", "top", "start", 0, 1.0)

    if (keyPressed("q") || ui.weapon_selector.active) {
        ui.weapon_selector.draw()
    }

    drawtext((map.x + mouse.x).toFixed(0) + ", " + (map.y + mouse.y).toFixed(0), [0, 0], 24, "sans-serif", "top", "start", 0, 1.0)
});

window.addEventListener("fixedUpdate", () => {

    updateBullets()
    gunUpdate()
    player.angletopoint([mouse.x, mouse.y])


    map.vector.x = keyPressed("a") - keyPressed("d");
    map.vector.y = keyPressed("w") - keyPressed("s");


    if (mouse.click) {
        shoot(gun.equiped, gun.angle)
    }
    if (keyPressed("r") && gun.mag.current < gun.mag.max) {
        reload(gun.equiped)
    }
    if (keyPressed("q") || ui.weapon_selector.active) {
        ui.weapon_selector.update()
    }


    if (map.vector.x != 0 && map.vector.y != 0) {
        map.currentVelocity = 0.707106781187 * map.velocity;
    }
    else {
        map.currentVelocity = map.velocity;
    }
    if (map.vector.x == 1) {
        map.vel.x -= map.currentVelocity * time.fixedDeltaTime;
    }
    if (map.vector.x == -1) {
        map.vel.x += map.currentVelocity * time.fixedDeltaTime;
    }

    if (map.vector.y == 1) {
        map.vel.y -= map.currentVelocity * time.fixedDeltaTime;
    }

    if (map.vector.y == -1) {
        map.vel.y += map.currentVelocity * time.fixedDeltaTime;
    }


    map.vel.x *= Math.pow(0.07, time.fixedDeltaTime);
    map.vel.y *= Math.pow(0.07, time.fixedDeltaTime);

    map.x += map.vel.x * time.fixedDeltaTime;
    map.y += map.vel.y * time.fixedDeltaTime;

    map.x = Math.round(Math.max(Math.min(map.x, map.max.x), map.min.x));
    map.y = Math.round(Math.max(Math.min(map.y, map.max.y), map.min.y));
})
