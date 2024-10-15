import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { animatePlayer, player } from "./player.js";
import { map } from "./map.js";
import { ParticleGenerator } from "./src/plugins/particles/particles.js";

import { bullets, gun, gunDraw, gunUpdate, shoot, reload, switchGun, drawBullets, updateBullets } from "./guns.js"

//import "./src/plugins/gui/gui.js"
import { ui } from "./ui.js";
import { chunker, chunker_config } from "./chunker.js";
import { bullet_decay, drawBulletDecay, updateEntities } from "./entities.js";
import { crosshair, crosshairAngle, updateCrosshair } from "./crosshair.js";

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
    animatePlayer()
    player.draw()
    gunDraw()



    // #############
    // MAP
    // #############
    ctx.save()
    ctx.translate(-map.x, -map.y)

    partGen.draw()
    drawBulletDecay()

    ctx.restore()
    // #############
    // END
    // #############
    chunker.updateHitboxes()
    chunker.drawChunkHitbox()
    chunker.drawChunk()

    crosshair.draw()
    ui.weapon_info.draw()

    if (keyPressed("q") || ui.weapon_selector.active) {
        mouse.show = true;
        ui.weapon_selector.draw()
    }
    else {
        mouse.show = false
    }
    drawtext(chunker.chunk.trunc.x + ", " + chunker.chunk.trunc.y, [0, 24], 24, "sans-serif", "top", "start", 0, 1.0)
    drawtext(map.x.toFixed(0) + ", " + map.y.toFixed(0), [0, 0], 24, "sans-serif", "top", "start", 0, 1.0)
});

window.addEventListener("fixedUpdate", () => {

    // ############################
    //CHUNKER
    // ############################
    chunker.updatePos()
    chunker.updateHitboxes()
    if (chunker.exists(chunker.chunk.trunc.x, chunker.chunk.trunc.y) == true) {
        chunker.updateActiveChunks()
        for (let i = 0; i < chunker.activeChunks.length; i++) {
            var y = chunker.activeChunks[i][0]
            var x = chunker.activeChunks[i][1]

            for (let l = 0; l < chunker_config["maps"][chunker.map][y][x].length; l++) {
                const hitbox = chunker_config["maps"][chunker.map][y][x][l];
                // BULLET COLLISION
                bullets.forEach((bullet, index) => {
                    bullet.x -= map.x
                    bullet.y -= map.y
                    const closestX = Math.min(Math.max(bullet.x, hitbox.x), hitbox.x + hitbox.width);
                    const closestY = Math.min(Math.max(bullet.y, hitbox.y), hitbox.y + hitbox.height);
                    const distanceX = Math.abs(bullet.x - closestX);
                    const distanceY = Math.abs(bullet.y - closestY);
                    if (distanceX <= bullet.width / 2 && distanceY <= bullet.height / 2) {
                        bullet.vel.x = 0
                        bullet.vel.y = 0
                        bullets.splice(index, 1)
                        bullet.toDelete = true
                        new bullet_decay(image[`${bullet.type}bullet`], bullet.x, bullet.y, bullet.width, bullet.height, bullet.angle)
                    }

                    bullet.x += map.x
                    bullet.y += map.y
                })
                // PLAYER COLLISION
                const dir = {
                    x: Math.sign((hitbox.x + hitbox.width / 2) - player.x - player.halfwidth),
                    y: Math.sign((hitbox.y + hitbox.height / 2) - player.y - player.halfheight)
                }

                if (player.hitboxes[0].collide(hitbox)) {
                    player.y += player.halfheight / 2;
                    player.height -= player.halfheight;
                    while (player.hitboxes[0].collide(hitbox)) {
                        map.x -= dir.x;
                        chunker.updateHitboxes();
                    }
                    player.y -= player.halfheight / 2;
                    player.height += player.halfheight;
                    map.vel.x = lerp(map.vel.x, 0, (1 ** time.fixedDeltaTime) * time.scale * 0.2)
                }
                if (player.hitboxes[0].collide(hitbox)) {

                    while (player.hitboxes[0].collide(hitbox)) {
                        map.y -= dir.y;
                        chunker.updateHitboxes();
                    }

                    map.vel.y = 0//lerp(map.vel.y, 0, (1 ** time.fixedDeltaTime) * time.scale * 0.2)
                }
            }
        }
    }

    // ############################
    // GUNS
    // ############################
    updateBullets()
    gunUpdate()
    if (!ui.weapon_selector.active) {
        updateCrosshair();
    }
    if (mouse.click) {
        shoot(gun.equiped, gun.angle)
    }

    if (keyPressed("r") && gun.mag.current < gun.mag.max) {
        reload(gun.equiped)
    }

    // ############################
    // ENTITIES
    // ############################
    updateEntities()

    // ############################
    // UI
    // ############################
    if (keyPressed("q") || ui.weapon_selector.active) {
        ui.weapon_selector.update()
    }
    if (!ui.weapon_selector.active) {
        if (keyPressed("n")) {
            time.scale = lerp(time.scale, 0.5, (1 ** time.fixedDeltaTime) * 0.1)
        }
        else {
            time.scale = lerp(time.scale, 1, (1 ** time.fixedDeltaTime) * 0.1)
        }
    }


    // ############################
    // MAP
    // ############################
    map.vector.x = keyPressed("a") - keyPressed("d");
    map.vector.y = keyPressed("w") - keyPressed("s");

    if (map.vector.x != 0 && map.vector.y != 0) {
        map.currentVelocity = 0.707106781187 * map.velocity;
    }
    else {
        map.currentVelocity = map.velocity;
    }
    if (map.vector.x == 1) {
        map.vel.x -= map.currentVelocity * time.fixedDeltaTime * time.scale;
    }
    if (map.vector.x == -1) {
        map.vel.x += map.currentVelocity * time.fixedDeltaTime * time.scale;
    }

    if (map.vector.y == 1) {
        map.vel.y -= map.currentVelocity * time.fixedDeltaTime * time.scale;
    }

    if (map.vector.y == -1) {
        map.vel.y += map.currentVelocity * time.fixedDeltaTime * time.scale;
    }


    map.vel.x *= Math.pow(0.03, time.fixedDeltaTime);
    map.vel.y *= Math.pow(0.03, time.fixedDeltaTime);

    map.x += map.vel.x * time.fixedDeltaTime * time.scale;
    map.y += map.vel.y * time.fixedDeltaTime * time.scale;

    map.x = Math.round(Math.max(Math.min(map.x, map.max.x), map.min.x));
    map.y = Math.round(Math.max(Math.min(map.y, map.max.y), map.min.y));
})
